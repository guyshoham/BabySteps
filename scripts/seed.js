// scripts/seed.js — one-off Firestore seeder for courses + lessons.
//
// Run locally (never on Vercel):
//   node --env-file=.env scripts/seed.js --dry-run   # print what would be written
//   node --env-file=.env scripts/seed.js             # write to Firestore
//
// Safe to re-run: every write is a merge on a fixed document id, so re-seeding
// updates fields and never duplicates a course or lesson.
//
// ── BEFORE THE FIRST REAL RUN ────────────────────────────────────────────────
// 1. Replace the placeholder lesson titles below with the real video titles.
//    The counts come from the sales page (challenge/rolling): 10 instructional
//    videos + 6 "golden tips" + 1 crawling-prep bonus = 17 lessons.
// 2. Make every `r2Key` match the object key actually uploaded to the R2 bucket,
//    exactly (case-sensitive, including the folder prefix).
// 3. `durationSec` is informational only — no page reads it yet. 0 is fine.
// ─────────────────────────────────────────────────────────────────────────────
import { adminDb } from "../lib/firebase-admin.js";

const DRY_RUN = process.argv.includes("--dry-run");

const DATA = {
  courses: [
    {
      id: "rolling",
      slug: "rolling",
      title: "קורס התהפכות",
      order: 1,
      published: true,
      description:
        "כל הכלים ללוות את התינוק בשלב ההתהפכות: 10 סרטוני הדרכה, 6 טיפי זהב ובונוס הכנה לזחילה.",
      coverImage: "/assets/videos/rolling-teaser-poster.jpg",
    },
    {
      id: "tummy-time",
      slug: "tummy-time",
      title: "קורס שכיבה על הבטן",
      order: 2,
      published: false, // still "בקרוב" on the site; no lessons uploaded yet
      description: "טכניקות עידוד לשכיבה על הבטן, חיזוק שרירי הצוואר והגב. בקרוב.",
      coverImage: "",
    },
  ],

  // courseId must match a course id above. Order drives the list on the course page.
  lessons: [
    // — 10 סרטוני הדרכה —
    { id: "rolling-01", courseId: "rolling", order: 1,  title: "שיעור 1",  r2Key: "rolling/lesson-01.mp4", durationSec: 0, description: "" },
    { id: "rolling-02", courseId: "rolling", order: 2,  title: "שיעור 2",  r2Key: "rolling/lesson-02.mp4", durationSec: 0, description: "" },
    { id: "rolling-03", courseId: "rolling", order: 3,  title: "שיעור 3",  r2Key: "rolling/lesson-03.mp4", durationSec: 0, description: "" },
    { id: "rolling-04", courseId: "rolling", order: 4,  title: "שיעור 4",  r2Key: "rolling/lesson-04.mp4", durationSec: 0, description: "" },
    { id: "rolling-05", courseId: "rolling", order: 5,  title: "שיעור 5",  r2Key: "rolling/lesson-05.mp4", durationSec: 0, description: "" },
    { id: "rolling-06", courseId: "rolling", order: 6,  title: "שיעור 6",  r2Key: "rolling/lesson-06.mp4", durationSec: 0, description: "" },
    { id: "rolling-07", courseId: "rolling", order: 7,  title: "שיעור 7",  r2Key: "rolling/lesson-07.mp4", durationSec: 0, description: "" },
    { id: "rolling-08", courseId: "rolling", order: 8,  title: "שיעור 8",  r2Key: "rolling/lesson-08.mp4", durationSec: 0, description: "" },
    { id: "rolling-09", courseId: "rolling", order: 9,  title: "שיעור 9",  r2Key: "rolling/lesson-09.mp4", durationSec: 0, description: "" },
    { id: "rolling-10", courseId: "rolling", order: 10, title: "שיעור 10", r2Key: "rolling/lesson-10.mp4", durationSec: 0, description: "" },

    // — 6 טיפי זהב —
    { id: "rolling-tip-01", courseId: "rolling", order: 11, title: "טיפ זהב 1", r2Key: "rolling/tip-01.mp4", durationSec: 0, description: "" },
    { id: "rolling-tip-02", courseId: "rolling", order: 12, title: "טיפ זהב 2", r2Key: "rolling/tip-02.mp4", durationSec: 0, description: "" },
    { id: "rolling-tip-03", courseId: "rolling", order: 13, title: "טיפ זהב 3", r2Key: "rolling/tip-03.mp4", durationSec: 0, description: "" },
    { id: "rolling-tip-04", courseId: "rolling", order: 14, title: "טיפ זהב 4", r2Key: "rolling/tip-04.mp4", durationSec: 0, description: "" },
    { id: "rolling-tip-05", courseId: "rolling", order: 15, title: "טיפ זהב 5", r2Key: "rolling/tip-05.mp4", durationSec: 0, description: "" },
    { id: "rolling-tip-06", courseId: "rolling", order: 16, title: "טיפ זהב 6", r2Key: "rolling/tip-06.mp4", durationSec: 0, description: "" },

    // — בונוס —
    {
      id: "rolling-bonus-crawling", courseId: "rolling", order: 17,
      title: "בונוס: הכנה לשלב הזחילה",
      r2Key: "rolling/bonus-crawling.mp4", durationSec: 0,
      description: "סרטון ייחודי שבונה את התשתית המוטורית לשלב ההתפתחותי הבא.",
    },

    // tummy-time lessons go here once the course is filmed (set published: true above).
  ],
};

// --- validate before writing: a bad courseId or duplicate id silently breaks a page ---
function validate({ courses, lessons }) {
  const errors = [];
  const courseIds = new Set();
  const slugs = new Set();
  for (const c of courses) {
    if (courseIds.has(c.id)) errors.push(`duplicate course id: ${c.id}`);
    if (slugs.has(c.slug)) errors.push(`duplicate course slug: ${c.slug}`);
    courseIds.add(c.id);
    slugs.add(c.slug);
  }
  const lessonIds = new Set();
  const orderPerCourse = new Map();
  for (const l of lessons) {
    if (lessonIds.has(l.id)) errors.push(`duplicate lesson id: ${l.id}`);
    lessonIds.add(l.id);
    if (!courseIds.has(l.courseId)) errors.push(`lesson ${l.id}: unknown courseId "${l.courseId}"`);
    if (!l.r2Key) errors.push(`lesson ${l.id}: empty r2Key`);
    const seen = orderPerCourse.get(l.courseId) ?? new Set();
    if (seen.has(l.order)) errors.push(`lesson ${l.id}: order ${l.order} already used in ${l.courseId}`);
    seen.add(l.order);
    orderPerCourse.set(l.courseId, seen);
  }
  return errors;
}

const errors = validate(DATA);
if (errors.length) {
  console.error("seed aborted — fix DATA first:");
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
  const { id, ...rest } = l;
  await db.collection("lessons").doc(id).set(rest, { merge: true });
  console.log("lesson:", id);
}
console.log("seed complete");
process.exit(0);
