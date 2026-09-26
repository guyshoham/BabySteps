# Claude Instructions

## Task Execution

For every task, run it using a background agent (`run_in_background: true`) so the user can continue giving instructions in the meantime.

---

# Project: מתחילים בקטן — Baby Development Courses

Hebrew (RTL) site for Yarden Shoham, a developmental coach. Two parts:

1. **Marketing site** (live): static HTML landing pages — `index.html`,
   `challenge/rolling/`, `challenge/tummy-time/`, shared `styles.css`, assets under `assets/`.
   These pages load only `styles.css`, not Tailwind. It moved from GitHub Pages to Vercel on
   2026-08-13.
2. **Course platform** (live): a gated, paid video-course area under `/app/*` with auth,
   enrollment, and progress tracking. It runs on Vercel at https://baby-steps-murex.vercel.app,
   with Firebase, R2 and Make wired up. The `app/` pages load `app/app.css` plus page CSS files (no Tailwind).

## Design & plan docs (read these first when resuming course-platform work)

- Spec: `docs/superpowers/specs/2026-06-16-digital-course-platform-design.md`
- Implementation plan: `docs/superpowers/plans/2026-06-16-digital-course-platform.md`
  (Tasks 1–12 = code. Tasks 13–14 = provisioning and E2E checks; see `docs/go-live-checklist.md`
  for what is checked.)

## Architecture (Approach A — chosen for $0/month at low scale)

```
Browser ──▶ Vercel (static site + /api serverless functions)
              ├─ GET  /api/video-url  → verify auth+enrollment, return short-lived R2 signed URL
              └─ POST /api/enroll      → Make webhook: create user + enrollment, send welcome email
            Firebase Auth + Firestore  (identity + data)
            Cloudflare R2              (private video bucket, $0 egress)
PayPal ──▶ Make ──▶ POST /api/enroll ──▶ Firebase emails the student a "set your password" link
```

- **Why this stack:** R2 has $0 egress (video bandwidth is the only thing that normally
  costs money). Firebase free tier covers auth+data. Vercel Hobby is free. PayPal+Make
  already existed (was enrolling into systeme.io; now re-pointed to our `/api/enroll`).
- **Anti-piracy stance:** no true DRM (that needs paid services). Deterrent = private
  bucket + login/enrollment gate + signed URLs that expire (~2h). Accepted tradeoff.
- **Auth UX:** email + password. `/api/enroll` creates the account on payment with a random
  password that nobody sees. Then it asks Firebase to send its Hebrew password reset email as
  the welcome email, so the buyer picks her own password. It sends this only while the user has
  never signed in. Make sends no email. "Forgot password" uses the same Firebase reset email.

## Data model (Firestore)

- `courses/{courseId}` → `{ title, slug, description, coverImage, order, published }`
- `lessons/{lessonId}` → `{ courseId, title, order, kind, r2Key, durationSec, description }`
  — **top-level** collection (not a subcollection) so the gatekeeper resolves a lesson in one
  read. `r2Key` is the object key in R2; never store a playable URL. `kind` is `"video"` or
  `"image"` (the golden tips are images). `durationSec` is set on videos only, and no page reads it.
- `users/{uid}` → `{ email, createdAt }`
- `users/{uid}/enrollments/{courseId}` → `{ grantedAt, source, paymentRef }` (server-written only)
- `users/{uid}/progress/{lessonId}` → `{ completed, lastPositionSec, updatedAt }` (owner read/write)

## Key files

- `lib/course-map.js` — PayPal productId → courseId map (`COURSE_MAP` env)
- `lib/prices.js` — course prices in ₪, the one source for every price on the site. HTML
  shows them as `<span data-price="rolling">₪175</span>`; change the number, run
  `npm run sync-prices`, then `npm test` (fails on a mismatch or an untagged `₪` amount).
  The PayPal link's amount is set in PayPal separately.
- `lib/enroll-core.js` — `runEnroll(deps, body)`, pure + idempotent (deps injected for tests)
- `lib/video-core.js` — `runVideoUrl(deps, {idToken, lessonId})`, pure gatekeeper logic
- `lib/manual-enroll-core.js` + `scripts/enroll-manual.js` — enroll a buyer by hand (Bit/Paybox,
  wrong email). Playbook: "Paid but no access" in `docs/go-live-checklist.md`
- `lib/firebase-admin.js` — Admin SDK singleton + real deps (`ensureUser`, `ensureEnrollment`,
  `verifyToken`, `getLesson`, `isEnrolled`); lazy init, no env reads at import
- `lib/r2.js` — `signUrl(r2Key)` → presigned R2 GET URL (S3-compatible, 2h default)
- `api/enroll.js` — POST handler, fail-closed `x-enroll-secret` check, wires real deps
- `api/video-url.js` — GET handler, parses `Bearer` token + `lessonId`, wires real deps
- `api/admin-progress.js` + `lib/admin-progress-core.js` — GET, every student's progress for
  admins only (401 no/bad token, 403 without the `admin: true` custom claim). `no-store`.
