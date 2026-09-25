// app/course-progress.js — pure helpers for the course page's progress line,
// "continue" button and feedback card. No DOM, no Firebase, so they are easy to test.
import { whatsAppUrl } from "./lesson-extras.js";

// lessonIds: the course's lesson ids in order. completedIds: a Set or array of
// completed lesson ids (it may hold lessons of other courses; they are ignored).
// Returns { done, total, nextId }:
// - done: how many of this course's lessons are completed
// - total: how many lessons the course has
// - nextId: the first lesson not done yet. When all are done it is the first
//   lesson (to watch again). null for an empty course.
export function courseProgress(lessonIds, completedIds) {
  const ids = Array.isArray(lessonIds) ? lessonIds : [];
  const completed = completedIds instanceof Set ? completedIds : new Set(completedIds ?? []);
  const done = ids.filter((id) => completed.has(id)).length;
  const firstOpen = ids.find((id) => !completed.has(id));
  return { done, total: ids.length, nextId: firstOpen ?? ids[0] ?? null };
}

// Label for the "continue" button, based on the progress.
export function continueLabel({ done, total }) {
  if (done === 0) return "התחילי מהשיעור הראשון";
  if (done >= total) return "צפי שוב מההתחלה";
  return "המשיכי מאיפה שעצרת";
}

// One entry per lesson for the step bar. The bar is a progress bar, not a map:
// it fills from the start, one step per done lesson, so "2 מתוך 18" always shows
// as the first 2 steps. The lesson list shows which lessons are done.
export function stepStates(lessonIds, completedIds) {
  const ids = Array.isArray(lessonIds) ? lessonIds : [];
  const completed = completedIds instanceof Set ? completedIds : new Set(completedIds ?? []);
  const done = ids.filter((id) => completed.has(id)).length;
  return ids.map((_, i) => i < done);
}

// The progress line and the step bar's spoken value: "3 מתוך 18 שיעורים".
export function progressText({ done, total }) {
  return `${done} מתוך ${total} שיעורים`;
}

// Link for sending Yarden a video of the practice from this course.
export function whatsAppCourseFeedbackUrl(title) {
  const t = String(title ?? "").trim();
  return whatsAppUrl(t
    ? `היי ירדן, צילמתי את התרגול מהקורס: ${t}`
    : "היי ירדן, צילמתי את התרגול");
}
