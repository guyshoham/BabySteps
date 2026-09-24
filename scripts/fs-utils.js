// scripts/fs-utils.js — small helpers shared by prepare-videos.js and upload-videos.js.
import { readdir } from "node:fs/promises";
import { join } from "node:path";

export const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1) + " MB";

// Every file under dir, recursively. Dotfiles and dot-folders are skipped.
export async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

// Reads `--course <id>` or `--course=<id>`. Returns { course } (null when the flag
// is absent) or { error } when the flag has no value.
export function parseCourseFlag(args) {
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith("--course=")) {
      const v = a.slice("--course=".length);
      return v ? { course: v } : { error: "--course needs a course id" };
    }
    if (a === "--course") {
      const v = args[i + 1];
      return v && !v.startsWith("--") ? { course: v } : { error: "--course needs a course id" };
    }
  }
  return { course: null };
}

// Picks the lessons one run works on. Local files are matched by file name, so two
// courses in one run could both claim `lesson-01.mp4`. One course per run avoids that.
// With no course given, this works only when exactly one course has lessons.
// Returns { courseId, lessons } or { error }.
export function selectCourseLessons({ courses, lessons }, course) {
  if (course) {
    if (!courses.some((c) => c.id === course)) {
      return { error: `unknown course "${course}". Course ids: ${courses.map((c) => c.id).join(", ")}` };
    }
    const picked = lessons.filter((l) => l.courseId === course);
    if (!picked.length) return { error: `course "${course}" has no lessons in course-data.js` };
    return { courseId: course, lessons: picked };
  }
  const withLessons = [...new Set(lessons.map((l) => l.courseId))];
  if (withLessons.length === 0) return { error: "no lessons in course-data.js" };
  if (withLessons.length > 1) {
    return { error: `several courses have lessons, so pick one with --course <id>. Course ids: ${withLessons.join(", ")}` };
  }
  return { courseId: withLessons[0], lessons };
}

// The first argument that is not a flag and not the value of one of valueFlags.
export function positionalArg(args, valueFlags = []) {
  return args.find((a, i) => !a.startsWith("--") && !valueFlags.includes(args[i - 1]));
}
