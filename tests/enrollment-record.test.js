import { describe, it, expect } from "vitest";
import { nextEnrollment } from "../lib/enrollment-record.js";

const T1 = "2026-09-01T10:00:00.000Z";
const T2 = "2026-09-20T10:00:00.000Z";

describe("nextEnrollment", () => {
  it("creates a new doc with one payment", () => {
    expect(nextEnrollment(null, { paymentRef: "PAY1", source: "paypal", at: T1 })).toEqual({
      grantedAt: T1,
      source: "paypal",
      paymentRef: "PAY1",
      payments: [{ ref: "PAY1", source: "paypal", at: T1 }],
    });
  });

  it("treats undefined existing like a missing doc", () => {
    const r = nextEnrollment(undefined, { paymentRef: "PAY1", source: "paypal", at: T1 });
    expect(r.grantedAt).toBe(T1);
    expect(r.payments).toHaveLength(1);
  });

  it("is a no-op for a retry with the same ref", () => {
    const first = nextEnrollment(null, { paymentRef: "PAY1", source: "paypal", at: T1 });
    const again = nextEnrollment(first, { paymentRef: "PAY1", source: "paypal", at: T2 });
    expect(again).toEqual(first);
  });

  it("keeps the first purchase and appends a second payment", () => {
    const first = nextEnrollment(null, { paymentRef: "PAY1", source: "paypal", at: T1 });
    const r = nextEnrollment(first, { paymentRef: "bit-9", source: "manual", at: T2 });
    expect(r).toEqual({
      grantedAt: T1,
      source: "paypal",
      paymentRef: "PAY1",
      payments: [
        { ref: "PAY1", source: "paypal", at: T1 },
        { ref: "bit-9", source: "manual", at: T2 },
      ],
    });
  });

  it("does not add the same second payment twice", () => {
    let doc = nextEnrollment(null, { paymentRef: "PAY1", source: "paypal", at: T1 });
    doc = nextEnrollment(doc, { paymentRef: "PAY2", source: "paypal", at: T2 });
    doc = nextEnrollment(doc, { paymentRef: "PAY2", source: "paypal", at: "2026-09-21T00:00:00.000Z" });
    expect(doc.payments.map((p) => p.ref)).toEqual(["PAY1", "PAY2"]);
    expect(doc.payments[1].at).toBe(T2);
  });

  it("seeds payments from the old fields of a doc without payments", () => {
    const old = { grantedAt: T1, source: "paypal", paymentRef: "PAY1" };
    const r = nextEnrollment(old, { paymentRef: "manual", source: "manual", at: T2 });
    expect(r).toEqual({
      grantedAt: T1,
      source: "paypal",
      paymentRef: "PAY1",
      payments: [
        { ref: "PAY1", source: "paypal", at: T1 },
        { ref: "manual", source: "manual", at: T2 },
      ],
    });
  });

  it("seeds an old doc and treats a retry of its ref as a no-op", () => {
    const old = { grantedAt: T1, source: "paypal", paymentRef: "PAY1" };
    const r = nextEnrollment(old, { paymentRef: "PAY1", source: "paypal", at: T2 });
    expect(r).toEqual({
      grantedAt: T1,
      source: "paypal",
      paymentRef: "PAY1",
      payments: [{ ref: "PAY1", source: "paypal", at: T1 }],
    });
  });

  it("seeds an empty payments list from an old doc with a null ref", () => {
    const old = { grantedAt: T1, source: "paypal", paymentRef: null };
    const r = nextEnrollment(old, { paymentRef: "PAY2", source: "paypal", at: T2 });
    expect(r).toEqual({
      grantedAt: T1,
      source: "paypal",
      paymentRef: null,
      payments: [{ ref: "PAY2", source: "paypal", at: T2 }],
    });
  });

  it("creates a doc with no payments when paymentRef is null", () => {
    expect(nextEnrollment(null, { paymentRef: null, source: "paypal", at: T1 })).toEqual({
      grantedAt: T1,
      source: "paypal",
      paymentRef: null,
      payments: [],
    });
  });

  it("treats an undefined paymentRef like null", () => {
    const r = nextEnrollment(null, { source: "paypal", at: T1 });
    expect(r.paymentRef).toBeNull();
    expect(r.payments).toEqual([]);
  });

  it("does not append a null ref to an existing doc", () => {
    const first = nextEnrollment(null, { paymentRef: "PAY1", source: "paypal", at: T1 });
    expect(nextEnrollment(first, { paymentRef: null, source: "paypal", at: T2 })).toEqual(first);
  });

  it("does not change the existing doc", () => {
    const existing = {
      grantedAt: T1, source: "paypal", paymentRef: "PAY1",
      payments: [{ ref: "PAY1", source: "paypal", at: T1 }],
    };
    const copy = structuredClone(existing);
    nextEnrollment(existing, { paymentRef: "PAY2", source: "paypal", at: T2 });
    expect(existing).toEqual(copy);
  });
});
