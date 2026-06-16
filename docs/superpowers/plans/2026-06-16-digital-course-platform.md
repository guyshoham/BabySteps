# Digital Course Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a gated, paid course area to the existing static site so logged-in students can watch enrolled-course video lessons with progress tracking, while staying $0/month.

**Architecture:** Existing static HTML/Tailwind site on Vercel gains an `/app/*` gated area (vanilla JS + Firebase Web SDK) and two Vercel serverless functions. Firebase Auth + Firestore hold identity and data; videos live in a private Cloudflare R2 bucket. The `GET /api/video-url` function verifies auth + enrollment and returns a short-lived R2 signed URL; the `POST /api/enroll` function is called by the existing PayPal→Make scenario to create the account and write the enrollment. Core logic is written as pure functions with injected I/O dependencies so it is unit-testable without hitting live services.

**Tech Stack:** Vanilla HTML/CSS/JS, Tailwind (CDN), Firebase Web SDK v10 (CDN ESM), Firebase Admin SDK (Node), AWS SDK v3 S3 client (R2 presigning), Vercel serverless functions (Node, ESM), Vitest for unit tests.

---

## File Structure

**New files:**
- `package.json` — function deps + test script (ESM project)
- `vercel.json` — clean URLs + `/app/*` rewrites
- `firestore.rules` — Firestore security rules
- `lib/course-map.js` — PayPal product → courseId mapping (pure)
- `lib/enroll-core.js` — enroll orchestration (pure, deps injected)
- `lib/video-core.js` — video-url orchestration (pure, deps injected)
- `lib/firebase-admin.js` — Admin SDK singleton + real enroll/video deps
- `lib/r2.js` — R2 S3 client + `signUrl()`
- `api/enroll.js` — POST handler (Make webhook), thin wrapper over `enroll-core`
- `api/video-url.js` — GET handler (gatekeeper), thin wrapper over `video-core`
- `app/firebase-config.js` — public Firebase Web config (filled in during setup)
- `app/firebase-client.js` — client SDK init + auth helpers (`requireAuth`, etc.)
- `app/login.html` — sign-in page
- `app/my-courses.html` — enrolled courses list
- `app/course.html` — lesson list for one course (with progress)
- `app/lesson.html` — video player + progress saving
- `scripts/seed.js` — one-off Firestore seeder for courses + lessons
- `tests/course-map.test.js`, `tests/enroll-core.test.js`, `tests/video-core.test.js`
- `.env.example` — documents required env vars

**Unchanged:** existing `index.html`, `styles.css`, `challenge/**`, `assets/**`.

---

## Task 1: Project scaffolding (package.json, vitest, .env.example)

