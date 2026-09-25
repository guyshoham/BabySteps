// app/lesson-switch.js: pure helpers for switching lessons in place on the
// lesson page (no full page load). No DOM, no Firebase, so they are easy to
// test. app/lesson.html does the drawing, the saving and the history calls.

import { findNeighbors, lessonPosition, positionLabel } from "./lesson-nav.js";
import { SITE_NAME } from "./app-shell.js";

const LESSON_PATH = /^\/app\/lesson\/([^/?#]+)\/?$/;

// "/app/lesson/rolling-03" -> "rolling-03". null for any other path, or for
// a broken %-escape.
export function lessonIdFromPath(pathname) {
  const m = LESSON_PATH.exec(String(pathname ?? ""));
  if (!m) return null;
  try {
    const id = decodeURIComponent(m[1]);
    return id || null;
  } catch {
    return null;
  }
}

// The lessons worth warming up after a switch: the one before and the one
// after, in course order.
export function neighborIds(ids, id) {
  const { prev, next } = findNeighbors(Array.isArray(ids) ? ids : [], id);
  return [prev, next].filter(Boolean);
}

// What the page draws for a lesson, from the course's ordered ids:
// { position, positionText, prev, next, isLast, done }.
// `done` is the saved state; the page keeps the live one itself.
export function lessonState(ids, completedIds, id) {
  const list = Array.isArray(ids) ? ids : [];
  const done = completedIds instanceof Set ? completedIds : new Set(completedIds ?? []);
  const position = lessonPosition(list, id);
  const { prev, next } = findNeighbors(list, id);
  return {
    position,
    positionText: positionLabel(position),
    prev,
    next,
    isLast: position !== null && next === null,
    done: done.has(id),
  };
}

// The lesson a click should open in place, or null to let the browser
// follow the link as usual. Only a plain left click on a same-site link to a
// lesson of the course that is loaded. New tab, new window, download and
// other courses keep the normal browser behavior.
// click: { href, target, download, button, ctrlKey, metaKey, shiftKey,
//          altKey, defaultPrevented }
// page:  { origin, lessonIds }
export function switchTarget(click, { origin, lessonIds } = {}) {
  if (!click || click.defaultPrevented) return null;
  if (click.button !== 0) return null;
  if (click.ctrlKey || click.metaKey || click.shiftKey || click.altKey) return null;
  if (click.download) return null;
  if (click.target && click.target !== "_self") return null;
  if (!Array.isArray(lessonIds) || lessonIds.length === 0) return null;
  let url;
  try { url = new URL(click.href, origin); } catch { return null; }
  if (url.origin !== origin) return null;
  const id = lessonIdFromPath(url.pathname);
  if (!id || !lessonIds.includes(id)) return null;
  return id;
}

// Read by the polite live region after a switch: "שיעור 4 מתוך 18: אקורדיון".
export function switchAnnouncement(position, title) {
  const where = positionLabel(position);
  const name = String(title ?? "").trim();
  if (where && name) return `${where}: ${name}`;
  return where || name;
}

// The browser tab title for a lesson.
export function lessonDocTitle(title) {
  const name = String(title ?? "").trim();
  return name ? `${name} | ${SITE_NAME}` : `שיעור | ${SITE_NAME}`;
}

// Whether to write the old lesson's video position once before leaving it.
// Only when its video was playing on this page, it moved at least a second
// since the last save, and it did not end (the ended handler saved it).
export function shouldFlushPosition({ attached, currentTime, lastSaved, ended }) {
  if (!attached || ended) return false;
  if (typeof currentTime !== "number" || !Number.isFinite(currentTime) || currentTime <= 0) return false;
  const last = Number.isFinite(lastSaved) ? lastSaved : 0;
  return Math.abs(currentTime - last) >= 1;
}

// Where to resume a lesson: the position saved on this page wins over the
// one loaded from Firestore (it is newer). 0 when neither is known.
export function resumeAt(id, { saved, loaded } = {}) {
  const pick = (m) => (m instanceof Map && Number.isFinite(m.get(id)) ? m.get(id) : null);
  return pick(saved) ?? pick(loaded) ?? 0;
}
