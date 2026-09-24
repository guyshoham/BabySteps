// app/lesson-nav.js — pure helper for the lesson page's prev/next buttons.
// `ids` are the course's lesson ids in order.
export function findNeighbors(ids, id) {
  const i = ids.indexOf(id);
  if (i === -1) return { prev: null, next: null };
  return { prev: ids[i - 1] ?? null, next: ids[i + 1] ?? null };
}
