import { describe, it, expect, vi } from "vitest";
import { runEnroll } from "../lib/enroll-core.js";

const map = { "ROLLING-2024": "rolling" };

function deps(overrides = {}) {
  return {
    map,
    ensureUser: vi.fn(async () => ({ uid: "u1", created: true, hasSignedIn: false })),
    ensureEnrollment: vi.fn(async () => {}),
    sendWelcome: vi.fn(async () => {}),
    ...overrides,
  };
}

const body = { email: "a@b.com", paypalProductId: "ROLLING-2024", paymentRef: "PAY1" };

describe("runEnroll", () => {
  it("400 when email is missing", async () => {
    const d = deps();
    const r = await runEnroll(d, { paypalProductId: "ROLLING-2024" });
    expect(r.status).toBe(400);
    expect(d.sendWelcome).not.toHaveBeenCalled();
  });

  it("400 when product is unknown", async () => {
    const d = deps();
    const r = await runEnroll(d, { email: "a@b.com", paypalProductId: "X" });
    expect(r.status).toBe(400);
    expect(d.sendWelcome).not.toHaveBeenCalled();
  });

  it("new user: enrolls and sends the welcome email", async () => {
    const d = deps();
    const r = await runEnroll(d, body);
    expect(r.status).toBe(200);
    expect(r.body).toEqual({
      uid: "u1", email: "a@b.com", courseId: "rolling", created: true, welcomeSent: true,
    });
    expect(d.ensureEnrollment).toHaveBeenCalledWith("u1", "rolling", "PAY1");
    expect(d.sendWelcome).toHaveBeenCalledWith("a@b.com");
  });

  it("existing user who never signed in: sends again (covers a retry after a failed send)", async () => {
    const d = deps({
      ensureUser: vi.fn(async () => ({ uid: "u1", created: false, hasSignedIn: false })),
    });
    const r = await runEnroll(d, { email: "a@b.com", paypalProductId: "ROLLING-2024" });
    expect(r.status).toBe(200);
    expect(r.body.created).toBe(false);
    expect(r.body.welcomeSent).toBe(true);
    expect(d.ensureEnrollment).toHaveBeenCalledWith("u1", "rolling", null);
    expect(d.sendWelcome).toHaveBeenCalledWith("a@b.com");
  });

  it("existing user who already signed in: enrolls, no email", async () => {
    const d = deps({
      ensureUser: vi.fn(async () => ({ uid: "u1", created: false, hasSignedIn: true })),
    });
    const r = await runEnroll(d, body);
    expect(r.status).toBe(200);
    expect(r.body.created).toBe(false);
    expect(r.body.welcomeSent).toBe(false);
    expect(d.ensureEnrollment).toHaveBeenCalledWith("u1", "rolling", "PAY1");
    expect(d.sendWelcome).not.toHaveBeenCalled();
  });

  it("send failure: returns 502 but the enrollment is still written", async () => {
    const d = deps({ sendWelcome: vi.fn(async () => { throw new Error("EMAIL_NOT_FOUND"); }) });
    const r = await runEnroll(d, body);
    expect(r.status).toBe(502);
    expect(r.body).toEqual({ error: "welcome email failed" });
    expect(d.ensureEnrollment).toHaveBeenCalledWith("u1", "rolling", "PAY1");
  });

  it("sends only after the enrollment is written", async () => {
    const order = [];
    const d = deps({
      ensureEnrollment: vi.fn(async () => { order.push("enroll"); }),
      sendWelcome: vi.fn(async () => { order.push("send"); }),
    });
    await runEnroll(d, body);
    expect(order).toEqual(["enroll", "send"]);
  });

  it("never returns a password", async () => {
    const d = deps({
      ensureUser: vi.fn(async () => ({ uid: "u1", created: true, hasSignedIn: false, password: "x" })),
    });
    const r = await runEnroll(d, body);
    expect(r.body).not.toHaveProperty("password");
  });
});
