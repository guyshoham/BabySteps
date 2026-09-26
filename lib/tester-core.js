// lib/tester-core.js — pure logic for scripts/create-tester.js.
// deps:
//   upsertUser(email, password): Promise<{ uid, created }>
//   listCourses(): Promise<{ id, published }[]>
//   ensureEnrollment(uid, courseId, paymentRef, source): Promise<void>
//   grantAdmin(uid): Promise<{ changed }>  // sets the admin claim, keeps other claims
// The tester is also an admin, so it can open /app/admin.
import { randomInt } from "node:crypto";

export const DEFAULT_TESTER_EMAIL = "tester@babysteps.test";

// No look-alike characters (0/o, 1/l/i), so it is easy to read and type.
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

// 3 groups of 4, e.g. "k7mp-x3rt-9qwz" (about 59 bits of entropy).
export function readablePassword(rand = randomInt) {
  const group = () => Array.from({ length: 4 }, () => ALPHABET[rand(ALPHABET.length)]).join("");
  return [group(), group(), group()].join("-");
}

// The tester only gets courses a student could see: `published: false` is skipped.
// A course with no `published` field counts as published (same rule as the app).
export function publishedCourseIds(courses) {
  return courses.filter((c) => c.published !== false).map((c) => c.id);
}

export async function runCreateTester(deps, { email, password }) {
  if (!email) throw new Error("email is required");
  if (!password) throw new Error("password is required");
  const { uid, created } = await deps.upsertUser(email, password);
  const courseIds = publishedCourseIds(await deps.listCourses());
  for (const courseId of courseIds) {
    await deps.ensureEnrollment(uid, courseId, "tester", "tester");
  }
  const { changed: adminChanged } = await deps.grantAdmin(uid);
  return { uid, created, courseIds, admin: true, adminChanged };
}
