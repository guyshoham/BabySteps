// scripts/upload-videos.js — upload lesson videos to the private R2 bucket using
// exactly the keys declared in course-data.js, so Firestore and the bucket can't drift.
//
// Usage (needs the R2_* vars, so load .env):
//   node --env-file=.env scripts/upload-videos.js ~/Videos/rolling --dry-run
//   node --env-file=.env scripts/upload-videos.js ~/Videos/rolling
//   node --env-file=.env scripts/upload-videos.js --verify        # no upload, just check
//
// Flags:
//   --dry-run   show the plan (what would upload, skip, or is missing) and exit
//   --force     re-upload even if an object of the same size is already there
//   --verify    skip uploading; only report which r2Keys exist in the bucket
//
// Matching rule: a local file matches a lesson when its filename equals the last
// segment of that lesson's r2Key (`rolling/lesson-01.mp4` ← `lesson-01.mp4`).
// Subdirectories are searched too, so a folder that already mirrors the key layout
// works as-is. Anything unmatched is reported rather than guessed at.
import { readdir, stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import {
  S3Client, HeadObjectCommand, PutObjectCommand, ListObjectsV2Command,
  CreateMultipartUploadCommand, UploadPartCommand,
  CompleteMultipartUploadCommand, AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { DATA, validate } from "./course-data.js";

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const FORCE = args.includes("--force");
const VERIFY_ONLY = args.includes("--verify");
const sourceDir = args.find((a) => !a.startsWith("--"));

// Files at or above this size are uploaded in parts. R2 accepts a single PUT up to
// 5 GB, but a multipart upload retries one 64 MB part instead of the whole file.
const MULTIPART_THRESHOLD = 64 * 1024 * 1024;
const PART_SIZE = 64 * 1024 * 1024;

const CONTENT_TYPES = {
  ".mp4": "video/mp4", ".mov": "video/quicktime", ".m4v": "video/x-m4v",
  ".webm": "video/webm", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
};

for (const k of ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"]) {
  if (!process.env[k]) {
    console.error(`missing env var ${k} — run with: node --env-file=.env scripts/upload-videos.js …`);
    process.exit(1);
  }
}

const errors = validate(DATA);
if (errors.length) {
  console.error("aborted — fix course-data.js first:");
  for (const e of errors) console.error("  ✗", e);
  process.exit(1);
}

const BUCKET = process.env.R2_BUCKET;
const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1) + " MB";

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

async function headObject(key) {
  try {
    const r = await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return { exists: true, size: r.ContentLength };
  } catch (e) {
    if (e.name === "NotFound" || e.$metadata?.httpStatusCode === 404) return { exists: false };
    throw e;
  }
}

async function uploadSimple(localPath, key, size, contentType) {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET, Key: key, Body: createReadStream(localPath),
    ContentLength: size, ContentType: contentType,
  }));
}

async function uploadMultipart(localPath, key, size, contentType) {
  const { UploadId } = await s3.send(new CreateMultipartUploadCommand({
    Bucket: BUCKET, Key: key, ContentType: contentType,
  }));
  const parts = [];
  try {
    const total = Math.ceil(size / PART_SIZE);
    for (let i = 0; i < total; i++) {
      const start = i * PART_SIZE;
      const end = Math.min(start + PART_SIZE, size) - 1;
      const r = await s3.send(new UploadPartCommand({
        Bucket: BUCKET, Key: key, UploadId, PartNumber: i + 1,
        Body: createReadStream(localPath, { start, end }),
        ContentLength: end - start + 1,
      }));
      parts.push({ ETag: r.ETag, PartNumber: i + 1 });
      process.stdout.write(`\r    part ${i + 1}/${total}`);
    }
    process.stdout.write("\r");
    await s3.send(new CompleteMultipartUploadCommand({
      Bucket: BUCKET, Key: key, UploadId, MultipartUpload: { Parts: parts },
    }));
  } catch (e) {
    // Leaving an incomplete upload around would silently bill for storage.
    await s3.send(new AbortMultipartUploadCommand({ Bucket: BUCKET, Key: key, UploadId })).catch(() => {});
    throw e;
  }
}

