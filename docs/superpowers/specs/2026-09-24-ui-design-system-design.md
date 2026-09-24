# UI design system (`@babysteps/ui`): design

Date: 2026-09-24
Status: approved in brainstorming, waiting for written-spec review

## 1. Goal

Build a real, polished React component library for "מתחילים בקטן" and sync it to
Claude Design (claude.ai/design). Then new landing pages and course app screens can be
designed there with the real components.

The current site is a rough sketch. It is offline, so nothing has to stay compatible
with it. This round sets a new, refined look.

### Order of work (agreed)

1. **This spec:** build the library, add a Storybook, sync it to Claude Design.
2. **Next phase:** design the new landing pages and app screens in Claude Design and get
   Yarden's feedback.
3. **Later phase:** rebuild the real site in React from those designs, importing this
   package. This is not part of this spec.

### Success criteria

- Claude Design can build a challenge landing page and a student app screen using only
  these components and tokens, and the result looks finished.
- Every component has Storybook stories that show all its variants with real Hebrew copy.
- design-sync completes and every uploaded component preview matches its Storybook
  render.
- The future React site can import `@babysteps/ui` with no changes to the library.

## 2. Brand direction: "Warm Nest"

Chosen from three directions. It is the current brand, grown up: cream and cocoa brown,
soft peach, a terracotta accent, very round shapes, soft deep shadows, a rounded heading
font. Warm, safe, trustworthy.

## 3. Tokens (`tokens.css`)

All components use only these CSS variables. No raw hex values inside component CSS.

### Colors

| Token | Value | Use |
| --- | --- | --- |
| `--color-ink` | `#3b2213` | main text |
| `--color-ink-soft` | `#6b4a36` | secondary text |
| `--color-ink-muted` | `#8a6a55` | captions, hints |
| `--color-brand-700` | `#5b3320` | headings, hover of brand |
| `--color-brand-600` | `#704229` | brand, primary buttons |
| `--color-brand-500` | `#8a5438` | lighter brand |
| `--color-accent` | `#e07a5f` | terracotta highlights, badges |
| `--color-whatsapp` | `#25d366` | WhatsApp button |
| `--color-success` | `#2f9e6b` | done, success alerts |
| `--color-warning` | `#e3a008` | warning alerts |
| `--color-error` | `#d14343` | errors |
| `--color-on-brand` | `#ffffff` | text on brand and cocoa |

### Surfaces

| Token | Value | Use |
| --- | --- | --- |
| `--surface-cream` | `#fdf6f0` | page background |
| `--surface-card` | `#ffffff` | cards |
| `--surface-peach` | `#fce1cc` | section tone |
| `--surface-mint` | `#e8f3ef` | section tone |
| `--surface-sky` | `#e3f2fd` | section tone |
| `--surface-blush` | `#fdf2f8` | section tone |
| `--surface-cocoa` | `#5b3320` | footer, dark section |

### Type

- Headings: **Varela Round**. Body: **Rubik** (400, 500, 700). Both support Hebrew.
- Sizes: `--text-display` 44px, `--text-h2` 32px, `--text-h3` 22px, `--text-lead` 18px,
  `--text-body` 16px, `--text-caption` 13px. Display and h2 shrink on mobile through
  `clamp()`.
- Body line height 1.7, headings 1.15.

### Shape, shadow, spacing, motion

- Radius: `--radius-sm` 8px, `--radius-md` 14px, `--radius-lg` 22px, `--radius-xl` 32px,
  `--radius-pill` 999px.
- Shadows (brown tinted): `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-brand`
  (values as shown in the brainstorm token sheet: `0 2px 8px`, `0 10px 30px`,
  `0 22px 50px` of `rgba(91,51,32, .08/.12/.18)`, and `0 8px 20px rgba(112,66,41,.30)`).
- Spacing on a 4px grid: `--space-1` 4px up to `--space-9` 96px
  (4, 8, 12, 16, 24, 32, 48, 64, 96).
- Motion: `--ease-soft`, `--duration-fast` 150ms, `--duration-base` 250ms. Gentle hover
  lift on cards and buttons. All motion is off under `prefers-reduced-motion`.
- Light theme only.

## 4. Components (30)

Every component is RTL-first and uses CSS logical properties.

### Base (8)

| Component | Key props |
| --- | --- |
| `Button` | `variant`: primary, outline, ghost, whatsapp. `size`: sm, md, lg. `icon`, `fullWidth`, `loading`, `href` (renders a link) |
| `Badge` | `variant`: tag, pill, highlight |
| `Card` | `padding`, `hoverLift`, `as` |
| `Icon` | `name` from a built-in set of inline SVGs: play, check, star, lock, arrow, whatsapp, clock, heart, baby, chevron, menu, close, user, logout. `size` |
| `Avatar` | `src` or `name` (initials), `size` |
| `StarRating` | `value` (0 to 5), `size` |
| `Spinner` | `size`, `label` (for screen readers) |
| `Divider` | `variant`: line, wave. `tone` (the color the wave flows into) |

### Layout (5)

| Component | Key props |
| --- | --- |
| `Container` | `width`: narrow, base, wide |
| `Section` | `tone`: cream, white, peach, mint, sky, blush, cocoa. `id`, `padding` |
| `SectionHeading` | `eyebrow`, `title`, `lead`, `align` |
| `SiteNav` | `logo`, `links`, `cta`; mobile menu with open and close |
| `Footer` | `logo`, `links`, `social`, `note` |

