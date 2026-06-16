// lib/video-core.js
// Pure orchestration of the gated video-url flow. All I/O injected via `deps`.
//
// deps:
//   verifyToken(idToken): Promise<{ uid } | null>
//   getLesson(lessonId): Promise<{ courseId, r2Key } | null>
//   isEnrolled(uid, courseId): Promise<boolean>
//   signUrl(r2Key): Promise<string>
export async function runVideoUrl(deps, { idToken, lessonId }) {
  const { verifyToken, getLesson, isEnrolled, signUrl } = deps;

  if (!idToken) return { status: 401, body: { error: "missing auth token" } };
  if (!lessonId) return { status: 400, body: { error: "lessonId is required" } };

  const decoded = await verifyToken(idToken);
  if (!decoded) return { status: 401, body: { error: "invalid token" } };

  const lesson = await getLesson(lessonId);
  if (!lesson) return { status: 404, body: { error: "lesson not found" } };

  const enrolled = await isEnrolled(decoded.uid, lesson.courseId);
  if (!enrolled) return { status: 403, body: { error: "not enrolled" } };

  const url = await signUrl(lesson.r2Key);
  return { status: 200, body: { url } };
}
