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
- [ ] Upload the rolling-course videos with **`scripts/upload-videos.js`**, which takes the
      keys straight from `scripts/course-data.js` so the bucket can't drift from Firestore:

      node --env-file=.env scripts/upload-videos.js ~/path/to/videos --dry-run
      node --env-file=.env scripts/upload-videos.js ~/path/to/videos
      node --env-file=.env scripts/upload-videos.js --verify   # check anytime

      A local file matches a lesson when its filename equals the last part of the r2Key
      (`lesson-01.mp4` → `rolling/lesson-01.mp4`); subfolders are searched. Expected names:

      lesson-01.mp4 … lesson-10.mp4,  tip-01.mp4 … tip-06.mp4,  bonus-crawling.mp4

      The dry run lists every unmatched lesson and every ignored file, so fix names before
      uploading. Re-runs skip files already present at the same size (`--force` overrides),
      and files over 64 MB upload in parts, so the 300 MB dashboard limit doesn't apply.
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

- [x] `cp .env.example .env` and fill in the real `FIREBASE_*` values. `.env` is
      gitignored — keep it that way.
- [ ] Open `scripts/course-data.js` and replace the placeholder lesson titles (`שיעור 1`,
      `טיפ זהב 1`, …) with the real video titles. This one file feeds both the seeder and the
      uploader.
- [ ] Preview without writing: `node --env-file=.env scripts/seed.js --dry-run`
- [ ] Write it: `node --env-file=.env scripts/seed.js` → prints each id, then
      `seed complete`. Re-running is safe (merge on fixed ids — no duplicates).
- [ ] Check in the Firebase console: `courses/rolling` exists and `lessons` has 17 docs.

## 5. Make: point the PayPal scenario at `/api/enroll`

Make only forwards the payment. Firebase sends the welcome email, so Make has no email step
(no Gmail or SMTP). Blueprint: `docs/make/paypal-enroll.blueprint.json`.

Scenario: **PayPal (new notification) → filter → HTTP**.

- [x] Product field found: the PayPal payload carries `course_2` in its raw data. The HTTP
      module sends `paypalProductId` as the constant `course_2`.
- [x] Set `COURSE_MAP` in Vercel to include `"course_2":"rolling"` (keep the existing keys).
      An unmapped value makes `/api/enroll` return `400 unknown product`. (Done 2026-09-24,
      all three environments.)
- [ ] Filter on the link into HTTP: `paymentStatus` equals `Completed` **AND** `raw`
      contains `course_2`.
- [ ] **HTTP → Make a request**:
      - URL `https://baby-steps-murex.vercel.app/api/enroll`, method **POST**, body raw JSON
      - Header `x-enroll-secret: <ENROLL_SECRET>` (replace `PASTE_ENROLL_SECRET_HERE`)
      - Body: `{"email":"{{1.payer.email}}","paypalProductId":"course_2","paymentRef":"{{1.txnId}}"}`
      - "Follow all redirects" must have a value (set it to **No**). If it is empty, the run
        fails with `Missing value of required parameter 'followAllRedirects'` before any call.
- [ ] Welcome email: `/api/enroll` asks Firebase to send its password reset email (Hebrew,
      `X-Firebase-Locale: he`) to any buyer who has **never signed in**. The link lets her
      choose a password, then goes to `/app/login`. Buyers who already log in get no email.
      No password is ever returned or emailed.
- [ ] If the email fails, `/api/enroll` still saves the enrollment but returns `502`, so Make
      marks the run as failed. Re-run it from Make's history: enroll is idempotent and the
      email is sent again.
- [x] Firebase template (Authentication → Templates → Password reset): default language set
      to Hebrew and sender name to `ירדן - מתחילים בקטן` (2026-09-24). Firebase refuses to
      change the subject and body (`EMAIL_TEMPLATE_UPDATE_NOT_ALLOWED`, an anti-spam rule),
      so the email uses Firebase's built-in Hebrew reset text. `%APP_NAME%` in that text is
      the project's public-facing name (Project settings → General).
- [ ] Note the manual Bit/Paybox path on the sales page. Those buyers never touch PayPal,
      so enroll them by hand with `scripts/enroll-manual.js` (see "Paid but no access"
      below). They get the same Firebase welcome email.

### 5a. Price check and IPN verification (backlog A4, G3)

This replaces the filter and body in the two items above. Two gaps are closed here:

- **A4:** the old filter checked that the raw IPN *contains* `course_2`, so `course_20` also
  matched. Nothing checked the amount, so a ₪1 payment still enrolled.
- **G3:** Make accepts any IPN sent to the hook URL. Anyone who has the URL can fake a payment.

