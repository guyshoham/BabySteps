import { describe, it, expect } from "vitest";
import { DATA, validate } from "../scripts/course-data.js";

const course = (id) => ({ id, slug: id, title: id, order: 1, published: true });
const lesson = (id, over = {}) => ({
  id, courseId: "c1", order: 1, kind: "video", title: id, r2Key: `c1/${id}.mp4`, ...over,
});

describe("course-data validate", () => {
  it("the real DATA passes", () => {
    expect(validate(DATA)).toEqual([]);
  });

  it("flags a duplicate lesson id", () => {
    const errors = validate({
      courses: [course("c1")],
      lessons: [lesson("l1"), lesson("l1", { order: 2, r2Key: "c1/other.mp4" })],
    });
    expect(errors).toContain("duplicate lesson id: l1");
  });

  it("flags a lesson that points at an unknown course", () => {
    const errors = validate({
      courses: [course("c1")],
      lessons: [lesson("l1", { courseId: "nope" })],
    });
    expect(errors).toContain('lesson l1: unknown courseId "nope"');
  });

  it("flags a duplicate r2Key", () => {
    const errors = validate({
      courses: [course("c1")],
      lessons: [
        lesson("l1", { r2Key: "c1/same.mp4" }),
        lesson("l2", { order: 2, r2Key: "c1/same.mp4" }),
      ],
    });
    expect(errors).toContain('lesson l2: r2Key "c1/same.mp4" is used by another lesson');
  });
});
