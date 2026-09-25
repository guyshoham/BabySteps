// app/video-url-cache.js: signed video URLs from /api/video-url, kept in
// memory and in sessionStorage until shortly before they expire.
//
// A signed URL lets anyone who has it watch the video until it expires, so it
// stays in this tab only (sessionStorage, not localStorage), and signOut()
// clears it. No Firebase import here: the caller passes getIdToken.
//
//   getVideoUrl(lessonId, getIdToken) -> Promise<string>
//   prefetchVideoUrls(ids, getIdToken) -> Promise<void>, never rejects
//   clearVideoUrls()
//
// getIdToken is a function that returns a Promise of a Firebase ID token,
// for example () => user.getIdToken().

// lib/r2.js signs URLs for 2 hours. The API sends expiresIn; this is the
// fallback when it does not. tests/video-url-cache.test.js keeps them equal.
export const DEFAULT_TTL_SECONDS = 2 * 60 * 60;
// Treat a URL as expired this long before it really expires, so a lesson that
// starts playing near the end still has time to load and seek.
export const EARLY_EXPIRY_SECONDS = 10 * 60;
export const STORAGE_PREFIX = "bs:video-url:v1:";

// Error for a failed /api/video-url call. `status` is the HTTP status
// (0 for a network error), so the page can show "no access" on 403.
export class VideoUrlError extends Error {
  constructor(status, message) {
    super(message || `video-url failed (${status})`);
    this.name = "VideoUrlError";
    this.status = status;
  }
}

function defaultStorage() {
  try { return globalThis.sessionStorage ?? null; } catch { return null; }
}

// Everything is injectable so tests can use a fake fetch, clock and storage.
export function createVideoUrlCache({
  fetchImpl = (...a) => globalThis.fetch(...a),
  now = () => Date.now(),
  storage = defaultStorage(),
  endpoint = "/api/video-url",
} = {}) {
  const memory = new Map(); // lessonId -> { url, exp }
  const inflight = new Map(); // lessonId -> Promise<string>
  // Bumped by clearVideoUrls, so a request that was running during sign out
  // does not store its URL afterwards.
  let generation = 0;

  const fresh = (entry) => entry && typeof entry.url === "string" && entry.exp > now();

  function read(lessonId) {
    const m = memory.get(lessonId);
    if (fresh(m)) return m.url;
    memory.delete(lessonId);
    try {
      const raw = storage?.getItem(STORAGE_PREFIX + lessonId);
      if (!raw) return null;
      const entry = JSON.parse(raw);
      if (fresh(entry)) { memory.set(lessonId, entry); return entry.url; }
      storage.removeItem(STORAGE_PREFIX + lessonId);
    } catch { /* storage blocked or bad JSON: act as a miss */ }
    return null;
  }

  function write(lessonId, url, expiresIn) {
    const ttl = Number.isFinite(expiresIn) && expiresIn > 0 ? expiresIn : DEFAULT_TTL_SECONDS;
    const entry = { url, exp: now() + (ttl - EARLY_EXPIRY_SECONDS) * 1000 };
    if (!(entry.exp > now())) return; // too short to be worth keeping
    memory.set(lessonId, entry);
    try { storage?.setItem(STORAGE_PREFIX + lessonId, JSON.stringify(entry)); } catch { /* full or blocked */ }
  }

  async function load(lessonId, getIdToken) {
    const gen = generation;
    const token = await getIdToken();
    let resp;
    try {
      resp = await fetchImpl(`${endpoint}?lessonId=${encodeURIComponent(lessonId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      throw new VideoUrlError(0, e?.message);
    }
    if (!resp.ok) throw new VideoUrlError(resp.status);
    const body = await resp.json();
    if (!body || typeof body.url !== "string") throw new VideoUrlError(resp.status, "no url in response");
    if (gen === generation) write(lessonId, body.url, body.expiresIn);
    return body.url;
  }

  function getVideoUrl(lessonId, getIdToken) {
    if (!lessonId) return Promise.reject(new VideoUrlError(400, "lessonId is required"));
    const cached = read(lessonId);
    if (cached) return Promise.resolve(cached);
    // Two calls for the same lesson at once share one request.
    if (inflight.has(lessonId)) return inflight.get(lessonId);
    const p = load(lessonId, getIdToken).finally(() => {
      if (inflight.get(lessonId) === p) inflight.delete(lessonId);
    });
    inflight.set(lessonId, p);
    return p;
  }

  // Warm the cache for lessons she may open next. Errors are ignored: the real
  // getVideoUrl call later reports them.
  async function prefetchVideoUrls(ids, getIdToken) {
    const unique = [...new Set((ids ?? []).filter(Boolean))];
    await Promise.allSettled(unique.map((id) => getVideoUrl(id, getIdToken)));
  }

  function clearVideoUrls() {
    generation++;
    memory.clear();
    inflight.clear();
    try {
      if (!storage) return;
      const keys = [];
      for (let i = 0; i < storage.length; i++) {
        const k = storage.key(i);
        if (k?.startsWith(STORAGE_PREFIX)) keys.push(k);
      }
      keys.forEach((k) => storage.removeItem(k));
    } catch { /* blocked */ }
  }

  return { getVideoUrl, prefetchVideoUrls, clearVideoUrls };
}

const shared = createVideoUrlCache();
export const getVideoUrl = shared.getVideoUrl;
export const prefetchVideoUrls = shared.prefetchVideoUrls;
export const clearVideoUrls = shared.clearVideoUrls;
