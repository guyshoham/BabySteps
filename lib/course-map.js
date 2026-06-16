// lib/course-map.js
// Maps a PayPal product/button identifier to an internal Firestore courseId.

export function loadCourseMap(env = process.env) {
  if (!env.COURSE_MAP) return {};
  try {
    return JSON.parse(env.COURSE_MAP);
  } catch {
    throw new Error("COURSE_MAP env is not valid JSON");
  }
}

export function courseIdForProduct(productId, map) {
  if (!productId) return null;
  return map[productId] ?? null;
}
