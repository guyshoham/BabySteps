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
- [ ] **[C4] P2 — Say who it is for in the hero.** `challenge/rolling/index.html:487`. The hero
  talks about calm and confidence but never says the baby's age, the length of the course, or that
  it works on a phone. Mothers from Instagram decide in seconds. **Fix:** add one line under the
  title, for example "לתינוקות בגילאי 3 עד 7 חודשים · 10 סרטונים קצרים · צופים מהנייד" (confirm the
  age range and lengths with Yarden).
- [ ] **[C6] P2 — One clear way to pay.** `challenge/rolling/index.html:635-668` (`.pay__grid`). Two equal cards
  (PayPal and Bit/Paybox) split the choice, and the Bit/Paybox path needs Yarden to enroll the
  buyer by hand (`docs/go-live-checklist.md:160`). Many Israeli mothers do not have PayPal and may
  not know they can pay by card. **Fix:** show one price card with the PayPal button and the line
  "אפשר לשלם בכרטיס אשראי, גם בלי חשבון PayPal" (check that guest checkout is on for the payment
  link). Move Bit/Paybox to a small text link under it. Use one `PriceCard` in the rebuild, and have it read the price from
  `lib/prices.js`.
- [ ] **[C7] P2 — Testimonials that show results.** The section "מה אמהות כתבו לי" on
  `challenge/rolling/index.html` now shows the three quotes as message bubbles (#73). They still
  praise Yarden in general ("את מדהימה", "חברה"), not the rolling course, and give no baby age or
  outcome. **Fix:** replace them with 3 short quotes from beta buyers (B1) that name the problem and
  the result, with the baby's age and, with consent, a WhatsApp screenshot or photo.
- [ ] **[C9] P3 — Let buyers copy the Bit/Paybox number.** `challenge/rolling/index.html:660`. The
  number is plain text. On a phone the buyer must remember it, switch to Bit, pay, and come back to
  send the WhatsApp. **Fix:** make the number a button that copies it (`navigator.clipboard.writeText`)
  and shows "הועתק ✓" for 2 seconds. Keep this even if C6 moves Bit/Paybox to a small link.
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

- [ ] **[T1] P1 — Health line on the sales and course pages.** `/terms` is live (refund rule,
  health disclaimer, personal use). What is left: add one line on the sales page and on the course
  page: "התכנים אינם תחליף לייעוץ רפואי או לפיזיותרפיה. בכל חשש, התייעצי עם רופא/ת הילדים". A lawyer
  may review the terms later. For a refund: refund in PayPal, delete the enrollment doc in
  Firestore, issue a credit note (F2).
- [ ] **[T3] P2 — Accessibility: what the statement lists as not done.** `/accessibility` is live
  and lists the gaps: no captions on the course videos and the teaser (planned), golden tips are
  images with only the title as alt text, no skip link in the app. Fix these, then update the
  statement and its date. The React rebuild on `@babysteps/ui` is the place to meet the standard
  fully. Never add "עוסק פטור" or a business number (owner decision, 2026-09-26).

## SEO, speed and analytics

- [ ] **[S1] P2 — Measure the funnel.** No page loads any analytics, so after launch there is no way
  to tell how many people visited, played the teaser or clicked PayPal. **Fix:** add a free
  cookieless tool (Cloudflare Web Analytics, GoatCounter or Vercel Web Analytics) so no cookie
  banner is needed. Count clicks on the PayPal button and the WhatsApp links, and use UTM tags on
  new links you share (the Instagram bio and Linktree links stay as they are, by owner decision). Compare PayPal clicks with Make runs each week.

## UI/UX

- [ ] **[U6] P3 — App look in the React rebuild.** The app now has the brand look: the shared
  header with the logo, tokens, no Tailwind grays, grouped lessons and progress (WP5 to WP7). What is
  left: get Yarden's feedback on the four app screens, then rebuild them in React with
  `@babysteps/ui` (`AppHeader`, `CourseProgressCard`, `LessonListItem`, `TextField`) as part of A10.
- [ ] **[U7] P2 — Pick one set of colors.** Decision sheet: `docs/design/2026-09-25-color-decision.md`
  and `color-decision.html` (#41). **Fix:** Yarden answers the 5 questions there, then align
  `styles.css` and `tokens.css`. The done color is already `#2f9e6b` (`--c-done`).
- [ ] **[U18] P2 — Contrast failures in the design system.** The site and app pages pass axe
  color-contrast (checked 2026-09-26, WP8). Left in `@babysteps/ui`: `.bs-lesson__state`, the
  CourseCard "coming soon" badge and title, and the TextField error text. **Fix:** darken to at
  least 4.5:1 (3:1 for large text) and rerun axe in Storybook.
- [ ] **[U19] P3 — Invalid list and heading order in the design system.** axe flags
  `ol.bs-lesson-list` in the LessonListItem FullList story (children are not list items) and a
  heading-order warning in the AppScreens example. **Fix:** wrap items in `<li>` and fix heading
  levels. Then consider `@storybook/addon-vitest` so a11y violations fail CI.

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
