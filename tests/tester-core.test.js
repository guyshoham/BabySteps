import { describe, it, expect, vi } from "vitest";
import { runCreateTester, readablePassword, publishedCourseIds } from "../lib/tester-core.js";

function deps(over = {}) {
  return {
    upsertUser: vi.fn(async () => ({ uid: "t1", created: true })),
    listCourses: vi.fn(async () => [
      { id: "rolling", published: true },
      { id: "tummy-time", published: false },
      { id: "no-flag" },
    ]),
    ensureEnrollment: vi.fn(async () => {}),
    ...over,
  };
}

describe("runCreateTester", () => {
  it("upserts the user and enrolls in every published course as tester", async () => {
    const d = deps();
    const r = await runCreateTester(d, { email: "t@x.test", password: "pw" });
    expect(d.upsertUser).toHaveBeenCalledWith("t@x.test", "pw");
    expect(d.ensureEnrollment).toHaveBeenCalledWith("t1", "rolling", "tester", "tester");
    expect(d.ensureEnrollment).toHaveBeenCalledWith("t1", "no-flag", "tester", "tester");
    expect(r).toEqual({ uid: "t1", created: true, courseIds: ["rolling", "no-flag"] });
  });

  it("does not enroll in an unpublished course", async () => {
    const d = deps();
    await runCreateTester(d, { email: "t@x.test", password: "pw" });
    expect(d.ensureEnrollment).not.toHaveBeenCalledWith("t1", "tummy-time", "tester", "tester");
    expect(d.ensureEnrollment).toHaveBeenCalledTimes(2);
  });

  it("rejects a missing password", async () => {
    await expect(runCreateTester(deps(), { email: "t@x.test" })).rejects.toThrow(/password/);
  });
});

describe("publishedCourseIds", () => {
  it("keeps published and unflagged courses, drops published: false", () => {
    expect(publishedCourseIds([
      { id: "a", published: true }, { id: "b", published: false }, { id: "c" },
    ])).toEqual(["a", "c"]);
  });
});

describe("readablePassword", () => {
  it("is 3 groups of 4 unambiguous chars", () => {
    const pw = readablePassword();
    expect(pw).toMatch(/^[a-hjkmnp-z2-9]{4}-[a-hjkmnp-z2-9]{4}-[a-hjkmnp-z2-9]{4}$/);
  });
});
