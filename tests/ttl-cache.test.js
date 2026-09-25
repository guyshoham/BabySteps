import { describe, it, expect, vi } from "vitest";
import { cachedLoader } from "../lib/ttl-cache.js";

function clock() {
  let t = 0;
  return { now: () => t, advance: (ms) => { t += ms; } };
}

describe("cachedLoader", () => {
  it("loads once and serves repeats from memory until the TTL ends", async () => {
    const c = clock();
    const load = vi.fn(async (k) => ({ k }));
    const get = cachedLoader(load, { ttlMs: 1000, now: c.now });
    expect(await get("a")).toEqual({ k: "a" });
    c.advance(999);
    await get("a");
    expect(load).toHaveBeenCalledTimes(1);
    c.advance(1);
    await get("a");
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("does not cache null, so a new lesson shows up at once", async () => {
    const load = vi.fn(async () => null);
    const get = cachedLoader(load, { ttlMs: 1000, now: () => 0 });
    expect(await get("x")).toBeNull();
    await get("x");
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("shares one load between calls at the same time", async () => {
    const load = vi.fn(async (k) => k);
    const get = cachedLoader(load, { ttlMs: 1000, now: () => 0 });
    await Promise.all([get("a"), get("a"), get("a")]);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("does not cache errors", async () => {
    const load = vi.fn().mockRejectedValueOnce(new Error("boom")).mockResolvedValue("ok");
    const get = cachedLoader(load, { ttlMs: 1000, now: () => 0 });
    await expect(get("a")).rejects.toThrow("boom");
    expect(await get("a")).toBe("ok");
  });

  it("keeps at most maxEntries, dropping the oldest", async () => {
    const load = vi.fn(async (k) => k);
    const get = cachedLoader(load, { ttlMs: 1000, maxEntries: 2, now: () => 0 });
    await get("a"); await get("b"); await get("c");
    expect(load).toHaveBeenCalledTimes(3);
    await get("c"); await get("b");
    expect(load).toHaveBeenCalledTimes(3);
    await get("a");
    expect(load).toHaveBeenCalledTimes(4);
  });
});
