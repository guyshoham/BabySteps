import { describe, it, expect } from "vitest";
import { DATA, validate } from "../scripts/course-data.js";

const courses = [
  { id: "rolling", slug: "rolling" },
  { id: "tummy-time", slug: "tummy-time" },
];
const lesson = (id, courseId, order, r2Key) => ({ id, courseId, order, kind: "video", r2Key });

describe("validate: r2Key file names", () => {
  it("passes the real course data", () => {
    expect(validate(DATA)).toEqual([]);
  });

  it("fails on two keys with the same file name in one course", () => {
    const errors = validate({
      courses,
      lessons: [
        lesson("a", "rolling", 1, "rolling/lesson-01.mp4"),
        lesson("b", "rolling", 2, "rolling/extra/lesson-01.mp4"),
      ],
    });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/lesson b: .*same file name as "rolling\/lesson-01\.mp4" in rolling/);
  });

  it("allows the same file name in different courses", () => {
    const errors = validate({
      courses,
      lessons: [
        lesson("a", "rolling", 1, "rolling/lesson-01.mp4"),
        lesson("b", "tummy-time", 1, "tummy-time/lesson-01.mp4"),
      ],
    });
    expect(errors).toEqual([]);
  });

  it("reports an exact duplicate key once, not twice", () => {
    const errors = validate({
      courses,
      lessons: [
        lesson("a", "rolling", 1, "rolling/lesson-01.mp4"),
        lesson("b", "rolling", 2, "rolling/lesson-01.mp4"),
      ],
    });
    expect(errors).toEqual(['lesson b: r2Key "rolling/lesson-01.mp4" is used by another lesson']);
  });
});
