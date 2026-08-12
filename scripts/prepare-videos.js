// scripts/prepare-videos.js — turn the raw course recordings into web-safe files
// named exactly as course-data.js expects, ready for upload-videos.js.
//
// Why this exists: the originals are HEVC (H.265) .mov files. Safari plays HEVC;
// Chrome and Firefox on Windows/Android generally do not, so a student would see a
// black player. This transcodes to H.264 + AAC in .mp4 with the moov atom up front
// (`+faststart`) so playback can begin before the file finishes downloading.
//
// Usage (no env needed — this touches no cloud service):
//   node scripts/prepare-videos.js "<source folder>" --dry-run
//   node scripts/prepare-videos.js "<source folder>"
//   node scripts/prepare-videos.js "<source folder>" --fast   # hardware encoder
//
// Output goes to ./staging/ by default (gitignored); pass --out <dir> to change it.
//
// Matching: a leading number in the filename picks the lesson ("7 - מעקב מבט.mov" → the
// lesson whose r2Key is rolling/lesson-07.mp4). Images named "… N.png" map to tip N.
// Anything it can't place is reported, never guessed at.
import { readdir, mkdir, stat, copyFile } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";
import { spawn } from "node:child_process";
import { DATA, validate } from "./course-data.js";

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const FAST = args.includes("--fast");
const FORCE = args.includes("--force");
const outIdx = args.indexOf("--out");
const OUT_DIR = resolve(outIdx >= 0 ? args[outIdx + 1] : "staging");
const sourceDir = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--out");

const errors = validate(DATA);
if (errors.length) {
  console.error("aborted — fix course-data.js first:");
  for (const e of errors) console.error("  ✗", e);
  process.exit(1);
}
if (!sourceDir) {
  console.error('usage: node scripts/prepare-videos.js "<source folder>" [--dry-run] [--fast] [--out dir]');
  process.exit(1);
}

const mb = (b) => (b / 1024 / 1024).toFixed(1) + " MB";
const VIDEO_EXT = new Set([".mov", ".mp4", ".m4v", ".webm", ".avi"]);
const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp"]);

function run(cmd, cmdArgs) {
  return new Promise((ok, fail) => {
    const p = spawn(cmd, cmdArgs, { stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    p.stderr.on("data", (d) => { err += d; });
    p.on("error", fail);
    p.on("close", (code) => (code === 0 ? ok() : fail(new Error(err.trim().split("\n").slice(-3).join("\n")))));
  });
}

async function probe(file) {
  return new Promise((ok) => {
    const p = spawn("ffprobe", ["-v", "error", "-select_streams", "v:0",
      "-show_entries", "stream=codec_name,width,height,duration", "-of", "default=nw=1:nk=1", file]);
    let out = "";
    p.stdout.on("data", (d) => { out += d; });
    p.on("close", () => {
      const [codec, width, height, duration] = out.trim().split("\n");
      ok({ codec, width: +width, height: +height, duration: Math.round(+duration) || 0 });
    });
    p.on("error", () => ok({}));
  });
}

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".")) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

// Index the expected outputs by the number embedded in their key, per kind.
const videoLessons = DATA.lessons.filter((l) => l.kind === "video");
const imageLessons = DATA.lessons.filter((l) => l.kind === "image");
const lessonByNumber = new Map();
for (const l of videoLessons) {
  const m = l.r2Key.match(/lesson-(\d+)\./);
  if (m) lessonByNumber.set(Number(m[1]), l);
}
const bonusLesson = videoLessons.find((l) => /bonus/.test(l.r2Key));
const tipByNumber = new Map();
for (const l of imageLessons) {
  const m = l.r2Key.match(/tip-(\d+)\./);
  if (m) tipByNumber.set(Number(m[1]), l);
}
// The highest lesson number + 1 is the bonus, by the source's own numbering.
const BONUS_NUMBER = Math.max(...lessonByNumber.keys()) + 1;

