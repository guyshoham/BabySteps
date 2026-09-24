// lib/manual-enroll-core.js — pure logic for scripts/enroll-manual.js.
// For buyers who did not come through PayPal and Make: Bit/Paybox payments,
// a typo in the email, or a partner's PayPal account.
//
// deps:
//   listCourseIds(): Promise<string[]>
//   ensureUser(email): Promise<{ uid, created, hasSignedIn }>
//   ensureEnrollment(uid, courseId, paymentRef, source): Promise<void>
//   sendWelcome(email): Promise<void>  // throws on failure

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function runManualEnroll(deps, { email, courseId, paymentRef, noEmail = false }) {
  const cleanEmail = String(email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(cleanEmail)) throw new Error(`not a valid email: ${email}`);

  const courseIds = await deps.listCourseIds();
  if (!courseId) {
    if (courseIds.length !== 1) {
      throw new Error(`pick a course: ${courseIds.join(", ") || "(no courses found)"}`);
    }
    courseId = courseIds[0];
  }
  if (!courseIds.includes(courseId)) {
    throw new Error(`unknown course: ${courseId} (known: ${courseIds.join(", ")})`);
  }

  const user = await deps.ensureUser(cleanEmail);
  await deps.ensureEnrollment(user.uid, courseId, paymentRef || "manual", "manual");

  // Same rule as runEnroll: only users who never signed in get the welcome email.
  const welcomeSent = !noEmail && !user.hasSignedIn;
  if (welcomeSent) {
    try {
      await deps.sendWelcome(cleanEmail);
    } catch (e) {
      throw new Error(`enrolled, but the welcome email failed: ${e?.message ?? e}`);
    }
  }

  return {
    uid: user.uid,
    email: cleanEmail,
    courseId,
    created: user.created,
    welcomeSent,
    hasSignedIn: user.hasSignedIn,
  };
}
