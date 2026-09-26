// lib/set-admin-core.js — pure logic for scripts/set-admin.js and the tester.
// An admin is a user whose Firebase Auth custom claims hold `admin: true`.
// Only /api/admin-progress reads it. The browser sees a new claim only after
// its ID token refreshes (app/admin.html forces one refresh).
//
// deps:
//   findUserByEmail(email): Promise<{ uid } | null>
//   getClaims(uid): Promise<object | null>   // current custom claims
//   setClaims(uid, claims): Promise<void>    // replaces all custom claims

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The claims to save: every other claim is kept, only `admin` changes.
export function nextClaims(current, admin) {
  const next = { ...(current ?? {}) };
  if (admin) next.admin = true;
  else delete next.admin;
  return next;
}

// Set or clear the admin claim on one user. Writes only when it changes.
export async function applyAdmin(deps, uid, admin) {
  const current = (await deps.getClaims(uid)) ?? {};
  const was = current.admin === true;
  if (was === Boolean(admin)) return { changed: false };
  await deps.setClaims(uid, nextClaims(current, admin));
  return { changed: true };
}

export async function runSetAdmin(deps, { email, remove = false }) {
  const cleanEmail = String(email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(cleanEmail)) throw new Error(`not a valid email: ${email}`);
  const user = await deps.findUserByEmail(cleanEmail);
  if (!user) throw new Error(`no user with this email: ${cleanEmail} (she must have an account first)`);
  const { changed } = await applyAdmin(deps, user.uid, !remove);
  return { uid: user.uid, email: cleanEmail, admin: !remove, changed };
}
