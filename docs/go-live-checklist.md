# Go-live checklist — course platform

Everything in `lib/`, `api/`, and `app/` is written and unit-tested. What's left is
provisioning the external accounts and wiring them together. This is the operator's
version of Tasks 13–14 in `docs/superpowers/plans/2026-06-16-digital-course-platform.md`,
with the exact values for this repo and the gotchas that plan doesn't mention.

Work top to bottom — each section depends on the one above it.

## Values you'll collect along the way

Keep these in a password manager as you go. Every one of them goes into Vercel
(Production + Preview), and the `FIREBASE_*` ones also go into a local `.env`.

| Env var | Where it comes from |
| --- | --- |
| `FIREBASE_PROJECT_ID` | Firebase service-account JSON → `project_id` |
| `FIREBASE_CLIENT_EMAIL` | same JSON → `client_email` |
| `FIREBASE_PRIVATE_KEY` | same JSON → `private_key` (starts `-----BEGIN PRIVATE KEY-----`) |
| `R2_ACCOUNT_ID` | Cloudflare dashboard → R2 → account id in the URL / right sidebar |
| `R2_ACCESS_KEY_ID` | R2 API token (S3-compatible credentials) |
| `R2_SECRET_ACCESS_KEY` | same token — **shown once**, copy it immediately |
| `R2_BUCKET` | `babysteps-videos` |
| `ENROLL_SECRET` | you invent it: `openssl rand -base64 32` |
| `COURSE_MAP` | JSON, see step 5 — the key must match what Make actually sends |

---

## 1. Firebase

