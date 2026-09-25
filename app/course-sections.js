// app/course-sections.js: pure helper that splits a course's lessons into the
// three groups of the course page: videos, tips and extras. No DOM, no Firebase.
//
// It works from the lesson docs as they are (no reseed), using `kind` and `order`:
// - videos: the "video" lessons that come before the first non-video lesson
//   (the main run of guidance videos, order 1 to 10 in the rolling course)
// - tips:   the "image" lessons (the golden tips)
// - extras: everything else: videos after the tips (bonus, appendix) and any
//   lesson with an unknown or missing kind
// Lessons are sorted by `order` (missing order goes last, input order breaks ties).
// Empty groups are left out.

export const GROUPS = {
  videos: "סרטוני הדרכה",
  tips: "טיפי זהב",
  extras: "בונוס ונספח",
};

function orderOf(lesson) {
  const n = Number(lesson?.order);
  return Number.isFinite(n) ? n : Infinity;
}

// lessons: [{ id, kind, order, title, ... }]. Returns
// [{ key: "videos" | "tips" | "extras", label, lessons: [...] }] in page order.
export function groupLessons(lessons) {
  const list = (Array.isArray(lessons) ? lessons : [])
    .filter((l) => l && typeof l === "object")
    .map((l, i) => ({ l, i }))
    .sort((a, b) => orderOf(a.l) - orderOf(b.l) || a.i - b.i)
    .map(({ l }) => l);

  const buckets = { videos: [], tips: [], extras: [] };
  let mainRun = true; // still inside the leading run of videos
  for (const l of list) {
    if (l.kind === "video" && mainRun) {
      buckets.videos.push(l);
    } else {
      mainRun = false;
      if (l.kind === "image") buckets.tips.push(l);
      else buckets.extras.push(l);
    }
  }

  return Object.keys(GROUPS)
    .filter((key) => buckets[key].length > 0)
    .map((key) => ({ key, label: GROUPS[key], lessons: buckets[key] }));
}

// Sprite icon id for a lesson row: play for videos, photo for tips, gift for a
// bonus (its title starts with "בונוס") and a paperclip for other extras.
export function lessonIcon(lesson, groupKey) {
  if (groupKey === "videos") return "i-play";
  if (groupKey === "tips") return "i-photo";
  if (String(lesson?.title ?? "").trim().startsWith("בונוס")) return "i-gift";
  return "i-paperclip";
}
