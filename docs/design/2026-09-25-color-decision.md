# Color decision: site vs design system (backlog U7)

Date: 2026-09-25. Status: waiting for Yarden.

## Why this doc

The site has two sets of colors. They look almost the same, but they are not the
same numbers:

1. **The live site.** The marketing pages (`index.html`, `challenge/**`) use the
   variables in `styles.css`, plus some colors typed straight into the page. The
   course area (`app/*.html`) types its colors as Tailwind classes, and uses gray
   and green from Tailwind.
2. **The design system** (`packages/ui/src/tokens.css`, "Warm Nest"). It will be
   the base when the site is rebuilt later.

We want one set. This doc lists every value, checks if the text is easy to read,
and gives one recommended choice per row. To see the colors, open
`docs/design/color-decision.html` in a browser, or look at
`docs/design/color-decision.png`.

## What is in use today

Counts are how many times the value appears in the page files.

**`styles.css` variables** (marketing pages, used through `var(...)`):

| Variable | Value | Uses in pages |
| --- | --- | --- |
| `--brand-brown` | `#704229` | 60 |
| `--brand-brown-light` | `#8a5438` | button hover (in `styles.css`) |
| `--brand-peach` | `#FCE7D6` | 15 |
| `--brand-peach-dark` | `#f5c9a7` | 4 |
| `--brand-mint` | `#E8F3EF` | 6 |
| `--brand-mint-dark` | `#c8e3da` | 4 |
| `--brand-pink` | `#FDF2F8` | 1 |
| `--brand-blue` | `#E3F2FD` | classes only |
| `--text-dark` | `#2d1a0e` | 30 |
| `--text-mid` | `#5a3820` | 30 |

**Colors typed into the marketing pages** (not variables):

| Value | Uses | Where |
| --- | --- | --- |
| `#fff` | 50 | white cards and text on brown |
| `#7a5a48` | 17 | small gray-brown text (card text) |
| `#f5a623` | 4 | gold stars and small accents |
| `#e8920e` | 1 | darker gold |
| `#888` | 1 | one gray background |
| `#704229`, `#fce7d6`, `#e8f3ef`, `#c8e3da`, `#f5c9a7` | 1 each | `thank-you.html` repeats the variables by hand |

**Course area (`app/*.html`, Tailwind classes):**

| Class | Color | Uses |
| --- | --- | --- |
| `bg-[#fdf6f0]` | `#fdf6f0` cream page | 4 (every page) |
| `text-[#704229]`, `bg-[#704229]` | `#704229` brown | 13 |
| `bg-white` | `#ffffff` cards | 7 |
| `text-gray-600` | `#4b5563` gray | 3 |
| `text-gray-500` | `#6b7280` gray | 1 |
| `bg-gray-200` | `#e5e7eb` gray | 1 (lesson not done) |
| `bg-green-500` | `#22c55e` green | 1 (lesson done badge) |
| `text-green-700` | `#15803d` green | 1 (password reset sent) |
| `text-red-600` | `#dc2626` red | 5 (error messages) |
| `bg-black` | `#000000` | 1 (video frame) |
| `rounded-lg / xl / 2xl / full` | 8 / 12 / 16px / circle | 3 / 4 / 4 / 1 |

**Corners (radius) on the marketing pages and `styles.css`:** 6px (26 uses, buttons and small
boxes), 16px (8), 20px (6), 10px (4), 12px (4), 2 to 4px (6), 8px (1), 14px (1),
circles 50% (26).

**Fonts:** every page loads only **Rubik** from Google Fonts. The design system
uses **Varela Round** for headings and Rubik for body text.

**Design system (`tokens.css`):** ink `#3b2213`, ink-soft `#6b4a36`,
ink-muted `#7e614e`, brand `#5b3320 / #704229 / #8a5438`, accent `#e07a5f`,
success `#2f9e6b`, warning `#e3a008`, error `#d14343`, cream `#fdf6f0`,
card `#ffffff`, peach `#fce1cc`, mint `#e8f3ef`, sky `#e3f2fd`, blush `#fdf2f8`,
radius 8 / 14 / 22 / 32px and pill.

