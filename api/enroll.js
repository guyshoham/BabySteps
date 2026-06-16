// api/enroll.js — POST webhook called by Make after a PayPal payment.
import { runEnroll } from "../lib/enroll-core.js";
import { loadCourseMap } from "../lib/course-map.js";
import { ensureUser, ensureEnrollment } from "../lib/firebase-admin.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }
  // Fail closed: if the secret isn't configured, reject everything rather than
  // letting `undefined === undefined` leave the endpoint open.
  if (!process.env.ENROLL_SECRET || req.headers["x-enroll-secret"] !== process.env.ENROLL_SECRET) {
    return res.status(401).json({ error: "unauthorized" });
  }
  try {
    const map = loadCourseMap();
    const result = await runEnroll({ map, ensureUser, ensureEnrollment }, req.body);
    return res.status(result.status).json(result.body);
  } catch (e) {
    console.error("enroll error", e);
    return res.status(500).json({ error: "internal error" });
  }
}
