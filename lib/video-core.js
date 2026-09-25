// lib/video-core.js
// Pure orchestration of the gated video-url flow. All I/O injected via `deps`.
//
// deps:
//   verifyToken(idToken): Promise<{ uid } | null>
//   getLesson(lessonId): Promise<{ courseId, r2Key } | null>
//   enrolledCourseIds(uid): Promise<string[]>  (read fresh on every call and
//     never cached, so a removed enrollment blocks the next request)
//   signUrl(r2Key): Promise<string>
//   urlTtlSeconds (optional number): sent back as `expiresIn`, so the browser
//     knows how long it may reuse the URL.
export async function runVideoUrl(deps, { idToken, lessonId }) {
  const { verifyToken, getLesson, enrolledCourseIds, signUrl, urlTtlSeconds } = deps;

  if (!idToken) return { status: 401, body: { error: "missing auth token" } };
  if (!lessonId) return { status: 400, body: { error: "lessonId is required" } };

  // The token is checked first, so a request without a valid login never
  // reads Firestore.
  const decoded = await verifyToken(idToken);
  if (!decoded) return { status: 401, body: { error: "invalid token" } };

  // Both reads need only what we already know, so they run at the same time.
  const [lesson, courseIds] = await Promise.all([
    getLesson(lessonId),
    enrolledCourseIds(decoded.uid),
  ]);
  if (!lesson) return { status: 404, body: { error: "lesson not found" } };
  if (!(courseIds ?? []).includes(lesson.courseId)) {
    return { status: 403, body: { error: "not enrolled" } };
  }

  const url = await signUrl(lesson.r2Key);
  const body = { url };
  if (Number.isFinite(urlTtlSeconds)) body.expiresIn = urlTtlSeconds;
  return { status: 200, body };
}
