// lib/enroll-core.js
// Pure orchestration of the enroll flow. All I/O is injected via `deps`
// so this is unit-testable without Firebase.
//
// deps:
//   map: { [paypalProductId]: courseId }
//   ensureUser(email): Promise<{ uid, created, hasSignedIn }>
//   ensureEnrollment(uid, courseId, paymentRef): Promise<void>
//   sendWelcome(email): Promise<void>  // Firebase "set your password" email; throws on failure
//   prices?: { [courseId]: number }     // ₪ per course, defaults to lib/prices.js
//   requireAmount?: boolean             // true (REQUIRE_AMOUNT=1) rejects a call without `amount`
import { courseIdForProduct } from "./course-map.js";
import { PRICES } from "./prices.js";

const isBlank = (v) => v === undefined || v === null || v === "";

// Checks the paid amount against the course price. Returns an error response, or null if OK.
// A higher amount is allowed. A missing amount passes (with a warning) unless requireAmount is set,
// so an old Make scenario that does not send it keeps working until it is updated.
function checkAmount({ amount, currency, courseId, prices, requireAmount, paymentRef }) {
  if (isBlank(amount)) {
    if (requireAmount) {
      console.error("enroll rejected: no amount sent", { courseId, paymentRef });
      return { status: 400, body: { error: "amount is required" } };
    }
    console.warn("enroll: no amount sent, price not checked", { courseId, paymentRef });
    return null;
  }
  if (currency !== "ILS") {
    console.error("enroll rejected: wrong currency", { courseId, currency, paymentRef });
    return { status: 400, body: { error: "currency must be ILS" } };
  }
  const price = prices[courseId];
  if (typeof price !== "number") {
    // Fail closed: a course without a price cannot be checked.
    console.error("enroll rejected: no price for course", { courseId, paymentRef });
    return { status: 400, body: { error: `no price for course: ${courseId}` } };
  }
  const paid = Number(amount);
  if (!Number.isFinite(paid) || paid < price) {
    console.error("enroll rejected: amount below price", { courseId, amount, price, paymentRef });
    return { status: 400, body: { error: "amount below price" } };
  }
  return null;
}

export async function runEnroll(deps, body) {
  const { map, ensureUser, ensureEnrollment, sendWelcome, prices = PRICES, requireAmount = false } = deps;
  const { email, paypalProductId, paymentRef, amount, currency } = body ?? {};

  if (!email || !paypalProductId) {
    return { status: 400, body: { error: "email and paypalProductId are required" } };
  }

  const courseId = courseIdForProduct(paypalProductId, map);
  if (!courseId) {
    return { status: 400, body: { error: `unknown product: ${paypalProductId}` } };
  }

  const amountError = checkAmount({ amount, currency, courseId, prices, requireAmount, paymentRef });
  if (amountError) return amountError;

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
