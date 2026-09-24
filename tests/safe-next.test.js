import { describe, it, expect } from "vitest";
import { safeNext } from "../app/safe-next.js";

const HOME = "/app/my-courses";

describe("safeNext", () => {
  it("keeps an in-app path with its query", () => {
    expect(safeNext("/app/lesson/rolling-02?x=1")).toBe("/app/lesson/rolling-02?x=1");
    expect(safeNext("/app/course/rolling")).toBe("/app/course/rolling");
  });
  it("falls back when missing", () => {
    expect(safeNext(null)).toBe(HOME);
    expect(safeNext("")).toBe(HOME);
  });
  it.each([
    "https://evil.example",
    "//evil.example/app/x",
    "/app//evil.example",
    "javascript:alert(1)",
    "/\\evil.example",
    "/app/\\evil.example",
    "/challenge/rolling",
    "app/lesson/x",
    "/app/login?next=https://evil.example",
  ])("rejects %s", (bad) => {
    expect(safeNext(bad)).toBe(HOME);
  });
});
