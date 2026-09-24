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

- [ ] **[C2] P1 — Remove claims and discounts that are not true.** `challenge/rolling/index.html:192`.
  The top bar says "כבר למעלה מ-200 אמהות עזרו לתינוק שלהן להתהפך עם הקורס הזה", and five stars
  with "200+ אמהות מרוצות" repeat at `:240-241`, `index.html:198` and `index.html:229-230`. The
  course has no buyers yet. The ₪205 crossed-out price (`:470`, `:496`) was never a real price.
  Both are misleading under Israeli consumer law and hurt trust if a follower asks. **Fix:** ask
  Yarden what is true and say only that, for example "מעל 200 משפחות כבר ליוויתי בסדנאות ובמפגשים".
  Remove the star ratings until real course reviews exist (B1). Remove the strikethrough, or run a
  real launch price with an end date ("מחיר השקה עד 31.10") and raise the price on that date.
- [ ] **[C3] P2 — Add a FAQ before the price.** `challenge/rolling/index.html:450`. The page has no
  FAQ, so the main doubts stay open: which age, premature babies, how long access lasts, can I watch
  on the phone, what if it does not help, how the WhatsApp feedback works, which email gets the
  login. **Fix:** add 6 to 8 questions right above `#register`, written with Yarden (for example
  "מאיזה גיל מתאים הקורס?", "לכמה זמן יש לי גישה?", "מה אם זה לא עוזר?"). Use a plain `<details>`
  list now and the `Faq` component in the React rebuild.
- [ ] **[C4] P2 — Say who it is for in the hero.** `challenge/rolling/index.html:223-229`. The hero
  talks about calm and confidence but never says the baby's age, the length of the course, or that
  it works on a phone. Mothers from Instagram decide in seconds. **Fix:** add one line under the
  title, for example "לתינוקות בגילאי 3 עד 7 חודשים · 10 סרטונים קצרים · צופים מהנייד" (confirm the
  age range and lengths with Yarden).
- [ ] **[C5] P2 — Put limits on the WhatsApp feedback promise.** `challenge/rolling/index.html:403-406`,
  `:484`. "ליווי אישי בווטסאפ" is sold as the best part, with no time limit, no number of videos
  and no response time. An open promise can bury a solo owner once sales grow, and vague terms cause
  disputes. **Fix:** decide the terms with Yarden and show them on the page, the FAQ and the terms
  page (T1), for example "ליווי בווטסאפ 30 יום מהרכישה, מענה תוך 48 שעות בימי חול".
- [ ] **[C6] P2 — One clear way to pay.** `challenge/rolling/index.html:456-514`. Two equal cards
  ("בחרי את הדרך הנוחה לך") split the choice, and the Bit/Paybox path needs Yarden to enroll the
  buyer by hand (`docs/go-live-checklist.md:160`). Many Israeli mothers do not have PayPal and may
  not know they can pay by card. **Fix:** show one price card with the PayPal button and the line
  "אפשר לשלם בכרטיס אשראי, גם בלי חשבון PayPal" (check that guest checkout is on for the payment
  link). Move Bit/Paybox to a small text link under it. Use one `PriceCard` in the rebuild, and have it read the price from
  `lib/prices.js`.
- [ ] **[C7] P2 — Testimonials that show results.** `challenge/rolling/index.html:427-443`. The three
  quotes praise Yarden in general ("את מדהימה", "חברה"), not the rolling course, and give no baby
  age or outcome. **Fix:** replace them with 3 short quotes from beta buyers (B1) that name the
  problem and the result, with the baby's age and, with consent, a WhatsApp screenshot or photo.
  Use `TestimonialCard` with the `detail` prop in the rebuild. While rebuilding, also move the
  problem block (`:322-361`) above the bio (`:284-320`), so the reader feels understood first.

## Buy and onboarding flow

- [ ] **[F2] P3 — Automate receipts once sales grow.** Decision 2026-09-25: Yarden keeps Paperless
  and issues each receipt by hand the same day (PayPal and Bit/Paybox). **Fix:** when sales reach
  about 5 a month, buy Paperless's "אוטומציות וקישוריות" package and add the Make step from
  `docs/research/2026-09-25-receipts-for-osek-patur.md`, keyed by the PayPal `txnId`.
