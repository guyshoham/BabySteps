import { describe, it, expect } from "vitest";
import { shouldComplete } from "../app/lesson-progress.js";

describe("shouldComplete", () => {
  it("is false at the start", () => {
    expect(shouldComplete(0, 100)).toBe(false);
  });
  it("is false just under 90%", () => {
    expect(shouldComplete(89.9, 100)).toBe(false);
  });
  it("is true at exactly 90%", () => {
    expect(shouldComplete(90, 100)).toBe(true);
  });
  it("is true at the end", () => {
    expect(shouldComplete(100, 100)).toBe(true);
  });
  it("is false when the duration is not known yet", () => {
    expect(shouldComplete(50, NaN)).toBe(false);
    expect(shouldComplete(50, Infinity)).toBe(false);
    expect(shouldComplete(50, 0)).toBe(false);
    expect(shouldComplete(50, undefined)).toBe(false);
  });
  it("is false when the current time is not a number", () => {
    expect(shouldComplete(NaN, 100)).toBe(false);
  });
});