- [x] Create a project at [console.firebase.google.com](https://console.firebase.google.com)
      (a name like `babysteps-courses`; Google Analytics not needed).
- [x] **Authentication → Sign-in method → Email/Password → Enable.** Leave "Email link"
      off.
- [x] **Firestore Database → Create database → Production mode.** Pick a region close to
      Israel (`eur3` / `europe-west`). The region is permanent.
- [x] **Firestore → Rules** → paste the contents of `firestore.rules` → **Publish**.
- [x] **Firestore → Indexes → Manual → Create index** (the console renamed "Composite" to
      **Manual** and "Single field" to "Automatic"). This one is easy to miss and the
      course page is broken without it:

      Index type: Create structured index
      Collection ID: lessons
      Fields:  courseId  (Ascending),  order  (Ascending)   ← equality field first
      Query scope: Collection

      (`app/course.html` runs `where("courseId","==",…) + orderBy("order")`. Without the
      index that query throws and the lesson list renders empty. If you skip this, the
      browser console will show a `FAILED_PRECONDITION` error containing a one-click
      "create index" link — that works too.)
- [x] **Project settings → Service accounts → Generate new private key.** Download the
      JSON → take `project_id`, `client_email`, `private_key` into the table above.
- [x] **Project settings → General → Your apps → Web app (`</>`)** → register an app →
      copy the config object into `app/firebase-config.js`, replacing the `PASTE_*`
      placeholders. This config is public by design — commit it.
- [x] **Authentication → Settings → Authorized domains** — done 2026-08-13 (Vercel domain
      added). *Not strictly required today:* This list
      gates OAuth popup/redirect sign-in and password-reset continue URLs. `firebase-client.js`
      uses plain email/password sign-in and a `sendPasswordResetEmail` with no continue URL, so
      neither applies. Add the production domain here only if you later add Google/Facebook
      sign-in or a custom redirect after reset.

> Note: anyone holding the public web API key can self-register an account, which lets them
> read the `courses` and `lessons` documents (titles and `r2Key` strings). That's harmless —
> `r2Key` is not playable, and `/api/video-url` checks enrollment before signing anything.

## 2. Cloudflare R2

- [x] Create bucket **`babysteps-videos`**. Do **not** enable public access or a public
      `r2.dev` domain — the whole gating model assumes the bucket is private.
- [x] **R2 → Manage API tokens → Create API token**, permission **Object Read & Write**,
      scoped to that bucket. Save the access key id + secret.
- [ ] Upload the rolling-course videos with keys matching `scripts/seed.js`:

      rolling/lesson-01.mp4 … rolling/lesson-10.mp4
      rolling/tip-01.mp4 … rolling/tip-06.mp4
      rolling/bonus-crawling.mp4

      Keys are case-sensitive and include the `rolling/` prefix. If you'd rather keep the
      filenames you already have, change `r2Key` in the seed script instead of renaming —
      just make the two sides identical.
- [ ] Encode for web before uploading if the source files are large: H.264 + AAC in `.mp4`,
      and `-movflags +faststart` so playback can start before the file is fully downloaded.

## 3. Vercel

- [x] Log into Vercel with the GitHub account **`guyshoham`** — this repo lives on the
      personal account (`git@github-personal:guyshoham/BabySteps.git`). If Vercel is signed
      in as the work account it won't see the repo.
- [x] **Add New → Project → Import `guyshoham/BabySteps`.** Framework preset: **Other**.
      Leave build/output settings empty — it's a static site plus `/api` functions.
- [x] **Settings → Environment Variables** → add all nine vars from the table
      (Production **and** Preview).
      - `FIREBASE_PRIVATE_KEY`: paste the key with its real line breaks. The code also
        accepts the `\n`-escaped single-line form (`lib/firebase-admin.js` un-escapes it),
        but don't mix the two — no surrounding quotes either way.
- [x] Deploy, then open `https://<project>.vercel.app/app/login` — the login form should
      render (you can't log in yet; no accounts exist).
- [x] Go back and add that domain to Firebase **Authorized domains** (step 1).
- [x] Cutover **done 2026-08-13**: everything runs on `https://baby-steps-murex.vercel.app`
      and GitHub Pages was disabled (`guyshoham.github.io/BabySteps` now 404s). Old
      `/challenge/rolling/` links 308-redirect to the clean URL and still work; links pointing
      at the **github.io host** are dead and need updating (Instagram bio, Linktree).
      Attach a custom domain before updating those links, to avoid doing it twice.
      *(original note: the marketing site was live at `guyshoham.github.io/BabySteps`.)* Simplest path is to leave Pages alone for now, run
      the course area on the Vercel domain, and move the whole site (plus a custom domain)
      once enrollment is proven. Whatever you choose, the PayPal buy link on
      `challenge/rolling/index.html` must lead buyers to whichever host is authoritative.

## 4. Seed Firestore

- [ ] `cp .env.example .env` and fill in the real `FIREBASE_*` values. `.env` is
      gitignored — keep it that way.
- [ ] Open `scripts/seed.js` and replace the placeholder lesson titles (`שיעור 1`,
      `טיפ זהב 1`, …) with the real video titles. Confirm each `r2Key` matches what you
      uploaded.
- [ ] Preview without writing: `node --env-file=.env scripts/seed.js --dry-run`
- [ ] Write it: `node --env-file=.env scripts/seed.js` → prints each id, then
      `seed complete`. Re-running is safe (merge on fixed ids — no duplicates).
- [ ] Check in the Firebase console: `courses/rolling` exists and `lessons` has 17 docs.

## 5. Make: point the PayPal scenario at `/api/enroll`

The existing scenario runs PayPal → systeme.io. Replace the systeme.io module.

- [ ] Run one real (or sandbox) payment through the existing scenario first and **look at
      the PayPal bundle in Make's execution history**. Find a field that identifies *which
      course was bought* and is stable across payments — the item name, the button/link id,
      or the item number. The current buy link is a PayPal no-code checkout,
      `paypal.com/ncp/payment/SDBZ5YS6JNKLQ`, so `SDBZ5YS6JNKLQ` is the likely candidate,
      but confirm it actually appears in the payload rather than assuming.
- [ ] Set `COURSE_MAP` in Vercel to map that exact string to the course id, e.g.
      `{"SDBZ5YS6JNKLQ":"rolling"}`. An unmapped value makes `/api/enroll` return
      `400 unknown product`, so this must match character for character.
- [ ] Add **HTTP → Make a request**:
      - URL `https://<your-vercel-domain>/api/enroll`, method **POST**, body type **JSON**
      - Header `x-enroll-secret: <ENROLL_SECRET>`
      - Body: `{ "email": "<buyer email>", "paypalProductId": "<that field>", "paymentRef": "<txn id>" }`
      - Turn on "Parse response" so the next module can branch on the result.
- [ ] Add the welcome email after it, branching on the response:
      - `created: true` → email the buyer their login: the `email` they paid with and the
        `password` from the response, plus the link to `/app/login`. **This is the only
        time that password is ever shown** — if the email fails, they have to use "forgot
        password".
      - `created: false` → they already had an account: email "you now have access, log in
        as usual" with no password.
- [ ] Note the manual Bit/Paybox path on the sales page — those buyers never touch PayPal,
      so enroll them by hand with the curl in step 6 (same command, real email).

## 6. Verify end to end

- [x] `npm test` → all unit tests pass.
- [x] Enrollment creates an account:

      curl -s -X POST https://<domain>/api/enroll \
        -H "Content-Type: application/json" \
        -H "x-enroll-secret: <ENROLL_SECRET>" \
        -d '{"email":"test+1@example.com","paypalProductId":"SDBZ5YS6JNKLQ","paymentRef":"TEST1"}'

      Expect `200` with `created:true`, `courseId:"rolling"`, and a `password`. Confirm the
      user in Firebase Auth and `users/<uid>/enrollments/rolling` in Firestore.
- [x] Idempotency: re-run the identical curl → `200`, `created:false`, `password:null`,
      no second user.
- [x] Wrong secret → `401`. Missing header → `401`.
- [ ] Log in at `/app/login` with that email + password → `/app/my-courses` shows the
      rolling course → open it → all 17 lessons listed in order (if the list is empty,
      it's the missing composite index from step 1).
- [ ] Open a lesson → video plays. In DevTools → Network, the video request goes to
      `*.r2.cloudflarestorage.com` with `X-Amz-…` query params — not to your domain.
- [ ] Not-enrolled path: `GET /api/video-url?lessonId=<a tummy-time lesson>` with that
      user's token → `403`. (Only testable once tummy-time has a lesson.)
- [ ] Progress: watch ~30s, reload → resumes where you left off. Let a lesson finish →
      the course page shows a ✓ on it.
- [ ] Expiry: signed URLs last 2h (`DEFAULT_EXPIRES_SECONDS` in `lib/r2.js`). To test
      quickly, lower it, redeploy, and re-request an old URL → R2 returns
      `Request has expired`. Put it back afterwards.
- [x] Delete the test user from Firebase Auth and its `users/<uid>` document.

## After go-live

- [ ] Send one real customer through the full PayPal flow and watch the Make execution.
- [ ] Update `CLAUDE.md` — move the course platform from "built, not yet provisioned" to
      live, and record the production domain.

**Verified 2026-08-13** against `https://baby-steps-murex.vercel.app`: bad/missing secret →
401, GET → 405, missing fields → 400, unknown product → 400, real enroll → 200 `created:true`
with a generated password, repeat call → `created:false` (idempotent), Auth user + `users/{uid}`
+ `enrollments/rolling` all written, a real web ID token reached `/api/video-url` and returned
`404 lesson not found` (correct — Firestore isn't seeded yet). Test user and docs deleted;
Auth and Firestore are empty again. Remaining boxes need seeded data and uploaded videos.
