// api/video-url.js — GET gatekeeper: verify auth + enrollment, return signed URL.
import { runVideoUrl } from "../lib/video-core.js";
import { verifyToken, getLesson, isEnrolled } from "../lib/firebase-admin.js";
import { signUrl } from "../lib/r2.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "method not allowed" });
  }
  const authHeader = req.headers.authorization || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const lessonId = req.query.lessonId || null;
  try {
    const result = await runVideoUrl(
      { verifyToken, getLesson, isEnrolled, signUrl },
      { idToken, lessonId }
    );
    return res.status(result.status).json(result.body);
  } catch (e) {
    console.error("video-url error", e);
    return res.status(500).json({ error: "internal error" });
  }
}
