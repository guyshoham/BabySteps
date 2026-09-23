// lib/tester-core.js — pure logic for scripts/create-tester.js.
// deps:
//   upsertUser(email, password): Promise<{ uid, created }>
//   listCourseIds(): Promise<string[]>
//   ensureEnrollment(uid, courseId, paymentRef, source): Promise<void>
import { randomInt } from "node:crypto";

export const DEFAULT_TESTER_EMAIL = "tester@babysteps.test";

// No look-alike characters (0/o, 1/l/i), so it is easy to read and type.
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

// 3 groups of 4, e.g. "k7mp-x3rt-9qwz" (about 59 bits of entropy).
export function readablePassword(rand = randomInt) {
  const group = () => Array.from({ length: 4 }, () => ALPHABET[rand(ALPHABET.length)]).join("");
  return [group(), group(), group()].join("-");
}

export async function runCreateTester(deps, { email, password }) {
  if (!email) throw new Error("email is required");
  if (!password) throw new Error("password is required");
  const { uid, created } = await deps.upsertUser(email, password);
  const courseIds = await deps.listCourseIds();
  for (const courseId of courseIds) {
    await deps.ensureEnrollment(uid, courseId, "tester", "tester");
  }
  return { uid, created, courseIds };
}
