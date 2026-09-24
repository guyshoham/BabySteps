// lib/enrollment-record.js — pure logic for users/{uid}/enrollments/{courseId}.
//
// The first purchase wins: grantedAt, source and paymentRef never change after
// the doc is created. Refunds and receipts need the original PayPal txnId.
// Every later payment is added to `payments`, once per ref, so a Make retry
// with the same txnId changes nothing.
//
// Doc shape:
//   { grantedAt, source, paymentRef, payments: [{ ref, source, at }] }
// A null paymentRef is never added to `payments` (it cannot be deduplicated).

// existing: the current doc data, or null if the doc does not exist.
// Returns the full doc to write. Does not change `existing`.
export function nextEnrollment(existing, { paymentRef, source, at }) {
  const ref = paymentRef ?? null;

  if (!existing) {
    return {
      grantedAt: at,
      source,
      paymentRef: ref,
      payments: ref === null ? [] : [{ ref, source, at }],
    };
  }

  const first = {
    grantedAt: existing.grantedAt ?? at,
    source: existing.source ?? source,
    paymentRef: existing.paymentRef ?? null,
  };

  // Docs written before `payments` existed: seed it from the old fields.
  const payments = Array.isArray(existing.payments)
    ? existing.payments.map((p) => ({ ...p }))
    : first.paymentRef === null
      ? []
      : [{ ref: first.paymentRef, source: first.source, at: first.grantedAt }];

  if (ref !== null && !payments.some((p) => p.ref === ref)) {
    payments.push({ ref, source, at });
  }

  return { ...first, payments };
}