async function report() {
  console.log("\n--- bucket state ---");
  const listed = new Map();
  let token;
  do {
    const r = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET, ContinuationToken: token }));
    for (const o of r.Contents || []) listed.set(o.Key, o.Size);
    token = r.IsTruncated ? r.NextContinuationToken : undefined;
  } while (token);

  let missing = 0;
  for (const l of DATA.lessons) {
    const size = listed.get(l.r2Key);
    if (size === undefined) { console.log("  ✗ MISSING", l.r2Key, `(lesson ${l.id})`); missing++; }
    else console.log("  ✓", l.r2Key, mb(size));
  }
  const referenced = new Set(DATA.lessons.map((l) => l.r2Key));
  for (const key of listed.keys()) {
    if (!referenced.has(key)) console.log("  ·  orphan (in bucket, not referenced by any lesson):", key);
  }
  console.log(missing === 0
    ? `\nall ${DATA.lessons.length} lesson videos are in place`
    : `\n${missing} of ${DATA.lessons.length} lesson videos still missing`);
  return missing;
}

// --- main ---

if (VERIFY_ONLY) {
  const missing = await report();
  process.exit(missing === 0 ? 0 : 1);
}

if (!sourceDir) {
  console.error("usage: node --env-file=.env scripts/upload-videos.js <folder-with-videos> [--dry-run] [--force]");
  console.error("       node --env-file=.env scripts/upload-videos.js --verify");
  process.exit(1);
}

const dir = resolve(sourceDir);
const files = await walk(dir);
const byName = new Map();
for (const f of files) {
  const name = basename(f);
  if (byName.has(name)) console.log(`note: two local files named ${name}; using ${byName.get(name)}`);
  else byName.set(name, f);
}

const plan = [];
const unmatchedLessons = [];
for (const l of DATA.lessons) {
  const wanted = l.r2Key.split("/").pop();
  const local = byName.get(wanted);
  if (local) plan.push({ lesson: l, local, key: l.r2Key });
  else unmatchedLessons.push({ lesson: l, wanted });
}
const usedFiles = new Set(plan.map((p) => p.local));
const unusedFiles = files.filter((f) => !usedFiles.has(f));

console.log(`source: ${dir}`);
console.log(`matched ${plan.length} of ${DATA.lessons.length} lessons\n`);

if (unmatchedLessons.length) {
  console.log("lessons with no matching local file — rename the file, or change r2Key in course-data.js:");
  for (const u of unmatchedLessons) console.log(`  ✗ ${u.lesson.id.padEnd(24)} expects a file named  ${u.wanted}`);
  console.log("");
}
if (unusedFiles.length) {
  console.log("local files that match no lesson (ignored):");
  for (const f of unusedFiles) console.log("  ·", basename(f));
  console.log("");
}

let uploaded = 0, skipped = 0;
for (const { lesson, local, key } of plan) {
  const { size } = await stat(local);
  const existing = await headObject(key);
  const contentType = CONTENT_TYPES[extname(local).toLowerCase()] || "application/octet-stream";

  if (existing.exists && existing.size === size && !FORCE) {
    console.log(`skip    ${key}  (already uploaded, ${mb(size)})`);
    skipped++;
    continue;
  }
  const verb = existing.exists ? "replace" : "upload ";
  if (DRY_RUN) { console.log(`${verb} ${key}  ${mb(size)}  ← ${basename(local)}`); continue; }

  console.log(`${verb} ${key}  ${mb(size)}  ← ${basename(local)}`);
  if (size >= MULTIPART_THRESHOLD) await uploadMultipart(local, key, size, contentType);
  else await uploadSimple(local, key, size, contentType);
  uploaded++;
}

if (DRY_RUN) {
  console.log(`\ndry run — nothing uploaded (${plan.length} would be processed, ${unmatchedLessons.length} unmatched)`);
  process.exit(0);
}

console.log(`\nuploaded ${uploaded}, skipped ${skipped}`);
const missing = await report();
process.exit(missing === 0 ? 0 : 1);
