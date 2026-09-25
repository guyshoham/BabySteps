import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the real deps so no Firebase or R2 code runs.
const mocks = vi.hoisted(() => ({
  verifyToken: vi.fn(),
  getLesson: vi.fn(),
  enrolledCourseIds: vi.fn(),
  signUrl: vi.fn(),
}));
vi.mock("../lib/firebase-admin.js", () => ({
  verifyToken: mocks.verifyToken,
  getLesson: mocks.getLesson,
  enrolledCourseIds: mocks.enrolledCourseIds,
}));
vi.mock("../lib/r2.js", () => ({ signUrl: mocks.signUrl, SIGNED_URL_TTL_SECONDS: 7200 }));

import handler from "../api/video-url.js";

function fakeRes() {
  return {
    headers: {},
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; return this; },
    status(c) { this.code = c; return this; },
    json(b) { this.body = b; return this; },
  };
}

function req(overrides = {}) {
  return {
    method: "GET",
    headers: { authorization: "Bearer tok123" },
    query: { lessonId: "rolling-01" },
    ...overrides,
  };
}

beforeEach(() => {
  mocks.verifyToken.mockReset().mockResolvedValue({ uid: "u1" });
  mocks.getLesson.mockReset().mockResolvedValue({ courseId: "rolling", r2Key: "rolling/lesson-01.mp4" });
  mocks.enrolledCourseIds.mockReset().mockResolvedValue(["rolling"]);
  mocks.signUrl.mockReset().mockResolvedValue("https://signed.example/x");
});

describe("api/video-url handler", () => {
  it("405 on POST", async () => {
    const res = fakeRes();
    await handler(req({ method: "POST" }), res);
    expect(res.code).toBe(405);
  });

  it("401 when the Authorization header is missing", async () => {
    const res = fakeRes();
    await handler(req({ headers: {} }), res);
    expect(res.code).toBe(401);
    expect(mocks.verifyToken).not.toHaveBeenCalled();
  });

  it("401 when the Authorization header has no 'Bearer ' prefix", async () => {
    const res = fakeRes();
    await handler(req({ headers: { authorization: "tok123" } }), res);
    expect(res.code).toBe(401);
    expect(mocks.verifyToken).not.toHaveBeenCalled();
  });

  it("400 when lessonId is missing", async () => {
    const res = fakeRes();
    await handler(req({ query: {} }), res);
    expect(res.code).toBe(400);
    expect(mocks.getLesson).not.toHaveBeenCalled();
  });

  it("200 with the signed URL on the happy path", async () => {
    const res = fakeRes();
    await handler(req(), res);
    expect(res.code).toBe(200);
    expect(res.body).toEqual({ url: "https://signed.example/x", expiresIn: 7200 });
    expect(mocks.verifyToken).toHaveBeenCalledWith("tok123");
    expect(mocks.enrolledCourseIds).toHaveBeenCalledWith("u1");
    expect(mocks.signUrl).toHaveBeenCalledWith("rolling/lesson-01.mp4");
  });

  it("never lets an HTTP cache keep the response", async () => {
    for (const r of [req(), req({ method: "POST" }), req({ headers: {} })]) {
      const res = fakeRes();
      await handler(r, res);
      expect(res.headers["cache-control"]).toBe("private, no-store");
    }
  });

  it("403 when not enrolled in the lesson's course", async () => {
    mocks.enrolledCourseIds.mockResolvedValue(["tummy-time"]);
    const res = fakeRes();
    await handler(req(), res);
    expect(res.code).toBe(403);
    expect(mocks.signUrl).not.toHaveBeenCalled();
  });

  it("keeps a lesson doc in memory between requests, but reads enrollment every time", async () => {
    await handler(req({ query: { lessonId: "cache-me" } }), fakeRes());
    await handler(req({ query: { lessonId: "cache-me" } }), fakeRes());
    expect(mocks.getLesson.mock.calls.filter((c) => c[0] === "cache-me")).toHaveLength(1);
    expect(mocks.enrolledCourseIds).toHaveBeenCalledTimes(2);
  });

  it("500 when a dep throws", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.getLesson.mockRejectedValue(new Error("boom"));
    const res = fakeRes();
    await handler(req({ query: { lessonId: "not-cached" } }), res);
    expect(res.code).toBe(500);
    expect(res.body).toEqual({ error: "internal error" });
    spy.mockRestore();
  });
});
