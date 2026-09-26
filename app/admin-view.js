// app/admin-view.js — pure helpers for the admin page (app/admin.html):
// filter, sort, summary and Hebrew dates. No DOM, no Firebase, so they are easy
// to test. The data is the body of GET /api/admin-progress.

export const ACTIVE_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

const time = (iso) => {
  const t = iso ? Date.parse(iso) : NaN;
  return Number.isFinite(t) ? t : null;
};
const latest = (...isos) => isos.reduce((best, x) => {
  const t = time(x);
  return t !== null && (best === null || t > time(best)) ? x : best;
}, null);

// The last time we know she was here: a lesson save or a sign in.
export function lastSeen(student, courses = student.courses) {
  return latest(student.lastSignIn, ...courses.map((c) => c.lastActivity));
}

// Students to show, each with the course entries that match the filter.
// opts: { courseId ("all" or an id), query (email search), sort ("activity",
// "progress" or "joined"), showTester }.
export function studentRows(data, { courseId = "all", query = "", sort = "activity", showTester = false } = {}) {
  const q = String(query).trim().toLowerCase();
  const rows = [];
  for (const s of data?.students ?? []) {
    if (s.isTester && !showTester) continue;
    if (q && !String(s.email ?? "").toLowerCase().includes(q)) continue;
    const courses = courseId === "all" ? s.courses : s.courses.filter((c) => c.courseId === courseId);
    if (courseId !== "all" && !courses.length) continue;
    rows.push({ student: s, courses });
  }
  return sortRows(rows, sort);
}

const ratio = (c) => (c.total ? c.completed / c.total : 0);
const bestRatio = (row) => Math.max(0, ...row.courses.map(ratio));
const activity = (row) => time(latest(...row.courses.map((c) => c.lastActivity)));

export function sortRows(rows, sort) {
  const key = {
    activity: activity,
    progress: bestRatio,
    joined: (r) => time(r.student.createdAt),
  }[sort] ?? activity;
  // Highest first. Missing values go last. Email breaks ties, so the order is stable.
  return [...rows].sort((a, b) => {
    const ka = key(a); const kb = key(b);
    if (ka !== kb) {
      if (ka === null) return 1;
      if (kb === null) return -1;
      return kb - ka;
    }
    return String(a.student.email).localeCompare(String(b.student.email));
  });
}

// The three numbers at the top, for the rows on screen.
export function summary(rows, now = new Date()) {
  const since = now.getTime() - ACTIVE_DAYS * DAY_MS;
  let active = 0;
  let finished = 0;
  for (const r of rows) {
    const seen = time(lastSeen(r.student, r.courses));
    if (seen !== null && seen >= since) active++;
    if (r.courses.some((c) => c.total > 0 && c.completed >= c.total)) finished++;
  }
  return { students: rows.length, active, finished };
}

// The lesson she touched last in these courses: { lessonId, title, at } or null.
export function lastLesson(row, coursesById) {
  let best = null;
  for (const c of row.courses) {
    if (!c.lastLessonId || !c.lastActivity) continue;
    if (!best || time(c.lastActivity) > time(best.at)) {
      const lesson = coursesById.get(c.courseId)?.lessons.find((l) => l.id === c.lastLessonId);
      best = { lessonId: c.lastLessonId, title: lesson?.title ?? c.lastLessonId, at: c.lastActivity };
    }
  }
  return best;
}

// One entry per lesson of the course, in course order.
export function lessonStates(course, entry) {
  const done = new Set(entry?.completedLessonIds ?? []);
  return (course?.lessons ?? []).map((l) => ({
    id: l.id, title: l.title, done: done.has(l.id), last: l.id === entry?.lastLessonId,
  }));
}

const dateFmt = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "short", year: "numeric" });
const fullFmt = new Intl.DateTimeFormat("he-IL", { dateStyle: "long", timeStyle: "short" });
const rtf = new Intl.RelativeTimeFormat("he", { numeric: "auto" });

// "26 בספט׳ 2026", or "" when there is no date.
export function formatDate(iso) {
  const t = time(iso);
  return t === null ? "" : dateFmt.format(new Date(t));
}
export function formatFull(iso) {
  const t = time(iso);
  return t === null ? "" : fullFmt.format(new Date(t));
}

// "לפני 3 ימים", "אתמול", "לפני שעתיים". "" when there is no date.
export function relativeTime(iso, now = new Date()) {
  const t = time(iso);
  if (t === null) return "";
  const diff = t - now.getTime();
  const abs = Math.abs(diff);
  const units = [
    ["year", 365 * DAY_MS], ["month", 30 * DAY_MS],
    ["day", DAY_MS], ["hour", 60 * 60 * 1000], ["minute", 60 * 1000],
  ];
  if (abs < 60 * 1000) return "עכשיו";
  for (const [unit, ms] of units) {
    // ICU writes the Hebrew dual with the number too ("לפני שעתיים (2)"): drop it.
    if (abs >= ms) return rtf.format(Math.round(diff / ms), unit).replace(/\s*\(\d+\)$/, "");
  }
  return "עכשיו";
}

const SOURCES = { paypal: "PayPal", manual: "ידני", tester: "בודק" };
export function sourceLabel(source) {
  return SOURCES[source] ?? (source || "");
}
