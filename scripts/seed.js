// scripts/seed.js — run locally: `node scripts/seed.js` (needs FIREBASE_* env vars).
import { adminDb } from "../lib/firebase-admin.js";

const DATA = {
  courses: [
    { id: "rolling", slug: "rolling", title: "קורס התהפכות", order: 1, published: true,
      description: "ליווי שלב ההתהפכות", coverImage: "/assets/videos/rolling-teaser-poster.jpg" },
    { id: "tummy-time", slug: "tummy-time", title: "קורס שכיבה על הבטן", order: 2, published: true,
      description: "ליווי שלב הטאמי טיים", coverImage: "" },
  ],
  lessons: [
    // courseId must match a course id above; r2Key is the object key in your R2 bucket.
    { id: "rolling-01", courseId: "rolling", title: "מבוא", order: 1, r2Key: "rolling/01.mp4", durationSec: 0, description: "" },
    { id: "rolling-02", courseId: "rolling", title: "תרגול ראשון", order: 2, r2Key: "rolling/02.mp4", durationSec: 0, description: "" },
    { id: "tummy-01", courseId: "tummy-time", title: "מבוא", order: 1, r2Key: "tummy/01.mp4", durationSec: 0, description: "" },
  ],
};

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
