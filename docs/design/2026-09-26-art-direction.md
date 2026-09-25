# Art direction and redesign plan

Date: 2026-09-26. Status: proposal, no code changed yet.

This doc sets one visual direction for the whole site (marketing pages and course app), lists
the "AI template" tells in the current pages, and splits the work into 8 packages that can run
in parallel without merge conflicts.

**Design read:** a personal brand landing site plus a small course app, for tired mothers who
arrive from Instagram on a phone. Warm, calm and personal. It should feel made by one careful
designer for one real person, not assembled from a kit.

**Dials** (from the `design-taste-frontend` skill): variance 6, motion 4, density 3. Calm beats
clever here. The audience holds a baby in one arm and reads with one thumb.

**Audit basis:** screenshots of every page at 390x844 and 1280x800 on the live site on
2026-09-25 (marketing pages anonymous, app pages as the tester, with all Firestore writes
blocked so no progress changed), plus a read of every page's source.

---

## 1. The idea: "On the mat"

Every video Yarden makes happens in the same place: on a cream mat on her living room floor,
next to a big plant, in daylight, with a baby at hand height. That place is the brand. The site
should feel like sitting down on that mat next to her.

- **Cream is the floor.** The page background is the cream of the mat (`#fdf6f0`), not white.
- **Peach is the window light.** One warm peach area per page, where the most human moment is
  (her photo, her message). Not a stripe on every other section.
- **Brown is her voice.** Brown `#704229` is the only color that asks you to do something:
  buttons, links, the one key number. Nothing else competes with it.
- **One thin line is her hand.** The logo is a thin line drawing. The site uses one matching
  device: a thin arc, the path a baby's body draws when it rolls from back to tummy. It appears
  at most 3 times on the whole site, and it moves only once (see Motion).

What makes it hers and not a template: her own photos and video stills lead every page, the
course content is shown with its real lesson names, and her students' real WhatsApp words are
shown as WhatsApp messages. No stock images, no invented icons of babies, no star ratings.

### Principles

1. **Real before decorative.** If a section has no real photo, still, screenshot or quote, it
   gets calm type and space, not an icon or a shape. No blobs, no emoji tiles.
2. **Small steps.** The brand is "מתחילים בקטן". Motion is small (12px, never bouncy), progress
   is shown as small equal steps, and each page asks for one next step only.
3. **One accent, one voice.** Brown is the only accent. One label per intent on a page. Start
   aligned (right) Hebrew text, centered only for a single moment (thank you, 404).
4. **Thumb first.** 390px is the main canvas. Every tap target is 44px or more, body text is
   16px or more, and the next action is always inside the first screen.
5. **Quiet craft.** Consistent radii, two shadows, one icon style, Hebrew typography done
   properly (no tracking, no fake capitals). Quality shows in what is left out.

---

## 2. Type

Keep **Rubik** for everything. It is already loaded, it has real Hebrew weights from 300 to 900,
and one font keeps the page fast in the Instagram in-app browser. I looked at Hebrew display
faces on Google Fonts (Suez One, Frank Ruhl Libre, Secular One, Varela Round). None earns its
cost: a serif reads as the default "wellness template", Secular One is too loud, and Varela Round
has one weight (see `docs/design/2026-09-25-color-decision.md`). Contrast comes from weight and
size inside Rubik: 300 for a soft large line, 700 for headings.

Load only the weights in use: `wght@300;400;500;700` (today it loads 6 weights and uses 800 for
almost every heading, which makes the pages feel heavy).

| Token | Mobile | Desktop (>= 1024px) | Weight | Line height | Use |
| --- | --- | --- | --- | --- | --- |
| `--fs-display` | 34px | 48px | 700 | 1.15 | One H1 per page |
| `--fs-h2` | 26px | 34px | 700 | 1.2 | Section headings |
| `--fs-h3` | 20px | 22px | 500 | 1.3 | Card and list titles |
| `--fs-lead` | 18px | 20px | 300 or 400 | 1.6 | Sub line under a heading |
| `--fs-body` | 16px | 17px | 400 | 1.7 | All paragraphs |
| `--fs-small` | 14px | 14px | 400 or 500 | 1.5 | Captions, meta, helper text |
| `--fs-label` | 13px | 13px | 500 | 1.4 | Badges only. The floor. |

Rules:

- **Measure:** paragraphs max `--measure: 36rem` (about 60 Hebrew characters). Headings max
  `20ch`. Use `text-wrap: balance` on headings and `text-wrap: pretty` on paragraphs.
