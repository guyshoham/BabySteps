// app/course-list.js: pure helper for the "my courses" page.
// Drops courses marked `published: false` and sorts the rest by `order`.
// A course with no `published` field counts as published. A course with no
// `order` goes last. Ties keep their input order.
export function visibleCourses(courses) {
  const rank = (c) => (typeof c.order === "number" ? c.order : Infinity);
  return courses
    .filter((c) => c && c.published !== false)
    .map((c, i) => ({ c, i }))
    .sort((a, b) => rank(a.c) - rank(b.c) || a.i - b.i)
    .map(({ c }) => c);
}