- [ ] **[F3] P2 — Get told when an enrollment fails.** When the welcome email fails,
  `/api/enroll` returns 502 and Make marks the run failed, but nobody is told. **Fix:** turn on
  Make's error email for the scenario (Scenario settings, "Notify on error") to Guy and Yarden.
  Add the FAQ line "הגישה נשלחת למייל של חשבון ה-PayPal ששילם" when C3 lands. The manual enroll
  script and the playbook ("Paid but no access" in `docs/go-live-checklist.md`) are done.
- [ ] **[F4] P2 — Tell existing students about a new course.** The welcome email goes only to users
  who never signed in, so a returning student who buys tummy time gets no email. **Fix:** build it on
  the G4 sender (see the research doc); send once when `ensureEnrollment` creates a new enrollment for
  a user who has signed in before.

## Learning experience

- [ ] **[L2] P2 — Take the student straight to her next lesson.** `app/course.html:49-64`,
  `app/login.html:33`. Every buyer first lands on "הקורסים שלי" with a single card. The course page
  shows done checks but no current lesson and no overall progress. **Fix:** if the user has exactly
  one enrollment, skip the list and open the course. On the course page add a "המשיכי מאיפה שעצרת"
  button that opens the first lesson not done, a progress line ("6 מתוך 18"), and highlight the
  current lesson. Use `ProgressBar` and `LessonListItem` with `state="current"` in the rebuild.
