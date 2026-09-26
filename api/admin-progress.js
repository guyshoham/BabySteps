// api/admin-progress.js — GET: every student's progress, for admins only
// (custom claim admin: true, see scripts/set-admin.js). Used by app/admin.html.
import { runAdminProgress, DEFAULT_TESTER_EMAILS } from "../lib/admin-progress-core.js";
import {
  verifyToken, listAllCourses, listAllLessons, listUserDocs,
  listAllEnrollments, listAllProgress, listAuthUsers,
} from "../lib/firebase-admin.js";

export default async function handler(req, res) {
  // Personal data: no shared or browser HTTP cache may keep it.
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method !== "GET") {
    return res.status(405).json({ error: "method not allowed" });
  }
  const authHeader = req.headers.authorization || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const testerEmails = [...DEFAULT_TESTER_EMAILS, process.env.TESTER_EMAIL].filter(Boolean);
  try {
    const result = await runAdminProgress(
      {
        verifyToken,
        listCourses: listAllCourses,
        listLessons: listAllLessons,
        listUserDocs,
        listEnrollments: listAllEnrollments,
        listProgress: listAllProgress,
        listAuthUsers,
      },
      { idToken, testerEmails },
    );
    return res.status(result.status).json(result.body);
  } catch (e) {
    console.error("admin-progress error", e);
    return res.status(500).json({ error: "internal error" });
  }
}
