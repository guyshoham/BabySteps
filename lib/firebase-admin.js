// lib/firebase-admin.js
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { randomBytes } from "node:crypto";
import { firebaseConfig } from "../app/firebase-config.js";
import { nextEnrollment } from "./enrollment-record.js";

// Where the "set your password" link sends the buyer after she picks a password.
// Firebase passes it to app/auth-action.html as continueUrl (once the custom action
// URL is set in the console). That page only keeps same-site /app/ paths.
export const WELCOME_CONTINUE_URL = "https://baby-steps-murex.vercel.app/app/login";

function init() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Vercel stores the key with literal \n; restore real newlines.
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }
}

export function adminAuth() { init(); return getAuth(); }
export function adminDb() { init(); return getFirestore(); }

export function generatePassword() {
  return randomBytes(9).toString("base64url"); // 12 url-safe chars
}

// --- deps for runEnroll ---

// hasSignedIn is false until the user logs in for the first time. runEnroll uses it
// to decide whether to send the welcome email.
export async function ensureUser(email) {
  const auth = adminAuth();
  try {
    const existing = await auth.getUserByEmail(email);
    return {
      uid: existing.uid,
      created: false,
      hasSignedIn: Boolean(existing.metadata?.lastSignInTime),
    };
  } catch (e) {
    if (e.code !== "auth/user-not-found") throw e;
    // A random password nobody ever sees. The buyer sets her own through the
    // welcome (password reset) email.
    const user = await auth.createUser({ email, password: generatePassword(), emailVerified: false });
    await adminDb().collection("users").doc(user.uid).set(
      { email, createdAt: new Date().toISOString() },
      { merge: true }
    );
    return { uid: user.uid, created: true, hasSignedIn: false };
  }
}