- **No tracking on Hebrew.** `letter-spacing` must be `0` on Hebrew text. Hebrew has no capital
  letters, so `text-transform: uppercase` does nothing, and the wide spacing only breaks the word
  shapes. This pattern is on 21 labels today (see the slop table).
- **Weight 800 only for the price number.** Headings are 700. UI labels are 500.
- **Color of text:** ink `#2d1a0e` for headings, `#5a3820` for body, `#7a5a48` for small print
  only (never for body paragraphs on peach).
- **Numbers:** Latin digits. Use `font-variant-numeric: tabular-nums` on counters ("3 מתוך 18"),
  prices and times, so they do not jump when they change. Keep every price in its
  `<span data-price="...">` tag (the `prices` test checks this).
- **Latin inside Hebrew:** wrap Latin words next to punctuation in `<bdi>` (PayPal, WhatsApp,
  Spam, an email). Today the period jumps to the wrong side in
  `challenge/rolling/thank-you.html:131` ("(Promotions)."). Phone numbers get
  `<span dir="ltr">`. Email inputs get `dir="ltr"`.
- **Arrows:** in RTL, "forward" points left. Use the sprite chevron (it flips with direction),
  and only on links that go to another place. Not on every button.
- **Dashes:** no em or en dashes in new copy. Use a comma, a colon, a period or two sentences.
  Lesson titles in `scripts/course-data.js` keep theirs until the L4 reseed.

---

## 3. Color and surface

The brand colors stay. The palette gets smaller: mint, pink, sky blue and gold leave the pages.

| Token | Value | Share of the screen | Where |
| --- | --- | --- | --- |
| `--c-cream` | `#fdf6f0` | about 60% | Page background, every page (marketing too) |
| `--c-paper` | `#ffffff` | about 20% | Things you act on: the offer card, forms, video frames, lesson rows |
| `--c-peach` | `#FCE7D6` | about 10% | One warm band per page, chat bubbles, the "current lesson" row |
| `--c-ink` / `--c-ink-soft` / `--c-ink-muted` | `#2d1a0e` / `#5a3820` / `#7a5a48` | text | See Type |
| `--c-brown` | `#704229` | about 5% | Buttons, links, the footer, key numbers. The only accent. |
| `--c-brown-hover` | `#8a5438` | state | Hover on brown |
| `--c-done` | `#2f9e6b` | state | Done checks in the app only |
| `--c-error` | `#dc2626` | state | Error text only |
| `--c-line` | `rgba(112,66,41,0.14)` | lines | Hairlines and card borders |

- **WhatsApp buttons become brand buttons** with the WhatsApp glyph inside. The green
  `#0f7a3d` block is a second accent, and today it is the biggest button on three pages.
- **Gold `#f5a623` is removed** with the star rows and the "הכי מומלץ" pill.
- **Light theme only, on purpose.** Add `<meta name="color-scheme" content="light">` and
  `color-scheme: light` so in-app browsers do not auto-darken photos. A dark theme is not worth
  the cost for this audience now.

**Radii (4 steps, from the color decision doc):** `--r-sm 8px` badges and chips, `--r-md 14px`
buttons, inputs and list rows, `--r-lg 22px` cards, photos and video frames, `--r-xl 32px` the one
hero photo. No pills except the tiny "בקרוב" badge. Today there are 9 different radii.

**Shadows (2, tinted brown, never black):**
`--shadow-1: 0 1px 2px rgba(112,66,41,.06), 0 6px 20px rgba(112,66,41,.08)` for resting cards on
cream, `--shadow-2: 0 2px 4px rgba(112,66,41,.08), 0 16px 40px rgba(112,66,41,.14)` for the one
raised thing (the offer card, a hovered link card). Today there are 17 different shadows.

**Borders:** a card has a shadow or a hairline, never both. On cream use a shadow, on white or
peach use a hairline. No left or right colored bar on callout boxes.

---

## 4. Layout and rhythm

**Spacing scale (4px base):** `--s-1 4`, `--s-2 8`, `--s-3 12`, `--s-4 16`, `--s-5 24`, `--s-6 32`,
`--s-7 48`, `--s-8 64`, `--s-9 96`. Section padding `--section-y: clamp(56px, 9vw, 96px)`. Side
gutter 16px on phones, 24px from 768px.

**Grid:** one column under 768px, always. From 1024px, a 12 column grid in a 1120px container.
Text columns sit on the start side (right) and span 6 or 7 columns. Media spans 5 or 6.

