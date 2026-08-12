// scripts/seed.js — one-off Firestore seeder for courses + lessons.
//
// Run locally (never on Vercel):
//   node --env-file=.env scripts/seed.js --dry-run   # print what would be written
//   node --env-file=.env scripts/seed.js             # write to Firestore
//
// Safe to re-run: every write is a merge on a fixed document id, so re-seeding
// updates fields and never duplicates a course or lesson.
//
// The data itself lives in ./course-data.js — edit it there.
import { adminDb } from "../lib/firebase-admin.js";
import { DATA, validate } from "./course-data.js";

const DRY_RUN = process.argv.includes("--dry-run");

const errors = validate(DATA);
if (errors.length) {
  console.error("seed aborted — fix course-data.js first:");
  for (const e of errors) console.error("  ✗", e);
  process.exit(1);
}

if (DRY_RUN) {
  for (const c of DATA.courses) console.log("course:", c.id, "→", c.title);
  for (const l of DATA.lessons) console.log("lesson:", l.id, "→", l.r2Key);
  console.log(`dry run — nothing written (${DATA.courses.length} courses, ${DATA.lessons.length} lessons)`);
  process.exit(0);
}

const db = adminDb();

for (const c of DATA.courses) {
  const { id, ...rest } = c;
  await db.collection("courses").doc(id).set(rest, { merge: true });
  console.log("course:", id);
}
for (const l of DATA.lessons) {
  // sourceName is a local build hint for prepare-videos.js — not app data.
  const { id, sourceName, ...rest } = l;
  await db.collection("lessons").doc(id).set(rest, { merge: true });
  console.log("lesson:", id);
}
console.log("seed complete");
process.exit(0);
