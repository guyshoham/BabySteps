// lib/ttl-cache.js
// Wraps an async loader with a small in-memory cache. A warm serverless
// instance keeps module state between requests, so repeat reads skip the
// network. Only non-null results are cached. Calls for the same key at the
// same time share one load. `now` is injectable for tests.
export function cachedLoader(load, { ttlMs, maxEntries = 500, now = () => Date.now() } = {}) {
  const entries = new Map(); // key -> { value, exp }
  const inflight = new Map(); // key -> Promise

  function cached(key) {
    const hit = entries.get(key);
    if (hit && hit.exp > now()) return Promise.resolve(hit.value);
    if (hit) entries.delete(key);
    if (inflight.has(key)) return inflight.get(key);
    const p = Promise.resolve()
      .then(() => load(key))
      .then((value) => {
        if (value != null) {
          // Oldest first: drop one entry when full, so memory stays bounded.
          if (entries.size >= maxEntries) entries.delete(entries.keys().next().value);
          entries.set(key, { value, exp: now() + ttlMs });
        }
        return value;
      })
      .finally(() => inflight.delete(key));
    inflight.set(key, p);
    return p;
  }
  cached.clear = () => { entries.clear(); inflight.clear(); };
  return cached;
}