function place(file) {
  const name = basename(file);
  const ext = extname(name).toLowerCase();
  // Match against the stem only — otherwise ".mp4" donates a stray "4".
  const stem = name.slice(0, name.length - ext.length);

  if (IMAGE_EXT.has(ext)) {
    // Tips are named "… N.png" — take the last number in the stem.
    const nums = stem.match(/\d+/g);
    if (!nums) return null;
    return tipByNumber.get(Number(nums[nums.length - 1])) ?? null;
  }
  if (VIDEO_EXT.has(ext)) {
    // Lessons are named "N - title.mov" — the number must lead, so a file like
    // "נספח" with no leading number is reported rather than guessed at.
    const m = stem.match(/^\s*(\d+)/);
    if (!m) return null;
    const num = Number(m[1]);
    if (num === BONUS_NUMBER) return bonusLesson ?? null;
    return lessonByNumber.get(num) ?? null;
  }
  return null;
}

const files = await walk(resolve(sourceDir));
const plan = [];
const unplaced = [];
for (const f of files) {
  const lesson = place(f);
  if (lesson) plan.push({ file: f, lesson });
  else unplaced.push(f);
}
const placed = new Set(plan.map((p) => p.lesson.id));
const missing = DATA.lessons.filter((l) => !placed.has(l.id));

console.log(`source: ${resolve(sourceDir)}`);
console.log(`output: ${OUT_DIR}`);
console.log(`placed ${plan.length} of ${DATA.lessons.length} lessons\n`);

if (unplaced.length) {
  console.log("source files not placed (ignored):");
  for (const f of unplaced) console.log("  ·", basename(f));
  console.log("");
}
if (missing.length) {
  console.log("lessons with no source file:");
  for (const l of missing) console.log(`  ✗ ${l.id.padEnd(24)} → ${l.r2Key}`);
  console.log("");
}

if (!DRY_RUN) await mkdir(OUT_DIR, { recursive: true });

plan.sort((a, b) => a.lesson.order - b.lesson.order);
let done = 0;
for (const { file, lesson } of plan) {
  const target = join(OUT_DIR, basename(lesson.r2Key));
  const src = await stat(file);

  if (!FORCE) {
    try {
      const existing = await stat(target);
      if (existing.size > 0) { console.log(`skip     ${basename(target)}  (already prepared, ${mb(existing.size)})`); continue; }
    } catch { /* not prepared yet */ }
  }

  if (lesson.kind === "image") {
    console.log(`copy     ${basename(target)}  ${mb(src.size)}  ← ${basename(file)}`);
    if (!DRY_RUN) await copyFile(file, target);
    done++;
    continue;
  }

  const info = await probe(file);
  const needsTranscode = info.codec !== "h264" || extname(file).toLowerCase() !== ".mp4";
  console.log(`${needsTranscode ? "encode  " : "remux   "} ${basename(target)}  ${mb(src.size)}  ← ${basename(file)}  [${info.codec || "?"} ${info.width}x${info.height} ${info.duration}s]`);
  if (DRY_RUN) continue;

  const codecArgs = FAST
    ? ["-c:v", "h264_videotoolbox", "-b:v", "5M"]
    : ["-c:v", "libx264", "-preset", "medium", "-crf", "23", "-profile:v", "high"];
  await run("ffmpeg", [
    "-y", "-i", file,
    ...codecArgs,
    "-pix_fmt", "yuv420p",       // required for broad browser/hardware support
    "-c:a", "aac", "-b:a", "128k",
    "-movflags", "+faststart",   // moov atom first → playback starts before full download
    target,
  ]);
  const outStat = await stat(target);
  console.log(`         → ${mb(outStat.size)}  (${Math.round((1 - outStat.size / src.size) * 100)}% smaller)`);
  done++;
}

if (DRY_RUN) {
  console.log(`\ndry run — nothing written (${plan.length} would be processed, ${missing.length} lessons unmatched)`);
  process.exit(0);
}
console.log(`\nprepared ${done} file(s) in ${OUT_DIR}`);
console.log(`next: node --env-file=.env scripts/upload-videos.js ${OUT_DIR}`);
