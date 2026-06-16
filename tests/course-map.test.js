import { describe, it, expect } from "vitest";
import { loadCourseMap, courseIdForProduct } from "../lib/course-map.js";

describe("course-map", () => {
  it("returns courseId for a known product", () => {
    expect(courseIdForProduct("ROLLING-2024", { "ROLLING-2024": "rolling" })).toBe("rolling");
  });
  it("returns null for an unknown product", () => {
    expect(courseIdForProduct("NOPE", { "ROLLING-2024": "rolling" })).toBe(null);
  });
  it("returns null for a missing productId", () => {
    expect(courseIdForProduct(undefined, {})).toBe(null);
  });
  it("loads the map from COURSE_MAP env JSON", () => {
    expect(loadCourseMap({ COURSE_MAP: '{"P1":"c1"}' })).toEqual({ P1: "c1" });
  });
  it("returns an empty map when COURSE_MAP is absent", () => {
    expect(loadCourseMap({})).toEqual({});
  });
  it("throws on invalid COURSE_MAP JSON", () => {
    expect(() => loadCourseMap({ COURSE_MAP: "{bad" })).toThrow();
  });
});
