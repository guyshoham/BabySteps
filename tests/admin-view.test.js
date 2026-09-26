import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  studentRows, summary, lastSeen, lastLesson, lessonStates, relativeTime, formatDate, sourceLabel,
} from "../app/admin-view.js";

const ROOT = join(import.meta.dirname, "..");
const NOW = new Date("2026-09-26T12:00:00.000Z");

const courses = [
  { id: "rolling", title: "התהפכות", lessons: [{ id: "r1", title: "א" }, { id: "r2", title: "ב" }] },
  { id: "tummy", title: "בטן", lessons: [{ id: "t1", title: "ג" }] },
];
const entry = (courseId, completed, total, lastActivity = null, lastLessonId = null, ids = []) =>
  ({ courseId, completed, total, lastActivity, lastLessonId, completedLessonIds: ids });

const data = {
  courses,
  students: [
    { uid: "a", email: "anna@example.com", createdAt: "2026-09-01T00:00:00Z", lastSignIn: "2026-09-10T00:00:00Z",
      isTester: false, courses: [entry("rolling", 2, 2, "2026-09-25T00:00:00Z", "r2", ["r1", "r2"])] },
    { uid: "b", email: "bella@example.com", createdAt: "2026-09-20T00:00:00Z", lastSignIn: null,
      isTester: false, courses: [entry("rolling", 0, 2), entry("tummy", 1, 1, "2026-09-01T00:00:00Z", "t1", ["t1"])] },
    { uid: "t", email: "tester@babysteps.test", createdAt: "2026-08-01T00:00:00Z", lastSignIn: "2026-09-26T00:00:00Z",
      isTester: true, courses: [entry("rolling", 1, 2, "2026-09-26T00:00:00Z", "r1", ["r1"])] },
  ],
};

describe("studentRows", () => {
  it("hides the tester unless asked", () => {
    expect(studentRows(data).map((r) => r.student.uid)).toEqual(["a", "b"]);
    expect(studentRows(data, { showTester: true }).map((r) => r.student.uid)).toContain("t");
  });

  it("filters by course and keeps only that course's entry", () => {
    const rows = studentRows(data, { courseId: "tummy" });
    expect(rows.map((r) => r.student.uid)).toEqual(["b"]);
    expect(rows[0].courses.map((c) => c.courseId)).toEqual(["tummy"]);
  });

  it("searches by email, any case", () => {
    expect(studentRows(data, { query: " BEL " }).map((r) => r.student.uid)).toEqual(["b"]);
  });

  it("sorts by activity, progress or join date", () => {
    expect(studentRows(data, { sort: "activity" }).map((r) => r.student.uid)).toEqual(["a", "b"]);
    expect(studentRows(data, { sort: "joined" }).map((r) => r.student.uid)).toEqual(["b", "a"]);
    const rolling = studentRows(data, { sort: "progress", courseId: "rolling" });
    expect(rolling.map((r) => r.student.uid)).toEqual(["a", "b"]);
  });
});

describe("summary", () => {
  it("counts students, active in 7 days, and finished", () => {
    expect(summary(studentRows(data), NOW)).toEqual({ students: 2, active: 1, finished: 2 });
    expect(summary(studentRows(data, { courseId: "rolling" }), NOW)).toEqual({ students: 2, active: 1, finished: 1 });
  });
});

describe("row helpers", () => {
  const byId = new Map(courses.map((c) => [c.id, c]));

  it("lastSeen is the later of sign in and lesson activity", () => {
    expect(lastSeen(data.students[0])).toBe("2026-09-25T00:00:00Z");
    expect(lastSeen(data.students[1], [])).toBeNull();
  });

  it("lastLesson finds the lesson title", () => {
    const [row] = studentRows(data, { query: "bella" });
    expect(lastLesson(row, byId)).toEqual({ lessonId: "t1", title: "ג", at: "2026-09-01T00:00:00Z" });
    expect(lastLesson({ courses: [entry("rolling", 0, 2)] }, byId)).toBeNull();
  });

  it("lessonStates follows the course order", () => {
    expect(lessonStates(courses[0], entry("rolling", 1, 2, "x", "r2", ["r1"]))).toEqual([
      { id: "r1", title: "א", done: true, last: false },
      { id: "r2", title: "ב", done: false, last: true },
    ]);
  });
});

describe("Hebrew dates", () => {
  it("relative time in Hebrew", () => {
    expect(relativeTime("2026-09-23T12:00:00Z", NOW)).toBe("לפני 3 ימים");
    expect(relativeTime("2026-09-25T12:00:00Z", NOW)).toBe("אתמול");
    expect(relativeTime("2026-09-26T11:59:40Z", NOW)).toBe("עכשיו");
    expect(relativeTime("2026-09-26T10:00:00Z", NOW)).toBe("לפני שעתיים");
    expect(relativeTime("2026-09-26T11:59:00Z", NOW)).toBe("לפני דקה");
    expect(relativeTime(null, NOW)).toBe("");
  });

  it("formats a date the Hebrew way, empty for none", () => {
    expect(formatDate("2026-09-26T12:00:00Z")).toMatch(/2026/);
    expect(formatDate(undefined)).toBe("");
  });

  it("names the enrollment source", () => {
    expect(sourceLabel("manual")).toBe("ידני");
    expect(sourceLabel("paypal")).toBe("PayPal");
  });
});

describe("admin page", () => {
  const html = readFileSync(join(ROOT, "app/admin.html"), "utf8");
  const js = readFileSync(join(ROOT, "app/admin.js"), "utf8");

  it("is not indexed, is Hebrew RTL and loads the app styles", () => {
    expect(html).toContain('<meta name="robots" content="noindex, nofollow" />');
    expect(html).toContain('<html lang="he" dir="rtl">');
    expect(html).toContain('<link rel="stylesheet" href="/app/app.css" />');
    expect(html).toContain("אין לך הרשאה לעמוד הזה");
  });

  it("never builds DOM with innerHTML", () => {
    const code = js.replace(/^\s*\/\/.*$/gm, "");
    expect(code).not.toMatch(/innerHTML|insertAdjacentHTML|outerHTML/);
  });

  it("refreshes the token once when the admin claim is missing", () => {
    expect(js).toContain("getIdTokenResult(true)");
  });
});
