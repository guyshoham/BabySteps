// lib/firebase-admin.js
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { randomBytes } from "node:crypto";
import { firebaseConfig } from "../app/firebase-config.js";
import { nextEnrollment } from "./enrollment-record.js";

// Where the "set your password" link sends the buyer after she picks a password.
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
    return { uid: decoded.uid };
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

export async function isEnrolled(uid, courseId) {
  const snap = await adminDb()
    .collection("users").doc(uid)
    .collection("enrollments").doc(courseId)
    .get();
  return snap.exists;
}
