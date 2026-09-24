import { describe, it, expect, vi } from "vitest";
import { runManualEnroll } from "../lib/manual-enroll-core.js";

function deps(over = {}) {
  return {
    listCourseIds: vi.fn(async () => ["rolling", "tummy-time"]),
    ensureUser: vi.fn(async () => ({ uid: "u1", created: true, hasSignedIn: false })),
    ensureEnrollment: vi.fn(async () => {}),
    sendWelcome: vi.fn(async () => {}),
    ...over,
  };
}

describe("runManualEnroll", () => {
  it("enrolls a new buyer, marks it manual and sends the welcome email", async () => {
    const d = deps();
    const r = await runManualEnroll(d, { email: " Buyer@Example.com ", courseId: "rolling", paymentRef: "bit-123" });
    expect(d.ensureUser).toHaveBeenCalledWith("buyer@example.com");
    expect(d.ensureEnrollment).toHaveBeenCalledWith("u1", "rolling", "bit-123", "manual");
    expect(d.sendWelcome).toHaveBeenCalledWith("buyer@example.com");
    expect(r).toEqual({ uid: "u1", email: "buyer@example.com", courseId: "rolling", created: true, welcomeSent: true, hasSignedIn: false });
  });

  it("uses 'manual' as the payment ref when none is given", async () => {
    const d = deps();
    await runManualEnroll(d, { email: "a@b.co", courseId: "rolling" });
    expect(d.ensureEnrollment).toHaveBeenCalledWith("u1", "rolling", "manual", "manual");
  });

  it("does not email a user who already signs in", async () => {
    const d = deps({ ensureUser: vi.fn(async () => ({ uid: "u2", created: false, hasSignedIn: true })) });
    const r = await runManualEnroll(d, { email: "a@b.co", courseId: "rolling" });
    expect(d.sendWelcome).not.toHaveBeenCalled();
    expect(r.welcomeSent).toBe(false);
    expect(r.hasSignedIn).toBe(true);
  });

  it("skips the email when noEmail is set", async () => {
    const d = deps();
    const r = await runManualEnroll(d, { email: "a@b.co", courseId: "rolling", noEmail: true });
    expect(d.sendWelcome).not.toHaveBeenCalled();
    expect(r.welcomeSent).toBe(false);
  });

  it("picks the only course when no course is given", async () => {
    const d = deps({ listCourseIds: vi.fn(async () => ["rolling"]) });
    const r = await runManualEnroll(d, { email: "a@b.co" });
    expect(r.courseId).toBe("rolling");
  });

  it("asks for a course when there are several and none is given", async () => {
    await expect(runManualEnroll(deps(), { email: "a@b.co" })).rejects.toThrow(/rolling, tummy-time/);
  });

  it("rejects an unknown course before touching the user", async () => {
    const d = deps();
    await expect(runManualEnroll(d, { email: "a@b.co", courseId: "nope" })).rejects.toThrow(/unknown course/);
    expect(d.ensureUser).not.toHaveBeenCalled();
  });

  it("rejects a bad email before touching the user", async () => {
    const d = deps();
    await expect(runManualEnroll(d, { email: "not-an-email", courseId: "rolling" })).rejects.toThrow(/email/);
    expect(d.ensureUser).not.toHaveBeenCalled();
  });

  it("keeps the enrollment and reports it when the email fails", async () => {
    const d = deps({ sendWelcome: vi.fn(async () => { throw new Error("boom"); }) });
    await expect(runManualEnroll(d, { email: "a@b.co", courseId: "rolling" })).rejects.toThrow(/enrolled, but the welcome email failed: boom/);
    expect(d.ensureEnrollment).toHaveBeenCalled();
  });
});