**Section families.** Each page uses at least 3 of these, and never the same family twice in a
row:

| Family | Shape | Rule |
| --- | --- | --- |
| A. Split media | Photo or video on one side, text on the other. Photo first on phones. | Max 2 per page, never next to each other |
| B. Text column | Heading, 1 or 2 short paragraphs, start aligned, max `--measure` | The default "calm" section |
| C. Syllabus | Grouped rows: type icon, title, meta. Group heading per group. | For course contents, in the app and on the sales page |
| D. Messages | Testimonials as WhatsApp style bubbles on peach, name under each | Emoji inside a student's own words is fine, it is her voice |
| E. Offer | One white card on the peach band, price, what you get, one button | Once per sales page |
| F. Still strip | 3 or 4 stills in a horizontal scroll snap row on phones, a row of 3 on desktop | Max once per page |

Banned: the centered hero with floating circles, 3 equal icon cards, a star row, a small
uppercase label plus a 48px bar above every heading, alternating white and peach stripes.

**Photos.** The real assets are portrait: `assets/about.jpg` 750x1000, the teaser 720x1280. Use
them in 4:5 or 9:16 frames, never squeezed into wide 16:9 strips (the home card crops Yarden's
head today, U27). `assets/yarden-portrait.jpg` is only 300px, so never show it above 120px.
Package 1 adds stills cut from the public teaser video (`assets/stills/`), so pages have more
than two real images. No pills or labels on top of photos. A caption, if any, goes under.

**Page shapes (target):**

- **Home:** A split hero (about.jpg with the baby, her name, one line of what she does, one
  button "לקורס ההתהפכות"). Then B: one short paragraph about her approach. Then "Inside the
  course" (real app screenshots in a plain phone frame, see Features). Then the courses: the
  rolling course as one wide split card, tummy time as one quiet line with a "בקרוב" badge.
  Then footer.
- **Rolling sales page:** A split hero (text start, teaser video end on desktop; on phones the
  video comes right under the hero text). B "Is this you" as a short list, not cards. A about
  Yarden. C the real syllabus (18 lessons in 3 groups). D messages. E offer. FAQ if #43 lands.
  Sticky buy bar on phones.
- **App pages:** cream page, white rows and cards, one peach "you are here" highlight.

---

## 5. Motion

Motion says one thing: "this changed" or "look here next". It is never decoration.

**Tokens:**

| Token | Value | Use |
| --- | --- | --- |
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | Everything that enters or changes (same as `--ease-soft` in `packages/ui`) |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | The arc draw only |
| `--dur-press` | `120ms` | Press feedback: `transform: scale(0.98)` |
| `--dur-state` | `200ms` | Hover, color and toggle changes |
| `--dur-enter` | `360ms` | Reveal and panels |
| `--dur-draw` | `600ms` | Signature moments (arc and check draw) |
| `--rise` | `12px` | Reveal distance (today it is 28px) |

**What moves:** the hero text once on load (3 items, 60ms apart); the first element of each
section when it scrolls in (not every card); state changes (done toggle, progress steps, the
sticky bar); the signature moments below. Only `transform` and `opacity` animate.

**What never moves:** prices, body paragraphs, form fields, testimonials, CTAs at rest. No pulse,
no ripple, no parallax, no confetti, no infinite loops, no scroll hijack. No JS scroll listeners:
use `IntersectionObserver` (the sticky bar and the nav progress bar on the sales page use
`window.addEventListener('scroll')` today, `challenge/rolling/index.html:658-659`).

**Reduced motion:** keep the existing `prefers-reduced-motion` block in `styles.css` and the
`.js` class gate (content is visible if JS never runs). Under reduced motion every moment jumps
to its final state, `.reveal` is visible at once, and smooth scrolling is off. Check with
`document.getAnimations().length === 0` after load.

**Signature moments (the only "wow", each used once):**

1. **Teaser frame (sales page).** The poster sits in a 22px radius frame with a custom play
   button: a 72px brown disc with a peach play glyph and a label under it, "הצצה לקורס · 1:30"
   (the teaser is 90 seconds, read from the file). Native controls appear only after play.
   On hover the disc scales to 1.04. On desktop the video is at most 80vh tall (U28).
2. **Lesson done (app).** When a lesson is done (90% watched, the button, or an image tip
   loads), the check inside the done button draws itself (`stroke-dashoffset`, 360ms), the
   button fills brown (200ms), and the matching step in the "שיעור 3 מתוך 18" step bar fills
   from the start side (`scaleX`, 360ms). A polite live region says "השיעור סומן כבוצע".
   No confetti, no emoji.
