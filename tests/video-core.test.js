import { describe, it, expect, vi } from "vitest";
import { runVideoUrl } from "../lib/video-core.js";

function deps(overrides = {}) {
  return {
    verifyToken: vi.fn(async () => ({ uid: "u1" })),
    getLesson: vi.fn(async () => ({ courseId: "rolling", r2Key: "rolling/01.mp4" })),
    enrolledCourseIds: vi.fn(async () => ["tummy-time", "rolling"]),
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
  it("401 when token is invalid, and reads nothing", async () => {
    const d = deps({ verifyToken: vi.fn(async () => null) });
    const r = await runVideoUrl(d, { idToken: "t", lessonId: "L1" });
    expect(r.status).toBe(401);
    expect(d.getLesson).not.toHaveBeenCalled();
    expect(d.enrolledCourseIds).not.toHaveBeenCalled();
  });
  it("404 when lesson is not found", async () => {
    const r = await runVideoUrl(deps({ getLesson: vi.fn(async () => null) }), { idToken: "t", lessonId: "L1" });
    expect(r.status).toBe(404);
  });
  it("403 when the user is not enrolled in the lesson's course", async () => {
    const d = deps({ enrolledCourseIds: vi.fn(async () => ["tummy-time"]) });
    const r = await runVideoUrl(d, { idToken: "t", lessonId: "L1" });
    expect(r.status).toBe(403);
    expect(d.signUrl).not.toHaveBeenCalled();
  });
  it("403 when the user has no enrollments", async () => {
    const r = await runVideoUrl(deps({ enrolledCourseIds: vi.fn(async () => []) }), { idToken: "t", lessonId: "L1" });
    expect(r.status).toBe(403);
  });
  it("200 with a signed url when enrolled", async () => {
    const d = deps();
    const r = await runVideoUrl(d, { idToken: "t", lessonId: "L1" });
    expect(r.status).toBe(200);
    expect(r.body).toEqual({ url: "https://r2.example/signed" });
    expect(d.signUrl).toHaveBeenCalledWith("rolling/01.mp4");
    expect(d.enrolledCourseIds).toHaveBeenCalledWith("u1");
  });
  it("sends expiresIn when urlTtlSeconds is given", async () => {
    const r = await runVideoUrl(deps({ urlTtlSeconds: 7200 }), { idToken: "t", lessonId: "L1" });
    expect(r.body).toEqual({ url: "https://r2.example/signed", expiresIn: 7200 });
  });
  it("runs the lesson read and the enrollment read at the same time", async () => {
    const started = [];
    let release;
    const gate = new Promise((r) => { release = r; });
    const d = deps({
      getLesson: vi.fn(async () => { started.push("lesson"); await gate; return { courseId: "rolling", r2Key: "k" }; }),
      enrolledCourseIds: vi.fn(async () => { started.push("enroll"); await gate; return ["rolling"]; }),
    });
    const p = runVideoUrl(d, { idToken: "t", lessonId: "L1" });
    await new Promise((r) => setTimeout(r, 0));
    // Both started before either finished.
    expect(started.sort()).toEqual(["enroll", "lesson"]);
    release();
    expect((await p).status).toBe(200);
  });
});
