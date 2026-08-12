// scripts/course-data.js — the single source of truth for courses and lessons.
//
// Read by `seed.js` (writes these to Firestore), `prepare-videos.js` (transcodes the
// originals into correctly-named web-safe files) and `upload-videos.js` (uploads them
// to R2), so a lesson's id, order, and r2Key can never drift between the three.
//
// `kind` decides how app/lesson.html renders the asset:
//   "video" → <video> player with progress tracking
//   "image" → <img>, marked complete once it loads
// Both are served the same way: a short-lived signed R2 URL from /api/video-url.
//
// `durationSec` is informational only — no page reads it yet.

export const DATA = {
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
      published: false, // still "בקרוב" on the site; no lessons filmed yet
      description: "טכניקות עידוד לשכיבה על הבטן, חיזוק שרירי הצוואר והגב. בקרוב.",
      coverImage: "",
    },
  ],

  // courseId must match a course id above. Order drives the list on the course page.
  lessons: [
    // — 10 סרטוני הדרכה — titles taken from the source filenames
    { id: "rolling-01", courseId: "rolling", order: 1,  kind: "video", title: "התהפכויות",              r2Key: "rolling/lesson-01.mp4", durationSec: 0, description: "" },
    { id: "rolling-02", courseId: "rolling", order: 2,  kind: "video", title: "חימום — חלק א",          r2Key: "rolling/lesson-02.mp4", durationSec: 0, description: "" },
    { id: "rolling-03", courseId: "rolling", order: 3,  kind: "video", title: "חימום — חלק ב",          r2Key: "rolling/lesson-03.mp4", durationSec: 0, description: "" },
    { id: "rolling-04", courseId: "rolling", order: 4,  kind: "video", title: "אקורדיון",               r2Key: "rolling/lesson-04.mp4", durationSec: 0, description: "" },
    { id: "rolling-05", courseId: "rolling", order: 5,  kind: "video", title: "מזרונים — חלק א",        r2Key: "rolling/lesson-05.mp4", durationSec: 0, description: "" },
    { id: "rolling-06", courseId: "rolling", order: 6,  kind: "video", title: "מזרונים — חלק ב",        r2Key: "rolling/lesson-06.mp4", durationSec: 0, description: "" },
    { id: "rolling-07", courseId: "rolling", order: 7,  kind: "video", title: "מעקב מבט",               r2Key: "rolling/lesson-07.mp4", durationSec: 0, description: "" },
    { id: "rolling-08", courseId: "rolling", order: 8,  kind: "video", title: "לביאה וגורייה",          r2Key: "rolling/lesson-08.mp4", durationSec: 0, description: "" },
    { id: "rolling-09", courseId: "rolling", order: 9,  kind: "video", title: "מודעות לכפות הרגליים",   r2Key: "rolling/lesson-09.mp4", durationSec: 0, description: "" },
    { id: "rolling-10", courseId: "rolling", order: 10, kind: "video", title: "שעון",                   r2Key: "rolling/lesson-10.mp4", durationSec: 0, description: "" },

    // — 6 טיפי זהב — these are images, not videos
    { id: "rolling-tip-01", courseId: "rolling", order: 11, kind: "image", title: "טיפ זהב 1", r2Key: "rolling/tip-01.png", description: "" },
    { id: "rolling-tip-02", courseId: "rolling", order: 12, kind: "image", title: "טיפ זהב 2", r2Key: "rolling/tip-02.png", description: "" },
    { id: "rolling-tip-03", courseId: "rolling", order: 13, kind: "image", title: "טיפ זהב 3", r2Key: "rolling/tip-03.png", description: "" },
    { id: "rolling-tip-04", courseId: "rolling", order: 14, kind: "image", title: "טיפ זהב 4", r2Key: "rolling/tip-04.png", description: "" },
    { id: "rolling-tip-05", courseId: "rolling", order: 15, kind: "image", title: "טיפ זהב 5", r2Key: "rolling/tip-05.png", description: "" },
    { id: "rolling-tip-06", courseId: "rolling", order: 16, kind: "image", title: "טיפ זהב 6", r2Key: "rolling/tip-06.png", description: "" },

    // — בונוס —
    {
      id: "rolling-bonus-crawling", courseId: "rolling", order: 17, kind: "video",
      title: "בונוס: הכנה לשלב הזחילה",
      r2Key: "rolling/bonus-crawling.mp4", durationSec: 0,
      description: "סרטון ייחודי שבונה את התשתית המוטורית לשלב ההתפתחותי הבא.",
    },

    // tummy-time lessons go here once the course is filmed (set published: true above).
  ],
};

// --- validation: a bad courseId or duplicate id silently breaks a page ---
export function validate({ courses, lessons }) {
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
  const keys = new Set();
  const orderPerCourse = new Map();
  for (const l of lessons) {
    if (lessonIds.has(l.id)) errors.push(`duplicate lesson id: ${l.id}`);
    lessonIds.add(l.id);
    if (!courseIds.has(l.courseId)) errors.push(`lesson ${l.id}: unknown courseId "${l.courseId}"`);
    if (!l.r2Key) errors.push(`lesson ${l.id}: empty r2Key`);
    if (keys.has(l.r2Key)) errors.push(`lesson ${l.id}: r2Key "${l.r2Key}" is used by another lesson`);
    keys.add(l.r2Key);
    if (l.kind !== "video" && l.kind !== "image") errors.push(`lesson ${l.id}: kind must be "video" or "image"`);
    const seen = orderPerCourse.get(l.courseId) ?? new Set();
    if (seen.has(l.order)) errors.push(`lesson ${l.id}: order ${l.order} already used in ${l.courseId}`);
    seen.add(l.order);
    orderPerCourse.set(l.courseId, seen);
  }
  return errors;
}
