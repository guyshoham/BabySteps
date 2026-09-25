import { describe, it, expect } from "vitest";
import {
  courseProgress, continueLabel, whatsAppCourseFeedbackUrl, stepStates, progressText,
} from "../app/course-progress.js";
import { WHATSAPP_NUMBER } from "../app/lesson-extras.js";

const L = ["l1", "l2", "l3", "l4"];

describe("courseProgress", () => {
  it("none done: next is the first lesson", () => {
    expect(courseProgress(L, new Set())).toEqual({ done: 0, total: 4, nextId: "l1" });
  });
  it("some done in order: next is the first not done", () => {
    expect(courseProgress(L, new Set(["l1", "l2"]))).toEqual({ done: 2, total: 4, nextId: "l3" });
  });
  it("gaps: next is the earliest lesson not done, not the one after the last done", () => {
    expect(courseProgress(L, new Set(["l2", "l4"]))).toEqual({ done: 2, total: 4, nextId: "l1" });
    expect(courseProgress(L, new Set(["l1", "l3", "l4"]))).toEqual({ done: 3, total: 4, nextId: "l2" });
  });
  it("all done: next wraps to the first lesson", () => {
    expect(courseProgress(L, new Set(L))).toEqual({ done: 4, total: 4, nextId: "l1" });
  });
  it("ignores completed lessons from other courses", () => {
    expect(courseProgress(L, new Set(["other-1", "l1", "other-2"])))
      .toEqual({ done: 1, total: 4, nextId: "l2" });
  });
  it("accepts an array of completed ids", () => {
    expect(courseProgress(L, ["l1"])).toEqual({ done: 1, total: 4, nextId: "l2" });
  });
  it("handles an empty course and missing input", () => {
    expect(courseProgress([], new Set(["l1"]))).toEqual({ done: 0, total: 0, nextId: null });
    expect(courseProgress(undefined, undefined)).toEqual({ done: 0, total: 0, nextId: null });
    expect(courseProgress(L, undefined)).toEqual({ done: 0, total: 4, nextId: "l1" });
  });
});

describe("continueLabel", () => {
  it("starts, continues or restarts", () => {
    expect(continueLabel({ done: 0, total: 4 })).toBe("התחילי מהשיעור הראשון");
    expect(continueLabel({ done: 2, total: 4 })).toBe("המשיכי מאיפה שעצרת");
    expect(continueLabel({ done: 4, total: 4 })).toBe("צפי שוב מההתחלה");
  });
});

describe("stepStates", () => {
  it("fills from the start, one step per done lesson, whatever lessons are done", () => {
    expect(stepStates(L, new Set(["l2", "l4"]))).toEqual([true, true, false, false]);
    expect(stepStates(L, ["l1", "other"])).toEqual([true, false, false, false]);
    expect(stepStates(L, L)).toEqual([true, true, true, true]);
  });
  it("handles missing input", () => {
    expect(stepStates(undefined, undefined)).toEqual([]);
    expect(stepStates(L, undefined)).toEqual([false, false, false, false]);
  });
});

describe("progressText", () => {
  it("says how many lessons are done", () => {
    expect(progressText({ done: 3, total: 18 })).toBe("3 מתוך 18 שיעורים");
  });
});

describe("whatsAppCourseFeedbackUrl", () => {
  const textOf = (url) => new URL(url).searchParams.get("text");
  it("points at Yarden's number with the course title", () => {
    const u = new URL(whatsAppCourseFeedbackUrl("קורס מתהפכים"));
    expect(u.origin).toBe("https://wa.me");
    expect(u.pathname).toBe(`/${WHATSAPP_NUMBER}`);
    expect(textOf(u.href)).toBe("היי ירדן, צילמתי את התרגול מהקורס: קורס מתהפכים");
  });
  it("encodes URL characters in the title", () => {
    const url = whatsAppCourseFeedbackUrl(`a & b #1 ?x=y`);
    expect(url).not.toContain("&");
    expect(url).not.toContain("#");
    expect(textOf(url)).toBe("היי ירדן, צילמתי את התרגול מהקורס: a & b #1 ?x=y");
  });
  it("falls back without a title", () => {
    expect(textOf(whatsAppCourseFeedbackUrl("  "))).toBe("היי ירדן, צילמתי את התרגול");
  });
});