- [ ] **[L3] P2 — WhatsApp feedback on the course page.** The lesson page has the card (#40).
  **Fix:** add the same card to `app/course.html`, and show the WhatsApp terms once C5 is decided.
- [ ] **[L4] P2 — Real titles, descriptions and lengths.** `scripts/course-data.js:52-57`. The tips
  are named "טיפ זהב 1" to "טיפ זהב 6", the appendix is just "נספח" (`:68`), every `description` is
  empty and `durationSec` is 0 (`:12` says no page reads it). A parent cannot find a tip again or
  plan a session. **Fix:** get real titles and one-line descriptions from Yarden, fill durations,
  reseed, and show the description and length on `app/lesson.html` and `app/course.html`.

## Trust and legal

- [ ] **[T1] P1 — Terms of use, refund policy and health disclaimer.** `/terms` returns 404 and no
  page mentions refunds or says the course is not medical advice. Selling online without terms
  invites disputes and PayPal claims, and Israeli distance-selling rules give buyers cancellation
  rights that may or may not apply to digital content once watched. **Fix:** write a short Hebrew
  `/terms` page: what the buyer gets, personal use only (no sharing the login), how long access
  lasts, the WhatsApp terms (C5), and the refund rule (for example full refund within 14 days if
  fewer than 3 lessons were watched; check it with an accountant or lawyer). Link it in the footer
  and under the PayPal button. Add one line on the sales page and the course page: "התכנים אינם
  תחליף לייעוץ רפואי או לפיזיותרפיה. בכל חשש, התייעצי עם רופא/ת הילדים". For a refund: refund in
  PayPal, delete the enrollment doc in Firestore, issue a credit note (F2).
- [ ] **[T2] P2 — Privacy policy.** `/privacy` returns 404. The site stores buyer emails and
  progress, passes data through PayPal, Make, Firebase, Cloudflare and Vercel, and mothers send
  videos of their babies on WhatsApp. Israeli privacy law (Amendment 13, in force since August
  2025) expects clear notice. **Fix:** a short Hebrew `/privacy` page: what is stored and where, who
  processes it, how long baby videos are kept on WhatsApp, and how to ask for deletion. Link it in
  the footer and on the login page.
- [ ] **[T3] P2 — Accessibility statement and a real footer.** `index.html:320-322`. There is no
  accessibility statement, and the footer text is very low contrast (`opacity:0.4`). The footer has
  no email, no business number, and no legal links. Israeli rules require a statement for many
  sites; check whether the small-business exemption applies. **Fix:** add `/accessibility` with the
  level reached and a contact for problems. On every page, the app included, show a contact email,
  "עוסק פטור" with the number if Yarden agrees, and links to T1, T2 and the statement. Fix the
  contrast. The React rebuild on `@babysteps/ui` is the place to meet the standard fully.

## SEO, speed and analytics

- [ ] **[S1] P2 — Measure the funnel.** No page loads any analytics, so after launch there is no way
  to tell how many people visited, played the teaser or clicked PayPal. **Fix:** add a free
  cookieless tool (Cloudflare Web Analytics, GoatCounter or Vercel Web Analytics) so no cookie
  banner is needed. Count clicks on the PayPal button and the WhatsApp links, and use UTM tags on
  new links you share (the Instagram bio and Linktree links stay as they are, by owner decision). Compare PayPal clicks with Make runs each week.

## UI/UX

- [ ] **[U5] P2 — One name for the course.** `challenge/rolling/index.html:569`. The course is "קורס
  מתהפכים" on the sticky bar, the WhatsApp text (`:509`) and the thank-you page
  (`challenge/rolling/thank-you.html:63`), but "קורס התהפכות" on home (`index.html:223`) and in the
  app (`scripts/course-data.js:19`). **Fix:** pick one name with Yarden and use it everywhere,
  including the PayPal item name.
- [ ] **[U6] P2 — Brand the course app.** `app/course.html:54-58`, `app/my-courses.html:13-16`. The
  app uses default Tailwind grays and a `bg-green-500` done badge, with no logo and no link to the
  site. It feels like a different product from the warm sales page. **Fix:** design the four app
  screens in Claude Design with `@babysteps/ui` (`AppHeader`, `CourseProgressCard`,
  `LessonListItem`, `TextField`), get Yarden's feedback, then rebuild them in React. Fold L1 to L7
  into those designs.
- [ ] **[U7] P2 — Pick one set of colors.** Decision sheet: `docs/design/2026-09-25-color-decision.md`
  and `color-decision.html` (#41). **Fix:** Yarden answers the 5 questions there, then align
  `styles.css` and `tokens.css`. Also fix now: the green "done" badge in `app/course.html` fails
  contrast (2.28:1); use `#2f9e6b`.
- [ ] **[U18] P2 — Contrast failures found by axe.** On the marketing pages: the footer tagline
  (3.7:1) and the `opacity:0.4` copyright line (2.49:1) on every page, `.btn-whatsapp` on the
  thank-you and tummy-time pages (1.98:1), and `.badge-coming-soon` on home (3.54:1). In
  `@babysteps/ui`: `.bs-lesson__state`, the CourseCard "coming soon" badge and title, and the
  TextField error text. **Fix:** darken to at least 4.5:1 (3:1 for large text) and rerun axe.
- [ ] **[U19] P3 — Invalid list and heading order in the design system.** axe flags
  `ol.bs-lesson-list` in the LessonListItem FullList story (children are not list items) and a
  heading-order warning in the AppScreens example. **Fix:** wrap items in `<li>` and fix heading
  levels. Then consider `@storybook/addon-vitest` so a11y violations fail CI.
- [ ] **[U20] P2 — Link the legal pages.** `/terms`, `/privacy` and `/accessibility` exist only as
  drafts (#39, #42, #46). **Fix:** once Yarden approves them, remove `noindex`, add footer links on
  every page (the footer uses `.footer-link` now), and link terms under the PayPal button.

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
- [ ] **[B4] P3 — Hebrew SEO articles.** The problem cards (`challenge/rolling/index.html:336-349`)
  match real searches, but there is no content to rank. **Fix:** 3 to 5 short articles, for
  example "מתי תינוק מתחיל להתהפך?", "תינוק מתהפך רק לצד אחד", "תינוק לא אוהב לשכב על הבטן", each
  with a link to the matching course.

## Housekeeping

- [ ] **[H1] P3 — Delete `staging/`.** 696 MB of the web-ready videos (the same 18 files as in R2,
  checked 2026-09-25). **Fix:** Guy uploads `staging/` to Google Drive as a backup first, then
  `rm -rf staging/`.