### Landing pages (11)

| Component | Key props |
| --- | --- |
| `Hero` | `tag`, `title`, `subtitle`, `actions`, `media` slot, decorative background shapes |
| `FeatureSteps` | `steps`: list of `{ title, text }`, shown as numbered rows |
| `ProblemCard` | `icon`, `title`, `text` |
| `TestimonialCard` | `quote`, `name`, `detail`, `avatar`, `rating` |
| `PriceCard` | `title`, `price`, `oldPrice`, `features`, `cta`, `featured`, `badge` |
| `CourseCard` | `title`, `description`, `image`, `meta` (lessons, duration), `cta` |
| `CredentialPill` | `icon`, `text` |
| `HighlightBox` | `tone`, `title`, children |
| `VideoFrame` | `poster`, `onPlay`, `label`, `aspect` |
| `FAQ` | `items`: list of `{ question, answer }`; one open at a time |
| `StickyCTA` | `text`, `action`; shows as a bottom bar on mobile |

### Course app (6)

| Component | Key props |
| --- | --- |
| `AppHeader` | `logo`, `userName`, `onSignOut` |
| `TextField` | `label`, `type` (text, email, password), `hint`, `error`, standard input props |
| `Alert` | `variant`: success, error, info. `title`, children |
| `ProgressBar` | `value` (0 to 100), `label` |
| `CourseProgressCard` | `title`, `image`, `progress`, `lessonsDone`, `lessonsTotal`, `href` |
| `LessonListItem` | `title`, `duration`, `state`: done, current, locked. `href` |

### Out of scope for this round

Countdown timer, checkout form (PayPal handles checkout), dark mode, admin screens,
porting the live pages.

## 5. Package structure

```
packages/ui/
  package.json          name @babysteps/ui, React as peer dependency
  tsconfig.json
  vite.config.ts        library mode
  src/
    index.ts            exports every component
    tokens.css          section 3
    base.css            fonts, reset for .bs-root, RTL defaults
    styles.css          imports tokens, base and every component CSS
    components/<Name>/
      <Name>.tsx
      <Name>.css
      <Name>.stories.tsx
      <Name>.test.tsx   only where there is real behavior
  .storybook/
    main.ts, preview.tsx
  dist/                 build output (gitignored)
```

- The root `package.json` gets `"workspaces": ["packages/*"]`.
- The root app (`api/`, `lib/`, `scripts/`, `tests/`) does not change.
- Components are TypeScript. The rest of the repo stays JS.

## 6. Styling rules

- Plain CSS, one file per component, classes prefixed `bs-` in BEM style:
  `bs-button`, `bs-button--outline`, `bs-button__icon`.
- Component CSS reads only tokens.
- A `BsRoot` wrapper (exported) sets `dir="rtl"`, `lang="he"`, the fonts and the base
  text color. Pages and stories wrap in it.
- No Tailwind, no CSS modules, no CSS-in-JS.
- Hover lifts and scroll fades respect `prefers-reduced-motion`.

## 7. Fonts

Self-hosted through `@fontsource/rubik` and `@fontsource/varela-round`, imported in
`base.css`. Hebrew and Latin subsets only. The font files ship in `dist/`.

## 8. Build

- Vite library mode, ESM output: `dist/index.js`, `dist/styles.css`, font files.
- Types: `tsc --emitDeclarationOnly` into `dist/`.
- Scripts in `packages/ui`: `build`, `storybook`, `build-storybook`, `test`.

## 9. Storybook

- Storybook with the React + Vite framework.
- A global decorator wraps every story in `BsRoot` on a cream background.
- One story file per component. Each variant is its own named story.
- Copy is real Hebrew, taken from the current landing pages and course app.
- Images: a few photos copied from `assets/` into the Storybook static folder.

## 10. Testing

- Vitest + Testing Library + jsdom, inside `packages/ui`.
- Tests cover real behavior only:
  - `FAQ`: opening one item closes the other; keyboard and `aria-expanded`.
  - `Button`: `loading` disables clicks and sets `aria-busy`; `href` renders a link.
  - `LessonListItem`: `locked` is not a link and is marked as locked.
  - `TextField`: `error` and `hint` are linked through `aria-describedby`;
    `aria-invalid` is set on error.
  - `SiteNav`: the mobile menu opens and closes.
- The root `npm test` keeps running the existing 19+ tests and also runs the package
  tests.

## 11. Sync to Claude Design

- Run the design-sync skill in Storybook shape, config at `.design-sync/config.json`
  with `storybookConfigDir: packages/ui/.storybook`.
- Target: a new Claude Design project, proposed name "מתחילים בקטן · Warm Nest".
- design-sync checks each preview against its Storybook render and uploads components
  as they pass.
- A conventions file (`.design-sync/conventions.md`) tells the design agent: wrap in
  `BsRoot`, use `var(--*)` tokens for layout glue, build pages from `Section` and
  `SectionHeading`, and never add raw colors.

## 12. Risks

- **Vercel deploy:** the root is served as static files, so `packages/ui/` source would
  be public. It holds no secrets, so this is accepted for now. The later React phase
  replaces the deploy setup anyway.
- **Hebrew in Varela Round:** it supports Hebrew, but its Hebrew weights are limited
  (one weight). Headings use that weight only.
