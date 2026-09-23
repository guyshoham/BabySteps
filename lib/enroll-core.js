// lib/enroll-core.js
// Pure orchestration of the enroll flow. All I/O is injected via `deps`
// so this is unit-testable without Firebase.
//
// deps:
//   map: { [paypalProductId]: courseId }
//   ensureUser(email): Promise<{ uid, created, hasSignedIn }>
//   ensureEnrollment(uid, courseId, paymentRef): Promise<void>
//   sendWelcome(email): Promise<void>  // Firebase "set your password" email; throws on failure
import { courseIdForProduct } from "./course-map.js";

export async function runEnroll(deps, body) {
  const { map, ensureUser, ensureEnrollment, sendWelcome } = deps;
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

  // Send whenever the buyer has never signed in, not only when the user was just
  // created. If a send fails, Make retries, and on the retry `created` is false.
  // This rule makes sure the retry still sends. Users who already log in get nothing.
  const needsWelcome = !user.hasSignedIn;
  if (needsWelcome) {
    try {
      await sendWelcome(email);
    } catch (e) {
      console.error("welcome email failed", e?.message ?? e);
      // The enrollment is saved. A non-2xx makes Make mark the run as failed so it
      // can be retried. Retrying is safe: enroll is idempotent.
      return { status: 502, body: { error: "welcome email failed" } };
    }
  }

  return {
    status: 200,
    body: {
      uid: user.uid,
      email,
      courseId,
      created: user.created,
      welcomeSent: needsWelcome,
    },
  };
}
