import { describe, it, expect, vi } from "vitest";
import {
  createVideoUrlCache, DEFAULT_TTL_SECONDS, EARLY_EXPIRY_SECONDS, STORAGE_PREFIX, VideoUrlError,
} from "../app/video-url-cache.js";
import { SIGNED_URL_TTL_SECONDS } from "../lib/r2.js";

function fakeStorage() {
  const m = new Map();
  return {
    get length() { return m.size; },
    key: (i) => [...m.keys()][i] ?? null,
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    _map: m,
  };
}

function okResponse(body) {
  return { ok: true, status: 200, json: async () => body };
}

function setup({ body = (id) => ({ url: `https://r2.example/${id}?sig=1`, expiresIn: 7200 }) } = {}) {
  let t = 1_000_000;
  const clock = { now: () => t, advance: (ms) => { t += ms; } };
  const storage = fakeStorage();
  const fetchImpl = vi.fn(async (url) => {
    const id = new URL(url, "https://x.test").searchParams.get("lessonId");
    return okResponse(body(id));
  });
  const getIdToken = vi.fn(async () => "tok");
  const cache = createVideoUrlCache({ fetchImpl, now: clock.now, storage });
  return { cache, clock, storage, fetchImpl, getIdToken };
}

describe("video-url-cache", () => {
  it("keeps the client fallback TTL equal to the server TTL", () => {
    expect(DEFAULT_TTL_SECONDS).toBe(SIGNED_URL_TTL_SECONDS);
  });

  it("calls the API with the Bearer token and lessonId", async () => {
    const { cache, fetchImpl, getIdToken } = setup();
    const url = await cache.getVideoUrl("rolling 02", getIdToken);
    expect(url).toBe("https://r2.example/rolling 02?sig=1");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [reqUrl, init] = fetchImpl.mock.calls[0];
    expect(reqUrl).toBe("/api/video-url?lessonId=rolling%2002");
    expect(init.headers.Authorization).toBe("Bearer tok");
  });

  it("serves a second call from memory", async () => {
    const { cache, fetchImpl, getIdToken } = setup();
    await cache.getVideoUrl("a", getIdToken);
    await cache.getVideoUrl("a", getIdToken);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(getIdToken).toHaveBeenCalledTimes(1);
  });

  it("shares one request between calls made at the same time", async () => {
    const { cache, fetchImpl, getIdToken } = setup();
    const [a, b] = await Promise.all([cache.getVideoUrl("a", getIdToken), cache.getVideoUrl("a", getIdToken)]);
    expect(a).toBe(b);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("stores the URL in sessionStorage with an expiry 10 minutes early", async () => {
    const { cache, storage, clock, getIdToken } = setup();
    await cache.getVideoUrl("a", getIdToken);
    const entry = JSON.parse(storage.getItem(STORAGE_PREFIX + "a"));
    expect(entry.url).toBe("https://r2.example/a?sig=1");
    expect(entry.exp).toBe(clock.now() + (7200 - EARLY_EXPIRY_SECONDS) * 1000);
  });

  it("reads a URL stored by an earlier page load", async () => {
    const first = setup();
    await first.cache.getVideoUrl("a", first.getIdToken);
    // A new page: new memory, same sessionStorage and clock.
    const fetchImpl = vi.fn();
    const again = createVideoUrlCache({ fetchImpl, now: first.clock.now, storage: first.storage });
    expect(await again.getVideoUrl("a", first.getIdToken)).toBe("https://r2.example/a?sig=1");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("fetches again once the early expiry has passed", async () => {
    const { cache, clock, fetchImpl, getIdToken } = setup();
    await cache.getVideoUrl("a", getIdToken);
    clock.advance((7200 - EARLY_EXPIRY_SECONDS) * 1000 - 1);
    await cache.getVideoUrl("a", getIdToken);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    clock.advance(1);
    await cache.getVideoUrl("a", getIdToken);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("uses the 2 hour default when the API sends no expiresIn", async () => {
    const { cache, storage, clock, getIdToken } = setup({ body: (id) => ({ url: `u-${id}` }) });
    await cache.getVideoUrl("a", getIdToken);
    const entry = JSON.parse(storage.getItem(STORAGE_PREFIX + "a"));
    expect(entry.exp).toBe(clock.now() + (DEFAULT_TTL_SECONDS - EARLY_EXPIRY_SECONDS) * 1000);
  });

  it("does not cache a URL that expires within the early window", async () => {
    const { cache, fetchImpl, getIdToken } = setup({ body: (id) => ({ url: `u-${id}`, expiresIn: 300 }) });
    expect(await cache.getVideoUrl("a", getIdToken)).toBe("u-a");
    await cache.getVideoUrl("a", getIdToken);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("rejects with the HTTP status and caches nothing on an error", async () => {
    const storage = fakeStorage();
    const fetchImpl = vi.fn(async () => ({ ok: false, status: 403, json: async () => ({ error: "not enrolled" }) }));
    const cache = createVideoUrlCache({ fetchImpl, now: () => 0, storage });
    const err = await cache.getVideoUrl("a", async () => "tok").catch((e) => e);
    expect(err).toBeInstanceOf(VideoUrlError);
    expect(err.status).toBe(403);
    expect(storage.length).toBe(0);
    await cache.getVideoUrl("a", async () => "tok").catch(() => {});
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("reports a network error as status 0", async () => {
    const cache = createVideoUrlCache({ fetchImpl: async () => { throw new TypeError("offline"); }, storage: null });
    const err = await cache.getVideoUrl("a", async () => "tok").catch((e) => e);
    expect(err.status).toBe(0);
  });

  it("rejects when lessonId is missing", async () => {
    const { cache, getIdToken } = setup();
    await expect(cache.getVideoUrl("", getIdToken)).rejects.toMatchObject({ status: 400 });
  });

  it("prefetches unique ids, skips empty ones and never rejects", async () => {
    let n = 0;
    const fetchImpl = vi.fn(async (url) => {
      n++;
      if (url.includes("bad")) return { ok: false, status: 500, json: async () => ({}) };
      return okResponse({ url: `u-${n}`, expiresIn: 7200 });
    });
    const cache = createVideoUrlCache({ fetchImpl, now: () => 0, storage: fakeStorage() });
    await expect(cache.prefetchVideoUrls(["a", null, "a", "bad", undefined, "b"], async () => "tok")).resolves.toBeUndefined();
    expect(fetchImpl).toHaveBeenCalledTimes(3);
    await cache.getVideoUrl("a", async () => "tok");
    await cache.getVideoUrl("b", async () => "tok");
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it("clearVideoUrls forgets memory and storage, and ignores a request still running", async () => {
    const { cache, storage, fetchImpl, getIdToken } = setup();
    storage.setItem("other-key", "keep");
    await cache.getVideoUrl("a", getIdToken);
    const running = cache.getVideoUrl("b", getIdToken);
    cache.clearVideoUrls();
    await running;
    expect(storage.getItem(STORAGE_PREFIX + "a")).toBeNull();
    expect(storage.getItem(STORAGE_PREFIX + "b")).toBeNull();
    expect(storage.getItem("other-key")).toBe("keep");
    await cache.getVideoUrl("a", getIdToken);
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it("works when storage throws", async () => {
    const bad = {
      get length() { throw new Error("blocked"); },
      key() { throw new Error("blocked"); },
      getItem() { throw new Error("blocked"); },
      setItem() { throw new Error("blocked"); },
      removeItem() { throw new Error("blocked"); },
    };
    const fetchImpl = vi.fn(async () => okResponse({ url: "u", expiresIn: 7200 }));
    const cache = createVideoUrlCache({ fetchImpl, now: () => 0, storage: bad });
    expect(await cache.getVideoUrl("a", async () => "tok")).toBe("u");
    expect(await cache.getVideoUrl("a", async () => "tok")).toBe("u");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(() => cache.clearVideoUrls()).not.toThrow();
  });
});
