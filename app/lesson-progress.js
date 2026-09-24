// app/lesson-progress.js — pure helper for the lesson page's completion rule.
// A video counts as done once 90% of it has been watched, so skipping the
// last seconds (credits, outro) still marks the lesson as done.
export const COMPLETE_RATIO = 0.9;

export function shouldComplete(currentTime, duration) {
  if (typeof duration !== "number" || !Number.isFinite(duration) || duration <= 0) return false;
  if (typeof currentTime !== "number" || !Number.isFinite(currentTime)) return false;
  return currentTime / duration >= COMPLETE_RATIO;
}
