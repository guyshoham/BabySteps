# Digital Course Platform — Design

**Date:** 2026-06-16
**Project:** מתחילים בקטן (Yarden Shoham — baby development courses)
**Status:** Approved (design phase)

## Goal

Turn the existing static marketing site into a gated, paid course platform hosting
2 courses (each with multiple video lessons). Students pay via the existing PayPal +
Make flow, get an auto-created account, log in, and watch ordered video lessons with
progress tracking.

## Constraints & Priorities

1. **Primary: free / lowest possible monthly cost.** Must stay $0/month at the
   expected scale (hundreds of users, not thousands).
2. **Secondary: deter video theft.** Casual download/sharing should be blocked.
   True DRM (Widevine/FairPlay) is explicitly out of scope — it only comes from paid
   services. The accepted deterrent is gated, short-lived signed URLs.
3. Reuse what already exists: static HTML/Tailwind RTL Hebrew site, and the current
   PayPal → Make automation (today it enrolls into systeme.io; we re-point it).

## Chosen Architecture (Approach A): Vercel + Firebase + Cloudflare R2

```
                ┌─────────────── Vercel (free Hobby) ──────────┐
 Browser ─────▶ │  Static site (existing HTML/Tailwind, RTL)   │
                │  + /api serverless functions:                │
                │      • GET  /api/video-url   (gatekeeper)    │
                │      • POST /api/enroll      (Make webhook)  │
                └───────┬──────────────────┬──────────────────┘
                        │                  │
              verify token + enroll   create user + enrollment
                        │                  │
                ┌───────▼──────┐    ┌───────▼──────────────┐
                │  Firebase    │    │  Cloudflare R2       │
                │  Auth +      │    │  (private bucket,    │
                │  Firestore   │    │   $0 egress)         │
                └──────────────┘    └──────────────────────┘
                        ▲
        PayPal ─▶ Make ─┘  (payment → POST /api/enroll → email login)
```

**Why this stack:** Cloudflare R2 has $0 egress forever (10 GB storage free), which is
the only way to serve video at $0 regardless of view volume. Firebase Auth + Firestore
give easy auth + data on a generous free tier. Vercel Hobby hosts the static site and
two small serverless functions for free. Video bytes stream R2 → student directly
(never through Vercel), so there is no bandwidth bill anywhere.

**Tradeoff accepted:** three free vendors instead of one, in exchange for genuinely $0
video at any realistic volume.

## Components (each has one job)

| Component | Responsibility |
|-----------|----------------|
| Vercel static site | Serve public marketing pages + gated app pages |
| `GET /api/video-url` | Verify auth + enrollment, return short-lived R2 signed URL |
| `POST /api/enroll` | Make webhook: create/get user, write enrollment, return login |
| Firebase Auth | Identity (email + password) |
| Firestore | Courses, lessons, enrollments, progress |
| Cloudflare R2 | Private video file storage |
| Make.com scenario | Bridge PayPal payment → `/api/enroll` → welcome email |

## Data Model (Firestore)

- `courses/{courseId}` → `{ title, slug, description, coverImage, order, published }`
- `courses/{courseId}/lessons/{lessonId}` →
  `{ title, order, r2Key, posterKey, durationSec, description }`
  — stores the **R2 object key only**, never a playable URL.
- `users/{uid}` → `{ email, createdAt }`
- `users/{uid}/enrollments/{courseId}` → `{ grantedAt, source: 'paypal', paymentRef }`
- `users/{uid}/progress/{lessonId}` → `{ completed, lastPositionSec, updatedAt }`

### Firestore security rules

- Course/lesson **metadata**: readable by any authenticated user (so they can browse).
- `enrollments`: readable only by the owner; **never** client-writable (only the
  server `/api/enroll` writes them, via Firebase Admin which bypasses rules).
- `progress`: read/write only by its owner.
- No playable video URL is ever stored in Firestore — video access is gated solely by
  the `/api/video-url` function.

## Video Gating Flow

1. Logged-in student opens a lesson → frontend sends the Firebase ID token to
   `GET /api/video-url?lessonId=…`.
2. Function verifies the token → resolves `uid` → reads the lesson's `courseId` and
   `r2Key` → checks `users/{uid}/enrollments/{courseId}` exists.
3. If enrolled: generate a **short-lived R2 signed (presigned) GET URL**, expiry ~2
   hours (long enough to cover a full lesson with seeking via HTTP range requests).
   If not enrolled: return 403.
4. The `<video>` element plays from that URL.
5. Cosmetic deterrents: `controlsList="nodownload"`, disabled right-click. Combined
   with no-public-link + expiry + login/enrollment gating, this is the agreed
   deterrent level (not DRM).

## Payment → Enrollment Flow

1. PayPal payment completes → Make catches it (as today).
2. Make calls `POST /api/enroll` with a shared-secret header and
   `{ email, paypalProductId, paymentRef }`.
3. Function maps `paypalProductId` → `courseId` (config map), then:
   - Creates the Firebase user if new (generated password); reuses if existing.
   - Writes the enrollment doc.
   - Returns login details to Make.
   - **Idempotent**: duplicate/repeat payments do not reset an existing user's
     password; they just ensure the enrollment exists.
4. Make sends the welcome email (email + generated password). "Forgot password" uses
   Firebase's built-in password-reset email as a safety net.

## Frontend Pages

Vanilla HTML + Tailwind + Firebase JS SDK via CDN — no build step, matches the current
site.

All gated app pages live under an **`/app/` prefix**, cleanly separated from the
public marketing site.

- **Public (unchanged):** home + challenge landing pages.
- `/app/login` — email + password (Firebase Auth client SDK).
- `/app/my-courses` — list of courses the student is enrolled in.
- `/app/course/{slug}` — lesson list with progress checkmarks + "resume."
- `/app/lesson/{id}` — video player; marks complete; saves last position.
  - Guard: not-logged-in → redirect to `/app/login`; logged-in-but-not-enrolled →
    "you don't have access" message.

Progress is written client-side directly to Firestore (rules enforce owner-only), so no
extra serverless function is needed for it.

## Content Management (v1)

Courses + lessons are seeded manually: upload video files to R2, then create the
Firestore docs via the Firebase console or a small one-off seed script. No admin UI in
v1.

## Error Handling & Edge Cases

- Not authenticated → redirect to login.
- Authenticated but not enrolled in the requested course → "no access" message (403
  from the function).
- Signed-URL fetch failure → user-facing error + retry.
- Expired Firebase ID token → refreshed automatically by the Firebase SDK.
- Duplicate / repeat payment → `/api/enroll` is idempotent.
- Lost welcome email / forgotten password → Firebase password-reset email.
- PayPal product → course mapping lives in a single config map in the function.

## Testing

- Manual end-to-end: simulate a payment hitting `/api/enroll`, log in, watch a gated
  video, confirm progress saves, confirm a non-enrolled user is blocked (403), confirm
  a signed URL expires.
- Light automated tests for function logic: enrollment check + product→course mapping +
  idempotency.

## Out of Scope for v1

PDFs / downloadable resources, comments / Q&A, certificates, refund/un-enroll
automation, admin dashboard/UI, subscriptions, multi-language beyond Hebrew. All
cleanly addable later.

## Open Items for Implementation Planning

- Exact Vercel project layout (static files + `/api` functions in one project).
- Firebase project + R2 bucket provisioning and the env vars/secrets each function
  needs (Firebase Admin credentials, R2 keys, the `/api/enroll` shared secret).
