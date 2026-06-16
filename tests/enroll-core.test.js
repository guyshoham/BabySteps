import { describe, it, expect, vi } from "vitest";
import { runEnroll } from "../lib/enroll-core.js";

const map = { "ROLLING-2024": "rolling" };

function deps(overrides = {}) {
  return {
    map,
    ensureUser: vi.fn(async () => ({ uid: "u1", created: true, password: "genpw" })),
    ensureEnrollment: vi.fn(async () => {}),
    ...overrides,
  };
}

describe("runEnroll", () => {
  it("400 when email is missing", async () => {
    const r = await runEnroll(deps(), { paypalProductId: "ROLLING-2024" });
    expect(r.status).toBe(400);
  });
  it("400 when product is unknown", async () => {
    const r = await runEnroll(deps(), { email: "a@b.com", paypalProductId: "X" });
    expect(r.status).toBe(400);
  });
  it("creates a new user, enrolls, and returns the generated password", async () => {
    const d = deps();
    const r = await runEnroll(d, { email: "a@b.com", paypalProductId: "ROLLING-2024", paymentRef: "PAY1" });
    expect(r.status).toBe(200);
    expect(r.body.courseId).toBe("rolling");
    expect(r.body.created).toBe(true);
    expect(r.body.password).toBe("genpw");
    expect(d.ensureEnrollment).toHaveBeenCalledWith("u1", "rolling", "PAY1");
  });
  it("is idempotent for an existing user: no password, still enrolls", async () => {
    const d = deps({ ensureUser: vi.fn(async () => ({ uid: "u1", created: false, password: null })) });
    const r = await runEnroll(d, { email: "a@b.com", paypalProductId: "ROLLING-2024" });
    expect(r.status).toBe(200);
    expect(r.body.created).toBe(false);
    expect(r.body.password).toBe(null);
    expect(d.ensureEnrollment).toHaveBeenCalledWith("u1", "rolling", null);
  });
});
