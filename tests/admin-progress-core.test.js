import { describe, it, expect, vi } from "vitest";
import { runAdminProgress, buildAdminProgress } from "../lib/admin-progress-core.js";

const NOW = new Date("2026-09-26T12:00:00.000Z");

function data() {
  return {
    courses: [
      { id: "tummy-time", title: "בטן", slug: "tummy-time", order: 2, published: true },
      { id: "rolling", title: "התהפכות", slug: "rolling", order: 1 },
    ],
    lessons: [
      { id: "r2", courseId: "rolling", title: "שיעור 2", order: 2, r2Key: "secret/r2.mp4" },
      { id: "r1", courseId: "rolling", title: "שיעור 1", order: 1 },
      { id: "r3", courseId: "rolling", title: "שיעור 3", order: 3 },
      { id: "t1", courseId: "tummy-time", title: "בטן 1", order: 1 },
    ],
    users: [
      { uid: "a", email: "Mom@Example.com", createdAt: "2026-09-01T10:00:00.000Z" },
      { uid: "b", email: "other@example.com", createdAt: "2026-09-10T10:00:00.000Z" },
      { uid: "t", email: "tester@babysteps.test", createdAt: "2026-08-01T10:00:00.000Z" },
    ],
    enrollments: [
      { uid: "a", courseId: "tummy-time", grantedAt: "2026-09-02T00:00:00.000Z", source: "paypal" },
      { uid: "a", courseId: "rolling", grantedAt: "2026-09-01T00:00:00.000Z", source: "paypal" },
      { uid: "b", courseId: "rolling", grantedAt: "2026-09-10T00:00:00.000Z", source: "manual" },
      { uid: "t", courseId: "rolling", grantedAt: "2026-08-01T00:00:00.000Z", source: "tester" },
    ],
    progress: [
      { uid: "a", lessonId: "r1", completed: true, updatedAt: "2026-09-20T08:00:00.000Z" },
      { uid: "a", lessonId: "r2", completed: false, updatedAt: "2026-09-25T08:00:00.000Z" },
      { uid: "a", lessonId: "r3", completed: true, updatedAt: "2026-09-21T08:00:00.000Z" },
      { uid: "a", lessonId: "t1", completed: true, updatedAt: "2026-09-22T08:00:00.000Z" },
    ],
    authUsers: [
      { uid: "a", email: "mom@example.com", createdAt: "2026-09-01T09:00:00.000Z", lastSignIn: "2026-09-24T07:00:00.000Z", passwordHash: "HASH" },
      { uid: "b", email: "other@example.com", createdAt: null, lastSignIn: null },
    ],
  };
}

function deps(over = {}) {
  const d = data();
  return {
    verifyToken: vi.fn(async () => ({ uid: "admin1", admin: true })),
    listCourses: vi.fn(async () => d.courses),
    listLessons: vi.fn(async () => d.lessons),
    listUserDocs: vi.fn(async () => d.users),
    listEnrollments: vi.fn(async () => d.enrollments),
    listProgress: vi.fn(async () => d.progress),
    listAuthUsers: vi.fn(async () => d.authUsers),
    ...over,
  };
}

describe("runAdminProgress", () => {
  it("401 without a token, and reads nothing", async () => {
    const d = deps();
    const r = await runAdminProgress(d, { idToken: null });
    expect(r.status).toBe(401);
    expect(d.verifyToken).not.toHaveBeenCalled();
    expect(d.listUserDocs).not.toHaveBeenCalled();
  });

  it("401 with a bad token", async () => {
    const d = deps({ verifyToken: vi.fn(async () => null) });
    const r = await runAdminProgress(d, { idToken: "bad" });
    expect(r.status).toBe(401);
    expect(d.listUserDocs).not.toHaveBeenCalled();
  });

  it("403 for a signed-in user who is not admin, and reads nothing", async () => {
    for (const decoded of [{ uid: "u" }, { uid: "u", admin: false }, { uid: "u", admin: "true" }]) {
      const d = deps({ verifyToken: vi.fn(async () => decoded) });
      const r = await runAdminProgress(d, { idToken: "tok" });
      expect(r.status).toBe(403);
      expect(r.body).toEqual({ error: "not an admin" });
      expect(d.listProgress).not.toHaveBeenCalled();
      expect(d.listAuthUsers).not.toHaveBeenCalled();
    }
  });

  it("200 with courses and students for an admin", async () => {
    const d = deps();
    const r = await runAdminProgress(d, { idToken: "tok", now: NOW });
    expect(d.verifyToken).toHaveBeenCalledWith("tok");
    expect(r.status).toBe(200);
    expect(r.body.generatedAt).toBe(NOW.toISOString());
    expect(r.body.courses.map((c) => c.id)).toEqual(["rolling", "tummy-time"]);
    expect(r.body.students).toHaveLength(3);
  });

  it("starts every read at the same time", async () => {
    let started = 0;
    const slow = () => vi.fn(() => { started++; return new Promise((res) => setTimeout(() => res([]), 5)); });
    const d = deps({
      listCourses: slow(), listLessons: slow(), listUserDocs: slow(),
      listEnrollments: slow(), listProgress: slow(), listAuthUsers: slow(),
    });
    const p = runAdminProgress(d, { idToken: "tok" });
    await new Promise((res) => setTimeout(res, 0));
    expect(started).toBe(6);
    await p;
  });
});

