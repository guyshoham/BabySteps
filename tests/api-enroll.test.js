import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the real deps so no Firebase code runs.
const mocks = vi.hoisted(() => ({
  ensureUser: vi.fn(),
  ensureEnrollment: vi.fn(),
  sendWelcome: vi.fn(),
}));
vi.mock("../lib/firebase-admin.js", () => mocks);

import handler from "../api/enroll.js";

function fakeRes() {
  return {
    status(c) { this.code = c; return this; },
    json(b) { this.body = b; return this; },
  };
}

const SECRET = "test-secret";
const body = { email: "a@b.com", paypalProductId: "ROLLING-2024", paymentRef: "PAY1" };

function req(overrides = {}) {
  return { method: "POST", headers: { "x-enroll-secret": SECRET }, body, ...overrides };
}

let savedEnv;

beforeEach(() => {
  savedEnv = { ENROLL_SECRET: process.env.ENROLL_SECRET, COURSE_MAP: process.env.COURSE_MAP };
  process.env.ENROLL_SECRET = SECRET;
  process.env.COURSE_MAP = JSON.stringify({ "ROLLING-2024": "rolling" });
  mocks.ensureUser.mockReset().mockResolvedValue({ uid: "u1", created: true, hasSignedIn: false });
  mocks.ensureEnrollment.mockReset().mockResolvedValue();
  mocks.sendWelcome.mockReset().mockResolvedValue();
});

afterEach(() => {
  for (const [k, v] of Object.entries(savedEnv)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
});

describe("api/enroll handler", () => {
  it("405 on GET", async () => {
    const res = fakeRes();
    await handler(req({ method: "GET" }), res);
    expect(res.code).toBe(405);
    expect(mocks.ensureUser).not.toHaveBeenCalled();
  });

  it("401 when ENROLL_SECRET is not set, even with no header (fail closed)", async () => {
    delete process.env.ENROLL_SECRET;
    const res = fakeRes();
    await handler(req({ headers: {} }), res);
    expect(res.code).toBe(401);
    expect(res.body).toEqual({ error: "unauthorized" });
    expect(mocks.ensureUser).not.toHaveBeenCalled();
  });

  it("401 on a wrong header", async () => {
    const res = fakeRes();
    await handler(req({ headers: { "x-enroll-secret": "nope" } }), res);
    expect(res.code).toBe(401);
    expect(mocks.ensureUser).not.toHaveBeenCalled();
  });

  it("returns the runEnroll status and body on the right header", async () => {
    const res = fakeRes();
    await handler(req(), res);
    expect(res.code).toBe(200);
    expect(res.body).toEqual({
      uid: "u1",
      email: "a@b.com",
      courseId: "rolling",
      created: true,
      welcomeSent: true,
    });
    expect(mocks.ensureEnrollment).toHaveBeenCalledWith("u1", "rolling", "PAY1");
    expect(mocks.sendWelcome).toHaveBeenCalledWith("a@b.com");
  });

  it("passes a runEnroll 400 through (unknown product)", async () => {
    const res = fakeRes();
    await handler(req({ body: { ...body, paypalProductId: "OTHER" } }), res);
    expect(res.code).toBe(400);
    expect(res.body.error).toMatch(/unknown product/);
  });

  it("500 when a dep throws", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.ensureUser.mockRejectedValue(new Error("boom"));
    const res = fakeRes();
    await handler(req(), res);
    expect(res.code).toBe(500);
    expect(res.body).toEqual({ error: "internal error" });
    spy.mockRestore();
  });
});
