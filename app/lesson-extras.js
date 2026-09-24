// app/lesson-extras.js — pure helpers for the lesson page's feedback and
// "course finished" cards. No DOM, no Firebase, so they are easy to test.

// Yarden's WhatsApp number, in the international form wa.me expects.
export const WHATSAPP_NUMBER = "972542366243";

export function whatsAppUrl(text) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(String(text ?? ""))}`;
}

// Link for sending Yarden a video of the practice for personal feedback.
export function whatsAppFeedbackUrl(title) {
  const t = String(title ?? "").trim();
  return whatsAppUrl(t
    ? `היי ירדן, צילמתי את התרגול של השיעור: ${t}`
    : "היי ירדן, צילמתי את התרגול");
}

// Link for sending a short testimonial after finishing the course.
export function whatsAppTestimonialUrl() {
  return whatsAppUrl("היי ירדן, סיימתי את הקורס ורציתי לשתף...");
}

// True when every lesson of the course is completed. An empty course is never
// "done", so the finish card cannot show before the lesson list has loaded.
export function allDone(lessonIds, completedIds) {
  if (!Array.isArray(lessonIds) || lessonIds.length === 0) return false;
  const done = completedIds instanceof Set ? completedIds : new Set(completedIds ?? []);
  return lessonIds.every((id) => done.has(id));
}
