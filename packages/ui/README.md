# @babysteps/ui

The "Warm Nest" design system for מתחילים בקטן. React components, tokens and fonts.
Hebrew and RTL first.

## Commands (run from the repo root)

| Command | What it does |
| --- | --- |
| `npm run ui:storybook` | Storybook on http://localhost:6006 |
| `npm run ui:build` | Builds `packages/ui/dist/` (JS, `styles.css` with the fonts inlined, `.d.ts`) |
| `npm test` | Root tests, then this package's tests |

## Using it

```tsx
import '@babysteps/ui/styles.css';
import { BsRoot, Hero, Button } from '@babysteps/ui';

export function Page() {
  return (
    <BsRoot>
      <Hero title="שלום" actions={<Button>להתחלה</Button>} />
    </BsRoot>
  );
}
```

- Always wrap pages in `BsRoot`. It sets RTL, Hebrew, the fonts and the base colors.
- Build pages from `Section` (sets the background `tone`) and `SectionHeading`.
- For your own layout glue, use the tokens: `var(--space-5)`, `var(--radius-lg)`,
  `var(--surface-mint)`. Never raw colors. The full list is in `src/tokens.css`.
- Wrap `LessonListItem` rows in `<ol className="bs-lesson-list">`.
- A fixed `StickyCTA` shows on phones only. Give the page about 96px of bottom padding.

## Adding a component

1. `src/components/<Name>/` with `<Name>.tsx`, `<Name>.css`, `<Name>.stories.tsx`,
   and `<Name>.test.tsx` when it has behavior.
2. Classes are `bs-<name>`, BEM style. CSS reads only tokens. Logical properties only.
3. Add the CSS `@import` to `src/styles.css` and the export to `src/index.ts`.
