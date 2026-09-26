// lib/admin-progress-core.js — pure logic for GET /api/admin-progress.
// Gives an admin the progress of every student. All I/O is injected.
//
// deps:
//   verifyToken(idToken): Promise<{ uid, admin } | null>
//   listCourses(): Promise<{ id, title, slug, order, published }[]>
//   listLessons(): Promise<{ id, courseId, title, order }[]>
//   listUserDocs(): Promise<{ uid, email, createdAt }[]>
//   listEnrollments(): Promise<{ uid, courseId, grantedAt, source }[]>
//   listProgress(): Promise<{ uid, lessonId, completed, updatedAt }[]>
//   listAuthUsers(): Promise<{ uid, email, createdAt, lastSignIn }[]>
// Dates are ISO strings (or null).

export const DEFAULT_TESTER_EMAILS = ["tester@babysteps.test"];

export async function runAdminProgress(deps, { idToken, testerEmails = DEFAULT_TESTER_EMAILS, now = new Date() }) {
  if (!idToken) return { status: 401, body: { error: "missing auth token" } };
  const decoded = await deps.verifyToken(idToken);
  if (!decoded) return { status: 401, body: { error: "invalid token" } };
  // Fail closed: only a real `true` claim counts.
  if (decoded.admin !== true) return { status: 403, body: { error: "not an admin" } };

  const [courses, lessons, users, enrollments, progress, authUsers] = await Promise.all([
    deps.listCourses(),
    deps.listLessons(),
    deps.listUserDocs(),
    deps.listEnrollments(),
    deps.listProgress(),
    deps.listAuthUsers(),
  ]);
  return {
    status: 200,
    body: buildAdminProgress({ courses, lessons, users, enrollments, progress, authUsers }, { testerEmails, now }),
  };
}

const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0) || String(a.id).localeCompare(String(b.id));
const later = (a, b) => (!a ? b : !b ? a : (a >= b ? a : b));

export function buildAdminProgress(
  { courses = [], lessons = [], users = [], enrollments = [], progress = [], authUsers = [] },
  { testerEmails = DEFAULT_TESTER_EMAILS, now = new Date() } = {},
) {
  // Courses with their lessons in course order. Only safe, known fields.
  const lessonsByCourse = new Map();
  for (const l of [...lessons].sort(byOrder)) {
    if (!lessonsByCourse.has(l.courseId)) lessonsByCourse.set(l.courseId, []);
    lessonsByCourse.get(l.courseId).push({ id: l.id, title: l.title ?? "", order: l.order ?? 0 });
  }
  const outCourses = [...courses].sort(byOrder).map((c) => ({
    id: c.id,
    title: c.title ?? "",
    slug: c.slug ?? null,
    order: c.order ?? 0,
    published: c.published !== false,
    lessons: lessonsByCourse.get(c.id) ?? [],
  }));
  const courseById = new Map(outCourses.map((c) => [c.id, c]));

  const auth = new Map(authUsers.map((u) => [u.uid, u]));
  const userDoc = new Map(users.map((u) => [u.uid, u]));
  const enrollByUid = new Map();
  for (const e of enrollments) {
    if (!enrollByUid.has(e.uid)) enrollByUid.set(e.uid, []);
    enrollByUid.get(e.uid).push(e);
  }
  const progressByUid = new Map();
  for (const p of progress) {
    if (!progressByUid.has(p.uid)) progressByUid.set(p.uid, new Map());
    progressByUid.get(p.uid).set(p.lessonId, p);
  }
  const testers = new Set(testerEmails.map((e) => String(e).trim().toLowerCase()).filter(Boolean));

  // A student is anyone with a users doc or an enrollment.
  const uids = new Set([...userDoc.keys(), ...enrollByUid.keys()]);
  const students = [];
  for (const uid of uids) {
    const doc = userDoc.get(uid) ?? {};
    const a = auth.get(uid) ?? {};
    const email = String(doc.email ?? a.email ?? "").toLowerCase();
    const mine = progressByUid.get(uid) ?? new Map();
    const userEnrolls = enrollByUid.get(uid) ?? [];

    let lastActivity = null;
    for (const p of mine.values()) lastActivity = later(lastActivity, p.updatedAt ?? null);

    const studentCourses = userEnrolls.map((e) => {
      const course = courseById.get(e.courseId);
      const courseLessons = course?.lessons ?? [];
      const completedLessonIds = courseLessons
        .filter((l) => mine.get(l.id)?.completed === true)
        .map((l) => l.id);
      let courseLast = null;
      let lastLessonId = null;
      for (const l of courseLessons) {
        const at = mine.get(l.id)?.updatedAt ?? null;
        if (at && (!courseLast || at > courseLast)) { courseLast = at; lastLessonId = l.id; }
      }
      return {
        courseId: e.courseId,
        grantedAt: e.grantedAt ?? null,
        source: e.source ?? null,
        completed: completedLessonIds.length,
        total: courseLessons.length,
        completedLessonIds,
        lastActivity: courseLast,
        lastLessonId,
      };
    }).sort((x, y) => byOrder(courseById.get(x.courseId) ?? { id: x.courseId }, courseById.get(y.courseId) ?? { id: y.courseId }));

    students.push({
      uid,
      email,
      createdAt: doc.createdAt ?? a.createdAt ?? null,
      lastSignIn: a.lastSignIn ?? null,
      lastActivity,
      isTester: testers.has(email) || userEnrolls.some((e) => e.source === "tester"),
      courses: studentCourses,
    });
  }
  // Most recent activity first; then by email so the order is stable.
  students.sort((x, y) => String(y.lastActivity ?? "").localeCompare(String(x.lastActivity ?? ""))
    || x.email.localeCompare(y.email));

  return { generatedAt: now.toISOString(), courses: outCourses, students };
}
