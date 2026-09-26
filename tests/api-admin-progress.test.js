import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the real deps so no Firebase code runs.
const mocks = vi.hoisted(() => ({
  verifyToken: vi.fn(),
  list: vi.fn(async () => []),
}));
vi.mock("../lib/firebase-admin.js", () => ({
  verifyToken: mocks.verifyToken,
  listAllCourses: mocks.list,
  listAllLessons: mocks.list,
  listUserDocs: mocks.list,
  listAllEnrollments: mocks.list,
  listAllProgress: mocks.list,
  listAuthUsers: mocks.list,
}));

import handler from "../api/admin-progress.js";

function fakeRes() {
  return {
    headers: {},
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; return this; },
    status(c) { this.code = c; return this; },
    json(b) { this.body = b; return this; },
  };
}
const req = (over = {}) => ({ method: "GET", headers: { authorization: "Bearer tok" }, query: {}, ...over });

beforeEach(() => {
  mocks.verifyToken.mockReset().mockResolvedValue({ uid: "y", admin: true });
  mocks.list.mockReset().mockResolvedValue([]);
});

describe("api/admin-progress handler", () => {
  it("405 on POST", async () => {
    const res = fakeRes();
    await handler(req({ method: "POST" }), res);
    expect(res.code).toBe(405);
  });

  it("401 without a Bearer token", async () => {
    for (const headers of [{}, { authorization: "tok" }]) {
      const res = fakeRes();
      await handler(req({ headers }), res);
      expect(res.code).toBe(401);
    }
    expect(mocks.verifyToken).not.toHaveBeenCalled();
  });

  it("401 when the token does not verify", async () => {
    mocks.verifyToken.mockResolvedValue(null);
    const res = fakeRes();
    await handler(req(), res);
    expect(res.code).toBe(401);
    expect(mocks.list).not.toHaveBeenCalled();
  });

  it("403 for a user without the admin claim", async () => {
    mocks.verifyToken.mockResolvedValue({ uid: "s", admin: false });
    const res = fakeRes();
    await handler(req(), res);
    expect(res.code).toBe(403);
    expect(mocks.list).not.toHaveBeenCalled();
  });

  it("200 for an admin", async () => {
    const res = fakeRes();
    await handler(req(), res);
    expect(res.code).toBe(200);
    expect(res.body).toMatchObject({ courses: [], students: [] });
    expect(mocks.verifyToken).toHaveBeenCalledWith("tok");
  });

  it("never lets an HTTP cache keep the response", async () => {
    for (const r of [req(), req({ method: "POST" }), req({ headers: {} })]) {
      const res = fakeRes();
      await handler(r, res);
      expect(res.headers["cache-control"]).toBe("private, no-store");
    }
  });

  it("500 when a read fails", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.list.mockRejectedValue(new Error("boom"));
    const res = fakeRes();
    await handler(req(), res);
    expect(res.code).toBe(500);
    expect(res.body).toEqual({ error: "internal error" });
    spy.mockRestore();
  });
});
