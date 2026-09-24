import { describe, it, expect } from "vitest";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mb, walk, parseCourseFlag, selectCourseLessons, positionalArg } from "../scripts/fs-utils.js";

describe("mb", () => {
  it("formats bytes as megabytes with one decimal", () => {
    expect(mb(1024 * 1024 * 1.5)).toBe("1.5 MB");
  });
});

describe("walk", () => {
  it("lists files recursively and skips dotfiles", async () => {
    const dir = await mkdtemp(join(tmpdir(), "walk-"));
    try {
      await mkdir(join(dir, "sub"));
      await mkdir(join(dir, ".hidden"));
      await writeFile(join(dir, "a.mp4"), "");
      await writeFile(join(dir, ".DS_Store"), "");
      await writeFile(join(dir, "sub", "b.mp4"), "");
      await writeFile(join(dir, ".hidden", "c.mp4"), "");
      const files = (await walk(dir)).map((f) => f.slice(dir.length + 1)).sort();
      expect(files).toEqual(["a.mp4", join("sub", "b.mp4")]);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

describe("parseCourseFlag", () => {
  it("returns null when the flag is absent", () => {
    expect(parseCourseFlag(["./videos", "--dry-run"])).toEqual({ course: null });
  });
  it("reads --course <id>", () => {
    expect(parseCourseFlag(["./videos", "--course", "rolling"])).toEqual({ course: "rolling" });
  });
  it("reads --course=<id>", () => {
    expect(parseCourseFlag(["--course=tummy-time"])).toEqual({ course: "tummy-time" });
  });
  it("fails when the value is missing", () => {
    expect(parseCourseFlag(["--course"]).error).toMatch(/needs a course id/);
    expect(parseCourseFlag(["--course", "--dry-run"]).error).toMatch(/needs a course id/);
    expect(parseCourseFlag(["--course="]).error).toMatch(/needs a course id/);
  });
});

describe("positionalArg", () => {
  it("skips values of flags that take one", () => {
    expect(positionalArg(["--course", "rolling", "./videos"], ["--course"])).toBe("./videos");
    expect(positionalArg(["--out", "x", "--course", "rolling", "src"], ["--out", "--course"])).toBe("src");
  });
  it("returns undefined when there is none", () => {
    expect(positionalArg(["--verify", "--course", "rolling"], ["--course"])).toBeUndefined();
  });
});

describe("selectCourseLessons", () => {
  const courses = [{ id: "rolling" }, { id: "tummy-time" }];
  const r1 = { id: "r1", courseId: "rolling" };
  const r2 = { id: "r2", courseId: "rolling" };
  const t1 = { id: "t1", courseId: "tummy-time" };

  it("uses the only course with lessons when no flag is given", () => {
    expect(selectCourseLessons({ courses, lessons: [r1, r2] }, null))
      .toEqual({ courseId: "rolling", lessons: [r1, r2] });
  });

  it("asks for --course when several courses have lessons", () => {
    const r = selectCourseLessons({ courses, lessons: [r1, t1] }, null);
    expect(r.error).toMatch(/--course <id>/);
    expect(r.error).toMatch(/rolling, tummy-time/);
  });

  it("filters to the given course", () => {
    expect(selectCourseLessons({ courses, lessons: [r1, t1, r2] }, "rolling"))
      .toEqual({ courseId: "rolling", lessons: [r1, r2] });
  });

  it("fails on an unknown course and lists the ids", () => {
    const r = selectCourseLessons({ courses, lessons: [r1] }, "crawling");
    expect(r.error).toMatch(/unknown course "crawling"/);
    expect(r.error).toMatch(/rolling, tummy-time/);
  });

  it("fails on a course with no lessons", () => {
    expect(selectCourseLessons({ courses, lessons: [r1] }, "tummy-time").error).toMatch(/no lessons/);
  });

  it("fails when there are no lessons at all", () => {
    expect(selectCourseLessons({ courses, lessons: [] }, null).error).toMatch(/no lessons/);
  });
});