## Site vs design system, per role

Contrast is the WCAG ratio of the text color on its usual background. Normal text
needs **4.5** or more (AA). Large text, icons and badges need **3** or more.

| Role | Site value | Design system value | Contrast (site / system) | Recommendation |
| --- | --- | --- | --- | --- |
| Brand brown | `#704229` | `#704229` (brand-600) | on white 8.40 / on cream 7.85 | **Same already.** Keep `#704229`. |
| Page background | white `#fff` (marketing), cream `#fdf6f0` (course area) | cream `#fdf6f0`, cards white | main text `#2d1a0e`: 16.59 on white / 15.50 on cream | **Cream page, white cards**, as the course area and system already do. Marketing sections that are white can stay white cards. |
| Peach surface | `#FCE7D6` | `#fce1cc` | brown text: 7.02 / 6.71 | **Keep the site's `#FCE7D6`.** Visitors know it and it reads a bit better. Change the system token. |
| Main text | `#2d1a0e` | `#3b2213` | 16.59 on white / 13.77 on cream | **Keep the site's `#2d1a0e`.** Both are far above 4.5. The site one is already live. |
| Soft text (second level) | `#5a3820` (`--text-mid`) | `#6b4a36` (ink-soft) | 10.39 on white / 7.38 on cream | **Keep the site's `#5a3820`.** It is used 30 times and reads better. |
| Muted text (small print) | `#7a5a48` (typed 17 times), course area uses gray `#4b5563` / `#6b7280` | `#7e614e` (ink-muted) | `#7a5a48`: 6.21 on white, 5.80 on cream, 5.18 on peach. `#7e614e`: 5.66 on white, **4.53 on peach**. Gray `#6b7280`: 4.52 on cream | **Use the site's `#7a5a48`** everywhere, also in the course area instead of gray. It passes with more room on peach. Gray looks cold next to the browns. |
| Success / done | `#22c55e` (green-500, white check on it) | `#2f9e6b` | white on green: **2.28 (fails)** / 3.37 (passes for a badge) | **Use the system's `#2f9e6b`.** The current badge fails. For green *text* (like "email sent"), keep a darker green such as `#15803d` (5.02). |
| Error | `#dc2626` (red-600) | `#d14343` | on white 4.83 / 4.57 | **Use the site's `#dc2626`.** It reads a bit better. Both pass. |
| Gold accent | `#f5a623` | coral `#e07a5f` (accent) | gold on white 2.03 | Keep gold for stars and icons only. **Never** use it for text. Not a decision now. |
| Corners (radius) | mixed: 6, 10, 12, 16, 20px | 8 / 14 / 22 / 32px | not a contrast item | **Use the system scale.** Map 6 to 8 (buttons), 10 to 12 to 14 (small cards), 16 to 20 to 22 (big cards). A little rounder and softer, and four sizes instead of nine. |
| Heading font | Rubik (bold) | Varela Round | not a contrast item | **Keep Rubik.** Visitors know it, it has bold weights (Varela Round has only one weight), and the page loads one font instead of two. |

## Questions for Yarden

1. **Peach:** keep the light peach you have today (`#FCE7D6`), not the slightly
   stronger one (`#fce1cc`)? *Recommended: yes, keep today's peach.*
2. **Heading font:** keep Rubik for headings, or switch to the rounder
   Varela Round? *Recommended: keep Rubik.*
3. **Small text in the course area:** change the gray text to the same soft
   brown as the marketing pages (`#7a5a48`)? *Recommended: yes.*
4. **"Done" badge:** use a slightly deeper green (`#2f9e6b`) so the white check
   mark is easy to see? *Recommended: yes.*
5. **Corners:** make boxes and buttons a little rounder, with one fixed set of
   sizes? *Recommended: yes.*

## After Yarden answers

- Update `packages/ui/src/tokens.css` to the chosen values (peach, ink, ink-soft,
  ink-muted, error, and the heading font if Rubik wins).
- Separate small tasks for the live pages: add `--text-muted: #7a5a48` to
  `styles.css` and use it instead of the 17 typed values, and swap the Tailwind
  gray and green in `app/*.html`.
