// api/video-url.js — GET gatekeeper: verify auth + enrollment, return signed URL.
import { runVideoUrl } from "../lib/video-core.js";
import { verifyToken, getLesson, enrolledCourseIds } from "../lib/firebase-admin.js";
import { signUrl, SIGNED_URL_TTL_SECONDS } from "../lib/r2.js";
import { cachedLoader } from "../lib/ttl-cache.js";

// Lesson docs (courseId, r2Key) change only when the course data is re-seeded,
// so a warm instance keeps them for 5 minutes. Enrollments are never cached.
const LESSON_CACHE_MS = 5 * 60 * 1000;
const getLessonCached = cachedLoader(getLesson, { ttlMs: LESSON_CACHE_MS });

export default async function handler(req, res) {
  // A signed URL is a personal, short-lived credential: no shared or browser
  // HTTP cache may keep it. The page caches it itself (app/video-url-cache.js).
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method !== "GET") {
    return res.status(405).json({ error: "method not allowed" });
  }
  const authHeader = req.headers.authorization || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const lessonId = req.query.lessonId || null;
  try {
    const result = await runVideoUrl(
      {
        verifyToken, getLesson: getLessonCached, enrolledCourseIds, signUrl,
        urlTtlSeconds: SIGNED_URL_TTL_SECONDS,
      },
      { idToken, lessonId }
    );
    return res.status(result.status).json(result.body);
  } catch (e) {
    console.error("video-url error", e);
    return res.status(500).json({ error: "internal error" });
  }
}
