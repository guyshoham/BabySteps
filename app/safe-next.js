// app/safe-next.js — where to go after login. Only same-site /app/ paths are
// allowed, so /app/login?next=https://evil.example cannot send a student away.
const FALLBACK = "/app/my-courses";

export function safeNext(next) {
  if (typeof next !== "string") return FALLBACK;
  // A path under /app/ whose next char is not a slash or backslash (no "//host").
  // Backslashes anywhere are refused: browsers treat "\" like "/" in URLs.
  if (!/^\/app\/[^/\\]/.test(next) || next.includes("\\")) return FALLBACK;
  // Never bounce back to the login page itself (it would loop or chain a next).
  if (next.startsWith("/app/login")) return FALLBACK;
  return next;
}
