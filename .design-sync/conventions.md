# מתחילים בקטן · Warm Nest: how to build with this library

Hebrew, right-to-left design system for a baby-development coach: landing pages that sell
courses, and a student app (login, my courses, lesson player). Warm, calm and round:
cream page, cocoa brown brand, soft pastel sections, terracotta accent.

## 1. Always wrap the screen in `BsRoot`

`BsRoot` sets `dir="rtl"`, `lang="he"`, the Rubik and Varela Round fonts, the ink color and
the cream background. Without it text runs left-to-right and components lose their fonts
and colors. Wrap once, at the top.

```jsx
const { BsRoot, Hero, Button } = window.BabyStepsUI;
<BsRoot>{/* the whole page */}</BsRoot>
```

Write all copy in Hebrew. "Forward" arrows point left (`icon="arrow"`).

## 2. Page structure

- Landing page: `SiteNav`, then `Hero`, then a stack of `Section` blocks, then `Footer`.
  Add `StickyCTA` (phones only) with about 96px of bottom padding on the page.
- Every `Section` takes `tone`: `cream`, `white`, `peach`, `mint`, `sky`, `blush` or
  `cocoa` (dark: its heading and lead turn white; cards inside stay light). Alternate tones
  between sections. Start each section with `SectionHeading` (`eyebrow`, `title`, `lead`).
- `Divider variant="wave" from="peach" tone="white"` makes a soft wave between two tones.
- Wrap words of a heading `title` in `<em>` for the terracotta highlight.
- App screens: `AppHeader` on top, content in `Container` (`narrow`, `base`, `wide`).
  Lessons go in `<ol className="bs-lesson-list">` with `LessonListItem` rows
  (`state`: `todo`, `current`, `done`, `locked`).
- Cards: `ProblemCard`, `TestimonialCard`, `PriceCard` (`featured` + `badge` for the
  recommended plan), `CourseCard`, `CourseProgressCard`. Buttons: `Button` with
  `variant` `primary`, `outline`, `ghost` or `whatsapp`; `href` makes it a link.

## 3. Styling: components first, tokens for glue

There are no utility classes. Style comes from component props. For your own layout glue
(grids, gaps, widths) use inline styles with the tokens only, never raw colors:

- Space: `var(--space-1)` 4px, `--space-2` 8, `--space-3` 12, `--space-4` 16,
  `--space-5` 24, `--space-6` 32, `--space-7` 48, `--space-8` 64, `--space-9` 96.
- Radius: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-pill`.
- Shadow: `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-brand`.
- Color: `--color-ink`, `--color-ink-soft`, `--color-ink-muted`, `--color-brand-500`,
  `--color-brand-600`, `--color-brand-700`, `--color-accent`, `--color-success`,
  `--color-warning`, `--color-error`, `--color-border`.
- Surfaces: `--surface-cream`, `--surface-card`, `--surface-peach`, `--surface-mint`,
  `--surface-sky`, `--surface-blush`, `--surface-cocoa`.
- Type: `--font-heading`, `--font-body`, `--text-display`, `--text-h2`, `--text-h3`,
  `--text-lead`, `--text-body`, `--text-caption`. Headings stay weight 400.

The full token list is in `styles.css` (it imports `_ds_bundle.css`). Each component's
props are in its `.d.ts`, usage in its `.prompt.md`.

## 4. Example

```jsx
<BsRoot>
  <Hero
    tag="קורס דיגיטלי · צפייה מיידית"
    title={<>לעזור לבייבי שלך <em>להתהפך</em>, בצורה רגועה</>}
    subtitle="תרגילים קצרים, ליווי אישי בווטסאפ ומעקב אחרי ההתקדמות."
    actions={<Button size="lg" icon="arrow" href="#register">רכישה וגישה מיידית</Button>}
  />
  <Section tone="white">
    <SectionHeading eyebrow="מזהה את עצמך?" title="האם זה המצב אצלכם כרגע?" />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-5)' }}>
      <ProblemCard emoji="🙆" title="התינוק לא מתהפך כלל" text="אתם מנסים, אבל הוא עדיין לא עושה את התנועה." />
      <ProblemCard emoji="🔄" title="מתהפך רק לפעמים" text="יש ניסיונות, אבל זה לא קורה בצורה עקבית." />
    </div>
  </Section>
</BsRoot>
```