**Files:**
- Create: `package.json`
- Create: `.env.example`
- Create: `.gitignore` (modify if exists)

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "babysteps-courses",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "vitest run"
  },
  "dependencies": {
    "@aws-sdk/client-s3": "^3.600.0",
    "@aws-sdk/s3-request-presigner": "^3.600.0",
    "firebase-admin": "^12.1.0"
  },
  "devDependencies": {
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 2: Create `.env.example`**

```bash
# Firebase Admin (Service account → Project settings → Service accounts → Generate key)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Cloudflare R2 (R2 → Manage API tokens → S3-compatible credentials)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=babysteps-videos

# Shared secret Make must send in the x-enroll-secret header
ENROLL_SECRET=

# JSON map of PayPal product/button id -> Firestore courseId
COURSE_MAP={"ROLLING-2024":"rolling","TUMMY-2024":"tummy-time"}
```

- [ ] **Step 3: Ensure build artifacts are ignored**

Add these lines to `.gitignore` (create the file if absent; keep any existing lines):

```
node_modules/
.env
.env.local
.vercel
```

- [ ] **Step 4: Install dependencies**

Run: `npm install`
Expected: `node_modules/` created, lockfile written, no errors.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .env.example .gitignore
git commit -m "chore: scaffold course platform (deps, vitest, env template)"
```

---

## Task 2: PayPal product → courseId mapping (`lib/course-map.js`)

**Files:**
- Create: `lib/course-map.js`
- Test: `tests/course-map.test.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/course-map.test.js
import { describe, it, expect } from "vitest";
import { loadCourseMap, courseIdForProduct } from "../lib/course-map.js";

describe("course-map", () => {
  it("returns courseId for a known product", () => {
    expect(courseIdForProduct("ROLLING-2024", { "ROLLING-2024": "rolling" })).toBe("rolling");
  });
  it("returns null for an unknown product", () => {
    expect(courseIdForProduct("NOPE", { "ROLLING-2024": "rolling" })).toBe(null);
  });
  it("returns null for a missing productId", () => {
    expect(courseIdForProduct(undefined, {})).toBe(null);
  });
  it("loads the map from COURSE_MAP env JSON", () => {
    expect(loadCourseMap({ COURSE_MAP: '{"P1":"c1"}' })).toEqual({ P1: "c1" });
  });
  it("returns an empty map when COURSE_MAP is absent", () => {
    expect(loadCourseMap({})).toEqual({});
  });
  it("throws on invalid COURSE_MAP JSON", () => {
    expect(() => loadCourseMap({ COURSE_MAP: "{bad" })).toThrow();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- course-map`
Expected: FAIL — `Cannot find module '../lib/course-map.js'`.

- [ ] **Step 3: Write the implementation**

```js
// lib/course-map.js
// Maps a PayPal product/button identifier to an internal Firestore courseId.

export function loadCourseMap(env = process.env) {
  if (!env.COURSE_MAP) return {};
  try {
    return JSON.parse(env.COURSE_MAP);
  } catch {
    throw new Error("COURSE_MAP env is not valid JSON");
  }
}

export function courseIdForProduct(productId, map) {
  if (!productId) return null;
  return map[productId] ?? null;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- course-map`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/course-map.js tests/course-map.test.js
git commit -m "feat: PayPal product to courseId mapping"
```

---

## Task 3: Enroll orchestration (`lib/enroll-core.js`)

**Files:**
- Create: `lib/enroll-core.js`
- Test: `tests/enroll-core.test.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/enroll-core.test.js
import { describe, it, expect, vi } from "vitest";
import { runEnroll } from "../lib/enroll-core.js";

const map = { "ROLLING-2024": "rolling" };

function deps(overrides = {}) {
  return {
    map,
    ensureUser: vi.fn(async () => ({ uid: "u1", created: true, password: "genpw" })),
    ensureEnrollment: vi.fn(async () => {}),
    ...overrides,
  };
}

describe("runEnroll", () => {
  it("400 when email is missing", async () => {
    const r = await runEnroll(deps(), { paypalProductId: "ROLLING-2024" });
    expect(r.status).toBe(400);
  });
  it("400 when product is unknown", async () => {
    const r = await runEnroll(deps(), { email: "a@b.com", paypalProductId: "X" });
    expect(r.status).toBe(400);
  });
  it("creates a new user, enrolls, and returns the generated password", async () => {
    const d = deps();
    const r = await runEnroll(d, { email: "a@b.com", paypalProductId: "ROLLING-2024", paymentRef: "PAY1" });
    expect(r.status).toBe(200);
    expect(r.body.courseId).toBe("rolling");
    expect(r.body.created).toBe(true);
    expect(r.body.password).toBe("genpw");
    expect(d.ensureEnrollment).toHaveBeenCalledWith("u1", "rolling", "PAY1");
  });
  it("is idempotent for an existing user: no password, still enrolls", async () => {
    const d = deps({ ensureUser: vi.fn(async () => ({ uid: "u1", created: false, password: null })) });
    const r = await runEnroll(d, { email: "a@b.com", paypalProductId: "ROLLING-2024" });
    expect(r.status).toBe(200);
    expect(r.body.created).toBe(false);
    expect(r.body.password).toBe(null);
    expect(d.ensureEnrollment).toHaveBeenCalledWith("u1", "rolling", null);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- enroll-core`
Expected: FAIL — `Cannot find module '../lib/enroll-core.js'`.

- [ ] **Step 3: Write the implementation**

```js
// lib/enroll-core.js
// Pure orchestration of the enroll flow. All I/O is injected via `deps`
// so this is unit-testable without Firebase.
//
// deps:
//   map: { [paypalProductId]: courseId }
//   ensureUser(email): Promise<{ uid, created, password|null }>
//   ensureEnrollment(uid, courseId, paymentRef): Promise<void>
import { courseIdForProduct } from "./course-map.js";

export async function runEnroll(deps, body) {
  const { map, ensureUser, ensureEnrollment } = deps;
  const { email, paypalProductId, paymentRef } = body ?? {};

  if (!email || !paypalProductId) {
    return { status: 400, body: { error: "email and paypalProductId are required" } };
  }

  const courseId = courseIdForProduct(paypalProductId, map);
  if (!courseId) {
    return { status: 400, body: { error: `unknown product: ${paypalProductId}` } };
  }

  const user = await ensureUser(email);
  await ensureEnrollment(user.uid, courseId, paymentRef ?? null);

  return {
    status: 200,
    body: {
      uid: user.uid,
      email,
      courseId,
      created: user.created,
      // password is only present when the account was newly created
      password: user.created ? user.password : null,
    },
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- enroll-core`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/enroll-core.js tests/enroll-core.test.js
git commit -m "feat: enroll orchestration core with idempotency"
```

---

## Task 4: Video-url orchestration (`lib/video-core.js`)

**Files:**
- Create: `lib/video-core.js`
- Test: `tests/video-core.test.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/video-core.test.js
import { describe, it, expect, vi } from "vitest";
import { runVideoUrl } from "../lib/video-core.js";

function deps(overrides = {}) {
  return {
    verifyToken: vi.fn(async () => ({ uid: "u1" })),
    getLesson: vi.fn(async () => ({ courseId: "rolling", r2Key: "rolling/01.mp4" })),
    isEnrolled: vi.fn(async () => true),
    signUrl: vi.fn(async () => "https://r2.example/signed"),
    ...overrides,
  };
}

describe("runVideoUrl", () => {
  it("401 when token is missing", async () => {
    const r = await runVideoUrl(deps(), { idToken: null, lessonId: "L1" });
    expect(r.status).toBe(401);
  });
  it("400 when lessonId is missing", async () => {
    const r = await runVideoUrl(deps(), { idToken: "t", lessonId: null });
    expect(r.status).toBe(400);
  });
  it("401 when token is invalid", async () => {
    const r = await runVideoUrl(deps({ verifyToken: vi.fn(async () => null) }), { idToken: "t", lessonId: "L1" });
    expect(r.status).toBe(401);
  });
  it("404 when lesson is not found", async () => {
    const r = await runVideoUrl(deps({ getLesson: vi.fn(async () => null) }), { idToken: "t", lessonId: "L1" });
    expect(r.status).toBe(404);
  });
  it("403 when the user is not enrolled", async () => {
    const r = await runVideoUrl(deps({ isEnrolled: vi.fn(async () => false) }), { idToken: "t", lessonId: "L1" });
    expect(r.status).toBe(403);
  });
  it("200 with a signed url when enrolled", async () => {
    const d = deps();
    const r = await runVideoUrl(d, { idToken: "t", lessonId: "L1" });
    expect(r.status).toBe(200);
    expect(r.body.url).toBe("https://r2.example/signed");
    expect(d.signUrl).toHaveBeenCalledWith("rolling/01.mp4");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- video-core`
Expected: FAIL — `Cannot find module '../lib/video-core.js'`.

- [ ] **Step 3: Write the implementation**

```js
// lib/video-core.js
// Pure orchestration of the gated video-url flow. All I/O injected via `deps`.
//
// deps:
//   verifyToken(idToken): Promise<{ uid } | null>
//   getLesson(lessonId): Promise<{ courseId, r2Key } | null>
//   isEnrolled(uid, courseId): Promise<boolean>
//   signUrl(r2Key): Promise<string>
export async function runVideoUrl(deps, { idToken, lessonId }) {
  const { verifyToken, getLesson, isEnrolled, signUrl } = deps;

  if (!idToken) return { status: 401, body: { error: "missing auth token" } };
  if (!lessonId) return { status: 400, body: { error: "lessonId is required" } };

  const decoded = await verifyToken(idToken);
  if (!decoded) return { status: 401, body: { error: "invalid token" } };

  const lesson = await getLesson(lessonId);
  if (!lesson) return { status: 404, body: { error: "lesson not found" } };

  const enrolled = await isEnrolled(decoded.uid, lesson.courseId);
  if (!enrolled) return { status: 403, body: { error: "not enrolled" } };

  const url = await signUrl(lesson.r2Key);
  return { status: 200, body: { url } };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- video-core`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/video-core.js tests/video-core.test.js
git commit -m "feat: gated video-url orchestration core"
```

---

## Task 5: R2 signing helper (`lib/r2.js`)

**Files:**
- Create: `lib/r2.js`

This wraps the AWS SDK against Cloudflare R2's S3-compatible endpoint. It is thin and
exercised by manual verification (Task 13), so no unit test here.

- [ ] **Step 1: Write the implementation**

```js
// lib/r2.js
// Generates short-lived signed GET URLs for private R2 objects.
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const DEFAULT_EXPIRES_SECONDS = 2 * 60 * 60; // 2 hours — covers a long lesson with seeking

let _client = null;
function client() {
  if (_client) return _client;
  _client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
  return _client;
}

export async function signUrl(r2Key, expiresIn = DEFAULT_EXPIRES_SECONDS) {
  const cmd = new GetObjectCommand({ Bucket: process.env.R2_BUCKET, Key: r2Key });
  return getSignedUrl(client(), cmd, { expiresIn });
}
```

- [ ] **Step 2: Verify it imports without error**

Run: `node -e "import('./lib/r2.js').then(() => console.log('ok'))"`
Expected: prints `ok` (no env needed at import time).

- [ ] **Step 3: Commit**

```bash
git add lib/r2.js
git commit -m "feat: R2 signed-url helper"
```

---

## Task 6: Firebase Admin singleton + real deps (`lib/firebase-admin.js`)

**Files:**
- Create: `lib/firebase-admin.js`

Real implementations of the deps injected into `enroll-core` and `video-core`.
Exercised by manual verification (Task 13).

- [ ] **Step 1: Write the implementation**

```js
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
```

- [ ] **Step 2: Verify it imports without error**

Run: `node -e "import('./lib/firebase-admin.js').then(() => console.log('ok'))"`
Expected: prints `ok`.

- [ ] **Step 3: Commit**

```bash
git add lib/firebase-admin.js
git commit -m "feat: Firebase Admin singleton and enroll/video deps"
```

---

## Task 7: API handlers (`api/enroll.js`, `api/video-url.js`)

**Files:**
- Create: `api/enroll.js`
- Create: `api/video-url.js`

Thin Vercel serverless wrappers that wire real deps into the cores.

- [ ] **Step 1: Write `api/enroll.js`**

```js
// api/enroll.js — POST webhook called by Make after a PayPal payment.
import { runEnroll } from "../lib/enroll-core.js";
import { loadCourseMap } from "../lib/course-map.js";
import { ensureUser, ensureEnrollment } from "../lib/firebase-admin.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }
  if (req.headers["x-enroll-secret"] !== process.env.ENROLL_SECRET) {
    return res.status(401).json({ error: "unauthorized" });
  }
  try {
    const map = loadCourseMap();
    const result = await runEnroll({ map, ensureUser, ensureEnrollment }, req.body);
    return res.status(result.status).json(result.body);
  } catch (e) {
    console.error("enroll error", e);
    return res.status(500).json({ error: "internal error" });
  }
}
```

- [ ] **Step 2: Write `api/video-url.js`**

```js
// api/video-url.js — GET gatekeeper: verify auth + enrollment, return signed URL.
import { runVideoUrl } from "../lib/video-core.js";
import { verifyToken, getLesson, isEnrolled } from "../lib/firebase-admin.js";
import { signUrl } from "../lib/r2.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "method not allowed" });
  }
  const authHeader = req.headers.authorization || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const lessonId = req.query.lessonId || null;
  try {
    const result = await runVideoUrl(
      { verifyToken, getLesson, isEnrolled, signUrl },
      { idToken, lessonId }
    );
    return res.status(result.status).json(result.body);
  } catch (e) {
    console.error("video-url error", e);
    return res.status(500).json({ error: "internal error" });
  }
}
```

- [ ] **Step 3: Verify both import without error**

Run: `node -e "Promise.all([import('./api/enroll.js'),import('./api/video-url.js')]).then(()=>console.log('ok'))"`
Expected: prints `ok`.

- [ ] **Step 4: Commit**

```bash
git add api/enroll.js api/video-url.js
git commit -m "feat: enroll and video-url serverless handlers"
```

---

## Task 8: Firestore security rules (`firestore.rules`)

**Files:**
- Create: `firestore.rules`

- [ ] **Step 1: Write the rules**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() { return request.auth != null; }
    function isOwner(uid) { return request.auth != null && request.auth.uid == uid; }

    match /courses/{courseId} {
      allow read: if signedIn();
      allow write: if false; // managed via admin/console only
    }

    match /lessons/{lessonId} {
      allow read: if signedIn();
      allow write: if false;
    }

    match /users/{uid} {
      allow read: if isOwner(uid);
      allow write: if false; // user docs are created server-side on enroll

      match /enrollments/{courseId} {
        allow read: if isOwner(uid);
        allow write: if false; // only the server (Admin SDK) writes enrollments
      }

      match /progress/{lessonId} {
        allow read, write: if isOwner(uid);
      }
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add firestore.rules
git commit -m "feat: Firestore security rules"
```

(The rules are deployed to Firebase in Task 12 — paste into the console's Rules editor, or `firebase deploy --only firestore:rules` if the Firebase CLI is set up.)

---

## Task 9: Routing config (`vercel.json`)

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Write the config**

```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "rewrites": [
    { "source": "/app/course/:slug", "destination": "/app/course.html" },
    { "source": "/app/lesson/:id", "destination": "/app/lesson.html" }
  ]
}
```

`cleanUrls` serves `/app/login` from `app/login.html`. The rewrites let
`/app/course/rolling` and `/app/lesson/<id>` resolve to their HTML files while the
real path (with the slug/id) stays in `location.pathname` for the client to read.

- [ ] **Step 2: Commit**

```bash
git add vercel.json
git commit -m "feat: Vercel clean URLs and /app route rewrites"
```

---

## Task 10: Firebase client + login page (`app/firebase-config.js`, `app/firebase-client.js`, `app/login.html`)

**Files:**
- Create: `app/firebase-config.js`
- Create: `app/firebase-client.js`
- Create: `app/login.html`

- [ ] **Step 1: Create `app/firebase-config.js`**

The Firebase **Web** config is public (safe to commit). Real values are pasted in
during Task 12 — until then this placeholder lets pages load locally.

```js
// app/firebase-config.js
// Public Firebase Web config — copy from Firebase console:
// Project settings → General → Your apps → Web app → SDK setup and configuration.
export const firebaseConfig = {
  apiKey: "PASTE_API_KEY",
  authDomain: "PASTE_PROJECT.firebaseapp.com",
  projectId: "PASTE_PROJECT_ID",
  storageBucket: "PASTE_PROJECT.appspot.com",
  appId: "PASTE_APP_ID",
};
```

- [ ] **Step 2: Create `app/firebase-client.js`**

```js
// app/firebase-client.js — Firebase Web SDK init + shared auth helpers.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, signOut as fbSignOut,
  onAuthStateChanged, sendPasswordResetEmail, setPersistence, browserLocalPersistence,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Keep users logged in across visits on the same device.
setPersistence(auth, browserLocalPersistence);

export function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}
export function signOut() { return fbSignOut(auth); }
export function resetPassword(email) { return sendPasswordResetEmail(auth, email); }

// Resolves with the signed-in user, or redirects to login and never resolves.
export function requireAuth() {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      if (user) {
        resolve(user);
      } else {
        const next = encodeURIComponent(location.pathname + location.search);
        location.replace(`/app/login?next=${next}`);
      }
    });
  });
}
```

- [ ] **Step 3: Create `app/login.html`**

```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>כניסה — מתחילים בקטן</title>
  <link rel="icon" type="image/png" href="/assets/logos/logo-peach.png" />
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>body{font-family:'Rubik',sans-serif}</style>
</head>
<body class="min-h-screen flex items-center justify-center bg-[#fdf6f0] p-4">
  <main class="w-full max-w-sm bg-white rounded-2xl shadow p-6">
    <h1 class="text-xl font-bold text-center mb-4">כניסה לקורסים</h1>
    <form id="login-form" class="space-y-3">
      <input id="email" type="email" required placeholder="אימייל"
             class="w-full border rounded-lg px-3 py-2" autocomplete="email" />
      <input id="password" type="password" required placeholder="סיסמה"
             class="w-full border rounded-lg px-3 py-2" autocomplete="current-password" />
      <button type="submit" class="w-full bg-[#704229] text-white rounded-lg py-2 font-semibold">
        כניסה
      </button>
    </form>
    <button id="reset" class="w-full text-sm text-[#704229] mt-3 underline">שכחתי סיסמה</button>
    <p id="msg" class="text-sm text-red-600 mt-3 text-center"></p>
  </main>

  <script type="module">
    import { signIn, resetPassword, auth } from "/app/firebase-client.js";
    import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

    const params = new URLSearchParams(location.search);
    const next = params.get("next") || "/app/my-courses";
    const msg = document.getElementById("msg");

    // Already signed in? Skip the form.
    onAuthStateChanged(auth, (user) => { if (user) location.replace(next); });

    document.getElementById("login-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      msg.textContent = "";
      try {
        await signIn(document.getElementById("email").value.trim(),
                     document.getElementById("password").value);
        location.replace(next);
      } catch {
        msg.textContent = "אימייל או סיסמה שגויים";
      }
    });

    document.getElementById("reset").addEventListener("click", async () => {
      const email = document.getElementById("email").value.trim();
      if (!email) { msg.textContent = "הזינו אימייל ואז לחצו שכחתי סיסמה"; return; }
      try {
        await resetPassword(email);
        msg.className = "text-sm text-green-700 mt-3 text-center";
        msg.textContent = "נשלח אליכם מייל לאיפוס סיסמה";
      } catch {
        msg.textContent = "לא הצלחנו לשלוח מייל איפוס";
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 4: Commit**

```bash
git add app/firebase-config.js app/firebase-client.js app/login.html
git commit -m "feat: Firebase web client and login page"
```

---

## Task 11: Student pages (`app/my-courses.html`, `app/course.html`, `app/lesson.html`)

**Files:**
- Create: `app/my-courses.html`
- Create: `app/course.html`
- Create: `app/lesson.html`

- [ ] **Step 1: Create `app/my-courses.html`**

```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>הקורסים שלי — מתחילים בקטן</title>
  <link rel="icon" type="image/png" href="/assets/logos/logo-peach.png" />
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>body{font-family:'Rubik',sans-serif}</style>
</head>
<body class="min-h-screen bg-[#fdf6f0] p-4">
  <header class="max-w-3xl mx-auto flex items-center justify-between py-4">
    <h1 class="text-xl font-bold">הקורסים שלי</h1>
    <button id="signout" class="text-sm underline text-[#704229]">יציאה</button>
  </header>
  <main id="list" class="max-w-3xl mx-auto grid gap-4 sm:grid-cols-2"></main>
  <p id="empty" class="max-w-3xl mx-auto text-center text-gray-500 hidden">עדיין אין לך קורסים.</p>

  <script type="module">
    import { requireAuth, db, signOut } from "/app/firebase-client.js";
    import { collection, getDocs, doc, getDoc }
      from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

    const user = await requireAuth();
    document.getElementById("signout").addEventListener("click", async () => {
      await signOut(); location.replace("/app/login");
    });

    const enrollSnap = await getDocs(collection(db, "users", user.uid, "enrollments"));
    const list = document.getElementById("list");

    if (enrollSnap.empty) { document.getElementById("empty").classList.remove("hidden"); }

    for (const enr of enrollSnap.docs) {
      const courseId = enr.id;
      const courseSnap = await getDoc(doc(db, "courses", courseId));
      if (!courseSnap.exists()) continue;
      const c = courseSnap.data();
      const a = document.createElement("a");
      a.href = `/app/course/${c.slug}`;
      a.className = "block bg-white rounded-2xl shadow overflow-hidden hover:shadow-lg transition";
      a.innerHTML = `
        ${c.coverImage ? `<img src="${c.coverImage}" alt="" class="w-full h-40 object-cover">` : ""}
        <div class="p-4">
          <h2 class="font-bold text-lg">${c.title}</h2>
          <p class="text-sm text-gray-600 mt-1">${c.description ?? ""}</p>
        </div>`;
      list.appendChild(a);
    }
  </script>
</body>
</html>
```

- [ ] **Step 2: Create `app/course.html`**

Reads the slug from the path (`/app/course/<slug>`), loads the course + its lessons
(ordered), and shows a ✓ for completed lessons.

```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>קורס — מתחילים בקטן</title>
  <link rel="icon" type="image/png" href="/assets/logos/logo-peach.png" />
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>body{font-family:'Rubik',sans-serif}</style>
</head>
<body class="min-h-screen bg-[#fdf6f0] p-4">
  <header class="max-w-2xl mx-auto py-4">
    <a href="/app/my-courses" class="text-sm underline text-[#704229]">← הקורסים שלי</a>
    <h1 id="title" class="text-2xl font-bold mt-2"></h1>
    <p id="desc" class="text-gray-600"></p>
  </header>
  <main id="lessons" class="max-w-2xl mx-auto space-y-2"></main>
  <p id="noaccess" class="max-w-2xl mx-auto text-center text-red-600 hidden">אין לך גישה לקורס הזה.</p>

  <script type="module">
    import { requireAuth, db } from "/app/firebase-client.js";
    import { collection, query, where, orderBy, getDocs, doc, getDoc }
      from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

    const slug = decodeURIComponent(location.pathname.split("/").pop());
    const user = await requireAuth();

    // Find course by slug.
    const courseQ = query(collection(db, "courses"), where("slug", "==", slug));
    const courseDocs = await getDocs(courseQ);
    if (courseDocs.empty) { document.getElementById("noaccess").classList.remove("hidden"); throw new Error("no course"); }
    const courseDoc = courseDocs.docs[0];
    const courseId = courseDoc.id;
    const c = courseDoc.data();

    // Enforce enrollment (defense-in-depth; video is also gated server-side).
    const enr = await getDoc(doc(db, "users", user.uid, "enrollments", courseId));
    if (!enr.exists()) { document.getElementById("noaccess").classList.remove("hidden"); throw new Error("not enrolled"); }

    document.getElementById("title").textContent = c.title;
    document.getElementById("desc").textContent = c.description ?? "";

    // Load lessons ordered, plus this user's progress.
    const lessonsSnap = await getDocs(
      query(collection(db, "lessons"), where("courseId", "==", courseId), orderBy("order"))
    );
    const progressSnap = await getDocs(collection(db, "users", user.uid, "progress"));
    const completed = new Set(progressSnap.docs.filter(d => d.data().completed).map(d => d.id));

    const wrap = document.getElementById("lessons");
    lessonsSnap.docs.forEach((d, i) => {
      const l = d.data();
      const done = completed.has(d.id);
      const a = document.createElement("a");
      a.href = `/app/lesson/${d.id}`;
      a.className = "flex items-center gap-3 bg-white rounded-xl shadow px-4 py-3 hover:shadow-md transition";
      a.innerHTML = `
        <span class="w-6 h-6 flex items-center justify-center rounded-full ${done ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"} text-sm">
          ${done ? "✓" : (i + 1)}
        </span>
        <span class="font-medium">${l.title}</span>`;
      wrap.appendChild(a);
    });
  </script>
</body>
</html>
```

- [ ] **Step 3: Create `app/lesson.html`**

Reads the lesson id from the path, renders the title, fetches a signed URL from
`/api/video-url`, and saves progress to Firestore.

```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>שיעור — מתחילים בקטן</title>
  <link rel="icon" type="image/png" href="/assets/logos/logo-peach.png" />
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>body{font-family:'Rubik',sans-serif}</style>
</head>
<body class="min-h-screen bg-[#fdf6f0] p-4">
  <header class="max-w-3xl mx-auto py-4">
    <a id="back" href="/app/my-courses" class="text-sm underline text-[#704229]">← חזרה לקורס</a>
    <h1 id="title" class="text-2xl font-bold mt-2"></h1>
  </header>
  <main class="max-w-3xl mx-auto">
    <video id="video" class="w-full rounded-2xl shadow bg-black" controls playsinline
           controlsList="nodownload" oncontextmenu="return false"></video>
    <p id="msg" class="text-center text-red-600 mt-3"></p>
  </main>

  <script type="module">
    import { requireAuth, db } from "/app/firebase-client.js";
    import { doc, getDoc, setDoc }
      from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

    const lessonId = decodeURIComponent(location.pathname.split("/").pop());
    const user = await requireAuth();
    const msg = document.getElementById("msg");
    const video = document.getElementById("video");

    // Lesson metadata (title + which course, for the back link + resume).
    const lessonSnap = await getDoc(doc(db, "lessons", lessonId));
    if (!lessonSnap.exists()) { msg.textContent = "השיעור לא נמצא"; throw new Error("no lesson"); }
    const lesson = lessonSnap.data();
    document.getElementById("title").textContent = lesson.title;

    // Get this user's saved position.
    const progSnap = await getDoc(doc(db, "users", user.uid, "progress", lessonId));
    const startAt = progSnap.exists() ? (progSnap.data().lastPositionSec || 0) : 0;

    // Fetch a signed URL (server checks enrollment).
    const token = await user.getIdToken();
    const resp = await fetch(`/api/video-url?lessonId=${encodeURIComponent(lessonId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (resp.status === 403) { msg.textContent = "אין לך גישה לשיעור הזה"; throw new Error("403"); }
    if (!resp.ok) { msg.textContent = "שגיאה בטעינת הסרטון"; throw new Error("video-url failed"); }
    const { url } = await resp.json();
    video.src = url;
    video.addEventListener("loadedmetadata", () => { if (startAt > 0) video.currentTime = startAt; });

    // Save progress: throttled position + completion on end.
    let lastSaved = 0;
    const save = (extra) => setDoc(
      doc(db, "users", user.uid, "progress", lessonId),
      { lastPositionSec: Math.floor(video.currentTime), updatedAt: new Date().toISOString(), ...extra },
      { merge: true }
    );
    video.addEventListener("timeupdate", () => {
      if (video.currentTime - lastSaved > 10) { lastSaved = video.currentTime; save({}); }
    });
    video.addEventListener("ended", () => save({ completed: true }));
  </script>
</body>
</html>
```

- [ ] **Step 4: Commit**

```bash
git add app/my-courses.html app/course.html app/lesson.html
git commit -m "feat: student pages (my-courses, course, lesson)"
```

---

## Task 12: Seed script (`scripts/seed.js`)

**Files:**
- Create: `scripts/seed.js`

A one-off Node script (run locally with env vars set) that writes the 2 courses and
their lessons to Firestore. Edit the `DATA` block to match your real lessons + R2 keys.

- [ ] **Step 1: Write the script**

```js
// scripts/seed.js — run locally: `node scripts/seed.js` (needs FIREBASE_* env vars).
import { adminDb } from "../lib/firebase-admin.js";

const DATA = {
  courses: [
    { id: "rolling", slug: "rolling", title: "קורס התהפכות", order: 1, published: true,
      description: "ליווי שלב ההתהפכות", coverImage: "/assets/videos/rolling-teaser-poster.jpg" },
    { id: "tummy-time", slug: "tummy-time", title: "קורס שכיבה על הבטן", order: 2, published: true,
      description: "ליווי שלב הטאמי טיים", coverImage: "" },
  ],
  lessons: [
    // courseId must match a course id above; r2Key is the object key in your R2 bucket.
    { id: "rolling-01", courseId: "rolling", title: "מבוא", order: 1, r2Key: "rolling/01.mp4", durationSec: 0, description: "" },
    { id: "rolling-02", courseId: "rolling", title: "תרגול ראשון", order: 2, r2Key: "rolling/02.mp4", durationSec: 0, description: "" },
    { id: "tummy-01", courseId: "tummy-time", title: "מבוא", order: 1, r2Key: "tummy/01.mp4", durationSec: 0, description: "" },
  ],
};

const db = adminDb();

for (const c of DATA.courses) {
  const { id, ...rest } = c;
  await db.collection("courses").doc(id).set(rest, { merge: true });
  console.log("course:", id);
}
for (const l of DATA.lessons) {
  const { id, ...rest } = l;
  await db.collection("lessons").doc(id).set(rest, { merge: true });
  console.log("lesson:", id);
}
console.log("seed complete");
process.exit(0);
```

- [ ] **Step 2: Commit**

```bash
git add scripts/seed.js
git commit -m "feat: Firestore seed script for courses and lessons"
```

---

## Task 13: Provisioning & wiring (manual — external services)

These steps create the accounts/secrets only the project owner can create. No code; do
them in order. Record each value into Vercel env vars (and a local `.env` for the seed
script + local function testing).

- [ ] **Step 1: Firebase project**
  - Create a Firebase project at console.firebase.google.com.
  - **Authentication** → Sign-in method → enable **Email/Password**.
  - **Firestore Database** → create (production mode).
  - **Project settings → Service accounts → Generate new private key** → take
    `project_id`, `client_email`, `private_key` → set `FIREBASE_PROJECT_ID`,
    `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`.
  - **Project settings → General → Your apps → Web app** → copy the config object →
    paste into `app/firebase-config.js`. Commit that file.
  - Paste `firestore.rules` into **Firestore → Rules → Publish**.

- [ ] **Step 2: Cloudflare R2 bucket**
  - Create an R2 bucket named `babysteps-videos` (keep it **private** — no public access).
  - **R2 → Manage R2 API Tokens → Create API token** (Object Read & Write) → take the
    S3 access key id + secret + your account id → set `R2_ACCOUNT_ID`,
    `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET=babysteps-videos`.
  - Upload your lesson videos using object keys that match `r2Key` in `scripts/seed.js`
    (e.g. `rolling/01.mp4`).

- [ ] **Step 3: Vercel project + env vars**
  - Import this Git repo into Vercel (Framework preset: **Other** / static).
  - In **Settings → Environment Variables**, add (Production + Preview):
    `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`,
    `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`,
    `ENROLL_SECRET` (a long random string), `COURSE_MAP` (JSON mapping your PayPal
    product/button ids to course ids).
  - Deploy.

- [ ] **Step 4: Seed Firestore**
  - Locally, create `.env` from `.env.example` with the real Firebase values.
  - Edit `DATA` in `scripts/seed.js` to your real courses/lessons/r2Keys.
  - Run (loading env): `node --env-file=.env scripts/seed.js`
  - Expected: prints each course/lesson id then `seed complete`.

- [ ] **Step 5: Re-point the Make scenario**
  - In your existing PayPal→Make scenario, replace the systeme.io action with an
    **HTTP → Make a request** module:
    - URL: `https://<your-vercel-domain>/api/enroll`
    - Method: POST, Body type: JSON
    - Header: `x-enroll-secret: <ENROLL_SECRET>`
    - Body: `{ "email": "<buyer email>", "paypalProductId": "<product/button id>", "paymentRef": "<txn id>" }`
  - Add a following email module: if the response `created` is true, email the buyer
    their login (`email` + `password` from the response). If `created` is false, send a
    "you've been enrolled, log in as usual" email (no password).

---

## Task 14: End-to-end verification (manual)

- [ ] **Step 1: Full test suite passes**

Run: `npm test`
Expected: all unit tests pass (course-map, enroll-core, video-core).

- [ ] **Step 2: Enroll endpoint creates an account**

```bash
curl -s -X POST https://<your-vercel-domain>/api/enroll \
  -H "Content-Type: application/json" \
  -H "x-enroll-secret: <ENROLL_SECRET>" \
  -d '{"email":"test+1@example.com","paypalProductId":"ROLLING-2024","paymentRef":"TEST1"}'
```
Expected: `200` JSON with `created:true`, `courseId:"rolling"`, and a `password`. Confirm
the user appears in Firebase Auth and `users/<uid>/enrollments/rolling` exists.

- [ ] **Step 3: Idempotency**

Re-run the same curl.
Expected: `200` with `created:false`, `password:null`; no duplicate user, enrollment still present.

- [ ] **Step 4: Wrong secret is rejected**

Re-run with a bad `x-enroll-secret`.
Expected: `401 unauthorized`.

- [ ] **Step 5: Gated playback works for an enrolled user**
  - Log in at `/app/login` with the test email + the password from Step 2.
  - Open `/app/my-courses` → see the rolling course → open it → open a lesson.
  - Expected: video plays. In DevTools Network, the video request goes to an
    `r2.cloudflarestorage.com` signed URL (with `X-Amz-...` query params), not your domain.

- [ ] **Step 6: Non-enrolled access is blocked**
  - Hit `/api/video-url?lessonId=tummy-01` with the enrolled user's token (enrolled only
    in rolling). Expected: `403 not enrolled`. The `tummy-time` lesson page shows the
    "no access" message.

- [ ] **Step 7: Progress persists**
  - Watch a few seconds of a lesson, reload → playback resumes near where you left off.
  - Let a (short test) lesson end → return to the course page → that lesson shows a ✓.

- [ ] **Step 8: Signed URL expiry**
  - Copy the signed video URL from Network, wait past the 2-hour expiry (or temporarily
    lower `DEFAULT_EXPIRES_SECONDS` in `lib/r2.js` to test faster), and request it again.
  - Expected: R2 returns `AccessDenied` / `Request has expired`.

---

## Notes on scope

This plan delivers the v1 spec scope: gated video player + progress tracking, PayPal→Make
auto-enrollment, signed-URL deterrent. Explicitly **not** included (per spec): PDFs, Q&A,
certificates, refund/un-enroll automation, admin UI, subscriptions.
