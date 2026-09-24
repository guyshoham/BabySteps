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
- [ ] **[G3] P3 — Stop fake payments.** Low priority until sales grow. The Make PayPal webhook accepts unverified IPNs, so
  anyone with the hook URL gets free access. **Fix:** verify each IPN with PayPal
  (`cmd=_notify-validate`) before enrolling, in Make or in `/api/enroll`.
- [ ] **[G4] P2 — Better welcome email.** Firebase refuses custom subject/body
  (`EMAIL_TEMPLATE_UPDATE_NOT_ALLOWED`), so buyers get the stock Hebrew "reset password" email,
  and the link opens an English Firebase page. The console is locked too ("Email template updates
  are currently unavailable"; only Firebase Support can lift it). Project name must be English, so
  `%APP_NAME%` stays `babysteps-courses` for now. **Fix:** send our own email and host a Hebrew
  `/app/set-password` page.

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

- [ ] **[F2] P1 — A receipt for every sale.** Yarden is עוסק פטור and must issue a receipt (קבלה)
  for each payment. Nothing in the flow creates one. **Fix:** pick an Israeli invoicing service
  that Make can call (for example Morning/Green Invoice, iCount or EZcount; compare the cheapest
  plan against issuing by hand) and add a Make step after the HTTP call that issues and emails the
  receipt with the buyer email and PayPal `txnId`. Until then, issue each receipt by hand the same
  day. Bit/Paybox sales always need a manual receipt.
- [ ] **[F3] P2 — Get told when an enrollment fails.** When the welcome email fails,
  `/api/enroll` returns 502 and Make marks the run failed, but nobody is told. **Fix:** turn on
  Make's error email for the scenario (Scenario settings, "Notify on error") to Guy and Yarden.
  Add the FAQ line "הגישה נשלחת למייל של חשבון ה-PayPal ששילם" when C3 lands. The manual enroll
  script and the playbook ("Paid but no access" in `docs/go-live-checklist.md`) are done.
- [ ] **[F4] P2 — Tell existing students about a new course.** `lib/enroll-core.js:31`. The welcome
  email goes only to users who never signed in. When tummy time launches, a returning student who
  pays gets no email at all and may think the payment failed. **Fix:** when the enrollment is new
  and the user has signed in before, send a short "הקורס נוסף לחשבון שלך" email with a login link.
  Build it on the same sender as G4.

## Learning experience

- [ ] **[L2] P2 — Take the student straight to her next lesson.** `app/course.html:49-64`,
  `app/login.html:33`. Every buyer first lands on "הקורסים שלי" with a single card. The course page
  shows done checks but no current lesson and no overall progress. **Fix:** if the user has exactly
  one enrollment, skip the list and open the course. On the course page add a "המשיכי מאיפה שעצרת"
  button that opens the first lesson not done, a progress line ("6 מתוך 18"), and highlight the
  current lesson. Use `ProgressBar` and `LessonListItem` with `state="current"` in the rebuild.
- [ ] **[L3] P2 — Bring the WhatsApp feedback into the app.** `app/lesson.html:17-22`. The sales page
  sells personal feedback (`challenge/rolling/index.html:404`), but the app never mentions it, so
  buyers forget to use the best part. **Fix:** on the course page and under each video, add a card
  "צלמי את התרגול ושלחי לי לפידבק אישי" with a `wa.me` link prefilled with the lesson title. Show the
  terms from C5.
- [ ] **[L4] P2 — Real titles, descriptions and lengths.** `scripts/course-data.js:52-57`. The tips
  are named "טיפ זהב 1" to "טיפ זהב 6", the appendix is just "נספח" (`:68`), every `description` is
  empty and `durationSec` is 0 (`:12` says no page reads it). A parent cannot find a tip again or
  plan a session. **Fix:** get real titles and one-line descriptions from Yarden, fill durations,
  reseed, and show the description and length on `app/lesson.html` and `app/course.html`.
- [ ] **[L5] P2 — Portrait video fit and fair completion.** `app/lesson.html:18`, `:77`. The videos
  are portrait (the teaser is 1080x1920), and `w-full` makes them taller than a phone screen, so the
  controls fall below the fold. A lesson counts as done only on `ended`, so skipping the last
  seconds never marks it. **Fix:** cap the player at about 80vh with `object-fit: contain`, set a
  poster, mark done at 90% watched, and add a "סמני כבוצע" toggle.
- [ ] **[L6] P2 — Loading, error and help states.** `app/my-courses.html:17`, `app/course.html:31`,
  `app/login.html:46-48`. Pages stay blank until Firestore answers, and a wrong course slug shows
  "אין לך גישה". The login page has no hint for first-time buyers and no support link, and every
  error says "אימייל או סיסמה שגויים", even a network error. The empty state
  (`app/my-courses.html:18`) offers no help. **Fix:** a spinner while loading, friendly errors with
  a WhatsApp link, the hint "פעם ראשונה? בחרי סיסמה דרך הקישור שקיבלת במייל", and clear Hebrew
  messages per Firebase error code. Use `Spinner`, `Alert` and `TextField` in the rebuild.
- [ ] **[L7] P3 — A finish line.** `app/lesson.html:77`. After the last lesson nothing happens. This
  is the best moment to ask for a review and to offer the next step. **Fix:** when all lessons are
  done, show "סיימת את הקורס!" with a request for a short testimonial (B1), a reminder about the
  WhatsApp feedback, and a link to the tummy time list (B2) or bundle (B3).

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
- [ ] **[S3] P2 — Shrink the teaser video.** `challenge/rolling/index.html:272`. `rolling-teaser.mp4`
  is 13.9 MB at 1080x1920, and its `moov` box sits at the end of the file (no faststart), so some
  phones must fetch almost the whole file before playing. The poster is a 195 KB JPEG. **Fix:**
  re-encode at 720x1280 with `-movflags +faststart` (aim for 3 to 5 MB), and save the poster as a
  WebP around 60 KB.

## UI/UX

- [ ] **[U3] P2 — Real photos instead of the logo and emoji.** `index.html:181`. The home "profile
  photo" is the logo with `alt="ירדן שוהם"`, and the course cards show big emoji (🔄, 🤱) on flat
  color (`:219`, `:243`). It looks unfinished next to a paid offer. **Fix:** use a crop of
  `assets/about.jpg` in the hero and `assets/videos/rolling-teaser-poster.jpg` on the rolling card.
  Use `CourseCard` in the rebuild.
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
- [ ] **[U7] P2 — Two color systems that already disagree.** `styles.css:5-16`. The live site uses
  `--text-dark #2d1a0e`, `--brand-peach #FCE7D6` and 6px buttons. `packages/ui/src/tokens.css:4-25`
  uses `--color-ink #3b2213`, `--surface-peach #fce1cc`, 8 to 32px radii and a Varela Round heading
  font the site never loads. The app pages hardcode `bg-[#fdf6f0]` and `text-[#704229]`
  (`app/login.html:12`, `:20`). The rebuild will look like a redesign, not a port. **Fix:** decide
  the final values with Yarden, then link `tokens.css` from the marketing pages and alias
  `--brand-*` to the token names. **[CONFIRMED]**
- [ ] **[U8] P2 — "Back" arrows point forward in RTL.** `app/course.html:14`. "← הקורסים שלי",
  "← חזרה לקורס" (`app/lesson.html:14`) and "← חזרה לדף הבית" (`challenge/tummy-time/index.html:95`)
  use the left arrow, which on this site means "forward" (every CTA uses "←"). The design system
  has only a forward arrow (`packages/ui/src/components/Icon/Icon.tsx:20-21`). **Fix:** use "→"
  for every back link. Add an `arrow-back` icon and a `BackLink` to `@babysteps/ui`. **[CONFIRMED]**
- [ ] **[U9] P2 — Motion ignores "reduce motion", and content needs JS to show.**
  `styles.css:178-198`. `.reveal` starts at `opacity: 0`, `.btn-pulse` loops forever, the sales
  page runs its own scroll animation (`challenge/rolling/index.html:586-616`), and the thank-you
  page drops confetti (`thank-you.html:223-240`). Nothing checks `prefers-reduced-motion`. If the
  script fails, `.reveal` sections stay invisible. **Fix:** a `prefers-reduced-motion: reduce`
  block that shows `.reveal` and stops the pulse and confetti; skip the smooth scroll in that case;
  hide `.reveal` only under a `.js` class set on `html`. **[CONFIRMED]**
- [ ] **[U10] P2 — The mobile sticky bar covers the price section and the footer.**
  `challenge/rolling/index.html:655-661`. The bar shows whenever `scrollY > 150`, also over
  `#register`, where it repeats the price over the PayPal card. The body has no bottom padding, so
  it also hides the footer's last line. **Fix:** hide it with an `IntersectionObserver` while
  `#register` or the footer is visible, and add `padding-bottom: 80px` to `body` below 768px.
  **[CONFIRMED]**
- [ ] **[U11] P2 — No way to reach the course from the site.** `index.html:152-169`. No marketing
  page links to `/app/login`. A returning buyer who lost the email cannot find where to log in.
  **Fix:** a small "כניסה לקורס" link in the nav and footer of every page (`SiteNav` in the
  rebuild). **[CONFIRMED]**
- [ ] **[U12] P2 — The login form has no labels and the wrong text direction.**
  `app/login.html:16-19`. The inputs use only placeholders, which vanish on typing and are weak for
  screen readers. Both fields inherit RTL, so an email shows flipped while typing. The error line
  (`:25`) is not announced. **Fix:** visible `<label>`s, `dir="ltr"` on both inputs, and
  `role="status" aria-live="polite"` on `#msg`. `TextField` already does this for the rebuild.
  **[CONFIRMED]**
- [ ] **[U13] P2 — Muted text fails contrast.** `packages/ui/src/tokens.css:6`. `--color-ink-muted
  #8a6a55` is about 3.9:1 on `--surface-peach`, and `PriceCard` uses it at caption size on the peach
  header (`PriceCard.css:31-33`, `:60-66`). On the live site, `#9a7a68` on white is about 3.9:1
  (`challenge/rolling/index.html:519`, `thank-you.html:92`). WCAG AA needs 4.5:1. **Fix:** darken
  the token to about `#74553f` and replace `#9a7a68` with `var(--text-mid)`. **[CONFIRMED]**
- [ ] **[U14] P2 — The reference designs repeat the claims being removed.**
  `packages/ui/src/examples/LandingPage.stories.tsx:53`. The example page synced to Claude Design
  shows five stars with "200+ אמהות מרוצות", the ₪205 old price (`:106`, `:115`) and the ₪105 home
  price (`:135`). `TestimonialCard` defaults to `rating = 5` (`TestimonialCard.tsx:18`). The rebuild
  will copy these. **Fix:** update the example after C2, set the `rating` default to `null`, and
  re-sync to Claude Design. **[CONFIRMED]**
- [ ] **[U15] P2 — The design system is missing pieces the rebuild needs.**
  `packages/ui/src/components/VideoFrame/VideoFrame.tsx:5-14`. `VideoFrame` is a teaser only: no
  `onTimeUpdate`, `onEnded`, start time or ref, and props spread onto the `<figure>` (`:34`), where
  media events do not bubble. It cannot drive lesson progress (L5). There is also no Checkbox (B2
  consent), EmptyState or BackLink (U8). **Fix:** add a `LessonPlayer` with `startAt`,
  `onProgress(sec)`, `onComplete` at 90% and a 9/16 fit capped at 80vh. Add `Checkbox`,
  `EmptyState` and `BackLink` before the app screens (U6). **[CONFIRMED]**
- [ ] **[U16] P2 — The package CSS carries 319 KB of inlined fonts.** `packages/ui/vite.config.ts:7-19`.
  Library mode inlines the `@fontsource` files from `base.css:2-9` as base64, woff and woff2, so
  `dist/styles.css` is 319 KB and blocks the first paint on phones. **Fix:**
  `build.assetsInlineLimit: 0`, import only woff2, and preload the Rubik 400 Hebrew file.
  **[CONFIRMED]**
- [ ] **[U17] P3 — Storybook has no accessibility or phone checks.** `packages/ui/.storybook/main.ts:5`.
  The only addon is `addon-docs`: no a11y panel and no phone viewport, though most buyers use phones
  and `StickyCTA` shows only below 768px. 13 of 30 components have no test (for example `Hero`,
  `Footer`, `StickyCTA`, `TestimonialCard`). **Fix:** add `@storybook/addon-a11y` and fail on
  violations in the Storybook Vitest run, add a 390px viewport, and add smoke tests. **[CONFIRMED]**

## Architecture

- [ ] **[A2] P2 — The live site serves the repo's source and docs.** `vercel.json:1`. There is no
  output directory, so the repo root is public: `/docs/TODO.md`, `/CLAUDE.md`,
  `/docs/make/paypal-enroll.blueprint.json`, `/lib/firebase-admin.js` and `/firestore.rules` all
  return 200 (`.env*` files return 404). The GitHub repo is public too, so this adds little, but it
  makes G3 easy to find from the site. **Fix:** do not use `.vercelignore` for `lib/`, because the
  `/api` functions import it. Move the public files into `public/` and set `outputDirectory`
  (or do it as part of A10). Until then, add `vercel.json` rewrites that return 404 for `/docs/`,
  `/lib/`, `/scripts/`, `/tests/`, `/packages/` and `*.md`. Add `X-Frame-Options: DENY` and
  `Referrer-Policy: strict-origin-when-cross-origin` headers for `/app/(.*)`. Check each URL after
  deploy. **[CONFIRMED]**
- [ ] **[A3] P2 — The Firebase SDK version is written seven times.** `app/firebase-client.js:2`.
  `10.12.0` appears in `firebase-client.js:2`, `:6`, `:7`, and each page imports Firestore from the
  CDN itself (`app/course.html:24`, `app/lesson.html:27`, `app/login.html:30`,
  `app/my-courses.html:23`). If one URL is bumped and not the others, two SDK copies load and
  Firestore throws "Type does not match the expected instance". **Fix:** re-export every Auth and
  Firestore function the pages use from `app/firebase-client.js`, and import only from there.
  **[CONFIRMED]**
- [ ] **[A4] P2 — The Make scenario is tied to one course and never checks the amount.**
  `docs/make/paypal-enroll.blueprint.json:219`. The filter checks that the raw IPN *contains*
  `course_2`, so `course_20` matches too. The body always sends `"paypalProductId":"course_2"`
  (`:237`), so `COURSE_MAP` is never really used and a second course needs a cloned scenario.
  `mc_gross` and `mc_currency` are never checked, so a payment at a wrong price still enrolls.
  **Fix:** send `{{1.item_number}}` as `paypalProductId` and let `/api/enroll` map it. Also send
  `mc_gross` and `mc_currency`, and reject in `runEnroll` when they do not match the expected price
  per product. **[CONFIRMED]**
- [ ] **[A5] P2 — Enrollment writes overwrite the first purchase.** `lib/firebase-admin.js:83-90`.
  `ensureEnrollment` merges and resets `grantedAt` and `paymentRef` on every call. A Make retry, a
  second payment or a manual enroll replaces the original PayPal `txnId`, which refunds (T1) and
  receipts (F2) need. **Fix:** in a transaction, create the doc only if it is missing. On later
  calls append to a `payments` array (`FieldValue.arrayUnion({ ref, source, at })`) and keep the
  first `grantedAt`. **[CONFIRMED]**
- [ ] **[A6] P2 — `published` and `order` are never read.** `app/my-courses.html:35`. The list shows
  every enrolled course in doc-id order and fetches them one by one. The course page
  (`app/course.html:29`) and the rules (`firestore.rules:7-9`) ignore `published`. The tester
  script enrolls in the unpublished tummy-time course (`lib/tester-core.js:23-26`), which then
  shows as an empty course. **Fix:** fetch courses with `Promise.all`, drop `published === false`,
  sort by `order`. Enroll the tester only in published courses. **[CONFIRMED]**
- [ ] **[A7] P2 — Video scripts break when a second course reuses file names.**
  `scripts/upload-videos.js:178`. Local files are matched by the last part of the key only, so
  `rolling/lesson-01.mp4` and `tummy-time/lesson-01.mp4` both want `lesson-01.mp4`.
  `prepare-videos.js:85-97` keys lessons by number across all courses, and `BONUS_NUMBER` assumes
  one course. `validate()` (`scripts/course-data.js:98`) does not catch it. **Fix:** a
  `--course <id>` flag on both scripts, and make `validate()` fail on duplicate basenames inside a
  course. **[CONFIRMED]**
- [ ] **[A8] P2 — No tests for handlers, real deps or data validation.** `api/enroll.js:12`.
  `tests/` covers only the pure cores. Nothing tests the fail-closed secret check, the `405`, the
  `Bearer` parsing (`api/video-url.js:11`), the `ensureUser` error branches and `hasSignedIn`
  (`lib/firebase-admin.js:35-55`), `sendWelcome` error parsing (`:73-80`), or `validate()`
  (`scripts/course-data.js:80-107`). **Fix:** handler tests with fake `req`/`res` and
  `vi.mock("../lib/firebase-admin.js")`; let `sendWelcome` take `fetch` as a parameter; add
  `tests/course-data.test.js`. **[CONFIRMED]**
- [ ] **[A9] P2 — No CI and no pinned Node version.** `package.json:8-9`. There is no `.github/`, so
  tests run only when someone remembers. The UI `typecheck` (`packages/ui/package.json:25`) is not
  in `npm test`. There is no `engines` field or `.nvmrc`, while Vitest needs Node 22.12 or newer.
  **Fix:** add `"engines": { "node": ">=22.12" }` and `.nvmrc`. Add a GitHub Action that runs
  `npm ci`, `npm test`, the UI typecheck and `npm run ui:build` on every PR. **[CONFIRMED]**
- [ ] **[A10] P2 — Plan the build step for the React rebuild.** `packages/ui/package.json:7-15`. The
  package points to `dist/`, which is gitignored and built by nobody on Vercel. The site has no
  build command, and routing is two rewrites (`vercel.json:4-5`). `lib/firebase-admin.js:6` imports
  `app/firebase-config.js` and `:9` hardcodes the prod URL, so moving `app/` or using preview URLs
  breaks the server. **Fix:** an `apps/web` workspace (Vite + React Router, one SPA for `/app/*`,
  prerendered `/` and `/challenge/*`). Vercel `buildCommand` builds the UI then the app,
  `outputDirectory` is `apps/web/dist`, `api/` stays at the root. Move the web API key and site URL
  into env vars (`FIREBASE_WEB_API_KEY`, `SITE_URL`). Keep old URLs with rewrites. This also fixes
  A2. **[CONFIRMED]**

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

- [ ] **[H1] P3 — Delete `staging/`.** 748 MB of transcoded videos, gitignored. **Fix:** once R2
  playback is confirmed good, `rm -rf staging/`.
- [ ] **[H2] P3 — Update `CLAUDE.md` status.** `CLAUDE.md` still says "built, not yet
  provisioned". **Fix:** mark the platform live and trim the "Remaining work" section to the open items here.

- [ ] **[H3] P3 — Remove dead code and assets.** `challenge/tummy-time/index.html:50-80`. Unused
  `.notify-input` styles, a "Logo placeholder" comment (`challenge/rolling/index.html:199`), a
  "Guarantee note" comment over a line with no guarantee (`:518`), and three unused logos
  (`assets/logos/logo-blue.png`, `logo-mint.png`, `logo-pink.png`, about 520 KB). **Fix:** delete
  them, or keep the logos only if the design system needs them.
- [ ] **[H4] P3 — Remove the committed third-party UI skill.** `.agents/skills/ui-ux-pro-max/SKILL.md:1`.
  About 1.5 MB of Python scripts and CSV data for a generic design tool is tracked in the repo.
  Nothing uses it, and it adds noise to every search. **Fix:** `git rm -r .agents/`, and install it
  in the user skills folder if still wanted. **[CONFIRMED]**
- [ ] **[H5] P3 — Delete old design-sync leftovers.** `.gitignore:21-22`. `.ds-sync/` (46 MB) and
  `ds-bundle/` (9.3 MB) are from an old sync tool that `.design-sync/` replaced. They are untracked
  but still on disk and still in `.gitignore`. `.superpowers/` and `.playwright-mcp/` (screenshots
  and logs) are leftovers too. **Fix:** `rm -rf .ds-sync ds-bundle .playwright-mcp .superpowers`,
  then drop lines 21 and 22 from `.gitignore`. **[CONFIRMED]**
- [ ] **[H6] P3 — Tidy `.gitignore`.** `.gitignore:4-5`, `:9`. `.env` and `.env.local` repeat
  `.env*`. `.DS_Store`, `.playwright-mcp/` and `*-preview.png` are ignored only by a personal global
  or `.git/info/exclude`, so another clone will commit them. **Fix:** delete lines 4 and 5, add
  `.DS_Store`, `.playwright-mcp/`, `*-preview.png` and `.idea/`. **[CONFIRMED]**
- [ ] **[H7] P3 — Share the page scripts instead of copying them.** `index.html:326-338`. The
  reveal-on-scroll observer is copied into all four marketing pages
  (`challenge/rolling/index.html:641-651`, `challenge/rolling/thank-you.html:255-265`,
  `challenge/tummy-time/index.html:233-245`), and the ripple handler twice
  (`challenge/rolling/index.html:619-631`, `thank-you.html:242-253`). **Fix:** one `/site.js` loaded
  with `defer`; delete the inline copies. **[CONFIRMED]**
- [ ] **[H8] P3 — Copied nav and footer markup with inline hover JS.** `index.html:286-324`. The same
  footer, with long inline SVGs and `onmouseover`/`onmouseout` style swaps, is pasted into all four
  pages, and the nav too (`challenge/rolling/index.html:196-209`). One link change means four
  edits. **Fix:** `.footer-link` and `.brand` classes with `:hover` in `styles.css`, drop the
  `onmouse*` attributes. Use `SiteNav` and `Footer` in the rebuild. **[CONFIRMED]**
- [ ] **[H9] P3 — Storybook keeps its own copies of site images.** `packages/ui/.storybook/main.ts:10`.
  The three files in `.storybook/public/` are byte-identical copies of `assets/about.jpg`,
  `assets/logos/logo-peach.png` and `assets/videos/rolling-teaser-poster.jpg`. Stories import images
  through `.storybook/assets.ts`, so `staticDirs` is not needed. **Fix:** import from
  `../../../assets/...` in `assets.ts`, delete `.storybook/public/`, remove `staticDirs`.
  **[CONFIRMED]**
- [ ] **[H10] P3 — More stale facts in `CLAUDE.md` (do with H2).** `CLAUDE.md:43`. It says Make emails
  a generated password; buyers now get the Firebase reset email. Line 49 lists `posterKey`, which
  nothing writes, and leaves out `kind`. Line 66 says the web config holds placeholders. Line 71
  says to edit `DATA` in `seed.js`; the data lives in `scripts/course-data.js`. Lines 13 and 15 say
  "HTML/Tailwind" and "GitHub Pages". **Fix:** update these lines. **[CONFIRMED]**
- [ ] **[H11] P3 — One R2 client and shared script helpers.** `scripts/upload-videos.js:59-66`. The
  S3 client setup repeats `lib/r2.js:11-19`, and `walk()` and `mb()` are copied between
  `scripts/upload-videos.js:68-79` and `scripts/prepare-videos.js:43`, `:71-80`. **Fix:** export
  `r2Client()` from `lib/r2.js`, and move `walk` and `mb` into `scripts/fs-utils.js`. **[CONFIRMED]**
