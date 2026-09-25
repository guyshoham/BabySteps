// app/lesson-nav.js: pure helpers for the lesson page's position line, step
// bar, prev/next buttons and "up next" bar. No DOM, no Firebase.
// `ids` are the course's lesson ids in order.

export function findNeighbors(ids, id) {
  const i = ids.indexOf(id);
  if (i === -1) return { prev: null, next: null };
  return { prev: ids[i - 1] ?? null, next: ids[i + 1] ?? null };
}

const asSet = (s) => (s instanceof Set ? s : new Set(s ?? []));

// Where the lesson sits in the course: { index (1 based), total }, or null
// when the lesson is not in the list.
export function lessonPosition(ids, id) {
  const list = Array.isArray(ids) ? ids : [];
  const i = list.indexOf(id);
  return i === -1 ? null : { index: i + 1, total: list.length };
}

// "שיעור 3 מתוך 18". Empty when the position is unknown.
export function positionLabel(pos) {
  return pos ? `שיעור ${pos.index} מתוך ${pos.total}` : "";
}

// One entry per lesson for the step bar: { id, done, current }.
export function stepStates(ids, completedIds, currentId) {
  const done = asSet(completedIds);
  return (Array.isArray(ids) ? ids : []).map((id) => ({
    id, done: done.has(id), current: id === currentId,
  }));
}

// Screen reader text for the step bar: "בוצעו 5 מתוך 18 שיעורים".
export function doneCountLabel(ids, completedIds) {
  const list = Array.isArray(ids) ? ids : [];
  const done = asSet(completedIds);
  const n = list.filter((id) => done.has(id)).length;
  return `בוצעו ${n} מתוך ${list.length} שיעורים`;
}

// "נשאר לך עוד שיעור אחד" / "נשארו לך עוד 4 שיעורים". Empty for 0 or less.
export function remainingLabel(n) {
  if (!Number.isInteger(n) || n <= 0) return "";
  return n === 1 ? "נשאר לך עוד שיעור אחד" : `נשארו לך עוד ${n} שיעורים`;
}

// What comes after this lesson:
// - { type: "next", id }: the next lesson in order.
// - { type: "open", id, remaining }: this is the last lesson, but other
//   lessons are still not done. `id` is the first of them.
// - { type: "course" }: the last lesson and nothing else is open, so the
//   next step is the course page.
// The current lesson never counts as "open", so the button never links to
// the page she is on.
export function upNext(ids, completedIds, currentId) {
  const list = Array.isArray(ids) ? ids : [];
  const { next } = findNeighbors(list, currentId);
  if (next) return { type: "next", id: next };
  const done = asSet(completedIds);
  const open = list.filter((id) => id !== currentId && !done.has(id));
  if (open.length > 0) return { type: "open", id: open[0], remaining: open.length };
  return { type: "course" };
}
