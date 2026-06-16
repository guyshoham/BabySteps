// lib/firebase-admin.js
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { randomBytes } from "node:crypto";

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

export async function ensureUser(email) {
  const auth = adminAuth();
  try {
    const existing = await auth.getUserByEmail(email);
    return { uid: existing.uid, created: false, password: null };
  } catch (e) {
    if (e.code !== "auth/user-not-found") throw e;
    const password = generatePassword();
    const user = await auth.createUser({ email, password, emailVerified: false });
    await adminDb().collection("users").doc(user.uid).set(
      { email, createdAt: new Date().toISOString() },
      { merge: true }
    );
    return { uid: user.uid, created: true, password };
  }
}

export async function ensureEnrollment(uid, courseId, paymentRef) {
  await adminDb()
    .collection("users").doc(uid)
    .collection("enrollments").doc(courseId)
    .set(
      { grantedAt: new Date().toISOString(), source: "paypal", paymentRef: paymentRef ?? null },
      { merge: true }
    );
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
