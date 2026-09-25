import { describe, it, expect } from "vitest";
import {
  findNeighbors, lessonPosition, positionLabel, stepStates, doneCountLabel,
  remainingLabel, upNext,
} from "../app/lesson-nav.js";

describe("findNeighbors", () => {
  const ids = ["a", "b", "c"];
  it("middle lesson has both neighbors", () => {
    expect(findNeighbors(ids, "b")).toEqual({ prev: "a", next: "c" });
  });
  it("first lesson has no prev", () => {
    expect(findNeighbors(ids, "a")).toEqual({ prev: null, next: "b" });
  });
  it("last lesson has no next", () => {
    expect(findNeighbors(ids, "c")).toEqual({ prev: "b", next: null });
  });
  it("unknown lesson has no neighbors", () => {
    expect(findNeighbors(ids, "x")).toEqual({ prev: null, next: null });
  });
});

describe("lessonPosition and positionLabel", () => {
  const ids = Array.from({ length: 18 }, (_, i) => `l${i + 1}`);
  it("counts from 1", () => {
    expect(lessonPosition(ids, "l1")).toEqual({ index: 1, total: 18 });
    expect(lessonPosition(ids, "l18")).toEqual({ index: 18, total: 18 });
  });
  it("builds the Hebrew line", () => {
    expect(positionLabel(lessonPosition(ids, "l3"))).toBe("שיעור 3 מתוך 18");
  });
  it("is null and empty for an unknown lesson or list", () => {
    expect(lessonPosition(ids, "x")).toBeNull();
    expect(lessonPosition(undefined, "l1")).toBeNull();
    expect(positionLabel(null)).toBe("");
  });
});

describe("stepStates", () => {
  it("marks done and current lessons", () => {
    expect(stepStates(["a", "b", "c"], new Set(["a"]), "b")).toEqual([
      { id: "a", done: true, current: false },
      { id: "b", done: false, current: true },
      { id: "c", done: false, current: false },
    ]);
  });
  it("accepts an array and ignores other courses", () => {
    expect(stepStates(["a"], ["z", "a"], "a")).toEqual([{ id: "a", done: true, current: true }]);
  });
  it("is empty for a missing list", () => {
    expect(stepStates(undefined, [], "a")).toEqual([]);
  });
});

describe("doneCountLabel", () => {
  it("counts only this course's done lessons", () => {
    expect(doneCountLabel(["a", "b", "c"], ["a", "c", "x"])).toBe("בוצעו 2 מתוך 3 שיעורים");
  });
  it("handles nothing done", () => {
    expect(doneCountLabel(["a"], undefined)).toBe("בוצעו 0 מתוך 1 שיעורים");
  });
});

describe("remainingLabel", () => {
  it("uses the singular for one lesson", () => {
    expect(remainingLabel(1)).toBe("נשאר לך עוד שיעור אחד");
  });
  it("uses the plural with the number", () => {
    expect(remainingLabel(4)).toBe("נשארו לך עוד 4 שיעורים");
  });
  it("is empty for zero, negative or bad input", () => {
    expect(remainingLabel(0)).toBe("");
    expect(remainingLabel(-2)).toBe("");
    expect(remainingLabel(undefined)).toBe("");
    expect(remainingLabel(1.5)).toBe("");
  });
});

describe("upNext", () => {
  const ids = ["a", "b", "c"];
  it("is the next lesson when there is one, done or not", () => {
    expect(upNext(ids, [], "a")).toEqual({ type: "next", id: "b" });
    expect(upNext(ids, ["b", "c"], "b")).toEqual({ type: "next", id: "c" });
  });
  it("on the last lesson, points at the first open lesson and counts them", () => {
    expect(upNext(ids, ["b"], "c")).toEqual({ type: "open", id: "a", remaining: 1 });
    expect(upNext(ids, [], "c")).toEqual({ type: "open", id: "a", remaining: 2 });
  });
  it("never counts the current lesson as open", () => {
    expect(upNext(ids, ["a", "b"], "c")).toEqual({ type: "course" });
  });
  it("is the course page when everything is done", () => {
    expect(upNext(ids, new Set(ids), "c")).toEqual({ type: "course" });
  });
  it("is the course page for a one lesson course", () => {
    expect(upNext(["a"], [], "a")).toEqual({ type: "course" });
  });
});