`/api/enroll` now reads `amount` and `currency`. If `amount` is sent, `currency` must be `ILS`
and `amount` must be at least the price in `lib/prices.js` (more is fine). Otherwise it answers
`400 amount below price` (or `currency must be ILS`) and enrolls nobody. If `amount` is not
sent, it enrolls as before and logs a warning. With `REQUIRE_AMOUNT=1` a missing amount is a `400`.

Note: `scripts/fake-payment.sh` sends `mc_gross=1.00`, so after step 3 below its runs end in
`400 amount below price`. That is the check working.

**Update the scenario**

1. In Make, either import `docs/make/paypal-enroll.blueprint.json` as a new scenario, or edit
   the live one by hand. If you import, set the PayPal webhook again and replace
   `PASTE_ENROLL_SECRET_HERE` with the real `ENROLL_SECRET`.
2. Filter on the link into HTTP: `paymentStatus` **equals** `Completed` **AND** `itemNumber`
   **equals** `course_2` (exact match, not "contains").
3. HTTP body:
   `{"email":"{{1.payer.email}}","paypalProductId":"{{1.itemNumber}}","paymentRef":"{{1.txnId}}","amount":"{{1.gross}}","currency":"{{1.currency}}"}`
   (`itemNumber`, `gross` and `currency` are the PayPal module's names for the IPN fields
   `item_number`, `mc_gross` and `mc_currency`.)

**Verify each IPN with PayPal (G3)**

PayPal's rules (source: <https://developer.paypal.com/api/nvp-soap/ipn/IPNImplementation/>):
post the message back over HTTPS to `https://ipnpb.paypal.com/cgi-bin/webscr` (sandbox:
`https://ipnpb.sandbox.paypal.com/cgi-bin/webscr`). Put `cmd=_notify-validate` in front of it,
and do not change the fields, their order or the character encoding. PayPal answers with the
single word `VERIFIED` or `INVALID`. PayPal also wants an empty `200` back at once, or it sends
the IPN again. Make's webhook already answers `Accepted` right away, so that part is covered.

4. Run the scenario once (a real sale or `scripts/fake-payment.sh`). In History, open the
   PayPal module output and look at `raw`. Check that it is the original form text
   (`txn_type=web_accept&payment_status=Completed&...`). If it is JSON instead, stop: the
   postback cannot rebuild the exact original order from JSON. In that case use Make's
   **Webhooks → Custom webhook** as the trigger (it keeps the raw body), or move the check
   into `/api/enroll` later.
5. Add an **HTTP → Make a request** module between the PayPal trigger and the enroll HTTP
   module:
   - URL `https://ipnpb.paypal.com/cgi-bin/webscr`, method **POST**
   - Header `Content-Type: application/x-www-form-urlencoded`
   - Header `User-Agent: BabySteps-IPN-Verify` (PayPal asks for a User-Agent)
   - Body type **Raw**, content: `cmd=_notify-validate&{{1.raw}}` (no spaces, nothing else)
   - Parse response: **No** (the answer is plain text)
   - Follow all redirects: **No**
6. Add a filter on the link from this module to the enroll HTTP module: `data` (the response
   body) **equals** `VERIFIED`. Keep the filter from step 2 as well. Anything else (`INVALID`,
   empty, an error page) stops the run, and nobody is enrolled.
7. Test it: `scripts/fake-payment.sh` must now stop at the new filter, because PayPal answers
   `INVALID` for a message it did not send. Then check that one real sale goes through with
   `VERIFIED` in History.

**Turn on the strict mode**

8. After one good run where History shows `amount` and `currency` in the enroll request and a
   `200` answer, set `REQUIRE_AMOUNT=1` in Vercel (Production and Preview) and redeploy. From
   then on, a call without an amount is rejected.
9. If a real buyer is ever rejected with `amount below price`, check the payment in PayPal
   first. If she did pay in full, enroll her by hand ("Paid but no access", step 4).

## 6. Verify end to end

- [x] `npm test` → all unit tests pass.
- [x] Enrollment creates an account:

      curl -s -X POST https://<domain>/api/enroll \
        -H "Content-Type: application/json" \
        -H "x-enroll-secret: <ENROLL_SECRET>" \
        -d '{"email":"test+1@example.com","paypalProductId":"SDBZ5YS6JNKLQ","paymentRef":"TEST1"}'

      Expect `200` with `created:true`, `courseId:"rolling"`, `welcomeSent:true` (no
      `password` since the Firebase welcome email change). Confirm the user in Firebase Auth
      and `users/<uid>/enrollments/rolling` in Firestore.
- [x] Idempotency: re-run the identical curl → `200`, `created:false`, no second user.
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

### Fake a payment

Tests the whole chain without paying: Make → `/api/enroll` → Firebase user + welcome email.

    scripts/fake-payment.sh guyshoham28+fake1@gmail.com

