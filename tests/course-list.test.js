import { describe, it, expect } from "vitest";
import { visibleCourses } from "../app/course-list.js";

const ids = (list) => list.map((c) => c.id);

describe("visibleCourses", () => {
  it("drops unpublished courses", () => {
    const r = visibleCourses([
      { id: "rolling", published: true, order: 1 },
      { id: "tummy-time", published: false, order: 2 },
    ]);
    expect(ids(r)).toEqual(["rolling"]);
  });
  it("keeps a course with no published field", () => {
    expect(ids(visibleCourses([{ id: "a", order: 1 }]))).toEqual(["a"]);
  });
  it("sorts by order, not input order", () => {
    const r = visibleCourses([{ id: "c", order: 3 }, { id: "a", order: 1 }, { id: "b", order: 2 }]);
    expect(ids(r)).toEqual(["a", "b", "c"]);
  });
  it("puts courses with no order last and keeps ties stable", () => {
    const r = visibleCourses([{ id: "x" }, { id: "b", order: 1 }, { id: "y" }, { id: "a", order: 1 }]);
    expect(ids(r)).toEqual(["b", "a", "x", "y"]);
  });
  it("skips missing courses and handles an empty list", () => {
    expect(ids(visibleCourses([null, { id: "a" }]))).toEqual(["a"]);
    expect(visibleCourses([])).toEqual([]);
  });
});
