import { describe, it, expect, vi } from "vitest";
import { nextClaims, applyAdmin, runSetAdmin } from "../lib/set-admin-core.js";

function deps(over = {}) {
  return {
    findUserByEmail: vi.fn(async () => ({ uid: "u1" })),
    getClaims: vi.fn(async () => ({})),
    setClaims: vi.fn(async () => {}),
    ...over,
  };
}

describe("nextClaims", () => {
  it("adds admin and keeps the other claims", () => {
    expect(nextClaims({ plan: "x" }, true)).toEqual({ plan: "x", admin: true });
  });
  it("removes admin and keeps the other claims", () => {
    expect(nextClaims({ plan: "x", admin: true }, false)).toEqual({ plan: "x" });
  });
  it("works with no claims yet", () => {
    expect(nextClaims(null, true)).toEqual({ admin: true });
    expect(nextClaims(undefined, false)).toEqual({});
  });
  it("does not change the object it was given", () => {
    const current = { admin: true };
    nextClaims(current, false);
    expect(current).toEqual({ admin: true });
  });
});

describe("applyAdmin", () => {
  it("writes only when the claim changes", async () => {
    const d = deps({ getClaims: vi.fn(async () => ({ admin: true, x: 1 })) });
    expect(await applyAdmin(d, "u1", true)).toEqual({ changed: false });
    expect(d.setClaims).not.toHaveBeenCalled();
  });
  it("treats a non-true admin value as not admin", async () => {
    const d = deps({ getClaims: vi.fn(async () => ({ admin: "yes" })) });
    expect(await applyAdmin(d, "u1", true)).toEqual({ changed: true });
    expect(d.setClaims).toHaveBeenCalledWith("u1", { admin: true });
  });
});

describe("runSetAdmin", () => {
  it("makes a user admin, with a cleaned email", async () => {
    const d = deps({ getClaims: vi.fn(async () => ({ other: true })) });
    const r = await runSetAdmin(d, { email: " Yarden@Example.com " });
    expect(d.findUserByEmail).toHaveBeenCalledWith("yarden@example.com");
    expect(d.setClaims).toHaveBeenCalledWith("u1", { other: true, admin: true });
    expect(r).toEqual({ uid: "u1", email: "yarden@example.com", admin: true, changed: true });
  });

  it("removes admin with remove: true", async () => {
    const d = deps({ getClaims: vi.fn(async () => ({ admin: true, other: 1 })) });
    const r = await runSetAdmin(d, { email: "a@b.co", remove: true });
    expect(d.setClaims).toHaveBeenCalledWith("u1", { other: 1 });
    expect(r.admin).toBe(false);
  });

  it("says nothing changed when she is already admin", async () => {
    const d = deps({ getClaims: vi.fn(async () => ({ admin: true })) });
    const r = await runSetAdmin(d, { email: "a@b.co" });
    expect(r.changed).toBe(false);
    expect(d.setClaims).not.toHaveBeenCalled();
  });

  it("rejects a bad email and an unknown user", async () => {
    await expect(runSetAdmin(deps(), { email: "nope" })).rejects.toThrow(/valid email/);
    const d = deps({ findUserByEmail: vi.fn(async () => null) });
    await expect(runSetAdmin(d, { email: "a@b.co" })).rejects.toThrow(/no user/);
    expect(d.setClaims).not.toHaveBeenCalled();
  });
});