It posts a fake PayPal IPN (`payment_status=Completed`, `item_number=course_2`) to
`MAKE_HOOK_URL` (from the environment, else from `.env`). Make answers `Accepted` at once; the result is in the scenario History.
Then check Firebase Auth for the email and `users/<uid>/enrollments/rolling`.

**Security:** Make accepts IPNs without checking them with PayPal. Keep `MAKE_HOOK_URL`
private (only in `.env`, never in the repo). If it leaks, regenerate the webhook in Make and
update PayPal's IPN URL.

## Paid but no access

A buyer says she paid but cannot get in. Go down this list in order.

1. **Did the payment reach Make?** Open the scenario's History in Make. Find the run by
   time or by the buyer's email.
   - No run: the IPN never arrived, or the filter dropped it. Check the payment in PayPal,
     then enroll her by hand (step 4).
   - Failed run: open it. A `502` means she is enrolled but the welcome email failed.
     Re-run it from History. Enroll is idempotent, so this is safe.
2. **Is she in Firebase?** Firebase console, Authentication, search her email.
   - Found, never signed in: the email went to spam, or she lost it. Ask her to use
     "שכחתי סיסמה" on `/app/login`. It sends a new link.
   - Not found: the access went to another email. Most often the PayPal account that paid
     is her partner's. Ask which email the PayPal account uses, or enroll her own email
     (step 4).
3. **Wrong email or a typo?** Enroll the right email (step 4). The access on the wrong
   email stays. Delete that user in Firebase Auth if it is clearly a typo.
4. **Enroll by hand** (also for every Bit/Paybox sale). Run from the repo root:

       node --env-file=.env scripts/enroll-manual.js <email> [courseId] --ref <payment note> --dry-run
       node --env-file=.env scripts/enroll-manual.js <email> [courseId] --ref <payment note>

   `courseId` is `rolling` or `tummy-time`. `--ref` is free text, for example
   `bit-2026-09-24`, and is saved on the enrollment. The script sends the "choose a password"
   email only if she never signed in. If she already logs in, it prints that; tell her the
   course is now in her account. `--no-email` skips the email.

Remember the receipt (TODO F2) for every manual sale.

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

## Hebrew password page (TODO G4)

The welcome email and "שכחתי סיסמה" both send Firebase's password reset link. By default that
link opens Firebase's own page, in English. `app/auth-action.html` is our Hebrew page for it.
It reads `mode` and `oobCode` from the link, shows the email, and lets her choose a password
(at least 8 characters). Other modes (`verifyEmail`, `recoverEmail`) show a short note and a
link to `/app/login`.

The page does nothing until Firebase sends links to it:

- [ ] Firebase console, Authentication, Templates, Password reset, the pencil icon, then
      "Customize action URL". Set it to `https://baby-steps-murex.vercel.app/app/auth-action`
      and save. This URL is used for all email templates.
- [ ] Send one reset to the tester email ("שכחתי סיסמה" on `/app/login`). Open the link. Check
      it lands on `/app/auth-action` in Hebrew, shows the tester email, and saves a new
      password. Log in with it. Then reset the tester again with `scripts/create-tester.js`.
- [ ] Open the same link a second time. It should say the link is not valid, in Hebrew.

To undo, clear the custom action URL in the same place. Links go back to Firebase's page.

## Web Analytics (TODO S1)

The four marketing pages (`index.html`, `challenge/rolling/`, `challenge/rolling/thank-you`,
`challenge/tummy-time/`) load `/_vercel/insights/script.js` in the `<head>`. It counts page
views. It uses no cookies, so no cookie banner is needed. The student pages under `/app/` do
not load it on purpose: that area is private.

The funnel to watch: visits to `/challenge/rolling` compared with visits to
`/challenge/rolling/thank-you`. PayPal sends buyers to the thank-you page after payment,
once the payment link's return URL points there. So its visits are close to the number of sales.

Hobby includes 50,000 events a month, with a 1 month reporting window. If the limit is hit,
collection pauses. It never costs money. Custom events (for example a count of PayPal or
WhatsApp clicks) need the Pro plan, so this change does not send any.

- [ ] Vercel dashboard, the project, Analytics, then "Enable".
- [ ] Redeploy (any new deploy works). Until then the script URL returns 404. That is expected.
- [ ] Open the live site in a normal window. In DevTools, Network, check a request to
      `/_vercel/insights/view`. Ad blockers can hide it, so test without one.
- [ ] After a few minutes, check the Analytics page in the dashboard shows the visit.

Later, on Pro: add a click listener in `site.js` for `a[href*="paypal"]` and `a[href*="wa.me"]`
that calls `window.va && window.va('event', { name: 'paypal_click' })` (or `whatsapp_click`).
Add the `window.va` queue snippet from the Vercel docs before the script tag, so clicks made
before the script loads are not lost.

To undo, remove the script line from the four pages, or disable Analytics in the dashboard.
