# TODO backlog

Deferred work for this repo. One line per item, IDs never change.

Categories: `G` = go-live · `C` = conversion · `F` = buy and onboarding flow · `L` = learning experience · `T` = trust and legal · `S` = SEO, speed and analytics · `U` = UI/UX · `B` = bigger bets · `D` = dev tooling · `H` = housekeeping.
Priority: `P0` data loss or wrong money · `P1` blocks sales or big UX · `P2` polish · `P3` nice to have.

The step-by-step provisioning list lives in `docs/go-live-checklist.md`. This file only tracks
what is still open.

## Go-live

- [ ] **[G2] P1 — Run one real payment end to end.** **Fix:** in PayPal
  (`paypal.com/ncp/links/SDBZ5YS6JNKLQ/edit`) set the price to ₪1, keep Product ID `course_2`, pay
  once, watch the Make run, set a password from the email, log in. Then set the price back to ₪175
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

- [ ] **[C1] P1 — One price everywhere.** `index.html:232`. The home card says ₪105, but the sales
  page and the sticky bar say ₪175 (`challenge/rolling/index.html:470`, `:496`, `:570`). A buyer who
  clicks from home sees a higher price and feels tricked. **Fix:** change the home card to ₪175 now.
  In the React rebuild, keep the price in one shared constant that every page reads.
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
  link). Move Bit/Paybox to a small text link under it. Use one `PriceCard` in the rebuild.
- [ ] **[C7] P2 — Testimonials that show results.** `challenge/rolling/index.html:427-443`. The three
  quotes praise Yarden in general ("את מדהימה", "חברה"), not the rolling course, and give no baby
  age or outcome. **Fix:** replace them with 3 short quotes from beta buyers (B1) that name the
  problem and the result, with the baby's age and, with consent, a WhatsApp screenshot or photo.
  Use `TestimonialCard` with the `detail` prop in the rebuild. While rebuilding, also move the
  problem block (`:322-361`) above the bio (`:284-320`), so the reader feels understood first.

## Buy and onboarding flow

- [ ] **[F1] P1 — Fix the thank-you page.** `challenge/rolling/thank-you.html:93`. It says the email
  comes from systeme.io with the subject "Important: Your access to training", which is no longer
  true. Step 3 (`:133`) says "Forgot password" in English, the headings start with "!" (`:59`,
  `:63`), and the logo (`:30`) sends the buyer back to the sales page. **Fix:** rewrite the copy to
  match the real Firebase email (sender "ירדן - מתחילים בקטן", link to choose a password), add a
  "כניסה לקורס" button to `/app/login`, say "שכחתי סיסמה", fix the punctuation, and point the logo
  at `/app/login`. Then set this page as the PayPal payment link's return URL and check it in G2.
- [ ] **[F2] P1 — A receipt for every sale.** Yarden is עוסק פטור and must issue a receipt (קבלה)
  for each payment. Nothing in the flow creates one. **Fix:** pick an Israeli invoicing service
  that Make can call (for example Morning/Green Invoice, iCount or EZcount; compare the cheapest
  plan against issuing by hand) and add a Make step after the HTTP call that issues and emails the
  receipt with the buyer email and PayPal `txnId`. Until then, issue each receipt by hand the same
  day. Bit/Paybox sales always need a manual receipt.
- [ ] **[F3] P2 — "Paid but no access" playbook and a manual enroll tool.** `lib/enroll-core.js:39`.
  When the email fails, `/api/enroll` returns 502 and Make marks the run failed, but nobody is told.
  Other cases: email in spam, buyer paid with her partner's PayPal so the email went to him, a typo.
  Bit/Paybox buyers and these cases need a curl call with the secret
  (`docs/go-live-checklist.md:160`), which Yarden cannot run. **Fix:** turn on Make's error email to
  Yarden. Add `scripts/enroll-manual.js <email> [courseId]` in the style of
  `scripts/create-tester.js`. Add a short section to `docs/go-live-checklist.md`: check Make history
  and re-run, check the user in Firebase Auth, send a reset from the login page, or enroll another
  email by hand. Add the FAQ line "הגישה נשלחת למייל של חשבון ה-PayPal ששילם".
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
- [ ] **[S2] P2 — Fix dead share previews and search basics.** `index.html:13`, `:16`,
  `challenge/rolling/index.html:13`, `:16`, `:25`. `og:image` and `og:url` point at
  `guyshoham.github.io`, which is 404 since 2026-08-13, so links shared on WhatsApp and Instagram
  show no image. The image is a 512px logo square while the card type is `summary_large_image`, and
  the tummy time page has no OG tags. No page has a `<meta name="description">`, `/robots.txt` and
  `/sitemap.xml` return 404, and `app/` pages are not `noindex`. **Fix:** absolute URLs on
  `https://baby-steps-murex.vercel.app`, a 1200x630 image with Yarden's photo and the course name, OG tags
  and a Hebrew description on every page, and a `robots.txt` that blocks `/app/` and `/api/`.
- [ ] **[S3] P2 — Shrink the teaser video.** `challenge/rolling/index.html:272`. `rolling-teaser.mp4`
  is 13.9 MB at 1080x1920, and its `moov` box sits at the end of the file (no faststart), so some
  phones must fetch almost the whole file before playing. The poster is a 195 KB JPEG. **Fix:**
  re-encode at 720x1280 with `-movflags +faststart` (aim for 3 to 5 MB), and save the poster as a
  WebP around 60 KB.
- [ ] **[S4] P2 — Remove the Tailwind CDN from the marketing pages.** `index.html:21`,
  `challenge/rolling/index.html:26`, `challenge/tummy-time/index.html:9`,
  `challenge/rolling/thank-you.html:10`. These pages use no Tailwind classes (only `styles.css`),
  yet each loads the Tailwind dev runtime, a large script that blocks rendering and warns in the
  console. **Fix:** delete the script tag, add the few reset rules the pages relied on to
  `styles.css`, and compare screenshots. The `app/` pages use Tailwind heavily; replace it there in
  the React rebuild.

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

## Bigger bets

- [ ] **[B1] P2 — Beta launch for real testimonials.** Before the public launch, give 5 to 10
  followers the course free or at half price in exchange for honest feedback within two weeks and a
  short quote with the baby's age. This tests the whole flow on real phones and fills C2 and C7
  with true social proof. **Fix:** Yarden picks the group, Guy enrolls them with the F3 script, and
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