describe("buildAdminProgress", () => {
  const out = buildAdminProgress(data(), { now: NOW });
  const byUid = Object.fromEntries(out.students.map((s) => [s.uid, s]));

  it("lists each course's lessons in order, with only id, title and order", () => {
    expect(out.courses[0]).toEqual({
      id: "rolling", title: "התהפכות", slug: "rolling", order: 1, published: true,
      lessons: [
        { id: "r1", title: "שיעור 1", order: 1 },
        { id: "r2", title: "שיעור 2", order: 2 },
        { id: "r3", title: "שיעור 3", order: 3 },
      ],
    });
    expect(JSON.stringify(out)).not.toContain("r2Key");
    expect(JSON.stringify(out)).not.toContain("secret/");
  });

  it("counts done lessons per course and finds the last lesson touched", () => {
    const a = byUid.a;
    expect(a.email).toBe("mom@example.com");
    expect(a.createdAt).toBe("2026-09-01T10:00:00.000Z");
    expect(a.lastSignIn).toBe("2026-09-24T07:00:00.000Z");
    expect(a.lastActivity).toBe("2026-09-25T08:00:00.000Z");
    expect(a.courses.map((c) => c.courseId)).toEqual(["rolling", "tummy-time"]);
    expect(a.courses[0]).toEqual({
      courseId: "rolling", grantedAt: "2026-09-01T00:00:00.000Z", source: "paypal",
      completed: 2, total: 3, completedLessonIds: ["r1", "r3"],
      lastActivity: "2026-09-25T08:00:00.000Z", lastLessonId: "r2",
    });
    expect(a.courses[1]).toMatchObject({ completed: 1, total: 1, lastLessonId: "t1" });
  });

  it("a student with no progress has 0 done and no activity", () => {
    expect(byUid.b.courses[0]).toMatchObject({ completed: 0, total: 3, completedLessonIds: [], lastActivity: null, lastLessonId: null });
    expect(byUid.b.lastSignIn).toBeNull();
  });

  it("marks the tester by email or by a tester enrollment", () => {
    expect(byUid.t.isTester).toBe(true);
    expect(byUid.a.isTester).toBe(false);
    const other = buildAdminProgress(
      { users: [{ uid: "x", email: "x@y.co" }], enrollments: [{ uid: "x", courseId: "rolling", source: "tester" }] },
      { now: NOW },
    );
    expect(other.students[0].isTester).toBe(true);
  });

  it("sorts by last activity, newest first", () => {
    expect(out.students[0].uid).toBe("a");
  });

  it("never passes on Auth internals", () => {
    expect(JSON.stringify(out)).not.toContain("HASH");
    expect(Object.keys(byUid.a).sort()).toEqual(
      ["courses", "createdAt", "email", "isTester", "lastActivity", "lastSignIn", "uid"],
    );
  });

  it("keeps an enrollment in a course that has no doc, with 0 lessons", () => {
    const r = buildAdminProgress({ users: [{ uid: "x", email: "x@y.co" }], enrollments: [{ uid: "x", courseId: "gone" }] });
    expect(r.students[0].courses[0]).toMatchObject({ courseId: "gone", completed: 0, total: 0 });
  });
});
