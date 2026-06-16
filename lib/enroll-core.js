// lib/enroll-core.js
// Pure orchestration of the enroll flow. All I/O is injected via `deps`
// so this is unit-testable without Firebase.
//
// deps:
//   map: { [paypalProductId]: courseId }
//   ensureUser(email): Promise<{ uid, created, password|null }>
//   ensureEnrollment(uid, courseId, paymentRef): Promise<void>
import { courseIdForProduct } from "./course-map.js";

export async function runEnroll(deps, body) {
  const { map, ensureUser, ensureEnrollment } = deps;
  const { email, paypalProductId, paymentRef } = body ?? {};

  if (!email || !paypalProductId) {
    return { status: 400, body: { error: "email and paypalProductId are required" } };
  }

  const courseId = courseIdForProduct(paypalProductId, map);
  if (!courseId) {
    return { status: 400, body: { error: `unknown product: ${paypalProductId}` } };
  }

  const user = await ensureUser(email);
  await ensureEnrollment(user.uid, courseId, paymentRef ?? null);

  return {
    status: 200,
    body: {
      uid: user.uid,
      email,
      courseId,
      created: user.created,
      password: user.created ? user.password : null,
    },
  };
}