3. **Course finished (app).** The finish card shows Yarden's small portrait with the arc drawn
   around it once (600ms), and her note in her voice. Replaces "סיימת את הקורס! 🎉".
4. **Payment received (thank-you page).** The check draws inside a circle (600ms), then the arc
   draws under it. Replaces the pop animation and the 40 multicolor confetti pieces.

---

## 6. Icons and illustration

- **One set, one style.** Use outline icons from **Tabler Icons** (MIT, stroke based), copied as
  `<symbol>` elements into one sprite file, `assets/icons/sprite.svg`. Set `stroke-width: 1.5`
  for all of them, so they match the thin line of the logo. `fill: none`,
  `stroke: currentColor`, round caps and joins. Do not draw icon paths by hand.
- **Usage:** `<svg class="icon" aria-hidden="true"><use href="/assets/icons/sprite.svg#i-play"/></svg>`.
  Size `1.25em` inline, 20px or 24px on their own. Directional icons (`i-chevron-forward`,
  `i-chevron-back`) get `.icon--dir`, which mirrors them for RTL.
- **Starting set:** `i-play` (video lesson), `i-photo` (tip), `i-gift` (bonus), `i-paperclip`
  (appendix), `i-check`, `i-circle-check`, `i-chevron-forward`, `i-chevron-back`, `i-lock`,
  `i-mail`, `i-clock`, `i-message` (feedback), `i-brand-whatsapp`, `i-brand-instagram`.
- **No emoji as icons or bullets** anywhere in our own UI. Emoji stay only inside quoted
  student messages.
- **No illustration.** No stock images, no AI images, no clip art babies. The only drawn element
  is the arc (one simple geometric stroke). Real photos, stills and screenshots do the rest.

---

## 7. Slop inventory

Design tells found in the current site. Content items that need Yarden's facts (the 200+ claim,
the ₪205 strike price, FAQ, legal pages) are left to drafts #35, #43, #58, #39, #42 and #46.
"WP" is the work package that fixes it.

