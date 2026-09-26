# TODO backlog

Deferred work for this repo. One line per item, IDs never change.

Categories: `G` = go-live · `C` = conversion · `F` = buy and onboarding flow · `L` = learning experience · `T` = trust and legal · `S` = SEO, speed and analytics · `U` = UI/UX · `A` = architecture · `B` = bigger bets · `D` = dev tooling · `H` = housekeeping.
Priority: `P0` data loss or wrong money · `P1` blocks sales or big UX · `P2` polish · `P3` nice to have.

The step-by-step provisioning list lives in `docs/go-live-checklist.md`. This file only tracks
what is still open.

## Go-live

- [ ] **[G2] P1 — Run one real payment end to end.** **Fix:** in PayPal
  (`paypal.com/ncp/links/SDBZ5YS6JNKLQ/edit`) set the price to ₪1, keep Product ID `course_2`, pay
  once, watch the Make run, set a password from the email, log in. Set
  `/challenge/rolling/thank-you` as the payment link's return URL first and check it lands there. Then set the price back to ₪175
  right away (a real buyer in that window would pay ₪1) and delete the test user.
- [ ] **[G3] P3 — Stop fake payments.** The Make PayPal webhook accepts unverified IPNs. The
  code side is done: `/api/enroll` checks the amount (#36). **Fix:** follow the manual steps in
  `docs/go-live-checklist.md` section 5a to add a PayPal `_notify-validate` check in Make. First
  confirm in a Make run that the trigger's `raw` field is the original IPN text; if it is JSON,
  use a custom webhook trigger or move the check into `/api/enroll`.
- [ ] **[G4] P2 — Our own welcome email.** Firebase refuses a custom subject and body, so buyers get
  the stock reset email. The Hebrew `/app/auth-action` page is live (#38) but only takes over once
  the Firebase console action URL is set, and that field may be locked or reject a Vercel domain.
  The welcome link also expires after 1 hour. **Fix:** try the console step from
  `docs/go-live-checklist.md`. If it is refused, follow `docs/research/2026-09-25-transactional-email.md`:
  buy a domain, send our own Hebrew email with Resend and `generatePasswordResetLink`, and add a
  "שלחו לי קישור חדש" button on `/app/auth-action` for expired links.

## Conversion

- [ ] **[C2] P3 — Optional: a real launch price.** Owner decision 2026-09-26: keep the ₪205
  crossed-out price for now (see `docs/decisions/2026-09-26-owner-decisions.md`). **Fix (only if the
  owner asks):** turn it into a real launch price with an end date ("מחיר השקה עד 31.10") and raise
  the price to ₪205 on that date.
- [ ] **[C7] P2 — Testimonials that show results.** The section "מה אמהות כתבו לי" on
  `challenge/rolling/index.html` now shows the three quotes as message bubbles (#73). They still
  praise Yarden in general ("את מדהימה", "חברה"), not the rolling course, and give no baby age or
  outcome. **Fix:** replace them with 3 short quotes from beta buyers (B1) that name the problem and
  the result, with the baby's age and, with consent, a WhatsApp screenshot or photo.
- [ ] **[C10] P2 — Better marketing copy.** The owner asked to improve the marketing texts later.
  The fake numbers were removed on 2026-09-26, and the redesign kept Yarden's sentences as they
  were. **Fix:** rework the copy on the home page and the rolling sales page with Yarden: the hero
  line, the "is this you" list and the offer. Keep every `data-price` tag.

## Buy and onboarding flow

- [ ] **[F2] P3 — Automate receipts once sales grow.** Decision 2026-09-25: Yarden keeps Paperless
  and issues each receipt by hand the same day (PayPal and Bit/Paybox). **Fix:** when sales reach
  about 5 a month, buy Paperless's "אוטומציות וקישוריות" package and add the Make step from
  `docs/research/2026-09-25-receipts-for-osek-patur.md`, keyed by the PayPal `txnId`.
- [ ] **[F3] P2 — Get told when an enrollment fails.** When the welcome email fails,
  `/api/enroll` returns 502 and Make marks the run failed, but nobody is told. **Fix:** turn on
  Make's error email for the scenario (Scenario settings, "Notify on error") to Guy and Yarden.
  The FAQ line about the login email, the manual enroll script and the playbook ("Paid but no access" in `docs/go-live-checklist.md`) are done.
- [ ] **[F4] P2 — Tell existing students about a new course.** The welcome email goes only to users
  who never signed in, so a returning student who buys tummy time gets no email. **Fix:** build it on
  the G4 sender (see the research doc); send once when `ensureEnrollment` creates a new enrollment for
  a user who has signed in before.

## Learning experience

- [ ] **[L4] P2 — Real titles, descriptions and lengths.** `scripts/course-data.js:52-57`. The tips
  are named "טיפ זהב 1" to "טיפ זהב 6", the appendix is just "נספח" (`:68`), every `description` is
  empty and `durationSec` is 0 (`:12` says no page reads it). A parent cannot find a tip again or
  plan a session. **Fix:** get real titles and one-line descriptions from Yarden, fill durations,
  reseed, and show the description and length on `app/lesson.html` and `app/course.html`.

## Trust and legal

- [ ] **[T3] P2 — Accessibility: what the statement lists as not done.** `/accessibility` is live
  and lists the gaps: no captions on the course videos and the teaser (planned), golden tips are
  images with only the title as alt text, no skip link in the app. Fix these, then update the
  statement and its date. The React rebuild on `@babysteps/ui` is the place to meet the standard
  fully. Never add "עוסק פטור" or a business number (owner decision, 2026-09-26).

## SEO, speed and analytics

- [ ] **[S1] P3 — Count clicks, not only visits.** Vercel Web Analytics is live (page views on the
  marketing pages, enabled 2026-09-26). Custom events (PayPal and WhatsApp clicks) need Vercel Pro.
  **Fix:** on Pro, add `va('event', { name: 'paypal_click' })` and `whatsapp_click` in `site.js`;
  until then, compare visits to `/challenge/rolling` with `/challenge/rolling/thank-you` and Make runs.

## UI/UX

- [ ] **[U6] P3 — App look in the React rebuild.** The app now has the brand look: the shared
  header with the logo, tokens, no Tailwind grays, grouped lessons and progress (WP5 to WP7). What is
  left: get Yarden's feedback on the four app screens, then rebuild them in React with
  `@babysteps/ui` (`AppHeader`, `CourseProgressCard`, `LessonListItem`, `TextField`) as part of A10.
- [ ] **[U7] P3 — Re-sync the design system to Claude Design.** `packages/ui/src/tokens.css` now
  matches `assets/css/tokens.css` (Rubik only, brown as the only accent, site radii and shadows).
  Claude Design still has the old look. **Fix:** run the design-sync skill (config in
  `.design-sync/`) and check a few previews against Storybook.

## Architecture

- [ ] **[A4] P2 — Update the Make scenario to send the amount.** The code checks price, currency and
  the exact product (#36). **Fix:** do G2 first (a ₪1 test is rejected once Make sends the amount).
  Then import `docs/make/paypal-enroll.blueprint.json` or edit the scenario as in checklist section
  5a, run one real payment, then set `REQUIRE_AMOUNT=1` in Vercel. `scripts/fake-payment.sh` sends
  ₪1 and will stop working; update it to send the real price or delete it.
- [ ] **[A10] P2 — Start the React rebuild.** The plan is in
  `docs/superpowers/specs/2026-09-25-react-rebuild-build-plan.md` (#44). **Fix:** decide the open
  questions in it (Vite vs Astro, Firebase config, custom domain first), then do step 1: the build
  pipeline with one page, and prove on a preview that `/api` still answers 401.

## Bigger bets

- [ ] **[B1] P2 — Beta launch for real testimonials.** Before the public launch, give 5 to 10
  followers the course free or at half price in exchange for honest feedback within two weeks and a
  short quote with the baby's age. This tests the whole flow on real phones and fills C2 and C7
  with true social proof. **Fix:** Yarden picks the group, Guy enrolls them with `scripts/enroll-manual.js`, and
  a Google Form collects feedback and consent to publish.
- [ ] **[B2] P3 — Email list and a free mini-challenge.** `challenge/tummy-time/index.html:123`. The
  "update me" button opens a WhatsApp chat, so Yarden must answer each one by hand and cannot
  message the list later. The page even has unused email input styles (`:50-80`). There is no free
  entry point, so every visitor must decide on ₪175 at once. **Fix:** add an email form that posts to
  a free list tool (for example MailerLite free tier) or a Make to Google Sheets scenario, with
  consent text. Offer a free "3 ימים, 3 תרגילי התהפכות" email series that ends with the course offer.
- [ ] **[B3] P3 — Bundle, upsell and referral links.** `lib/course-map.js`. PayPal payment links have
  no coupons, and when tummy time ships both courses sell only one by one. **Fix:** extra PayPal
  links with their own product IDs in `COURSE_MAP`: a bundle price that enrolls both courses, and a
  friend price that Yarden sends to buyers who finish. Show the bundle on the finish screen (L7) and
  in "הקורסים שלי".

## Housekeeping

- [ ] **[H1] P3 — Delete `staging/`.** 696 MB of the web-ready videos (the same 18 files as in R2,
  checked 2026-09-25). **Fix:** Guy uploads `staging/` to Google Drive as a backup first, then
  `rm -rf staging/`.