// Ask Firebase to send its built-in password reset email. This is the welcome
// email: the link lets the buyer choose her password. Uses the public web API key.
// Throws with Firebase's error message on a non-2xx response.
// fetchImpl is injectable so tests can check the request without the network.
export async function sendWelcome(email, fetchImpl = fetch) {
  const res = await fetchImpl(
    `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${firebaseConfig.apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Firebase-Locale": "he" },
      body: JSON.stringify({
        requestType: "PASSWORD_RESET",
        email,
        continueUrl: WELCOME_CONTINUE_URL,
      }),
    }
  );
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error?.message) message = data.error.message;
    } catch { /* body was not JSON */ }
    throw new Error(`sendWelcome failed: ${message}`);
  }
}

// Keeps the first grantedAt/source/paymentRef and adds new payments to `payments`.
// A transaction, so two calls at once cannot drop a payment.
export async function ensureEnrollment(uid, courseId, paymentRef, source = "paypal") {
  const db = adminDb();
  const ref = db
    .collection("users").doc(uid)
    .collection("enrollments").doc(courseId);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const next = nextEnrollment(snap.exists ? snap.data() : null, {
      paymentRef: paymentRef ?? null,
      source,
      at: new Date().toISOString(),
    });
    tx.set(ref, next);
  });
}

// --- deps for scripts/create-tester.js ---

// Create the user with this password, or reset the password if the user exists.
// Also makes sure users/{uid} exists, like real students get.
export async function upsertUserWithPassword(email, password) {
  const auth = adminAuth();
  let uid;
  let created = false;
  try {
    const existing = await auth.getUserByEmail(email);
    await auth.updateUser(existing.uid, { password });
    uid = existing.uid;
  } catch (e) {
    if (e.code !== "auth/user-not-found") throw e;
    const user = await auth.createUser({ email, password, emailVerified: false });
    uid = user.uid;
    created = true;
  }
  const ref = adminDb().collection("users").doc(uid);
  const snap = await ref.get();
  if (!snap.exists) await ref.set({ email, createdAt: new Date().toISOString() });
  return { uid, created };
}

export async function findUserByEmail(email) {
  try {
    const u = await adminAuth().getUserByEmail(email);
    return { uid: u.uid };
  } catch (e) {
    if (e.code === "auth/user-not-found") return null;
    throw e;
  }
}

export async function listCourseIds() {
  const snap = await adminDb().collection("courses").get();
  return snap.docs.map((d) => d.id);
}

// Every course as { id, published }. Callers decide what to do with unpublished ones.
export async function listCourses() {
  const snap = await adminDb().collection("courses").get();
  return snap.docs.map((d) => ({ id: d.id, published: d.get("published") }));
}

// --- deps for runVideoUrl ---

export async function verifyToken(idToken) {
  try {
    const decoded = await adminAuth().verifyIdToken(idToken);
    // `admin` is the custom claim set by scripts/set-admin.js. Only a real true counts.
    return { uid: decoded.uid, admin: decoded.admin === true };
  } catch {
    return null;
  }
}

export async function getLesson(lessonId) {
  const snap = await adminDb().collection("lessons").doc(lessonId).get();
  if (!snap.exists) return null;
  const data = snap.data();
  return { courseId: data.courseId, r2Key: data.r2Key };
}

// The ids of every course this user is enrolled in. One query, so the API can
// run it at the same time as the lesson read.
export async function enrolledCourseIds(uid) {
  const snap = await adminDb().collection("users").doc(uid).collection("enrollments").get();
  return snap.docs.map((d) => d.id);
}

export async function isEnrolled(uid, courseId) {
  const snap = await adminDb()
    .collection("users").doc(uid)
    .collection("enrollments").doc(courseId)
    .get();
  return snap.exists;
}

// --- deps for scripts/set-admin.js (custom claims) ---

export async function getClaims(uid) {
  const u = await adminAuth().getUser(uid);
  return u.customClaims ?? {};
}

export async function setClaims(uid, claims) {
  await adminAuth().setCustomUserClaims(uid, claims);
}

// --- deps for runAdminProgress (lib/admin-progress-core.js) ---

// Firestore may hold a Timestamp or a string. The admin API sends ISO strings.
export function toIso(v) {
  if (!v) return null;
  if (typeof v === "string") return v;
  if (v instanceof Date) return v.toISOString();
  if (typeof v.toDate === "function") return v.toDate().toISOString();
  return null;
}

// The uid of a doc at users/{uid}/<sub>/{id}.
function ownerUid(docSnap) {
  const user = docSnap.ref.parent.parent;
  return user && user.parent.id === "users" ? user.id : null;
}

export async function listAllCourses() {
  const snap = await adminDb().collection("courses").get();
  return snap.docs.map((d) => ({
    id: d.id, title: d.get("title"), slug: d.get("slug"), order: d.get("order"), published: d.get("published"),
  }));
}

export async function listAllLessons() {
  const snap = await adminDb().collection("lessons").get();
  return snap.docs.map((d) => ({
    id: d.id, courseId: d.get("courseId"), title: d.get("title"), order: d.get("order"),
  }));
}

export async function listUserDocs() {
  const snap = await adminDb().collection("users").get();
  return snap.docs.map((d) => ({ uid: d.id, email: d.get("email") ?? null, createdAt: toIso(d.get("createdAt")) }));
}

export async function listAllEnrollments() {
  const snap = await adminDb().collectionGroup("enrollments").get();
  return snap.docs.map((d) => ({
    uid: ownerUid(d), courseId: d.id, grantedAt: toIso(d.get("grantedAt")), source: d.get("source") ?? null,
  })).filter((e) => e.uid);
}

export async function listAllProgress() {
  const snap = await adminDb().collectionGroup("progress").get();
  return snap.docs.map((d) => ({
    uid: ownerUid(d), lessonId: d.id, completed: d.get("completed") === true, updatedAt: toIso(d.get("updatedAt")),
  })).filter((p) => p.uid);
}

// Every Auth user, 1000 per page. Only the uid, email and two dates leave here:
// never password hashes, providers or other Auth internals.
export async function listAuthUsers() {
  const out = [];
  let pageToken;
  do {
    const page = await adminAuth().listUsers(1000, pageToken);
    for (const u of page.users) {
      out.push({
        uid: u.uid,
        email: u.email ?? null,
        createdAt: toIso(u.metadata?.creationTime ? new Date(u.metadata.creationTime) : null),
        lastSignIn: toIso(u.metadata?.lastSignInTime ? new Date(u.metadata.lastSignInTime) : null),
      });
    }
    pageToken = page.pageToken;
  } while (pageToken);
  return out;
}