| # | Tell | Where (`file:line`) | Fix | WP |
| --- | --- | --- | --- | --- |
| 1 | Floating pastel circles ("blobs") behind the hero | `index.html:196-197`, `challenge/rolling/index.html:224-225`, `challenge/rolling/thank-you.html:50-51`, `challenge/tummy-time/index.html:90-91`, `404.html:59-60` | Delete. The hero asset is a real photo or the video. | 2, 3, 4 |
| 2 | Tracked "uppercase" Hebrew eyebrow above every heading | `index.html:144-150`, `:206`, `:231`, `:296`; `challenge/rolling/index.html:274`, `:305`, `:336`, `:377`, `:429`, `:464`, `:514`; `thank-you.html:82`, `:120`; `tummy-time/index.html:128`, `:170`; `styles.css:144-149` | Delete. The heading is enough. No `letter-spacing` on Hebrew. | 1, 2, 3, 4 |
| 3 | 48px peach bar under every section heading | `styles.css:279-285`; used 10 times, e.g. `challenge/rolling/index.html:276` | Delete the rule and the markup. | 1, then 2 to 4 |
| 4 | Emoji used as icons | `challenge/rolling/index.html:344`, `:350`, `:356` (🙆 🔄 ↩️), `:412` (⭐); `tummy-time/index.html:136`, `:144`, `:152` (🤱 💪 🎯), `:169` (🔄); `app/lesson.html:31` (🎉); `thank-you.html:173` (♡) | Sprite icons where an icon helps, otherwise nothing. | 3, 4, 7 |
| 5 | Three equal icon-in-tile cards | `challenge/rolling/index.html:341-361` (+ `.icon-wrap` `:50-59`); `tummy-time/index.html:133-159` | A short list (family B) with one bold phrase per item. | 3, 4 |
| 6 | Pulsing CTA | `styles.css:389-394`, used at `challenge/rolling/index.html:496` | Remove. A still, clear button. | 1, 3 |
| 7 | Material ripple on every button | `site.js:26-40`, `styles.css:349-370` | Remove. Press feedback is `scale(0.98)` for 120ms. | 1 |
| 8 | Gold five-star rows | `index.html:251`; `challenge/rolling/index.html:249`, `:437`, `:443`, `:449`; `styles.css:455-460` | Remove the glyph rows. Real quotes carry trust. | 2, 3 |
| 9 | Gold gradient "⭐ הכי מומלץ" pill with glow, "הכי שווה" tag | `challenge/rolling/index.html:474`, `:415` | Remove. One offer card (#58). | 3 |
| 10 | Checkmark confetti: ✓ pills, ✓ rows, "✓ · ✓ · ✓" strings | `index.html:165-168`; `challenge/rolling/index.html:199`, `:257-263`, `:487`, `:490-493` | One `i-check` list only in "what you get". Chips become plain text (U26). | 2, 3 |
| 11 | Hero with 6 stacked elements (tag, 2 part title, sub, 2 CTAs, stars, trust row) | `challenge/rolling/index.html:227-265` | Max 4: title, one sentence, one button, one quiet link. | 3 |
| 12 | Decorative dots, one of them pulsing forever | `challenge/rolling/index.html:108-115`; `tummy-time/index.html:45-57` | Remove. | 3, 4 |
| 13 | Two part hero title: bold line, dash, light second line | `challenge/rolling/index.html:232-235`; `tummy-time/index.html:99-102` | One heading plus a lead line (U25). | 3, 4 |
| 14 | "Reveal on scroll" on about 20 elements with delay 1 to 4 | `styles.css:372-387`, e.g. `challenge/rolling/index.html:343-355`, `:436-448` | Reveal only the first element of a section, 12px rise. | 1, 2 to 4 |
| 15 | Hover lift on things you cannot click | `challenge/rolling/index.html:46-49`, `styles.css:451-454`, `index.html:66-69` | Hover states only on links and buttons. | 1, 2, 3 |
| 16 | Pastel rainbow: mint, pink, sky, gold next to peach | `styles.css:10-13`, `challenge/rolling/index.html:363`, `:503`, `thank-you.html:92` | Cream, paper and peach only. | 1, 3, 4 |
| 17 | Callout box with a colored side bar | `challenge/rolling/index.html:363`, `thank-you.html:92` | Plain peach box or a bold first sentence. | 3, 4 |
| 18 | 9 radii and 17 shadows, all inline | e.g. `challenge/rolling/index.html:280`, `:300`, `:382`, `:474`; `index.html:203`, `:293` | Token radii and 2 shadows (section 3). | 1, then all |
| 19 | Frosted glass nav bar | `styles.css:94-102`, `app/app.css:80-91` | Solid cream with a hairline. Blur costs frames on cheap phones. | 1, 5 |
| 20 | Text arrows "←" on almost every button | `index.html:257`, `:275`; `challenge/rolling/index.html:215`, `:242`, `:496`, `:520`; `thank-you.html:107`, `:188`; `tummy-time/index.html:116`, `:175` | Sprite chevron, only on links that go somewhere. | 2, 3, 4 |
| 21 | Many CTAs with the same intent | Sales page: "לרכישה" (`:215`), "רכישה וגישה מיידית" (`:242`), sticky "לרכישה" (`:579`), "שלמי וקבלי גישה מיידית" (`:496`); `404.html:75-87` has 4 buttons | One label per intent per page. 404 keeps 2 buttons. | 3, 4 |
| 22 | Stock headings: "בחרי את הקורס שלך" with one live course, "חוויות מהשטח" ("from the field"), a question eyebrow over a question heading | `index.html:232`; `challenge/rolling/index.html:430`, `:336-337` | Plain names ("הקורסים", "מה אמהות כתבו לי"). Yarden approves the wording. | 2, 3 |
| 23 | Numbered circles for items that are not steps | `challenge/rolling/index.html:384-417` (`.feature-num`) | Type icons in the syllabus (family C). Keep numbers only for real steps (thank-you). | 3 |
| 24 | Multicolor confetti incl. gold, plus a pop animation | `thank-you.html:236-255`, `:18-27`; `styles.css:509-521` | The check and arc draw (moment 4). | 4 |
| 25 | Generic spinner as the loading state | `app/course.html:26`, `app/my-courses.html:23` | Skeleton rows in the shape of the list. | 5, 6 |
| 26 | Centered footer with a round logo, title, tagline and 4 boxed pills | `styles.css:175-226`, same markup on 5 pages | Compact start aligned footer (spec in WP1). Drop Linktree, it only links back to her. | 1, then 2 to 4 |
| 27 | Em dashes in UI copy | 25 in marketing pages (e.g. `index.html:213`, `challenge/rolling/index.html:233`, `:238`), 5 in app pages, one in each `<title>` | Comma, colon or two sentences. | 2 to 7 |
| 28 | Scroll listeners for the sticky bar and a nav progress bar | `challenge/rolling/index.html:631-663`, `:204` | `IntersectionObserver` on the hero; drop the progress bar. | 3 |
| 29 | JS smooth scroll with its own easing | `challenge/rolling/index.html:593-629` | CSS `scroll-behavior: smooth` (off under reduced motion) and `scroll-margin-top`. | 1, 3 |

---

## 8. Features worth adding (no new facts needed)

All of these use data that already exists and fit static HTML plus vanilla JS.

1. **Custom teaser frame** (sales page). Poster, custom play button, duration label, native
   controls only after play, `max-height: 80vh` on desktop. About 30 lines of JS.
2. **Real syllabus on the sales page.** The 18 lesson names already exist in
   `scripts/course-data.js`. Show them in 3 groups ("10 סרטוני הדרכה", "6 טיפי זהב", "בונוס
   ונספח") with type icons. A small Vitest can check the page lists the same titles as the data.
3. **"Inside the course" on home.** Two real screenshots of the app (course page and lesson page
   at 390px, taken with the tester and Firestore writes blocked), in a plain rounded frame, with
   one line: "כל השיעורים במקום אחד, בקצב שלך". Real screenshots, not fake UI built from divs.
4. **Grouped course overview** (app, L8). Group rows by type without a reseed: videos are
   `kind: "video"` in order 1 to 10, tips are `kind: "image"`, and the rest are extras. A pure
   helper `app/course-sections.js` with tests does this. Each row: type icon, title, state.
   The current lesson row is peach with the word "כאן עצרת".
5. **Step bar progress** (app). 18 small equal segments instead of one thin bar. It is the brand
   idea made visible: small steps. On the lesson page a compact version sits under the title
   with "שיעור 3 מתוך 18" (L9).
6. **Up next** (lesson page). Move prev and next right under the done button (L9). After the
   video ends or reaches 90%, a bottom bar slides up with the next lesson's icon and title and one
   button. On the last lesson it says what is left, or links to the course (L10).
7. **Lesson done moment and finish card** (signature moments 2 and 3).
8. **Skeleton loading** for the course list and lesson rows, in the final shape.
9. **Login polish** (U23): "נכנסת..." state, a show or hide password button (the auth action page
   already has one to copy), `dir="ltr"` email field.
10. **Optional, P3:** a Picture in Picture button on the lesson video where the browser supports
    it (`video.requestPictureInPicture`), so a mother can scroll to the feedback card while she
    watches. Skip on iOS Safari if it fails.

---

## 9. Work packages

Rules for all packages:

- Each package owns only the files and regions listed. If you need a change outside them, write
  it in your PR description for the owner; do not edit it.
- Use the token and class names in WP1 even before it merges. Merge order: WP1 first, then 2 to 7
  in any order, then WP8.
- Keep every `data-price` tag, every element id used by page scripts, and the public helper
  functions that tests import. `npm test` must pass.
- The rolling page has open content drafts (#35, #43, #58). WP3 starts after they are merged or
  closed, or rebases on them. Copy changes that need Yarden go in the PR as a question, not a
  silent edit.
- Branch from `origin/master`, one PR per package, labels `backlog: ui/ux` plus the area label.

**Common acceptance checks** (every package, for the pages it owns):

1. Screenshots at 390x844 and 1280x800, full page, attached to the PR. App pages: log in as the
   tester and block Firestore writes with `context.route(/Firestore\/Write/, r => r.abort())`.
2. axe color-contrast: 0 violations. Inject `https://cdn.jsdelivr.net/npm/axe-core@4/axe.min.js`
   with `page.addScriptTag`, then `axe.run({ runOnly: ["color-contrast"] })`.
3. Reduced motion: a context with `reducedMotion: "reduce"` shows all content, and
   `document.getAnimations().length === 0` after load.
4. No layout shift: CLS under 0.05 from a `PerformanceObserver` on `layout-shift`. Images have
   `width` and `height`.
5. `npm test` passes.
6. Grep of the owned files: no em or en dashes in visible copy, no emoji outside quoted
   testimonials, no `letter-spacing` on Hebrew, no `window.addEventListener("scroll"`.

### WP1. Foundations (tokens, icons, stills, shared CSS)

- **Goal:** one source of tokens and shared styles, the icon sprite and the stills, plus the
  global quick wins that need no HTML change.
- **Owns:** new `assets/css/tokens.css`; `styles.css` (whole file); `site.js` (whole file); new
  `assets/icons/sprite.svg`; new `assets/stills/*`; in `app/app.css` only the header comment and
  the `:root` block (lines 1 to 20).
- **Tokens (agreed names, others may use them now):** `--c-cream --c-paper --c-peach --c-brown
  --c-brown-hover --c-ink --c-ink-soft --c-ink-muted --c-line --c-done --c-error`;
  `--fs-display --fs-h2 --fs-h3 --fs-lead --fs-body --fs-small --fs-label --measure`;
  `--s-1` to `--s-9 --section-y`; `--r-sm --r-md --r-lg --r-xl`; `--shadow-1 --shadow-2`;
  `--ease-out --ease-in-out --dur-press --dur-state --dur-enter --dur-draw --rise`.
  Keep the old `--brand-*`, `--text-*` and `--app-*` names as aliases.
- **Shared classes to add in `styles.css`:** `.t-display .t-h2 .t-h3 .t-lead .t-small`,
  `.section .container .stack`, `.btn .btn--primary .btn--quiet`, `.card`, `.icon .icon--dir`,
  `.site-nav` (solid cream), `.site-footer` (compact, start aligned). Put the canonical nav and
  footer markup in a comment at the top of the nav and footer sections of `styles.css`.
- **Quick wins in CSS and JS only:** remove ripple and pulse behavior, hide `.section-divider`,
  shrink reveal to `--rise`, fix footer contrast (U18), body `background: var(--c-cream)`,
  `color-scheme: light`, CSS smooth scroll behind `prefers-reduced-motion: no-preference`.
  Keep old class names working (mark them `/* deprecated, WP8 removes */`).
- **Sprite:** the icon list in section 6, from Tabler Icons, stroke 1.5.
- **Stills:** 4 frames from `assets/videos/rolling-teaser.mp4` with ffmpeg, 720px wide, JPEG and
  WebP, frames that show Yarden or the baby clearly and no text overlay.
- **Depends on:** nothing. Blocks the merge of all others.
- **Accept:** common checks on all 5 marketing pages (they must look the same or better, not
  broken); the reduced motion block and `.js` gate still work.

### WP2. Home page

- **Goal:** a home page that shows Yarden and the course, not a template hero.
- **Owns:** `index.html` (whole file: head, its `<style>` block, all body sections); new
  `assets/shots/*` (app screenshots).
- **Do:** split hero with `about.jpg` in a 4:5 frame and one button to the rolling course; a
  short text column about her approach (existing copy); the "Inside the course" section with two
  real app screenshots; the courses as one wide rolling card plus a quiet tummy time line;
  the WP1 footer markup. Remove blobs, eyebrows, dividers, stars, check pills, text arrows.
  Fix the photo crop (U27). Chips become plain text (U26). Body text at least 16px (U22).
- **Depends on:** WP1 names. Retake the screenshots after WP6 and WP7 merge (a follow up
  commit is fine).
- **Accept:** common checks; the button to the course is inside the first screen at 390x844;
  at least 3 section families and no family twice in a row.

### WP3. Rolling sales page

- **Goal:** the main sales page in the new direction, with the teaser as the hero asset.
- **Owns:** `challenge/rolling/index.html` (whole file); new `tests/sales-syllabus.test.js`.
- **Do:** hero with max 4 elements; custom teaser frame (moment 1, U28); "is this you" as a short
  list; about split; the real syllabus in 3 groups with sprite icons (a test checks titles match
  `scripts/course-data.js`); testimonials as message bubbles, no stars; one offer card per #58;
  one label per intent; sticky bar and nav with `IntersectionObserver`, no scroll listeners;
  remove the proof bar pattern, pulse, gold pill, emoji tiles, dots, dividers, eyebrows,
  mint boxes. Fix the hero title wrap (U25) and small text (U22).
- **Depends on:** WP1 names; drafts #35, #43 and #58 merged or closed first. Ask Yarden before
  changing any sentence of her copy; headings may be proposed in the PR.
- **Accept:** common checks; the teaser play button is inside the first screen on desktop and
  the second on phones; the syllabus test passes; every `₪` amount is tagged.

### WP4. Thank-you, tummy time and 404

- **Goal:** the three small pages follow the direction and lose the loud parts.
- **Owns:** `challenge/rolling/thank-you.html`, `challenge/tummy-time/index.html`, `404.html`
  (each whole file).
- **Do:** thank-you: the check and arc draw (moment 4) instead of confetti and pop; the email
  step first and the login button after the steps (U24); spam tip once; logo links to `/`;
  fix the `(Promotions).` bidi bug with `<bdi>`; brand WhatsApp button. Tummy time: one heading,
  no pulsing dot, the three topics as a short list with no emoji, remove the nav "back" button
  (U21). 404: one still from `assets/stills/` instead of the faded "404", 2 buttons, not 4.
- **Depends on:** WP1 names and stills.
- **Accept:** common checks; tummy time nav has no overlap at 320px and 360px; confetti code is
  gone from the thank-you page.

### WP5. App shell, login, password page, my courses

- **Goal:** the app looks like the same brand as the site, and its forms feel solid.
- **Owns:** `app/app.css` from line 21 to the end; `app/app-shell.js`; `app/login.html`;
  `app/auth-action.html`; `app/my-courses.html`; `app/course-list.js`; `app/auth-errors.js`.
- **Do:** solid cream header, token radii and shadows on `.app-card .app-row .app-btn
  .app-btn-outline .app-input` (keep these class names, WP6 and WP7 use them); add
  `.app-skeleton` for loading rows; login loading state and show or hide password (U23);
  `dir="ltr"` on email inputs; skeleton instead of spinner on my courses; em dashes out of
  titles; `color-scheme: light`.
- **Depends on:** WP1 token block in `app/app.css`.
- **Accept:** common checks on login, auth-action (open it with no params) and my courses
  (`?all=1`); `tests/app-shell.test.js` and `tests/auth-errors.test.js` pass.

### WP6. Course overview page

- **Goal:** a course page that shows the shape of the course and where she is.
- **Owns:** `app/course.html`; `app/course-progress.js`; new `app/course-sections.js`; new
  `app/course.css`; new `tests/course-sections.test.js`; `tests/course-progress.test.js`.
- **Do:** header with the course cover (teaser poster, 4:5) and title; the step bar (18 segments,
  fills once on load, 360ms); the continue button; lessons grouped into 3 sections by the pure
  helper (no reseed); rows with type icons from the sprite, a green `--c-done` check for done,
  a peach "כאן עצרת" row for the current lesson; skeleton rows while loading; keep building DOM
  with `textContent` and `setAttribute`, never `innerHTML`.
- **Depends on:** WP1 tokens and sprite; WP5 class names (stable).
- **Accept:** common checks with the tester (0 done, so the first row is current); unit tests
  for grouping (videos, tips, extras, unknown kind) pass; the page is at most 1.5 screens at
  390px thanks to the groups.

### WP7. Lesson page and the done moment

- **Goal:** the lesson page puts the next step in reach and makes "done" feel good.
- **Owns:** `app/lesson.html`; `app/lesson-extras.js` (keep `whatsAppUrl` and the exported
  names, `course-progress.js` imports them); `app/lesson-nav.js`; `app/lesson-progress.js`; new
  `app/lesson.css`; new `app/lesson-moment.js`; their tests in `tests/`.
- **Do:** "שיעור 3 מתוך 18" with the compact step bar under the title (L9); prev and next under
  the done button, above the feedback card (L9); the done moment (moment 2); the up next bar
  after the end or at 90%; the last lesson shows what is left (L10); the finish card with the
  arc and portrait (moment 3), no emoji; sprite icons in the buttons. Keep the 90% rule and the
  manual toggle logic unchanged.
- **Depends on:** WP1 tokens and sprite; WP5 class names.
- **Accept:** common checks on a video lesson and an image tip, with Firestore writes blocked;
  under reduced motion the done state appears at once; the next button is inside the first
  screen at 390x844; lesson tests pass.

### WP8. Cleanup and QA (last)

- **Goal:** remove what is no longer used and prove the whole site passes.
- **Owns:** `styles.css` deprecated rules only (after WP2 to WP4 merge); `docs/TODO.md` (remove
  the items that are done: U18, U21 to U28, L8 to L10, parts of U6); a new QA script in the job's
  tmp folder, not in the repo.
- **Do:** delete `.btn-pulse`, `.ripple-circle`, `.confetti-piece`, `.star-row`,
  `.section-divider`, `.reveal-delay-*`, `.icon-wrap` and the mint, pink and blue variables once
  a grep shows no use; run the common checks on all 10 pages; list anything left as new TODO
  items.
- **Depends on:** WP1 to WP7 merged.
- **Accept:** grep shows no deprecated class in any page; common checks pass on every page;
  `npm test` passes.
