import { describe, it, expect, vi } from "vitest";
import { runCreateTester, readablePassword } from "../lib/tester-core.js";

function deps(over = {}) {
  return {
    upsertUser: vi.fn(async () => ({ uid: "t1", created: true })),
    listCourseIds: vi.fn(async () => ["rolling", "tummy-time"]),
    ensureEnrollment: vi.fn(async () => {}),
    ...over,
  };
}

describe("runCreateTester", () => {
  it("upserts the user and enrolls in every course as tester", async () => {
    const d = deps();
    const r = await runCreateTester(d, { email: "t@x.test", password: "pw" });
    expect(d.upsertUser).toHaveBeenCalledWith("t@x.test", "pw");
    expect(d.ensureEnrollment).toHaveBeenCalledWith("t1", "rolling", "tester", "tester");
    expect(d.ensureEnrollment).toHaveBeenCalledWith("t1", "tummy-time", "tester", "tester");
    expect(r).toEqual({ uid: "t1", created: true, courseIds: ["rolling", "tummy-time"] });
  });

  it("rejects a missing password", async () => {
    await expect(runCreateTester(deps(), { email: "t@x.test" })).rejects.toThrow(/password/);
  });
});

describe("readablePassword", () => {
  it("is 3 groups of 4 unambiguous chars", () => {
    const pw = readablePassword();
    expect(pw).toMatch(/^[a-hjkmnp-z2-9]{4}-[a-hjkmnp-z2-9]{4}-[a-hjkmnp-z2-9]{4}$/);
  });
});