- `lib/set-admin-core.js` + `scripts/set-admin.js` — give or take the admin claim
  (`--email <email> [--remove] [--dry-run]`). Playbook: "Admin page" in `docs/go-live-checklist.md`
- `app/admin.html` + `app/admin.js` + `app/admin-view.js` (pure filter/sort/summary helpers) +
  `app/admin.css` — the admin page at `/app/admin`. `my-courses` shows a "ניהול" link to admins.
- `app/firebase-config.js` — the real Firebase web config. It is public by design (the API key
  is not a secret; `firestore.rules` protect the data).
- `app/firebase-client.js` — web SDK init + `requireAuth/signIn/signOut/resetPassword`
- `app/login.html`, `app/my-courses.html`, `app/course.html`, `app/lesson.html`, `app/admin.html` — gated pages
- `app/lesson-switch.js` — pure helpers for the lesson page's in-place switch. A click on
  another lesson of the course swaps it without a page load (`showLesson` in `lesson.html`,
  `history.pushState`, one `AbortController` per lesson for the video listeners). Links keep
  their real `href`; any failure falls back to `location.assign`.
- `firestore.rules` — security rules (publish to Firebase)
- `vercel.json` — `cleanUrls` + rewrites for `/app/course/:slug` and `/app/lesson/:id`
- `scripts/course-data.js` — the one source for courses and lessons (`DATA` + `validate`). Read
  by `seed.js`, `prepare-videos.js` and `upload-videos.js`. Edit the data here.
- `scripts/seed.js` — Firestore seeder for the 2 courses + lessons, safe to re-run (`--dry-run`)
- `tests/*.test.js` — Vitest unit tests for `course-map`, `enroll-core`, `manual-enroll-core`,
  `video-core`, `tester-core`, `set-admin-core`, `admin-progress-core`, `app/admin-view.js`, `prices` (also checks the site pages' price tags), and the app
  helpers `app/lesson-nav.js` and `app/safe-next.js`

## Design system (`packages/ui/`, `@babysteps/ui`)

- npm workspace package with the "Warm Nest" React components (30), tokens and fonts.
  Spec: `docs/superpowers/specs/2026-09-24-ui-design-system-design.md`.
- TypeScript + plain `bs-` prefixed CSS that reads only `src/tokens.css` variables.
  Logical CSS properties only (RTL). No Tailwind.
- Token values come from the site file `assets/css/tokens.css` (the source of truth). Change
  it first, then copy the values into `packages/ui/src/tokens.css`.
- `npm run ui:storybook` for the style guide, `npm run ui:build` for `dist/`.
- The live site does not use it yet. A later phase rebuilds the site in React on top of it.
- Synced to Claude Design with the design-sync skill (config in `.design-sync/`).

## Conventions (follow these)

- ESM throughout (`package.json` has `"type": "module"`). Serverless handlers `export default`.
- Core logic is pure with **injected dependencies**; real I/O lives in `lib/firebase-admin.js`
  and `lib/r2.js`. Keep new logic testable the same way.
- All UI is Hebrew + `dir="rtl"`. Brand: brown `#704229`, cream bg `#fdf6f0`, Rubik font.
- **Never** build DOM from Firestore data with `innerHTML` — use `textContent`/`setAttribute`
  (XSS). The student pages already do this; match that pattern.
- Frontend uses the Firebase Web SDK v10 from the gstatic CDN (no bundler/build step).

## Testing

- `npm test` → root Vitest tests (`tests/`), then the `@babysteps/ui` tests. Run before
  committing changes to `lib/`, `api/` or `packages/ui/`.
- Smoke-check handlers/libs import: `node -e "import('./api/enroll.js').then(()=>console.log('ok'))"`

## Running locally

- Real end-to-end requires `vercel dev` (runs the `/api` functions) **plus** the env vars
  below. Without them, `/api` calls fail.
- Static-only visual check: `python3 -m http.server 8000`, open `/app/login.html` (note: clean
  URLs and `/api` won't work under a plain static server).
- Tester login: `node --env-file=.env scripts/create-tester.js` creates `TESTER_EMAIL` (default
  `tester@babysteps.test`) enrolled in all courses. The tester is also an admin (custom claim
  `admin: true`, kept on every run), so it can open `/app/admin`. Re-run to reset its password to `TESTER_PASSWORD`
  in `.env` (generated and appended there if missing). `--dry-run` shows what it would do.

## Environment variables (set in Vercel; see `.env.example`)

`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`,
`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`,
`ENROLL_SECRET` (Make sends it as `x-enroll-secret`), `COURSE_MAP` (JSON: PayPal product → courseId).

## Open work

Open work lives in `docs/TODO.md`. Provisioning steps, and what is already checked, live in
`docs/go-live-checklist.md`.

## Out of scope (v1, deferred): PDFs, Q&A/comments, certificates, refund/un-enroll automation,
subscriptions.
