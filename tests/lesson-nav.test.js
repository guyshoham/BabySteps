import { describe, it, expect } from "vitest";
import { findNeighbors } from "../app/lesson-nav.js";

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
