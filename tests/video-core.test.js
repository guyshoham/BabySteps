import { describe, it, expect, vi } from "vitest";
import { runVideoUrl } from "../lib/video-core.js";

function deps(overrides = {}) {
  return {
    verifyToken: vi.fn(async () => ({ uid: "u1" })),
    getLesson: vi.fn(async () => ({ courseId: "rolling", r2Key: "rolling/01.mp4" })),
    isEnrolled: vi.fn(async () => true),
    signUrl: vi.fn(async () => "https://r2.example/signed"),
    ...overrides,
  };
}

describe("runVideoUrl", () => {
  it("401 when token is missing", async () => {
    const r = await runVideoUrl(deps(), { idToken: null, lessonId: "L1" });
    expect(r.status).toBe(401);
  });
  it("400 when lessonId is missing", async () => {
    const r = await runVideoUrl(deps(), { idToken: "t", lessonId: null });
    expect(r.status).toBe(400);
  });
  it("401 when token is invalid", async () => {
    const r = await runVideoUrl(deps({ verifyToken: vi.fn(async () => null) }), { idToken: "t", lessonId: "L1" });
    expect(r.status).toBe(401);
  });
  it("404 when lesson is not found", async () => {
    const r = await runVideoUrl(deps({ getLesson: vi.fn(async () => null) }), { idToken: "t", lessonId: "L1" });
    expect(r.status).toBe(404);
  });
  it("403 when the user is not enrolled", async () => {
    const r = await runVideoUrl(deps({ isEnrolled: vi.fn(async () => false) }), { idToken: "t", lessonId: "L1" });
    expect(r.status).toBe(403);
  });
  it("200 with a signed url when enrolled", async () => {
    const d = deps();
    const r = await runVideoUrl(d, { idToken: "t", lessonId: "L1" });
    expect(r.status).toBe(200);
    expect(r.body.url).toBe("https://r2.example/signed");
    expect(d.signUrl).toHaveBeenCalledWith("rolling/01.mp4");
  });
});
