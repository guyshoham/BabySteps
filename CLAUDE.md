# Claude Instructions

## Task Execution

For every task, run it using a background agent (`run_in_background: true`) so the user can continue giving instructions in the meantime.

---

# Project: מתחילים בקטן — Baby Development Courses

Hebrew (RTL) site for Yarden Shoham, a developmental coach. Two parts:

1. **Marketing site** (already live): static HTML/Tailwind landing pages — `index.html`,
   `challenge/rolling/`, `challenge/tummy-time/`, shared `styles.css`, assets under `assets/`.
   Hosted historically on GitHub Pages.
2. **Course platform** (built, not yet provisioned): a gated, paid video-course area under
   `/app/*` with auth, enrollment, and progress tracking. Code is complete and unit-tested;
   it needs external accounts wired up before it runs (see "Remaining work" below).

## Design & plan docs (read these first when resuming course-platform work)

- Spec: `docs/superpowers/specs/2026-06-16-digital-course-platform-design.md`
- Implementation plan: `docs/superpowers/plans/2026-06-16-digital-course-platform.md`
  (Tasks 1–12 = code, DONE. Tasks 13–14 = manual provisioning + E2E verification, NOT done.)

## Architecture (Approach A — chosen for $0/month at low scale)

```
Browser ──▶ Vercel (static site + /api serverless functions)
              ├─ GET  /api/video-url  → verify auth+enrollment, return short-lived R2 signed URL
              └─ POST /api/enroll      → Make webhook: create user + enrollment, return login
            Firebase Auth + Firestore  (identity + data)
            Cloudflare R2              (private video bucket, $0 egress)
PayPal ──▶ Make ──▶ POST /api/enroll ──▶ emails student their login
```

- **Why this stack:** R2 has $0 egress (video bandwidth is the only thing that normally
  costs money). Firebase free tier covers auth+data. Vercel Hobby is free. PayPal+Make
  already existed (was enrolling into systeme.io; now re-pointed to our `/api/enroll`).
- **Anti-piracy stance:** no true DRM (that needs paid services). Deterrent = private
  bucket + login/enrollment gate + signed URLs that expire (~2h). Accepted tradeoff.
- **Auth UX:** email + password. Account is auto-created by `/api/enroll` on payment with a
  generated password emailed to the buyer (via Make). "Forgot password" uses Firebase's
  built-in reset email.

## Data model (Firestore)

- `courses/{courseId}` → `{ title, slug, description, coverImage, order, published }`
- `lessons/{lessonId}` → `{ courseId, title, order, r2Key, posterKey, durationSec, description }`
  — **top-level** collection (not a subcollection) so the gatekeeper resolves a lesson in one
  read. `r2Key` is the object key in R2; never store a playable URL.
- `users/{uid}` → `{ email, createdAt }`
- `users/{uid}/enrollments/{courseId}` → `{ grantedAt, source, paymentRef }` (server-written only)
- `users/{uid}/progress/{lessonId}` → `{ completed, lastPositionSec, updatedAt }` (owner read/write)

## Key files

- `lib/course-map.js` — PayPal productId → courseId map (`COURSE_MAP` env)
- `lib/enroll-core.js` — `runEnroll(deps, body)`, pure + idempotent (deps injected for tests)
- `lib/video-core.js` — `runVideoUrl(deps, {idToken, lessonId})`, pure gatekeeper logic
- `lib/firebase-admin.js` — Admin SDK singleton + real deps (`ensureUser`, `ensureEnrollment`,
  `verifyToken`, `getLesson`, `isEnrolled`); lazy init, no env reads at import
- `lib/r2.js` — `signUrl(r2Key)` → presigned R2 GET URL (S3-compatible, 2h default)
- `api/enroll.js` — POST handler, fail-closed `x-enroll-secret` check, wires real deps
- `api/video-url.js` — GET handler, parses `Bearer` token + `lessonId`, wires real deps
- `app/firebase-config.js` — **public** Firebase web config (PLACEHOLDERS — fill from console)
- `app/firebase-client.js` — web SDK init + `requireAuth/signIn/signOut/resetPassword`
- `app/login.html`, `app/my-courses.html`, `app/course.html`, `app/lesson.html` — gated pages
- `firestore.rules` — security rules (publish to Firebase)
- `vercel.json` — `cleanUrls` + rewrites for `/app/course/:slug` and `/app/lesson/:id`
- `scripts/seed.js` — one-off Firestore seeder for the 2 courses + lessons (edit `DATA`)
- `tests/*.test.js` — Vitest unit tests for the three core modules

## Conventions (follow these)

- ESM throughout (`package.json` has `"type": "module"`). Serverless handlers `export default`.
- Core logic is pure with **injected dependencies**; real I/O lives in `lib/firebase-admin.js`
  and `lib/r2.js`. Keep new logic testable the same way.
- All UI is Hebrew + `dir="rtl"`. Brand: brown `#704229`, cream bg `#fdf6f0`, Rubik font.
- **Never** build DOM from Firestore data with `innerHTML` — use `textContent`/`setAttribute`
  (XSS). The student pages already do this; match that pattern.
- Frontend uses the Firebase Web SDK v10 from the gstatic CDN (no bundler/build step).

## Testing

- `npm test` → Vitest (16 tests). Run before committing changes to `lib/` or `api/`.
- Smoke-check handlers/libs import: `node -e "import('./api/enroll.js').then(()=>console.log('ok'))"`

## Running locally

- Real end-to-end requires `vercel dev` (runs the `/api` functions) **plus** the env vars below
  and a filled-in `app/firebase-config.js`. Without provisioning, gated pages redirect to login.
- Static-only visual check: `python3 -m http.server 8000`, open `/app/login.html` (note: clean
  URLs and `/api` won't work under a plain static server).

## Environment variables (set in Vercel; see `.env.example`)

`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`,
`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`,
`ENROLL_SECRET` (Make sends it as `x-enroll-secret`), `COURSE_MAP` (JSON: PayPal product → courseId).

## Remaining work to go live (Plan Tasks 13–14 — all external, owner-only)

1. Create Firebase project: enable Email/Password auth, create Firestore, generate a service
   account key (→ `FIREBASE_*` env), copy the web config into `app/firebase-config.js`, and
   publish `firestore.rules`.
2. Create a **private** Cloudflare R2 bucket + S3 API token (→ `R2_*` env). Upload lesson videos
   with keys matching `r2Key` in `scripts/seed.js`.
3. Import the repo into Vercel, set all env vars, deploy.
4. Seed Firestore: fill real data in `scripts/seed.js`, run `node --env-file=.env scripts/seed.js`.
5. Re-point the existing PayPal→Make scenario to `POST /api/enroll` with the `x-enroll-secret`
   header and `{ email, paypalProductId, paymentRef }`; add the welcome/login email step.
6. Verify end-to-end (Plan Task 14): enroll via curl, log in, watch a gated video, confirm
   progress saves, confirm a non-enrolled user gets 403, confirm signed-URL expiry.

## Out of scope (v1, deferred): PDFs, Q&A/comments, certificates, refund/un-enroll automation,
admin UI, subscriptions.
