# `@babysteps/ui` Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished "Warm Nest" React component library (30 components, tokens, fonts, Storybook) in `packages/ui/` and sync it to Claude Design.

**Architecture:** A new npm workspace package `@babysteps/ui` next to the existing root app. Components are TypeScript React with plain `bs-`-prefixed CSS that reads only CSS variables from `tokens.css`. Vite library mode builds `dist/`; Storybook shows every variant; design-sync uploads it to a new Claude Design project.

**Tech Stack:** React 19, TypeScript 5.9, Vite 8 (library mode), Storybook 10 (`@storybook/react-vite`), Vitest 5 + Testing Library + jsdom, `@fontsource/rubik`, `@fontsource/varela-round`.

**Spec:** `docs/superpowers/specs/2026-09-24-ui-design-system-design.md`

## Global Constraints

- All UI is Hebrew and RTL. Use CSS logical properties (`margin-inline-start`, `inset-inline-end`, `padding-block`) in every component. Physical `left`/`right` only where centering needs it, with a comment.
- Component CSS uses only tokens from `tokens.css` (`var(--*)`). No raw hex or rgba values in component CSS. `color-mix()` over tokens is allowed.
- Every class is prefixed `bs-` in BEM style: `bs-block`, `bs-block__element`, `bs-block--modifier`.
- Headings use `--font-heading` (Varela Round) at weight 400 only. Varela Round has one weight; never set bold on headings.
- No Tailwind, no CSS modules, no CSS-in-JS. Inline `style` only for runtime values (a width percent, an aspect ratio, a tone color).
- Never build DOM from data with `innerHTML` / `dangerouslySetInnerHTML`.
- Story copy is real Hebrew. Do not use em dashes or en dashes in copy; use commas.
- All motion must stop under `prefers-reduced-motion: reduce` (the global rule in `base.css` does this; do not override it).
- React is a peer dependency (`>=18`). The package is `private: true` and never published.
- ESM only (`"type": "module"`).
- Commit messages: short, lowercase conventional style, e.g. `feat(ui): add Button, Badge and Card`. No attribution lines.

## Review Focus

1. **Out-of-range numbers** (`ProgressBar value={140}` or `NaN`, `StarRating value={7}`, `CourseProgressCard lessonsTotal={0}`): values are clamped, nothing shows `NaN` or `Infinity`. Tests in Tasks 2, 9 and 10.
2. **A loading `Button` with `href`**: it must not navigate and must not fire `onClick`. Test in Task 3.
3. **Mobile menu escape routes**: `Escape` and clicking a link both close the `SiteNav` menu. Test in Task 5.
4. **Missing optional images** (`CourseCard`, `Avatar`, `VideoFrame`, `CourseProgressCard` with no image): a clean fallback renders, never a broken `<img>`. Tests in Tasks 2, 7, 8.
5. **Long Hebrew text and long unbroken strings** (long testimonials, long course titles, a pasted URL): text wraps inside its card at 360px width, no horizontal scroll. Covered by `LongText` stories in Tasks 7 and 10 and the mobile visual pass in Task 11.

## Small Additions to the Spec

These fill gaps the spec left open. None changes an agreed decision.

- Token `--color-border` (`rgba(112, 66, 41, 0.14)`) for card, input and divider borders.
- Icons `instagram`, `sparkle` and `video` on top of the 14 named in the spec.
- `Divider` gets `from` (the tone behind the wave) next to `tone`.
- `Section` gets `width` (inner container width, or `none`).
- `Hero` gets `proof` (a social proof line under the actions).
- `Alert` gets a `warning` variant.
- `LessonListItem` uses `durationSec` instead of `duration`, to match Firestore.
- `StickyCTA` gets `position: 'static'` so it can be previewed on desktop.
- Root Vitest goes from 2 to 5, so the repo has one Vite version.

## File Structure

```
package.json                     (modify) workspaces, test script, vitest ^5
vitest.config.js                 (create) root tests only: tests/**/*.test.js
.gitignore                       (modify) packages/ui/dist, storybook-static
CLAUDE.md                        (modify, Task 11) document the package
packages/ui/
  package.json
  tsconfig.json                  typecheck config (src + .storybook)
  tsconfig.build.json            .d.ts emit into dist/
  vite.config.ts                 library build + vitest config
  README.md                      (Task 11)
  .storybook/
    main.ts
    preview.tsx
    preview.css
    public/                      about.jpg, logo-peach.png, rolling-teaser-poster.jpg
  src/
    index.ts                     public exports (grows each task)
    styles.css                   @imports tokens, base, every component CSS (grows each task)
    tokens.css
    base.css                     fonts, .bs-root reset, tone classes, helpers
    test-setup.ts
    utils/
      cx.ts                      class name joiner
      tone.ts                    SectionTone type, toneClass(), toneVar()
      number.ts                  clamp(), clampPercent()
      time.ts                    formatDuration()
      brand.ts                   BrandLogo, NavLink types
      number.test.ts
      time.test.ts
    foundations/
      BsRoot.tsx, BsRoot.test.tsx, Tokens.stories.tsx
    components/<Name>/
      <Name>.tsx, <Name>.css, <Name>.stories.tsx, [<Name>.test.tsx]
    examples/                    (Task 11) LandingPage.stories.tsx, MyCourses.stories.tsx
```

Every component task ends by adding its CSS `@import` lines to `src/styles.css` and its export lines to `src/index.ts`. Those two files are the only shared files that change after Task 1.

---

### Task 1: Package foundation (workspace, tokens, BsRoot, build, tests, Storybook)

**Files:**
- Modify: `package.json`, `.gitignore`
- Create: `vitest.config.js`
- Create: `packages/ui/package.json`, `packages/ui/tsconfig.json`, `packages/ui/tsconfig.build.json`, `packages/ui/vite.config.ts`
- Create: `packages/ui/src/{index.ts,styles.css,tokens.css,base.css,test-setup.ts}`
- Create: `packages/ui/src/utils/{cx.ts,tone.ts,number.ts,time.ts,brand.ts,number.test.ts,time.test.ts}`
- Create: `packages/ui/src/foundations/{BsRoot.tsx,BsRoot.test.tsx,Tokens.stories.tsx}`
- Create: `packages/ui/.storybook/{main.ts,preview.tsx,preview.css}` and `packages/ui/.storybook/public/*`

**Interfaces:**
- Produces:
  - `cx(...parts: Array<string | false | null | undefined>): string`
  - `type SectionTone = 'cream' | 'white' | 'peach' | 'mint' | 'sky' | 'blush' | 'cocoa'`
  - `toneClass(tone: SectionTone): string` returns `bs-tone--<tone>`
  - `toneVar(tone: SectionTone): string` returns `var(--surface-card)` for white, else `var(--surface-<tone>)`
  - `clamp(value: number, min: number, max: number): number` (non-finite returns `min`)
  - `clampPercent(value: number): number` (rounded, 0 to 100)
  - `formatDuration(sec?: number | null): string | null` (`65` gives `"1:05"`, `3725` gives `"1:02:05"`, invalid gives `null`)
  - `interface BrandLogo { src: string; alt: string; href?: string }`
  - `interface NavLink { label: ReactNode; href: string }`
  - `BsRoot(props: HTMLAttributes<HTMLDivElement>)` renders `<div dir="rtl" lang="he" class="bs-root">`
  - CSS: every token in `tokens.css`; tone classes `.bs-tone--<tone>` set `--bs-tone` (and on cocoa `--bs-tone-ink`, `--bs-heading`, `--bs-ink-soft`); `.bs-visually-hidden`.

- [ ] **Step 1: Upgrade root Vitest and restrict root test discovery**

The root uses Vitest 2 (needs Vite 5). The new package needs Vite 8. One Vitest across the repo avoids two Vite copies fighting in `node_modules`.

Create `vitest.config.js` at the repo root:

```js
import { defineConfig } from 'vitest/config';

// Root tests only. packages/ui runs its own Vitest with jsdom.
export default defineConfig({
  test: {
    include: ['tests/**/*.test.js'],
  },
});
```

Edit root `package.json` to:

```json
{
  "name": "babysteps-courses",
  "private": true,
  "type": "module",
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "test": "vitest run && npm test --workspace @babysteps/ui",
    "ui:storybook": "npm run storybook --workspace @babysteps/ui",
    "ui:build": "npm run build --workspace @babysteps/ui"
  },
  "dependencies": {
    "@aws-sdk/client-s3": "^3.600.0",
    "@aws-sdk/s3-request-presigner": "^3.600.0",
    "firebase-admin": "^12.1.0"
  },
  "devDependencies": {
    "vitest": "^5.0.1"
  }
}
```

The `test` script will fail until Step 3 creates the workspace. Check the root tests alone first:

Run: `npm install && npx vitest run`
Expected: all existing root tests PASS (`tests/*.test.js`). If any fail because of a Vitest 2 to 5 API change, fix the test file (not the code under test) and note it in the commit message.

- [ ] **Step 2: Ignore build output**

Append to `.gitignore`:

```
packages/ui/dist/
packages/ui/storybook-static/
```

- [ ] **Step 3: Create the package manifest and configs**

`packages/ui/package.json`:

```json
{
  "name": "@babysteps/ui",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "description": "Warm Nest design system for מתחילים בקטן",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./styles.css": "./dist/styles.css"
  },
  "sideEffects": [
    "**/*.css"
  ],
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "vite build && tsc -p tsconfig.build.json",
    "typecheck": "tsc -p tsconfig.json",
    "test": "vitest run",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  },
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18"
  },
  "dependencies": {
    "@fontsource/rubik": "^5.3.0",
    "@fontsource/varela-round": "^5.3.0"
  },
  "devDependencies": {
    "@storybook/addon-docs": "^10.6.0",
    "@storybook/react-vite": "^10.6.0",
    "@testing-library/jest-dom": "^7.0.1",
    "@testing-library/react": "^16.3.3",
    "@testing-library/user-event": "^14.6.7",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "@vitejs/plugin-react": "^6.1.1",
    "jsdom": "^30.1.1",
    "react": "^19.3.0",
    "react-dom": "^19.3.0",
    "storybook": "^10.6.0",
    "typescript": "~5.9.3",
    "vite": "^8.3.0",
    "vitest": "^5.0.1"
  }
}
```

`packages/ui/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["src", ".storybook/**/*", "vite.config.ts"]
}
```

`packages/ui/tsconfig.build.json`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "declaration": true,
    "emitDeclarationOnly": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["src/**/*.stories.tsx", "src/**/*.test.ts", "src/**/*.test.tsx", "src/test-setup.ts"]
}
```

`packages/ui/vite.config.ts`:

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index',
      cssFileName: 'styles',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
    cssCodeSplit: false,
    sourcemap: true,
    emptyOutDir: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
  },
});
```

Run: `npm install` (from the repo root)
Expected: installs with no peer-dependency errors. Then `npm exec --workspace @babysteps/ui -- vite --version` prints `vite/8.x`.

- [ ] **Step 4: Write the failing utility tests**

`packages/ui/src/test-setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
```

`packages/ui/src/utils/number.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { clamp, clampPercent } from './number';

describe('clamp', () => {
  it('keeps values inside the range', () => {
    expect(clamp(3, 0, 5)).toBe(3);
  });
  it('clamps values outside the range', () => {
    expect(clamp(-2, 0, 5)).toBe(0);
    expect(clamp(9, 0, 5)).toBe(5);
  });
  it('treats non-finite values as the minimum', () => {
    expect(clamp(Number.NaN, 0, 5)).toBe(0);
    expect(clamp(Number.POSITIVE_INFINITY, 0, 5)).toBe(0);
  });
});

describe('clampPercent', () => {
  it('rounds and clamps to 0..100', () => {
    expect(clampPercent(42.6)).toBe(43);
    expect(clampPercent(140)).toBe(100);
    expect(clampPercent(-5)).toBe(0);
    expect(clampPercent(Number.NaN)).toBe(0);
  });
});
```

`packages/ui/src/utils/time.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { formatDuration } from './time';

describe('formatDuration', () => {
  it('formats minutes and seconds', () => {
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(0)).toBe('0:00');
  });
  it('formats hours', () => {
    expect(formatDuration(3725)).toBe('1:02:05');
  });
  it('rounds fractional seconds', () => {
    expect(formatDuration(59.6)).toBe('1:00');
  });
  it('returns null for missing or invalid input', () => {
    expect(formatDuration(undefined)).toBeNull();
    expect(formatDuration(null)).toBeNull();
    expect(formatDuration(-3)).toBeNull();
    expect(formatDuration(Number.NaN)).toBeNull();
  });
});
```

`packages/ui/src/foundations/BsRoot.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BsRoot } from './BsRoot';

describe('BsRoot', () => {
  it('sets RTL, Hebrew and the root class', () => {
    render(<BsRoot data-testid="root" className="extra">שלום</BsRoot>);
    const root = screen.getByTestId('root');
    expect(root).toHaveAttribute('dir', 'rtl');
    expect(root).toHaveAttribute('lang', 'he');
    expect(root).toHaveClass('bs-root', 'extra');
    expect(root).toHaveTextContent('שלום');
  });
});
```

- [ ] **Step 5: Run the tests to verify they fail**

Run: `npm test --workspace @babysteps/ui`
Expected: FAIL, with errors like `Failed to resolve import "./number"` and `"./BsRoot"`.

- [ ] **Step 6: Write the utilities and BsRoot**

`packages/ui/src/utils/cx.ts`:

```ts
/** Joins class names, skipping empty values. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
```

`packages/ui/src/utils/tone.ts`:

```ts
export type SectionTone = 'cream' | 'white' | 'peach' | 'mint' | 'sky' | 'blush' | 'cocoa';

export const sectionTones: SectionTone[] = ['cream', 'white', 'peach', 'mint', 'sky', 'blush', 'cocoa'];

/** Class that sets --bs-tone (and ink overrides for cocoa). Defined in base.css. */
export function toneClass(tone: SectionTone): string {
  return `bs-tone--${tone}`;
}

/** The surface color of a tone, for inline styles. */
export function toneVar(tone: SectionTone): string {
  return tone === 'white' ? 'var(--surface-card)' : `var(--surface-${tone})`;
}
```

`packages/ui/src/utils/number.ts`:

```ts
/** Clamps a number into [min, max]. Non-finite input returns min. */
export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/** Rounds and clamps a percent into 0..100. */
export function clampPercent(value: number): number {
  return Math.round(clamp(value, 0, 100));
}
```

`packages/ui/src/utils/time.ts`:

```ts
/** Formats seconds as m:ss or h:mm:ss. Returns null for missing or invalid input. */
export function formatDuration(sec?: number | null): string | null {
  if (sec == null || !Number.isFinite(sec) || sec < 0) return null;
  const total = Math.round(sec);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}
```

`packages/ui/src/utils/brand.ts`:

```ts
import type { ReactNode } from 'react';

export interface BrandLogo {
  src: string;
  alt: string;
  /** Where the logo links to. Defaults to "/". */
  href?: string;
}

export interface NavLink {
  label: ReactNode;
  href: string;
}
```

`packages/ui/src/foundations/BsRoot.tsx`:

```tsx
import type { HTMLAttributes } from 'react';
import { cx } from '../utils/cx';

export type BsRootProps = HTMLAttributes<HTMLDivElement>;

/**
 * Root wrapper for every page and screen. Sets RTL, Hebrew, fonts, base text color
 * and the cream page background. Components are unstyled outside it.
 */
export function BsRoot({ className, children, ...rest }: BsRootProps) {
  return (
    <div dir="rtl" lang="he" className={cx('bs-root', className)} {...rest}>
      {children}
    </div>
  );
}
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npm test --workspace @babysteps/ui`
Expected: PASS, 3 files, 9 tests.

- [ ] **Step 8: Write the tokens, base styles and entry files**

`packages/ui/src/tokens.css`:

```css
/* Warm Nest tokens. Components read only these variables. */
:root {
  /* Colors */
  --color-ink: #3b2213;
  --color-ink-soft: #6b4a36;
  --color-ink-muted: #8a6a55;
  --color-brand-700: #5b3320;
  --color-brand-600: #704229;
  --color-brand-500: #8a5438;
  --color-accent: #e07a5f;
  --color-whatsapp: #25d366;
  --color-success: #2f9e6b;
  --color-warning: #e3a008;
  --color-error: #d14343;
  --color-on-brand: #ffffff;
  --color-border: rgba(112, 66, 41, 0.14);

  /* Surfaces */
  --surface-cream: #fdf6f0;
  --surface-card: #ffffff;
  --surface-peach: #fce1cc;
  --surface-mint: #e8f3ef;
  --surface-sky: #e3f2fd;
  --surface-blush: #fdf2f8;
  --surface-cocoa: #5b3320;

  /* Type */
  --font-heading: 'Varela Round', 'Rubik', system-ui, sans-serif;
  --font-body: 'Rubik', system-ui, sans-serif;
  --text-display: clamp(2rem, 1.35rem + 2.6vw, 2.75rem);
  --text-h2: clamp(1.625rem, 1.3rem + 1.3vw, 2rem);
  --text-h3: 1.375rem;
  --text-lead: 1.125rem;
  --text-body: 1rem;
  --text-caption: 0.8125rem;
  --leading-body: 1.7;
  --leading-heading: 1.15;

  /* Shape */
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 22px;
  --radius-xl: 32px;
  --radius-pill: 999px;

  /* Shadows (brown tinted) */
  --shadow-sm: 0 2px 8px rgba(91, 51, 32, 0.08);
  --shadow-md: 0 10px 30px rgba(91, 51, 32, 0.12);
  --shadow-lg: 0 22px 50px rgba(91, 51, 32, 0.18);
  --shadow-brand: 0 8px 20px rgba(112, 66, 41, 0.3);

  /* Spacing, 4px grid */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;
  --space-9: 96px;

  /* Motion */
  --ease-soft: cubic-bezier(0.22, 1, 0.36, 1);
  --duration-fast: 150ms;
  --duration-base: 250ms;

  /* Layout */
  --container-narrow: 720px;
  --container-base: 1040px;
  --container-wide: 1240px;
}
```

`packages/ui/src/base.css`:

```css
/* Fonts: Hebrew and Latin subsets only */
@import '@fontsource/rubik/hebrew-400.css';
@import '@fontsource/rubik/hebrew-500.css';
@import '@fontsource/rubik/hebrew-700.css';
@import '@fontsource/rubik/latin-400.css';
@import '@fontsource/rubik/latin-500.css';
@import '@fontsource/rubik/latin-700.css';
@import '@fontsource/varela-round/hebrew-400.css';
@import '@fontsource/varela-round/latin-400.css';

.bs-root {
  font-family: var(--font-body);
  font-size: var(--text-body);
  line-height: var(--leading-body);
  color: var(--color-ink);
  background: var(--surface-cream);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

.bs-root *,
.bs-root *::before,
.bs-root *::after {
  box-sizing: border-box;
}

.bs-root :where(h1, h2, h3, h4, p, ul, ol, figure, blockquote) {
  margin: 0;
}

.bs-root :where(h1, h2, h3, h4) {
  font-family: var(--font-heading);
  font-weight: 400;
  line-height: var(--leading-heading);
  color: var(--bs-heading, var(--color-brand-700));
  text-wrap: balance;
}

/* <em> inside a heading is a soft terracotta highlight */
.bs-root :where(h1, h2, h3) em {
  font-style: normal;
  padding-inline: 0.1em;
  background: linear-gradient(
    transparent 62%,
    color-mix(in srgb, var(--color-accent) 38%, transparent) 62%
  );
}

.bs-root :where(img, video, svg) {
  display: block;
  max-width: 100%;
}

.bs-root :where(a) {
  color: inherit;
}

.bs-root :where(button, input) {
  font: inherit;
}

.bs-root :focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}

/* Tone classes: sections, heroes, boxes read --bs-tone */
.bs-tone--cream { --bs-tone: var(--surface-cream); }
.bs-tone--white { --bs-tone: var(--surface-card); }
.bs-tone--peach { --bs-tone: var(--surface-peach); }
.bs-tone--mint  { --bs-tone: var(--surface-mint); }
.bs-tone--sky   { --bs-tone: var(--surface-sky); }
.bs-tone--blush { --bs-tone: var(--surface-blush); }
.bs-tone--cocoa {
  --bs-tone: var(--surface-cocoa);
  --bs-tone-ink: var(--color-on-brand);
  --bs-heading: var(--color-on-brand);
  --bs-ink-soft: color-mix(in srgb, var(--color-on-brand) 82%, transparent);
}

.bs-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (prefers-reduced-motion: reduce) {
  .bs-root *,
  .bs-root *::before,
  .bs-root *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

`packages/ui/src/styles.css`:

```css
@import './tokens.css';
@import './base.css';
/* Component styles are added below, one @import per component. */
```

`packages/ui/src/index.ts`:

```ts
import './styles.css';

export { BsRoot, type BsRootProps } from './foundations/BsRoot';
export { cx } from './utils/cx';
export { toneClass, toneVar, sectionTones, type SectionTone } from './utils/tone';
export { clamp, clampPercent } from './utils/number';
export { formatDuration } from './utils/time';
export type { BrandLogo, NavLink } from './utils/brand';
```

- [ ] **Step 9: Set up Storybook**

Copy three photos for stories:

```bash
mkdir -p packages/ui/.storybook/public
cp assets/about.jpg assets/logos/logo-peach.png assets/videos/rolling-teaser-poster.jpg packages/ui/.storybook/public/
```

`packages/ui/.storybook/main.ts`:

```ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  staticDirs: ['./public'],
};

export default config;
```

`packages/ui/.storybook/preview.css`:

```css
html,
body {
  margin: 0;
}

.bs-story {
  min-height: 100vh;
}

.bs-story--pad {
  padding: 32px 24px;
}
```

`packages/ui/.storybook/preview.tsx`:

```tsx
import type { Preview } from '@storybook/react-vite';
import '../src/styles.css';
import './preview.css';
import { BsRoot } from '../src/foundations/BsRoot';

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
  },
  decorators: [
    (Story, context) => (
      // Stories set parameters.bsFlush for full-bleed components (Hero, Section, SiteNav).
      <BsRoot className={context.parameters.bsFlush ? 'bs-story' : 'bs-story bs-story--pad'}>
        <Story />
      </BsRoot>
    ),
  ],
};

export default preview;
```

`packages/ui/src/foundations/Tokens.stories.tsx` (a visual token sheet for review):

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

const colors = [
  'color-ink', 'color-ink-soft', 'color-ink-muted', 'color-brand-700', 'color-brand-600',
  'color-brand-500', 'color-accent', 'color-whatsapp', 'color-success', 'color-warning', 'color-error',
];
const surfaces = [
  'surface-cream', 'surface-card', 'surface-peach', 'surface-mint', 'surface-sky', 'surface-blush', 'surface-cocoa',
];
const radii = ['radius-sm', 'radius-md', 'radius-lg', 'radius-xl', 'radius-pill'];
const shadows = ['shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-brand'];

function Swatch({ token }: { token: string }) {
  return (
    <div style={{ width: 112, fontSize: 12 }}>
      <div
        style={{
          height: 56,
          borderRadius: 'var(--radius-md)',
          background: `var(--${token})`,
          boxShadow: 'inset 0 0 0 1px var(--color-border)',
        }}
      />
      <code dir="ltr" style={{ display: 'block', marginTop: 6 }}>--{token}</code>
    </div>
  );
}

function TokenSheet() {
  const row = { display: 'flex', flexWrap: 'wrap' as const, gap: 16, marginBottom: 32 };
  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>צבעים</h2>
      <div style={row}>{colors.map((t) => <Swatch key={t} token={t} />)}</div>
      <h2 style={{ marginBottom: 16 }}>משטחים</h2>
      <div style={row}>{surfaces.map((t) => <Swatch key={t} token={t} />)}</div>
      <h2 style={{ marginBottom: 16 }}>טיפוגרפיה</h2>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-display)', color: 'var(--color-brand-700)' }}>כותרת ראשית</p>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-h2)', color: 'var(--color-brand-700)' }}>כותרת סקשן</p>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-h3)', color: 'var(--color-brand-700)' }}>כותרת כרטיס</p>
        <p style={{ fontSize: 'var(--text-lead)', color: 'var(--color-ink-soft)' }}>טקסט מוביל, 18 פיקסלים</p>
        <p>טקסט רגיל, 16 פיקסלים, גובה שורה 1.7</p>
        <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-muted)' }}>טקסט קטן, 13 פיקסלים</p>
      </div>
      <h2 style={{ marginBottom: 16 }}>פינות וצללים</h2>
      <div style={row}>
        {radii.map((t) => (
          <div key={t} style={{ width: 96, height: 64, background: 'var(--surface-peach)', borderRadius: `var(--${t})`, display: 'grid', placeItems: 'center', fontSize: 12 }} dir="ltr">{t}</div>
        ))}
      </div>
      <div style={row}>
        {shadows.map((t) => (
          <div key={t} style={{ width: 128, height: 72, background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', boxShadow: `var(--${t})`, display: 'grid', placeItems: 'center', fontSize: 12 }} dir="ltr">{t}</div>
        ))}
      </div>
    </div>
  );
}

const meta = {
  title: 'Foundations/Tokens',
  component: TokenSheet,
} satisfies Meta<typeof TokenSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sheet: Story = {};
```

- [ ] **Step 10: Verify build, typecheck, Storybook and the full test run**

Run: `npm run build --workspace @babysteps/ui && ls packages/ui/dist packages/ui/dist/assets | head -30`
Expected: `dist/index.js`, `dist/styles.css`, `dist/index.d.ts`, `dist/foundations/BsRoot.d.ts`, and `.woff2` files under `dist/assets/`.

Run: `grep -c "font-face" packages/ui/dist/styles.css`
Expected: `8` (one per imported font file).

Run: `npm run typecheck --workspace @babysteps/ui`
Expected: no output, exit 0.

Run: `npm run build-storybook --workspace @babysteps/ui -- --quiet`
Expected: `packages/ui/storybook-static/index.html` exists.

Run: `npm test`
Expected: root tests PASS, then `@babysteps/ui` tests PASS (9).

- [ ] **Step 11: Commit**

```bash
git add package.json package-lock.json vitest.config.js .gitignore packages/ui
git commit -m "feat(ui): scaffold @babysteps/ui with tokens, BsRoot, build and Storybook"
```

---

### Task 2: Display primitives (Icon, Spinner, Divider, Avatar, StarRating)

**Files:**
- Create: `packages/ui/src/components/Icon/{Icon.tsx,Icon.css,Icon.stories.tsx,Icon.test.tsx}`
- Create: `packages/ui/src/components/Spinner/{Spinner.tsx,Spinner.css,Spinner.stories.tsx}`
- Create: `packages/ui/src/components/Divider/{Divider.tsx,Divider.css,Divider.stories.tsx}`
- Create: `packages/ui/src/components/Avatar/{Avatar.tsx,Avatar.css,Avatar.stories.tsx,Avatar.test.tsx}`
- Create: `packages/ui/src/components/StarRating/{StarRating.tsx,StarRating.css,StarRating.stories.tsx,StarRating.test.tsx}`
- Modify: `packages/ui/src/styles.css`, `packages/ui/src/index.ts`

**Interfaces:**
- Consumes: `cx`, `clamp`, `SectionTone`, `toneVar` (Task 1)
- Produces:
  - `type IconName = 'play' | 'check' | 'star' | 'lock' | 'arrow' | 'chevron' | 'whatsapp' | 'instagram' | 'clock' | 'heart' | 'baby' | 'menu' | 'close' | 'user' | 'logout' | 'sparkle' | 'video'`; `iconNames: IconName[]`
  - `Icon({ name, size = 20, label, ...svgProps })`. With `label`: `role="img"` + `aria-label`. Without: `aria-hidden="true"`. `arrow` points left (forward in RTL). `chevron` points down.
  - `Spinner({ size = 20, label = 'טוען', decorative = false })`
  - `Divider({ variant = 'line' | 'wave', tone = 'white', from })`
  - `initials(name: string): string`; `Avatar({ name, src, size = 'md', decorative = false })`, sizes `'sm' | 'md' | 'lg'`
  - `StarRating({ value, size = 18, label })`, value rounded and clamped to 0..5

The spec lists 14 icon names. This plan adds `instagram` (Footer social), `sparkle` (Alert info) and `video` (course meta). That is within the spec's "built-in set".

- [ ] **Step 1: Write the failing tests**

`packages/ui/src/components/Icon/Icon.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Icon, iconNames } from './Icon';

describe('Icon', () => {
  it('is hidden from screen readers without a label', () => {
    const { container } = render(<Icon name="star" />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('is an image with a name when labelled', () => {
    render(<Icon name="lock" label="נעול" />);
    expect(screen.getByRole('img', { name: 'נעול' })).toBeInTheDocument();
  });

  it('renders every icon name with drawn content', () => {
    for (const name of iconNames) {
      const { container, unmount } = render(<Icon name={name} />);
      expect(container.querySelector('svg')?.childElementCount).toBeGreaterThan(0);
      unmount();
    }
  });
});
```

`packages/ui/src/components/Avatar/Avatar.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar, initials } from './Avatar';

describe('initials', () => {
  it('takes the first letter of the first two words', () => {
    expect(initials('ירדן שוהם')).toBe('יש');
    expect(initials('כרמל')).toBe('כ');
    expect(initials('  טל   בן  דוד ')).toBe('טב');
  });
  it('returns an empty string for a blank name', () => {
    expect(initials('   ')).toBe('');
  });
});

describe('Avatar', () => {
  it('shows a photo with the name as alt text', () => {
    render(<Avatar name="ירדן שוהם" src="/about.jpg" />);
    expect(screen.getByRole('img', { name: 'ירדן שוהם' })).toHaveAttribute('src', '/about.jpg');
  });

  it('falls back to initials without a photo, and keeps the name for screen readers', () => {
    const { container } = render(<Avatar name="ירדן שוהם" />);
    expect(container.querySelector('img')).toBeNull();
    expect(container).toHaveTextContent('יש');
    expect(screen.getByText('ירדן שוהם')).toHaveClass('bs-visually-hidden');
  });

  it('is fully hidden when decorative', () => {
    const { container } = render(<Avatar name="טל" decorative />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });
});
```

`packages/ui/src/components/StarRating/StarRating.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StarRating } from './StarRating';

describe('StarRating', () => {
  it('announces the rating', () => {
    render(<StarRating value={4} />);
    expect(screen.getByRole('img', { name: 'דירוג 4 מתוך 5' })).toBeInTheDocument();
  });

  it('clamps values above 5 and below 0', () => {
    const { rerender } = render(<StarRating value={7} />);
    expect(screen.getByRole('img', { name: 'דירוג 5 מתוך 5' })).toBeInTheDocument();
    rerender(<StarRating value={-2} />);
    expect(screen.getByRole('img', { name: 'דירוג 0 מתוך 5' })).toBeInTheDocument();
  });

  it('fills the right number of stars', () => {
    const { container } = render(<StarRating value={3.4} />);
    expect(container.querySelectorAll('.bs-stars__on')).toHaveLength(3);
    expect(container.querySelectorAll('.bs-stars__off')).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test --workspace @babysteps/ui`
Expected: FAIL, `Failed to resolve import "./Icon"`, `"./Avatar"`, `"./StarRating"`.

- [ ] **Step 3: Write Icon**

`packages/ui/src/components/Icon/Icon.tsx`:

```tsx
import type { ReactNode, SVGProps } from 'react';
import { cx } from '../../utils/cx';

const paths = {
  play: <path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  star: (
    <path
      d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"
      fill="currentColor"
      stroke="none"
    />
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  // Points left: "forward" in RTL.
  arrow: <path d="M19 12H5M11 6l-6 6 6 6" />,
  chevron: <path d="M6 9l6 6 6-6" />,
  whatsapp: (
    <>
      <path d="M4 20l1.3-3.9A8 8 0 1 1 8 18.8z" />
      <path d="M9.5 9.2c0 2.9 2.4 5.3 5.3 5.3l1-1.4-2-1-.9.7a3.6 3.6 0 0 1-1.7-1.7l.7-.9-1-2z" />
    </>
  ),
  instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4.5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17" cy="7" r="0.8" fill="currentColor" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  heart: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  baby: (
    <>
      <circle cx="12" cy="12.5" r="8" />
      <circle cx="9.5" cy="11.5" r="0.7" fill="currentColor" />
      <circle cx="14.5" cy="11.5" r="0.7" fill="currentColor" />
      <path d="M9.6 15.2a3.4 3.4 0 0 0 4.8 0M12 4.5c1.4 0 2.1.9 2.1 1.9" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
  logout: <path d="M14 5h4a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-4M10 16l-4-4 4-4M6 12h9" />,
  sparkle: <path d="M12 4l1.8 5.2L19 11l-5.2 1.8L12 18l-1.8-5.2L5 11l5.2-1.8z" />,
  video: (
    <>
      <rect x="3.5" y="6" width="12" height="12" rx="2" />
      <path d="M15.5 10.5l5-3v9l-5-3" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof paths;
export const iconNames = Object.keys(paths) as IconName[];

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  /** Width and height in px. */
  size?: number;
  /** Accessible name. Leave empty for decorative icons. */
  label?: string;
}

export function Icon({ name, size = 20, label, className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      className={cx('bs-icon', className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
```

`packages/ui/src/components/Icon/Icon.css`:

```css
.bs-icon {
  flex-shrink: 0;
  vertical-align: middle;
}
```

`packages/ui/src/components/Icon/Icon.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon, iconNames } from './Icon';

const meta = {
  title: 'Base/Icon',
  component: Icon,
  args: { name: 'heart', size: 32 },
  argTypes: { name: { control: 'select', options: iconNames } },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  render: (args) => (
    <span style={{ color: 'var(--color-brand-600)' }}>
      <Icon {...args} />
    </span>
  ),
};

export const AllIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-5)', color: 'var(--color-brand-600)' }}>
      {iconNames.map((name) => (
        <div key={name} style={{ display: 'grid', justifyItems: 'center', gap: 'var(--space-2)', width: 72 }}>
          <Icon name={name} size={28} />
          <code dir="ltr" style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-muted)' }}>{name}</code>
        </div>
      ))}
    </div>
  ),
};
```

- [ ] **Step 4: Write Spinner**

`packages/ui/src/components/Spinner/Spinner.tsx`:

```tsx
import type { HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number;
  /** Screen reader text. */
  label?: string;
  /** Hide from screen readers (use when the parent already says it is busy). */
  decorative?: boolean;
}

export function Spinner({ size = 20, label = 'טוען', decorative = false, className, style, ...rest }: SpinnerProps) {
  return (
    <span
      role={decorative ? undefined : 'status'}
      aria-hidden={decorative || undefined}
      className={cx('bs-spinner', className)}
      style={{ width: size, height: size, ...style }}
      {...rest}
    >
      {!decorative && <span className="bs-visually-hidden">{label}</span>}
    </span>
  );
}
```

`packages/ui/src/components/Spinner/Spinner.css`:

```css
.bs-spinner {
  display: inline-block;
  flex-shrink: 0;
  border-radius: 50%;
  border: 2.5px solid currentColor;
  border-block-start-color: transparent;
  animation: bs-spin 0.8s linear infinite;
}

@keyframes bs-spin {
  to {
    transform: rotate(360deg);
  }
}
```

`packages/ui/src/components/Spinner/Spinner.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from './Spinner';

const meta = {
  title: 'Base/Spinner',
  component: Spinner,
  args: { size: 28 },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <span style={{ color: 'var(--color-brand-600)' }}>
      <Spinner {...args} />
    </span>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-5)', alignItems: 'center', color: 'var(--color-brand-600)' }}>
      <Spinner size={16} />
      <Spinner size={24} />
      <Spinner size={40} />
    </div>
  ),
};
```

- [ ] **Step 5: Write Divider**

`packages/ui/src/components/Divider/Divider.tsx`:

```tsx
import type { HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import { toneVar, type SectionTone } from '../../utils/tone';

export interface DividerProps extends HTMLAttributes<HTMLElement> {
  variant?: 'line' | 'wave';
  /** Wave only: the tone the wave flows into (the next section). */
  tone?: SectionTone;
  /** Wave only: the tone behind the wave (the previous section). Transparent if unset. */
  from?: SectionTone;
}

export function Divider({ variant = 'line', tone = 'white', from, className, style, ...rest }: DividerProps) {
  if (variant === 'line') {
    return <hr className={cx('bs-divider', 'bs-divider--line', className)} style={style} {...rest} />;
  }
  return (
    <div
      aria-hidden="true"
      className={cx('bs-divider', 'bs-divider--wave', className)}
      style={{ color: toneVar(tone), background: from ? toneVar(from) : 'transparent', ...style }}
      {...rest}
    >
      <svg viewBox="0 0 1440 64" preserveAspectRatio="none" focusable="false">
        <path d="M0 32C180 64 360 64 540 40S900 0 1080 16s270 40 360 32V64H0Z" fill="currentColor" />
      </svg>
    </div>
  );
}
```

`packages/ui/src/components/Divider/Divider.css`:

```css
.bs-divider--line {
  border: 0;
  height: 1px;
  background: var(--color-border);
  margin-block: var(--space-6);
}

.bs-divider--wave {
  display: block;
  line-height: 0;
}

.bs-divider--wave svg {
  width: 100%;
  height: 48px;
}
```

`packages/ui/src/components/Divider/Divider.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from './Divider';

const meta = {
  title: 'Base/Divider',
  component: Divider,
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Line: Story = {
  render: (args) => (
    <div>
      <p>פסקה ראשונה.</p>
      <Divider {...args} variant="line" />
      <p>פסקה שנייה.</p>
    </div>
  ),
};

export const WavePeachToWhite: Story = {
  args: { variant: 'wave', from: 'peach', tone: 'white' },
  parameters: { bsFlush: true },
  render: (args) => (
    <div>
      <div style={{ background: 'var(--surface-peach)', height: 120 }} />
      <Divider {...args} />
      <div style={{ background: 'var(--surface-card)', height: 120 }} />
    </div>
  ),
};

export const WaveIntoCocoa: Story = {
  args: { variant: 'wave', from: 'cream', tone: 'cocoa' },
  parameters: { bsFlush: true },
  render: (args) => (
    <div>
      <div style={{ height: 80 }} />
      <Divider {...args} />
      <div style={{ background: 'var(--surface-cocoa)', height: 80 }} />
    </div>
  ),
};
```

- [ ] **Step 6: Write Avatar**

`packages/ui/src/components/Avatar/Avatar.tsx`:

```tsx
import type { HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';

/** First letter of the first two words. */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => Array.from(word)[0])
    .join('');
}

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Hide from screen readers when the name is shown next to it. */
  decorative?: boolean;
}

export function Avatar({ name, src, size = 'md', decorative = false, className, ...rest }: AvatarProps) {
  return (
    <span
      className={cx('bs-avatar', `bs-avatar--${size}`, className)}
      aria-hidden={decorative || undefined}
      {...rest}
    >
      {src ? (
        <img className="bs-avatar__img" src={src} alt={decorative ? '' : name} />
      ) : (
        <>
          <span className="bs-avatar__initials" aria-hidden="true">{initials(name)}</span>
          {!decorative && <span className="bs-visually-hidden">{name}</span>}
        </>
      )}
    </span>
  );
}
```

`packages/ui/src/components/Avatar/Avatar.css`:

```css
.bs-avatar {
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  background: var(--surface-peach);
  color: var(--color-brand-600);
  font-family: var(--font-heading);
  box-shadow: 0 0 0 3px var(--surface-card);
}

.bs-avatar--sm { width: 40px; height: 40px; font-size: 15px; }
.bs-avatar--md { width: 56px; height: 56px; font-size: 20px; }
.bs-avatar--lg { width: 88px; height: 88px; font-size: 30px; }

.bs-avatar__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

`packages/ui/src/components/Avatar/Avatar.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './Avatar';

const meta = {
  title: 'Base/Avatar',
  component: Avatar,
  args: { name: 'ירדן שוהם' },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Photo: Story = { args: { src: '/about.jpg', size: 'lg' } };
export const Initials: Story = {};
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
      <Avatar name="כרמל" size="sm" />
      <Avatar name="טל כהן" size="md" />
      <Avatar name="ירדן שוהם" src="/about.jpg" size="lg" />
    </div>
  ),
};
```

- [ ] **Step 7: Write StarRating**

`packages/ui/src/components/StarRating/StarRating.tsx`:

```tsx
import type { HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import { clamp } from '../../utils/number';
import { Icon } from '../Icon/Icon';

export interface StarRatingProps extends HTMLAttributes<HTMLSpanElement> {
  /** 0 to 5. Rounded to a whole star and clamped. */
  value: number;
  size?: number;
  /** Overrides the default "דירוג X מתוך 5". */
  label?: string;
}

export function StarRating({ value, size = 18, label, className, ...rest }: StarRatingProps) {
  const stars = Math.round(clamp(value, 0, 5));
  return (
    <span role="img" aria-label={label ?? `דירוג ${stars} מתוך 5`} className={cx('bs-stars', className)} {...rest}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Icon key={i} name="star" size={size} className={i < stars ? 'bs-stars__on' : 'bs-stars__off'} />
      ))}
    </span>
  );
}
```

`packages/ui/src/components/StarRating/StarRating.css`:

```css
.bs-stars {
  display: inline-flex;
  gap: 2px;
}

.bs-stars__on {
  color: var(--color-warning);
}

.bs-stars__off {
  color: var(--color-border);
}
```

`packages/ui/src/components/StarRating/StarRating.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { StarRating } from './StarRating';

const meta = {
  title: 'Base/StarRating',
  component: StarRating,
  args: { value: 5 },
} satisfies Meta<typeof StarRating>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Five: Story = {};
export const Three: Story = { args: { value: 3 } };
export const Large: Story = { args: { value: 4, size: 28 } };
```

- [ ] **Step 8: Register styles and exports**

Append to `packages/ui/src/styles.css`:

```css
@import './components/Icon/Icon.css';
@import './components/Spinner/Spinner.css';
@import './components/Divider/Divider.css';
@import './components/Avatar/Avatar.css';
@import './components/StarRating/StarRating.css';
```

Append to `packages/ui/src/index.ts`:

```ts
export { Icon, iconNames, type IconName, type IconProps } from './components/Icon/Icon';
export { Spinner, type SpinnerProps } from './components/Spinner/Spinner';
export { Divider, type DividerProps } from './components/Divider/Divider';
export { Avatar, initials, type AvatarProps } from './components/Avatar/Avatar';
export { StarRating, type StarRatingProps } from './components/StarRating/StarRating';
```

- [ ] **Step 9: Run tests and typecheck**

Run: `npm test --workspace @babysteps/ui && npm run typecheck --workspace @babysteps/ui`
Expected: PASS (all tests, including the 3 new files), typecheck exit 0.

- [ ] **Step 10: Look at the stories**

Run: `npm run storybook --workspace @babysteps/ui` and open `http://localhost:6006`.
Expected: `Base/Icon/AllIcons` shows 17 icons, all clear at 28px. `Base/Divider` waves span full width. Stop the server when done.

- [ ] **Step 11: Commit**

```bash
git add packages/ui
git commit -m "feat(ui): add Icon, Spinner, Divider, Avatar and StarRating"
```

---
### Task 3: Button, Badge and Card

**Files:**
- Create: `packages/ui/src/components/Button/{Button.tsx,Button.css,Button.stories.tsx,Button.test.tsx}`
- Create: `packages/ui/src/components/Badge/{Badge.tsx,Badge.css,Badge.stories.tsx}`
- Create: `packages/ui/src/components/Card/{Card.tsx,Card.css,Card.stories.tsx}`
- Modify: `packages/ui/src/styles.css`, `packages/ui/src/index.ts`

**Interfaces:**
- Consumes: `cx` (Task 1), `Icon`, `IconName`, `Spinner` (Task 2)
- Produces:
  - `Button(props: ButtonProps)`. `variant: 'primary' | 'outline' | 'ghost' | 'whatsapp'` (default primary), `size: 'sm' | 'md' | 'lg'` (default md), `icon?: IconName`, `iconPosition: 'start' | 'end'` (default end; whatsapp defaults to the `whatsapp` icon at start), `fullWidth`, `loading`, `href`, `target`, `rel`, plus button attributes. With `href` it renders `<a>`.
  - `Badge({ variant: 'tag' | 'pill' | 'highlight' = 'tag', icon?, children })`
  - `Card({ as: 'div' | 'article' | 'section' | 'li' | 'figure' = 'div', padding: 'none' | 'sm' | 'md' | 'lg' = 'md', hoverLift = false })`

- [ ] **Step 1: Write the failing Button tests**

`packages/ui/src/components/Button/Button.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('is a button of type "button" by default and fires onClick', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>להצטרפות</Button>);
    const button = screen.getByRole('button', { name: 'להצטרפות' });
    expect(button).toHaveAttribute('type', 'button');
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('while loading: disabled, busy, and does not fire onClick', async () => {
    const onClick = vi.fn();
    render(<Button loading onClick={onClick}>שליחה</Button>);
    const button = screen.getByRole('button', { name: /שליחה/ });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders a link when href is set', () => {
    render(<Button href="/challenge/rolling/">לקורס</Button>);
    expect(screen.getByRole('link', { name: 'לקורס' })).toHaveAttribute('href', '/challenge/rolling/');
  });

  it('a loading link has no href, is aria-disabled, and does not fire onClick', async () => {
    const onClick = vi.fn();
    const { container } = render(
      <Button href="/buy" loading onClick={onClick}>לרכישה</Button>,
    );
    const link = container.querySelector('a');
    expect(link).not.toHaveAttribute('href');
    expect(link).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(link!);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('whatsapp variant shows the whatsapp icon by default', () => {
    const { container } = render(<Button variant="whatsapp">דברי איתי</Button>);
    expect(container.querySelectorAll('svg.bs-icon')).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test --workspace @babysteps/ui -- Button`
Expected: FAIL, `Failed to resolve import "./Button"`.

- [ ] **Step 3: Write Button**

`packages/ui/src/components/Button/Button.tsx`:

```tsx
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, MouseEvent } from 'react';
import { cx } from '../../utils/cx';
import { Icon, type IconName } from '../Icon/Icon';
import { Spinner } from '../Spinner/Spinner';

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'whatsapp';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconPosition?: 'start' | 'end';
  fullWidth?: boolean;
  /** Shows a spinner, blocks clicks and sets aria-busy. */
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  /** Renders an <a> instead of a <button>. */
  href?: string;
  target?: string;
  rel?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition,
  fullWidth = false,
  loading = false,
  type = 'button',
  href,
  target,
  rel,
  disabled,
  onClick,
  className,
  children,
  ...rest
}: ButtonProps) {
  const iconName = icon ?? (variant === 'whatsapp' ? 'whatsapp' : undefined);
  const position = iconPosition ?? (variant === 'whatsapp' ? 'start' : 'end');
  const iconSize = size === 'sm' ? 16 : 20;
  const iconEl = iconName ? <Icon name={iconName} size={iconSize} className="bs-button__icon" /> : null;

  const classes = cx(
    'bs-button',
    `bs-button--${variant}`,
    `bs-button--${size}`,
    fullWidth && 'bs-button--full',
    loading && 'bs-button--loading',
    className,
  );

  const content = (
    <>
      {loading ? <Spinner size={iconSize - 2} decorative /> : position === 'start' && iconEl}
      <span className="bs-button__label">{children}</span>
      {!loading && position === 'end' && iconEl}
    </>
  );

  if (href !== undefined) {
    const blocked = loading || disabled;
    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
      if (blocked) {
        event.preventDefault();
        return;
      }
      onClick?.(event as unknown as MouseEvent<HTMLButtonElement>);
    };
    return (
      <a
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
        className={classes}
        href={blocked ? undefined : href}
        target={target}
        rel={rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)}
        aria-busy={loading || undefined}
        aria-disabled={blocked || undefined}
        onClick={handleClick}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      {...rest}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      onClick={onClick}
    >
      {content}
    </button>
  );
}
```

`packages/ui/src/components/Button/Button.css`:

```css
.bs-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border: 2px solid transparent;
  border-radius: var(--radius-pill);
  font-family: var(--font-body);
  font-weight: 700;
  line-height: 1.2;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition:
    transform var(--duration-fast) var(--ease-soft),
    box-shadow var(--duration-fast) var(--ease-soft),
    background-color var(--duration-fast) var(--ease-soft);
}

.bs-button--sm { padding: var(--space-2) var(--space-4); font-size: var(--text-caption); }
.bs-button--md { padding: var(--space-3) var(--space-5); font-size: var(--text-body); }
.bs-button--lg { padding: var(--space-4) var(--space-6); font-size: var(--text-lead); }

.bs-button--primary {
  background: var(--color-brand-600);
  color: var(--color-on-brand);
  box-shadow: var(--shadow-brand);
}
.bs-button--primary:hover {
  background: var(--color-brand-700);
  transform: translateY(-2px);
}

.bs-button--outline {
  background: transparent;
  color: var(--color-brand-600);
  border-color: currentColor;
}
.bs-button--outline:hover {
  background: var(--surface-peach);
}

.bs-button--ghost {
  background: transparent;
  color: var(--color-brand-600);
}
.bs-button--ghost:hover {
  background: color-mix(in srgb, var(--color-brand-600) 8%, transparent);
}

/* Dark ink on WhatsApp green: white text fails contrast. */
.bs-button--whatsapp {
  background: var(--color-whatsapp);
  color: var(--color-ink);
  box-shadow: 0 8px 20px color-mix(in srgb, var(--color-whatsapp) 35%, transparent);
}
.bs-button--whatsapp:hover {
  transform: translateY(-2px);
}

.bs-button--full {
  width: 100%;
}

.bs-button:disabled,
.bs-button[aria-disabled='true'] {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.bs-button--loading {
  cursor: progress;
}
```

- [ ] **Step 4: Run the Button tests to verify they pass**

Run: `npm test --workspace @babysteps/ui -- Button`
Expected: PASS, 5 tests.

- [ ] **Step 5: Write Badge and Card**

`packages/ui/src/components/Badge/Badge.tsx`:

```tsx
import type { HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import { Icon, type IconName } from '../Icon/Icon';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** tag: white label (hero tags). pill: mint status. highlight: terracotta "most popular". */
  variant?: 'tag' | 'pill' | 'highlight';
  icon?: IconName;
}

export function Badge({ variant = 'tag', icon, className, children, ...rest }: BadgeProps) {
  return (
    <span className={cx('bs-badge', `bs-badge--${variant}`, className)} {...rest}>
      {icon && <Icon name={icon} size={14} />}
      {children}
    </span>
  );
}
```

`packages/ui/src/components/Badge/Badge.css`:

```css
.bs-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-pill);
  font-size: var(--text-caption);
  font-weight: 700;
  line-height: 1.4;
  white-space: nowrap;
}

.bs-badge--tag {
  background: var(--surface-card);
  color: var(--color-brand-600);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.bs-badge--pill {
  background: var(--surface-mint);
  color: var(--color-ink);
}

.bs-badge--highlight {
  background: var(--color-accent);
  color: var(--color-ink);
}
```

`packages/ui/src/components/Badge/Badge.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';

const meta = {
  title: 'Base/Badge',
  component: Badge,
  args: { children: 'קורס דיגיטלי · צפייה מיידית' },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Tag: Story = { args: { variant: 'tag' } };
export const Pill: Story = { args: { variant: 'pill', children: 'זמין עכשיו' } };
export const Highlight: Story = { args: { variant: 'highlight', icon: 'star', children: 'הכי מומלץ' } };
export const OnPeach: Story = {
  render: () => (
    <div style={{ background: 'var(--surface-peach)', padding: 'var(--space-5)', display: 'flex', gap: 'var(--space-3)', borderRadius: 'var(--radius-lg)' }}>
      <Badge>אתגר 5 ימים · חינם</Badge>
      <Badge variant="pill">זמין עכשיו</Badge>
      <Badge variant="highlight" icon="star">הכי מומלץ</Badge>
    </div>
  ),
};
```

`packages/ui/src/components/Card/Card.tsx`:

```tsx
import type { HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'article' | 'section' | 'li' | 'figure';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Lifts slightly on hover. Use for clickable cards. */
  hoverLift?: boolean;
}

export function Card({ as: Tag = 'div', padding = 'md', hoverLift = false, className, ...rest }: CardProps) {
  return (
    <Tag
      className={cx('bs-card', `bs-card--pad-${padding}`, hoverLift && 'bs-card--lift', className)}
      {...rest}
    />
  );
}
```

`packages/ui/src/components/Card/Card.css`:

```css
.bs-card {
  position: relative;
  background: var(--surface-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow-wrap: anywhere;
}

.bs-card--pad-none { padding: 0; }
.bs-card--pad-sm { padding: var(--space-4); }
.bs-card--pad-md { padding: var(--space-5); }
.bs-card--pad-lg { padding: var(--space-6); }

.bs-card--lift {
  transition:
    transform var(--duration-base) var(--ease-soft),
    box-shadow var(--duration-base) var(--ease-soft);
}

.bs-card--lift:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
```

`packages/ui/src/components/Card/Card.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './Card';

const meta = {
  title: 'Base/Card',
  component: Card,
  args: {
    children: (
      <>
        <h3 style={{ marginBottom: 'var(--space-2)' }}>6 טיפי זהב</h3>
        <p>טיפים מעשיים שיעזרו לך ללוות את התינוק בצורה הכי נכונה.</p>
      </>
    ),
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: (args) => <div style={{ maxWidth: 360 }}><Card {...args} /></div> };
export const LargePadding: Story = { args: { padding: 'lg' }, render: (args) => <div style={{ maxWidth: 360 }}><Card {...args} /></div> };
export const HoverLift: Story = { args: { hoverLift: true }, render: (args) => <div style={{ maxWidth: 360 }}><Card {...args} /></div> };
```

`packages/ui/src/components/Button/Button.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';

const meta = {
  title: 'Base/Button',
  component: Button,
  args: { children: 'להצטרפות לאתגר' },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { icon: 'arrow' } };
export const Outline: Story = { args: { variant: 'outline', children: 'איך זה עובד?' } };
export const Ghost: Story = { args: { variant: 'ghost', children: 'לכל הקורסים' } };
export const WhatsApp: Story = { args: { variant: 'whatsapp', children: 'דברי איתי בווטסאפ' } };
export const Loading: Story = { args: { loading: true, children: 'שולחת...' } };
export const Disabled: Story = { args: { disabled: true } };
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
      <Button size="sm">קטן</Button>
      <Button size="md">בינוני</Button>
      <Button size="lg" icon="arrow">לרכישה וגישה מיידית</Button>
    </div>
  ),
};
export const FullWidth: Story = {
  args: { fullWidth: true, children: 'שלמי וקבלי גישה מיידית', icon: 'arrow' },
  render: (args) => <div style={{ maxWidth: 360 }}><Button {...args} /></div>,
};
export const AsLink: Story = { args: { href: '#register', children: 'לקורס ולרכישה', icon: 'arrow' } };
```

- [ ] **Step 6: Register styles and exports**

Append to `packages/ui/src/styles.css`:

```css
@import './components/Button/Button.css';
@import './components/Badge/Badge.css';
@import './components/Card/Card.css';
```

Append to `packages/ui/src/index.ts`:

```ts
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from './components/Button/Button';
export { Badge, type BadgeProps } from './components/Badge/Badge';
export { Card, type CardProps } from './components/Card/Card';
```

- [ ] **Step 7: Run tests and typecheck**

Run: `npm test --workspace @babysteps/ui && npm run typecheck --workspace @babysteps/ui`
Expected: PASS, typecheck exit 0.

- [ ] **Step 8: Commit**

```bash
git add packages/ui
git commit -m "feat(ui): add Button, Badge and Card"
```

---

### Task 4: Layout (Container, Section, SectionHeading)

**Files:**
- Create: `packages/ui/src/components/Container/{Container.tsx,Container.css,Container.stories.tsx}`
- Create: `packages/ui/src/components/Section/{Section.tsx,Section.css,Section.stories.tsx,Section.test.tsx}`
- Create: `packages/ui/src/components/SectionHeading/{SectionHeading.tsx,SectionHeading.css,SectionHeading.stories.tsx}`
- Modify: `packages/ui/src/styles.css`, `packages/ui/src/index.ts`

**Interfaces:**
- Consumes: `cx`, `toneClass`, `SectionTone`, `sectionTones` (Task 1)
- Produces:
  - `type ContainerWidth = 'narrow' | 'base' | 'wide'`; `Container({ width = 'base' })`
  - `Section({ tone = 'white', padding: 'sm' | 'md' | 'lg' = 'md', width: ContainerWidth | 'none' = 'base', id })`. Wraps children in a `Container` unless `width="none"`.
  - `SectionHeading({ eyebrow?, title, lead?, align: 'center' | 'start' = 'center', level: 1 | 2 | 3 = 2 })`

- [ ] **Step 1: Write the failing Section test**

`packages/ui/src/components/Section/Section.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Section } from './Section';

describe('Section', () => {
  it('applies the tone class and wraps children in a container', () => {
    const { container } = render(<Section tone="mint" id="about">תוכן</Section>);
    const section = container.querySelector('section')!;
    expect(section).toHaveAttribute('id', 'about');
    expect(section).toHaveClass('bs-section', 'bs-tone--mint', 'bs-section--md');
    expect(section.querySelector('.bs-container--base')).toHaveTextContent('תוכן');
  });

  it('skips the container with width="none"', () => {
    const { container } = render(<Section width="none">תוכן</Section>);
    expect(container.querySelector('.bs-container')).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test --workspace @babysteps/ui -- Section`
Expected: FAIL, `Failed to resolve import "./Section"`.

- [ ] **Step 3: Write Container, Section and SectionHeading**

`packages/ui/src/components/Container/Container.tsx`:

```tsx
import type { HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';

export type ContainerWidth = 'narrow' | 'base' | 'wide';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** narrow 720px (text, forms), base 1040px, wide 1240px (hero, nav). */
  width?: ContainerWidth;
}

export function Container({ width = 'base', className, ...rest }: ContainerProps) {
  return <div className={cx('bs-container', `bs-container--${width}`, className)} {...rest} />;
}
```

`packages/ui/src/components/Container/Container.css`:

```css
.bs-container {
  width: 100%;
  margin-inline: auto;
  padding-inline: var(--space-4);
}

@media (min-width: 768px) {
  .bs-container {
    padding-inline: var(--space-5);
  }
}

.bs-container--narrow { max-width: var(--container-narrow); }
.bs-container--base { max-width: var(--container-base); }
.bs-container--wide { max-width: var(--container-wide); }
```

`packages/ui/src/components/Container/Container.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Container } from './Container';

const box = { background: 'var(--surface-peach)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)' };

const meta = {
  title: 'Layout/Container',
  component: Container,
  parameters: { bsFlush: true },
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Widths: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-4)', paddingBlock: 'var(--space-6)' }}>
      <Container width="narrow"><div style={box}>narrow · 720px</div></Container>
      <Container width="base"><div style={box}>base · 1040px</div></Container>
      <Container width="wide"><div style={box}>wide · 1240px</div></Container>
    </div>
  ),
};
```

`packages/ui/src/components/Section/Section.tsx`:

```tsx
import type { HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import { toneClass, type SectionTone } from '../../utils/tone';
import { Container, type ContainerWidth } from '../Container/Container';

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  /** Background color. cocoa also switches text to white. */
  tone?: SectionTone;
  /** Vertical space. */
  padding?: 'sm' | 'md' | 'lg';
  /** Inner container width, or "none" to manage layout yourself. */
  width?: ContainerWidth | 'none';
}

export function Section({ tone = 'white', padding = 'md', width = 'base', className, children, ...rest }: SectionProps) {
  return (
    <section className={cx('bs-section', toneClass(tone), `bs-section--${padding}`, className)} {...rest}>
      {width === 'none' ? children : <Container width={width}>{children}</Container>}
    </section>
  );
}
```

`packages/ui/src/components/Section/Section.css`:

```css
.bs-section {
  position: relative;
  background: var(--bs-tone);
  color: var(--bs-tone-ink, inherit);
}

.bs-section--sm { padding-block: var(--space-6); }
.bs-section--md { padding-block: var(--space-7); }
.bs-section--lg { padding-block: var(--space-8); }

@media (min-width: 768px) {
  .bs-section--md { padding-block: var(--space-8); }
  .bs-section--lg { padding-block: var(--space-9); }
}
```

`packages/ui/src/components/SectionHeading/SectionHeading.tsx`:

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';

export interface SectionHeadingProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Small label above the title. */
  eyebrow?: ReactNode;
  /** Wrap words in <em> for a terracotta highlight. */
  title: ReactNode;
  lead?: ReactNode;
  align?: 'center' | 'start';
  level?: 1 | 2 | 3;
}

export function SectionHeading({ eyebrow, title, lead, align = 'center', level = 2, className, ...rest }: SectionHeadingProps) {
  const Heading = `h${level}` as 'h1' | 'h2' | 'h3';
  return (
    <div className={cx('bs-section-heading', `bs-section-heading--${align}`, className)} {...rest}>
      {eyebrow && <p className="bs-section-heading__eyebrow">{eyebrow}</p>}
      <Heading className="bs-section-heading__title">{title}</Heading>
      {lead && <p className="bs-section-heading__lead">{lead}</p>}
    </div>
  );
}
```

`packages/ui/src/components/SectionHeading/SectionHeading.css`:

```css
.bs-section-heading {
  display: grid;
  gap: var(--space-3);
  margin-block-end: var(--space-6);
}

.bs-section-heading--center {
  text-align: center;
  justify-items: center;
  max-width: 680px;
  margin-inline: auto;
}

.bs-section-heading__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-caption);
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--bs-ink-soft, var(--color-brand-500));
}

.bs-section-heading__eyebrow::before {
  content: '';
  width: 24px;
  height: 3px;
  border-radius: var(--radius-pill);
  background: var(--color-accent);
}

.bs-section-heading__title {
  font-size: var(--text-h2);
}

.bs-section-heading__lead {
  font-size: var(--text-lead);
  color: var(--bs-ink-soft, var(--color-ink-soft));
  max-width: 60ch;
}
```

`packages/ui/src/components/SectionHeading/SectionHeading.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SectionHeading } from './SectionHeading';

const meta = {
  title: 'Layout/SectionHeading',
  component: SectionHeading,
  args: {
    eyebrow: 'תוכן הקורס',
    title: <>מה <em>מחכה לך</em> בפנים?</>,
    lead: 'כל מה שצריך כדי לעזור לתינוק שלך להתהפך, בצעדים קטנים ומהסלון שלך.',
  },
} satisfies Meta<typeof SectionHeading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Centered: Story = {};
export const Start: Story = { args: { align: 'start' } };
export const TitleOnly: Story = { args: { eyebrow: undefined, lead: undefined, title: 'מה אומרות האמהות?' } };
```

`packages/ui/src/components/Section/Section.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { sectionTones } from '../../utils/tone';
import { Section } from './Section';
import { SectionHeading } from '../SectionHeading/SectionHeading';

const meta = {
  title: 'Layout/Section',
  component: Section,
  parameters: { bsFlush: true },
  args: { tone: 'peach' },
  argTypes: { tone: { control: 'select', options: sectionTones } },
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Peach: Story = {
  render: (args) => (
    <Section {...args}>
      <SectionHeading eyebrow="מזהה את עצמך?" title="האם זה המצב אצלכם כרגע?" lead="שלושה מצבים נפוצים שאמהות מספרות לי עליהם." />
    </Section>
  ),
};

export const Cocoa: Story = {
  args: { tone: 'cocoa' },
  render: (args) => (
    <Section {...args}>
      <SectionHeading eyebrow="הצטרפות" title="מוכנה להתחיל?" lead="גישה מיידית לכל הסרטונים וליווי אישי בווטסאפ." />
    </Section>
  ),
};

export const AllTones: Story = {
  render: () => (
    <>
      {sectionTones.map((tone) => (
        <Section key={tone} tone={tone} padding="sm">
          <SectionHeading title={`tone="${tone}"`} />
        </Section>
      ))}
    </>
  ),
};
```

- [ ] **Step 4: Register styles and exports**

Append to `packages/ui/src/styles.css`:

```css
@import './components/Container/Container.css';
@import './components/Section/Section.css';
@import './components/SectionHeading/SectionHeading.css';
```

Append to `packages/ui/src/index.ts`:

```ts
export { Container, type ContainerProps, type ContainerWidth } from './components/Container/Container';
export { Section, type SectionProps } from './components/Section/Section';
export { SectionHeading, type SectionHeadingProps } from './components/SectionHeading/SectionHeading';
```

- [ ] **Step 5: Run tests and typecheck**

Run: `npm test --workspace @babysteps/ui && npm run typecheck --workspace @babysteps/ui`
Expected: PASS, typecheck exit 0.

- [ ] **Step 6: Commit**

```bash
git add packages/ui
git commit -m "feat(ui): add Container, Section and SectionHeading"
```

---

### Task 5: SiteNav and Footer

**Files:**
- Create: `packages/ui/src/components/SiteNav/{SiteNav.tsx,SiteNav.css,SiteNav.stories.tsx,SiteNav.test.tsx}`
- Create: `packages/ui/src/components/Footer/{Footer.tsx,Footer.css,Footer.stories.tsx}`
- Modify: `packages/ui/src/styles.css`, `packages/ui/src/index.ts`

**Interfaces:**
- Consumes: `cx`, `toneClass`, `BrandLogo`, `NavLink` (Task 1), `Icon`, `IconName` (Task 2), `Button` (Task 3), `Container` (Task 4)
- Produces:
  - `SiteNav({ logo?: BrandLogo, title?, links?: NavLink[] = [], cta?: { label: ReactNode; href: string }, menuLabel = 'תפריט' })`. Mobile menu toggle has `aria-expanded` and `aria-controls`; `Escape` and link clicks close it.
  - `interface SocialLink { label: string; href: string; icon: IconName }`
  - `Footer({ logo?, title?, tagline?, links?: NavLink[] = [], social?: SocialLink[] = [], note? })`. Always cocoa.

- [ ] **Step 1: Write the failing SiteNav tests**

`packages/ui/src/components/SiteNav/SiteNav.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SiteNav } from './SiteNav';

const links = [
  { label: 'הקורסים', href: '#courses' },
  { label: 'מי אני', href: '#about' },
];

function toggle() {
  return screen.getByRole('button', { name: 'תפריט' });
}

describe('SiteNav', () => {
  it('toggles the mobile menu', async () => {
    render(<SiteNav title="מתחילים בקטן" links={links} />);
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(toggle());
    expect(toggle()).toHaveAttribute('aria-expanded', 'true');
    const menuId = toggle().getAttribute('aria-controls')!;
    expect(document.getElementById(menuId)).toBeInTheDocument();
    await userEvent.click(toggle());
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on Escape', async () => {
    render(<SiteNav links={links} />);
    await userEvent.click(toggle());
    await userEvent.keyboard('{Escape}');
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes when a link is clicked', async () => {
    render(<SiteNav links={links} />);
    await userEvent.click(toggle());
    await userEvent.click(screen.getByRole('link', { name: 'מי אני' }));
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
  });

  it('has no toggle when there are no links and no cta', () => {
    render(<SiteNav title="מתחילים בקטן" />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test --workspace @babysteps/ui -- SiteNav`
Expected: FAIL, `Failed to resolve import "./SiteNav"`.

- [ ] **Step 3: Write SiteNav**

`packages/ui/src/components/SiteNav/SiteNav.tsx`:

```tsx
import { useEffect, useId, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import type { BrandLogo, NavLink } from '../../utils/brand';
import { Icon } from '../Icon/Icon';
import { Button } from '../Button/Button';
import { Container } from '../Container/Container';

export interface SiteNavProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  logo?: BrandLogo;
  /** Brand name shown next to the logo. */
  title?: ReactNode;
  links?: NavLink[];
  cta?: { label: ReactNode; href: string };
  /** Accessible name of the menu and its toggle. */
  menuLabel?: string;
}

export function SiteNav({ logo, title, links = [], cta, menuLabel = 'תפריט', className, ...rest }: SiteNavProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const hasMenu = links.length > 0 || cta !== undefined;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={cx('bs-sitenav', open && 'bs-sitenav--open', className)} {...rest}>
      <Container width="wide" className="bs-sitenav__bar">
        <a className="bs-sitenav__brand" href={logo?.href ?? '/'}>
          {logo && <img className="bs-sitenav__logo" src={logo.src} alt={logo.alt} />}
          {title && <span className="bs-sitenav__title">{title}</span>}
        </a>
        {hasMenu && (
          <>
            <button
              type="button"
              className="bs-sitenav__toggle"
              aria-expanded={open}
              aria-controls={menuId}
              onClick={() => setOpen((value) => !value)}
            >
              <Icon name={open ? 'close' : 'menu'} size={24} />
              <span className="bs-visually-hidden">{menuLabel}</span>
            </button>
            <nav id={menuId} className="bs-sitenav__menu" aria-label={menuLabel}>
              {links.length > 0 && (
                <ul className="bs-sitenav__links">
                  {links.map((link) => (
                    <li key={link.href}>
                      <a className="bs-sitenav__link" href={link.href} onClick={close}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              {cta && (
                <Button href={cta.href} size="sm" icon="arrow" onClick={close}>
                  {cta.label}
                </Button>
              )}
            </nav>
          </>
        )}
      </Container>
    </header>
  );
}
```

`packages/ui/src/components/SiteNav/SiteNav.css`:

```css
.bs-sitenav {
  position: sticky;
  inset-block-start: 0;
  z-index: 40;
  background: color-mix(in srgb, var(--surface-cream) 88%, transparent);
  backdrop-filter: blur(10px);
  border-block-end: 1px solid var(--color-border);
}

.bs-sitenav__bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  min-height: 68px;
}

.bs-sitenav__brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  text-decoration: none;
}

.bs-sitenav__logo {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}

.bs-sitenav__title {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  color: var(--color-brand-700);
}

.bs-sitenav__toggle {
  display: inline-grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-brand-700);
  cursor: pointer;
}

.bs-sitenav__menu {
  display: none;
}

.bs-sitenav--open .bs-sitenav__menu {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--space-4);
  position: absolute;
  inset-inline: var(--space-4);
  inset-block-start: calc(100% + var(--space-2));
  padding: var(--space-5);
  background: var(--surface-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.bs-sitenav__links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.bs-sitenav__link {
  display: block;
  padding: var(--space-2) var(--space-1);
  font-weight: 500;
  text-decoration: none;
  color: var(--color-ink);
  border-radius: var(--radius-sm);
}

.bs-sitenav__link:hover {
  color: var(--color-brand-600);
}

@media (min-width: 768px) {
  .bs-sitenav__toggle {
    display: none;
  }

  .bs-sitenav__menu,
  .bs-sitenav--open .bs-sitenav__menu {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--space-5);
    position: static;
    padding: 0;
    background: none;
    box-shadow: none;
  }

  .bs-sitenav__links {
    flex-direction: row;
    gap: var(--space-5);
  }
}
```

- [ ] **Step 4: Run the SiteNav tests to verify they pass**

Run: `npm test --workspace @babysteps/ui -- SiteNav`
Expected: PASS, 4 tests.

- [ ] **Step 5: Write Footer and the stories**

`packages/ui/src/components/Footer/Footer.tsx`:

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { toneClass } from '../../utils/tone';
import type { BrandLogo, NavLink } from '../../utils/brand';
import { Icon, type IconName } from '../Icon/Icon';
import { Container } from '../Container/Container';

export interface SocialLink {
  /** Accessible name, e.g. "WhatsApp". */
  label: string;
  href: string;
  icon: IconName;
}

export interface FooterProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  logo?: BrandLogo;
  title?: ReactNode;
  tagline?: ReactNode;
  links?: NavLink[];
  social?: SocialLink[];
  /** Copyright line. */
  note?: ReactNode;
}

export function Footer({ logo, title, tagline, links = [], social = [], note, className, ...rest }: FooterProps) {
  return (
    <footer className={cx('bs-footer', toneClass('cocoa'), className)} {...rest}>
      <Container width="base" className="bs-footer__inner">
        {(logo || title || tagline) && (
          <div className="bs-footer__brand">
            {logo && <img className="bs-footer__logo" src={logo.src} alt={logo.alt} />}
            {title && <p className="bs-footer__title">{title}</p>}
            {tagline && <p className="bs-footer__tagline">{tagline}</p>}
          </div>
        )}
        {links.length > 0 && (
          <nav aria-label="קישורים">
            <ul className="bs-footer__links">
              {links.map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        )}
        {social.length > 0 && (
          <ul className="bs-footer__social">
            {social.map((item) => (
              <li key={item.href}>
                <a href={item.href} aria-label={item.label} target="_blank" rel="noopener noreferrer">
                  <Icon name={item.icon} size={20} />
                </a>
              </li>
            ))}
          </ul>
        )}
        {note && <p className="bs-footer__note">{note}</p>}
      </Container>
    </footer>
  );
}
```

`packages/ui/src/components/Footer/Footer.css`:

```css
.bs-footer {
  background: var(--bs-tone);
  color: var(--bs-tone-ink);
  padding-block: var(--space-8) var(--space-6);
}

.bs-footer__inner {
  display: grid;
  justify-items: center;
  gap: var(--space-5);
  text-align: center;
}

.bs-footer__brand {
  display: grid;
  justify-items: center;
  gap: var(--space-2);
}

.bs-footer__logo {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--surface-card);
  padding: var(--space-1);
  object-fit: cover;
}

.bs-footer__title {
  font-family: var(--font-heading);
  font-size: var(--text-h3);
}

.bs-footer__tagline {
  font-size: var(--text-caption);
  color: var(--bs-ink-soft);
}

.bs-footer__links,
.bs-footer__social {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-3) var(--space-5);
}

.bs-footer__links a {
  text-decoration: none;
  color: var(--bs-ink-soft);
}

.bs-footer__links a:hover {
  color: var(--color-on-brand);
}

.bs-footer__social a {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-on-brand) 12%, transparent);
  transition: background-color var(--duration-fast) var(--ease-soft);
}

.bs-footer__social a:hover {
  background: color-mix(in srgb, var(--color-on-brand) 24%, transparent);
}

.bs-footer__note {
  font-size: var(--text-caption);
  color: var(--bs-ink-soft);
}
```

`packages/ui/src/components/Footer/Footer.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Footer } from './Footer';

const meta = {
  title: 'Layout/Footer',
  component: Footer,
  parameters: { bsFlush: true },
  args: {
    logo: { src: '/logo-peach.png', alt: 'מתחילים בקטן' },
    title: 'ירדן שוהם · מתחילים בקטן',
    tagline: 'מלווה התפתחותית · קורסים דיגיטליים לתינוקות',
    social: [
      { label: 'WhatsApp', href: 'https://wa.me/972542366243', icon: 'whatsapp' },
      { label: 'Instagram', href: 'https://instagram.com/', icon: 'instagram' },
    ],
    note: '© 2026 ירדן שוהם · כל הזכויות שמורות',
  },
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithLinks: Story = {
  args: {
    links: [
      { label: 'הקורסים', href: '#courses' },
      { label: 'מי אני', href: '#about' },
      { label: 'תנאי שימוש', href: '/terms' },
    ],
  },
};
```

`packages/ui/src/components/SiteNav/SiteNav.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SiteNav } from './SiteNav';

const meta = {
  title: 'Layout/SiteNav',
  component: SiteNav,
  parameters: { bsFlush: true },
  args: {
    logo: { src: '/logo-peach.png', alt: '' },
    title: 'מתחילים בקטן',
    links: [
      { label: 'הקורסים', href: '#courses' },
      { label: 'מי אני', href: '#about' },
      { label: 'המלצות', href: '#reviews' },
    ],
    cta: { label: 'לרכישה', href: '#register' },
  },
} satisfies Meta<typeof SiteNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = {};
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile2', isRotated: false } },
};
export const BrandOnly: Story = { args: { links: [], cta: undefined } };
```

- [ ] **Step 6: Register styles and exports**

Append to `packages/ui/src/styles.css`:

```css
@import './components/SiteNav/SiteNav.css';
@import './components/Footer/Footer.css';
```

Append to `packages/ui/src/index.ts`:

```ts
export { SiteNav, type SiteNavProps } from './components/SiteNav/SiteNav';
export { Footer, type FooterProps, type SocialLink } from './components/Footer/Footer';
```

- [ ] **Step 7: Run tests and typecheck**

Run: `npm test --workspace @babysteps/ui && npm run typecheck --workspace @babysteps/ui`
Expected: PASS, typecheck exit 0.

- [ ] **Step 8: Check the mobile menu by hand**

Run: `npm run storybook --workspace @babysteps/ui`, open `Layout/SiteNav/Mobile`, click the menu button.
Expected: a white rounded panel opens under the bar with the links and the CTA; the icon turns into a close icon. If the `mobile2` viewport name does not exist in this Storybook version, pick any phone viewport from the toolbar and change the `globals.viewport.value` to that name.

- [ ] **Step 9: Commit**

```bash
git add packages/ui
git commit -m "feat(ui): add SiteNav and Footer"
```

---

### Task 6: Landing content blocks (Hero, FeatureSteps, ProblemCard, CredentialPill, HighlightBox)

**Files:**
- Create: `packages/ui/src/components/Hero/{Hero.tsx,Hero.css,Hero.stories.tsx}`
- Create: `packages/ui/src/components/FeatureSteps/{FeatureSteps.tsx,FeatureSteps.css,FeatureSteps.stories.tsx,FeatureSteps.test.tsx}`
- Create: `packages/ui/src/components/ProblemCard/{ProblemCard.tsx,ProblemCard.css,ProblemCard.stories.tsx}`
- Create: `packages/ui/src/components/CredentialPill/{CredentialPill.tsx,CredentialPill.css,CredentialPill.stories.tsx}`
- Create: `packages/ui/src/components/HighlightBox/{HighlightBox.tsx,HighlightBox.css,HighlightBox.stories.tsx}`
- Modify: `packages/ui/src/styles.css`, `packages/ui/src/index.ts`

**Interfaces:**
- Consumes: `cx`, `toneClass`, `SectionTone` (Task 1), `Icon`, `IconName`, `StarRating` (Task 2), `Badge`, `Card`, `Button` (Task 3), `Container` (Task 4)
- Produces:
  - `Hero({ tag?, title, subtitle?, actions?, proof?, media?, tone: SectionTone = 'peach' })`. With `media`: two columns on desktop. Without: centered.
  - `interface FeatureStep { title: ReactNode; text?: ReactNode; badge?: ReactNode }`; `FeatureSteps({ steps })` renders an `<ol>`.
  - `ProblemCard({ icon?: IconName, emoji?: string, title, text? })`
  - `CredentialPill({ icon: IconName = 'check', children })`
  - `type BoxTone = 'peach' | 'mint' | 'sky' | 'blush'`; `HighlightBox({ tone: BoxTone = 'mint', title?, icon?, children })`

- [ ] **Step 1: Write the failing FeatureSteps test**

`packages/ui/src/components/FeatureSteps/FeatureSteps.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeatureSteps } from './FeatureSteps';

describe('FeatureSteps', () => {
  it('renders an ordered list with one item per step', () => {
    render(
      <FeatureSteps
        steps={[
          { title: '10 סרטוני הדרכה', text: 'תרגילים מפורטים.' },
          { title: 'ליווי אישי בווטסאפ', badge: 'הכי שווה' },
        ]}
      />,
    );
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('1');
    expect(items[1]).toHaveTextContent('הכי שווה');
  });

  it('renders nothing for an empty list', () => {
    const { container } = render(<FeatureSteps steps={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test --workspace @babysteps/ui -- FeatureSteps`
Expected: FAIL, `Failed to resolve import "./FeatureSteps"`.

- [ ] **Step 3: Write FeatureSteps**

`packages/ui/src/components/FeatureSteps/FeatureSteps.tsx`:

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Badge } from '../Badge/Badge';

export interface FeatureStep {
  title: ReactNode;
  text?: ReactNode;
  /** Optional highlight badge, e.g. "הכי שווה". */
  badge?: ReactNode;
}

export interface FeatureStepsProps extends HTMLAttributes<HTMLOListElement> {
  steps: FeatureStep[];
}

export function FeatureSteps({ steps, className, ...rest }: FeatureStepsProps) {
  if (steps.length === 0) return null;
  return (
    <ol className={cx('bs-feature-steps', className)} {...rest}>
      {steps.map((step, i) => (
        <li key={i} className="bs-feature-steps__item">
          <span className="bs-feature-steps__num" aria-hidden="true">{i + 1}</span>
          <div className="bs-feature-steps__body">
            <h3 className="bs-feature-steps__title">
              {step.title}
              {step.badge && <Badge variant="highlight">{step.badge}</Badge>}
            </h3>
            {step.text && <p className="bs-feature-steps__text">{step.text}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
```

`packages/ui/src/components/FeatureSteps/FeatureSteps.css`:

```css
.bs-feature-steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--space-4);
}

.bs-feature-steps__item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  padding: var(--space-5);
  background: var(--surface-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.bs-feature-steps__num {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-brand-600);
  color: var(--color-on-brand);
  font-family: var(--font-heading);
  font-size: var(--text-h3);
  box-shadow: var(--shadow-brand);
}

.bs-feature-steps__title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-h3);
  margin-block-end: var(--space-1);
}

.bs-feature-steps__text {
  color: var(--color-ink-soft);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test --workspace @babysteps/ui -- FeatureSteps`
Expected: PASS, 2 tests.

- [ ] **Step 5: Write Hero, ProblemCard, CredentialPill and HighlightBox**

`packages/ui/src/components/Hero/Hero.tsx`:

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { toneClass, type SectionTone } from '../../utils/tone';
import { Badge } from '../Badge/Badge';
import { Container } from '../Container/Container';

export interface HeroProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Small white label above the title. */
  tag?: ReactNode;
  /** The page h1. Wrap words in <em> for a terracotta highlight. */
  title: ReactNode;
  subtitle?: ReactNode;
  /** Usually one or two Buttons. */
  actions?: ReactNode;
  /** Social proof line under the actions, e.g. StarRating + "200+ אמהות". */
  proof?: ReactNode;
  /** Image or VideoFrame. Switches to a two-column layout on desktop. */
  media?: ReactNode;
  tone?: SectionTone;
}

export function Hero({ tag, title, subtitle, actions, proof, media, tone = 'peach', className, ...rest }: HeroProps) {
  return (
    <section className={cx('bs-hero', toneClass(tone), media ? 'bs-hero--split' : 'bs-hero--center', className)} {...rest}>
      <div className="bs-hero__shapes" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <Container width="wide" className="bs-hero__inner">
        <div className="bs-hero__content">
          {tag && <Badge variant="tag">{tag}</Badge>}
          <h1 className="bs-hero__title">{title}</h1>
          {subtitle && <p className="bs-hero__subtitle">{subtitle}</p>}
          {actions && <div className="bs-hero__actions">{actions}</div>}
          {proof && <div className="bs-hero__proof">{proof}</div>}
        </div>
        {media && <div className="bs-hero__media">{media}</div>}
      </Container>
    </section>
  );
}
```

`packages/ui/src/components/Hero/Hero.css`:

```css
.bs-hero {
  position: relative;
  overflow: hidden;
  background: var(--bs-tone);
  color: var(--bs-tone-ink, inherit);
  padding-block: var(--space-8);
}

@media (min-width: 768px) {
  .bs-hero {
    padding-block: var(--space-9);
  }
}

.bs-hero__shapes span {
  position: absolute;
  border-radius: 50%;
  opacity: 0.75;
}

.bs-hero__shapes span:nth-child(1) {
  width: 340px;
  height: 340px;
  background: var(--surface-mint);
  inset-block-start: -140px;
  inset-inline-end: -110px;
}

.bs-hero__shapes span:nth-child(2) {
  width: 240px;
  height: 240px;
  background: var(--surface-blush);
  inset-block-end: -90px;
  inset-inline-start: -70px;
}

.bs-hero__shapes span:nth-child(3) {
  width: 88px;
  height: 88px;
  border-radius: var(--radius-xl);
  background: var(--surface-card);
  opacity: 0.55;
  inset-block-start: 16%;
  inset-inline-start: 7%;
  transform: rotate(18deg);
}

.bs-hero__inner {
  position: relative;
  display: grid;
  gap: var(--space-7);
  align-items: center;
}

@media (min-width: 900px) {
  .bs-hero--split .bs-hero__inner {
    grid-template-columns: 1.1fr 1fr;
  }
}

.bs-hero--center .bs-hero__content {
  display: grid;
  justify-items: center;
  text-align: center;
  max-width: 780px;
  margin-inline: auto;
}

.bs-hero__title {
  font-size: var(--text-display);
  margin-block: var(--space-4);
}

.bs-hero__subtitle {
  font-size: var(--text-lead);
  color: var(--bs-ink-soft, var(--color-ink-soft));
  max-width: 56ch;
}

.bs-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-block-start: var(--space-6);
}

.bs-hero--center .bs-hero__actions,
.bs-hero--center .bs-hero__proof {
  justify-content: center;
}

.bs-hero__proof {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  margin-block-start: var(--space-5);
  font-size: var(--text-caption);
  font-weight: 500;
  color: var(--bs-ink-soft, var(--color-ink-soft));
}

.bs-hero__media img {
  width: 100%;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  object-fit: cover;
}
```

`packages/ui/src/components/ProblemCard/ProblemCard.tsx`:

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Icon, type IconName } from '../Icon/Icon';
import { Card } from '../Card/Card';

export interface ProblemCardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  icon?: IconName;
  /** Used instead of icon when set. */
  emoji?: string;
  title: ReactNode;
  text?: ReactNode;
}

export function ProblemCard({ icon, emoji, title, text, className, ...rest }: ProblemCardProps) {
  return (
    <Card as="article" padding="lg" hoverLift className={cx('bs-problem-card', className)} {...rest}>
      {(emoji || icon) && (
        <span className="bs-problem-card__icon" aria-hidden="true">
          {emoji ?? (icon && <Icon name={icon} size={28} />)}
        </span>
      )}
      <h3 className="bs-problem-card__title">{title}</h3>
      {text && <p className="bs-problem-card__text">{text}</p>}
    </Card>
  );
}
```

`packages/ui/src/components/ProblemCard/ProblemCard.css`:

```css
.bs-problem-card {
  display: grid;
  gap: var(--space-3);
  align-content: start;
}

.bs-problem-card__icon {
  display: grid;
  place-items: center;
  width: 60px;
  height: 60px;
  border-radius: var(--radius-lg);
  background: var(--surface-mint);
  color: var(--color-brand-600);
  font-size: 30px;
  line-height: 1;
}

.bs-problem-card__title {
  font-size: var(--text-h3);
}

.bs-problem-card__text {
  color: var(--color-ink-soft);
}
```

`packages/ui/src/components/CredentialPill/CredentialPill.tsx`:

```tsx
import type { HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import { Icon, type IconName } from '../Icon/Icon';

export interface CredentialPillProps extends HTMLAttributes<HTMLSpanElement> {
  icon?: IconName;
}

export function CredentialPill({ icon = 'check', className, children, ...rest }: CredentialPillProps) {
  return (
    <span className={cx('bs-credential-pill', className)} {...rest}>
      <span className="bs-credential-pill__icon">
        <Icon name={icon} size={14} />
      </span>
      {children}
    </span>
  );
}
```

`packages/ui/src/components/CredentialPill/CredentialPill.css`:

```css
.bs-credential-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4) var(--space-2) var(--space-3);
  background: var(--surface-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  box-shadow: var(--shadow-sm);
  font-size: var(--text-caption);
  font-weight: 500;
  color: var(--color-brand-700);
}

.bs-credential-pill__icon {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--surface-mint);
  color: var(--color-success);
}
```

`packages/ui/src/components/HighlightBox/HighlightBox.tsx`:

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { toneClass } from '../../utils/tone';
import { Icon, type IconName } from '../Icon/Icon';

export type BoxTone = 'peach' | 'mint' | 'sky' | 'blush';

export interface HighlightBoxProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: BoxTone;
  title?: ReactNode;
  icon?: IconName;
}

export function HighlightBox({ tone = 'mint', title, icon, className, children, ...rest }: HighlightBoxProps) {
  return (
    <div className={cx('bs-highlight-box', toneClass(tone), className)} {...rest}>
      {icon && (
        <span className="bs-highlight-box__icon" aria-hidden="true">
          <Icon name={icon} size={24} />
        </span>
      )}
      <div className="bs-highlight-box__content">
        {title && <p className="bs-highlight-box__title">{title}</p>}
        {children && <div className="bs-highlight-box__body">{children}</div>}
      </div>
    </div>
  );
}
```

`packages/ui/src/components/HighlightBox/HighlightBox.css`:

```css
.bs-highlight-box {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  padding: var(--space-6);
  background: var(--bs-tone);
  border-radius: var(--radius-xl);
  border-inline-start: 5px solid var(--color-accent);
}

.bs-highlight-box__icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--surface-card);
  color: var(--color-accent);
}

.bs-highlight-box__title {
  font-family: var(--font-heading);
  font-size: var(--text-h3);
  color: var(--color-brand-700);
  margin-block-end: var(--space-2);
}

.bs-highlight-box__body {
  color: var(--color-ink-soft);
}
```

`packages/ui/src/components/Hero/Hero.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Hero } from './Hero';
import { Button } from '../Button/Button';
import { StarRating } from '../StarRating/StarRating';

const meta = {
  title: 'Landing/Hero',
  component: Hero,
  parameters: { bsFlush: true },
  args: {
    tag: 'קורס דיגיטלי · צפייה מיידית',
    title: <>לעזור לבייבי שלך <em>להתהפך</em>, בצורה רגועה ומקצועית</>,
    subtitle: 'היי אהובה, כאן ירדן. בניתי עבורך קורס דיגיטלי ממוקד שייתן לך את כל הכלים לעזור לתינוק שלך לעבור את שלב ההתהפכות, בביטחון מלא.',
    actions: (
      <>
        <Button size="lg" icon="arrow">רכישה וגישה מיידית</Button>
        <Button size="lg" variant="outline">מה יש בקורס?</Button>
      </>
    ),
    proof: (
      <>
        <StarRating value={5} size={16} />
        <span>200+ אמהות מרוצות</span>
      </>
    ),
  },
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Centered: Story = {};
export const WithImage: Story = {
  args: { media: <img src="/about.jpg" alt="ירדן שוהם עם תינוק" /> },
};
export const MintTone: Story = {
  args: { tone: 'mint', tag: 'אתגר 5 ימים · חינם', title: <>5 ימים של <em>שכיבה על הבטן</em>, בלי בכי</>, proof: undefined },
};
```

`packages/ui/src/components/FeatureSteps/FeatureSteps.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FeatureSteps } from './FeatureSteps';

const meta = {
  title: 'Landing/FeatureSteps',
  component: FeatureSteps,
  args: {
    steps: [
      { title: '10 סרטוני הדרכה פרקטיים', text: 'תרגילים מפורטים שניתן ליישם מיד, מהסלון שלך, ללא ציוד מיוחד.' },
      { title: '6 טיפי זהב', text: 'טיפים מעשיים שיעזרו לך ללוות את התינוק בצורה הכי נכונה.' },
      { title: 'בונוס: הכנה לשלב הזחילה', text: 'סרטון ייחודי שיבנה את התשתית המוטורית לשלב ההתפתחותי הבא.' },
      { title: 'ליווי אישי בווטסאפ', text: 'שולחת לי סרטון של התרגול, ואני מחזירה פידבק ודיוק אישי.', badge: 'הכי שווה' },
    ],
  },
} satisfies Meta<typeof FeatureSteps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: (args) => <div style={{ maxWidth: 720 }}><FeatureSteps {...args} /></div> };
```

`packages/ui/src/components/ProblemCard/ProblemCard.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProblemCard } from './ProblemCard';

const meta = {
  title: 'Landing/ProblemCard',
  component: ProblemCard,
  args: {
    emoji: '🙆',
    title: 'התינוק לא מתהפך כלל',
    text: 'אתם מנסים, אבל הוא עדיין לא עושה את התנועה בעצמו ואתם לא בטוחים מה לעשות.',
  },
} satisfies Meta<typeof ProblemCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithEmoji: Story = { render: (args) => <div style={{ maxWidth: 320 }}><ProblemCard {...args} /></div> };
export const WithIcon: Story = {
  args: { emoji: undefined, icon: 'baby', title: 'מתהפך רק לפעמים', text: 'יש ניסיונות, אבל ההתהפכות לא קורית בצורה עקבית ועצמאית.' },
  render: (args) => <div style={{ maxWidth: 320 }}><ProblemCard {...args} /></div>,
};
export const Grid: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-5)' }}>
      <ProblemCard emoji="🙆" title="התינוק לא מתהפך כלל" text="אתם מנסים, אבל הוא עדיין לא עושה את התנועה בעצמו." />
      <ProblemCard emoji="🔄" title="מתהפך רק לפעמים" text="יש ניסיונות, אבל ההתהפכות לא קורית בצורה עקבית." />
      <ProblemCard emoji="↩️" title="מתהפך לכיוון אחד בלבד" text="מצליח לצד אחד אבל מתקשה עם הצד השני." />
    </div>
  ),
};
```

`packages/ui/src/components/CredentialPill/CredentialPill.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CredentialPill } from './CredentialPill';

const meta = {
  title: 'Landing/CredentialPill',
  component: CredentialPill,
  args: { children: 'מלווה התפתחותית מוסמכת' },
} satisfies Meta<typeof CredentialPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Row: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
      <CredentialPill>מלווה התפתחותית מוסמכת</CredentialPill>
      <CredentialPill icon="heart">מדריכת בייבי יוגה</CredentialPill>
      <CredentialPill icon="baby">עיסוי תינוקות</CredentialPill>
    </div>
  ),
};
```

`packages/ui/src/components/HighlightBox/HighlightBox.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { HighlightBox } from './HighlightBox';

const meta = {
  title: 'Landing/HighlightBox',
  component: HighlightBox,
  args: {
    icon: 'sparkle',
    title: 'אם הכרת לפחות אחד מהמצבים האלה',
    children: 'הקורס הזה נבנה בדיוק בשבילך. בצעדים קטנים, עם הידיים, מהסלון שלך.',
  },
} satisfies Meta<typeof HighlightBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Mint: Story = { render: (args) => <div style={{ maxWidth: 720 }}><HighlightBox {...args} /></div> };
export const Peach: Story = { args: { tone: 'peach' }, render: (args) => <div style={{ maxWidth: 720 }}><HighlightBox {...args} /></div> };
export const NoIcon: Story = { args: { icon: undefined, tone: 'sky' }, render: (args) => <div style={{ maxWidth: 720 }}><HighlightBox {...args} /></div> };
```

- [ ] **Step 6: Register styles and exports**

Append to `packages/ui/src/styles.css`:

```css
@import './components/Hero/Hero.css';
@import './components/FeatureSteps/FeatureSteps.css';
@import './components/ProblemCard/ProblemCard.css';
@import './components/CredentialPill/CredentialPill.css';
@import './components/HighlightBox/HighlightBox.css';
```

Append to `packages/ui/src/index.ts`:

```ts
export { Hero, type HeroProps } from './components/Hero/Hero';
export { FeatureSteps, type FeatureStepsProps, type FeatureStep } from './components/FeatureSteps/FeatureSteps';
export { ProblemCard, type ProblemCardProps } from './components/ProblemCard/ProblemCard';
export { CredentialPill, type CredentialPillProps } from './components/CredentialPill/CredentialPill';
export { HighlightBox, type HighlightBoxProps, type BoxTone } from './components/HighlightBox/HighlightBox';
```

- [ ] **Step 7: Run tests and typecheck**

Run: `npm test --workspace @babysteps/ui && npm run typecheck --workspace @babysteps/ui`
Expected: PASS, typecheck exit 0.

- [ ] **Step 8: Commit**

```bash
git add packages/ui
git commit -m "feat(ui): add Hero, FeatureSteps, ProblemCard, CredentialPill and HighlightBox"
```

---
### Task 7: Landing cards (TestimonialCard, PriceCard, CourseCard)

**Files:**
- Create: `packages/ui/src/components/TestimonialCard/{TestimonialCard.tsx,TestimonialCard.css,TestimonialCard.stories.tsx}`
- Create: `packages/ui/src/components/PriceCard/{PriceCard.tsx,PriceCard.css,PriceCard.stories.tsx,PriceCard.test.tsx}`
- Create: `packages/ui/src/components/CourseCard/{CourseCard.tsx,CourseCard.css,CourseCard.stories.tsx,CourseCard.test.tsx}`
- Modify: `packages/ui/src/styles.css`, `packages/ui/src/index.ts`

**Interfaces:**
- Consumes: `cx`, `toneClass` (Task 1), `Icon`, `Avatar`, `StarRating` (Task 2), `Badge`, `Card`, `Button` (Task 3), `BoxTone` (Task 6)
- Produces:
  - `TestimonialCard({ quote, name, detail?, avatar?: string, rating?: number | null = 5 })`. `rating={null}` hides the stars.
  - `PriceCard({ title, price: string, oldPrice?: string, priceNote?, description?, features?: ReactNode[], cta?, featured = false, badge? })`
  - `CourseCard({ title, description?, image?: string, imageAlt?, emoji?, tone: BoxTone = 'peach', meta?: ReactNode[], price?, status?, comingSoon = false, cta? })`. No image: shows `emoji` (default `🍼`).

- [ ] **Step 1: Write the failing tests**

`packages/ui/src/components/PriceCard/PriceCard.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PriceCard } from './PriceCard';

describe('PriceCard', () => {
  it('shows the price, the old price for screen readers, and the features', () => {
    const { container } = render(
      <PriceCard title="גישה מיידית" price="₪175" oldPrice="₪205" features={['גישה מלאה לכל הסרטונים', 'ליווי אישי בווטסאפ']} />,
    );
    expect(screen.getByRole('heading', { name: 'גישה מיידית' })).toBeInTheDocument();
    expect(screen.getByText('₪175')).toBeInTheDocument();
    expect(container.querySelector('s.bs-price-card__old')).toHaveTextContent('מחיר קודם: ₪205');
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('marks the featured card and shows its badge', () => {
    const { container } = render(<PriceCard title="PayPal" price="₪175" featured badge="הכי מומלץ" />);
    expect(container.firstElementChild).toHaveClass('bs-price-card--featured');
    expect(screen.getByText('הכי מומלץ')).toBeInTheDocument();
  });

  it('renders no feature list when features is empty', () => {
    render(<PriceCard title="העברה ידנית" price="₪175" features={[]} />);
    expect(screen.queryByRole('list')).toBeNull();
  });
});
```

`packages/ui/src/components/CourseCard/CourseCard.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CourseCard } from './CourseCard';

describe('CourseCard', () => {
  it('shows the image with alt text when given', () => {
    render(<CourseCard title="קורס התהפכות" image="/about.jpg" imageAlt="תינוק מתהפך" />);
    expect(screen.getByRole('img', { name: 'תינוק מתהפך' })).toHaveAttribute('src', '/about.jpg');
  });

  it('falls back to an emoji without an image', () => {
    const { container } = render(<CourseCard title="קורס שכיבה על הבטן" emoji="🤱" />);
    expect(container.querySelector('img')).toBeNull();
    expect(container).toHaveTextContent('🤱');
  });

  it('marks a coming-soon course as disabled', () => {
    const { container } = render(<CourseCard title="בקרוב" comingSoon status="בקרוב" />);
    expect(container.firstElementChild).toHaveAttribute('aria-disabled', 'true');
    expect(container.firstElementChild).toHaveClass('bs-course-card--soon');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test --workspace @babysteps/ui -- PriceCard CourseCard`
Expected: FAIL, `Failed to resolve import "./PriceCard"` and `"./CourseCard"`.

- [ ] **Step 3: Write PriceCard and CourseCard**

`packages/ui/src/components/PriceCard/PriceCard.tsx`:

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Icon } from '../Icon/Icon';
import { Badge } from '../Badge/Badge';
import { Card } from '../Card/Card';

export interface PriceCardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: ReactNode;
  /** Display string with currency, e.g. "₪175". */
  price: string;
  /** Crossed-out earlier price. */
  oldPrice?: string;
  /** Small line under the price, e.g. "תשלום חד-פעמי". */
  priceNote?: ReactNode;
  description?: ReactNode;
  features?: ReactNode[];
  /** Usually a full-width Button. */
  cta?: ReactNode;
  /** Brand border, larger shadow, peach header. Use for the recommended option. */
  featured?: boolean;
  /** Floating badge on top, e.g. "הכי מומלץ". */
  badge?: ReactNode;
}

export function PriceCard({
  title,
  price,
  oldPrice,
  priceNote,
  description,
  features = [],
  cta,
  featured = false,
  badge,
  className,
  ...rest
}: PriceCardProps) {
  return (
    <Card as="article" padding="none" className={cx('bs-price-card', featured && 'bs-price-card--featured', className)} {...rest}>
      {badge && (
        <Badge variant="highlight" icon="star" className="bs-price-card__badge">
          {badge}
        </Badge>
      )}
      <div className="bs-price-card__header">
        <h3 className="bs-price-card__title">{title}</h3>
        {description && <p className="bs-price-card__desc">{description}</p>}
        <p className="bs-price-card__price">
          <span className="bs-price-card__amount">{price}</span>
          {oldPrice && (
            <s className="bs-price-card__old">
              <span className="bs-visually-hidden">מחיר קודם: </span>
              {oldPrice}
            </s>
          )}
        </p>
        {priceNote && <p className="bs-price-card__note">{priceNote}</p>}
      </div>
      {features.length > 0 && (
        <ul className="bs-price-card__features">
          {features.map((feature, i) => (
            <li key={i}>
              <Icon name="check" size={16} className="bs-price-card__check" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}
      {cta && <div className="bs-price-card__cta">{cta}</div>}
    </Card>
  );
}
```

`packages/ui/src/components/PriceCard/PriceCard.css`:

```css
.bs-price-card {
  display: flex;
  flex-direction: column;
  margin-block-start: var(--space-4);
}

.bs-price-card--featured {
  border: 2px solid var(--color-brand-600);
  box-shadow: var(--shadow-lg);
}

/* Physical left/transform: centers the badge the same way in any direction. */
.bs-price-card__badge {
  position: absolute;
  inset-block-start: 0;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: var(--shadow-sm);
}

.bs-price-card__header {
  display: grid;
  gap: var(--space-2);
  padding: var(--space-6) var(--space-6) var(--space-5);
  border-start-start-radius: inherit;
  border-start-end-radius: inherit;
  text-align: center;
}

.bs-price-card--featured .bs-price-card__header {
  background: var(--surface-peach);
}

.bs-price-card__title {
  font-size: var(--text-h3);
}

.bs-price-card__desc {
  font-size: var(--text-caption);
  color: var(--color-ink-soft);
}

.bs-price-card__price {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: var(--space-3);
  margin-block-start: var(--space-2);
}

.bs-price-card__amount {
  font-family: var(--font-heading);
  font-size: 2.75rem;
  line-height: 1;
  color: var(--color-brand-700);
}

.bs-price-card__old {
  font-size: var(--text-lead);
  color: var(--color-ink-muted);
}

.bs-price-card__note {
  font-size: var(--text-caption);
  color: var(--color-ink-muted);
}

.bs-price-card__features {
  list-style: none;
  margin: 0;
  padding: var(--space-5) var(--space-6) 0;
  display: grid;
  gap: var(--space-3);
}

.bs-price-card__features li {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
}

.bs-price-card__check {
  margin-block-start: 5px;
  color: var(--color-success);
}

.bs-price-card__cta {
  margin-block-start: auto;
  padding: var(--space-5) var(--space-6) var(--space-6);
}

.bs-price-card__cta > .bs-button {
  width: 100%;
}
```

`packages/ui/src/components/CourseCard/CourseCard.tsx`:

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { toneClass } from '../../utils/tone';
import { Badge } from '../Badge/Badge';
import { Card } from '../Card/Card';
import type { BoxTone } from '../HighlightBox/HighlightBox';

export interface CourseCardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: ReactNode;
  description?: ReactNode;
  image?: string;
  imageAlt?: string;
  /** Shown when there is no image. Default "🍼". */
  emoji?: string;
  /** Background of the image area. */
  tone?: BoxTone;
  /** Short facts, e.g. ["10 סרטונים", "ליווי בווטסאפ"]. */
  meta?: ReactNode[];
  price?: ReactNode;
  /** Badge over the image, e.g. "זמין עכשיו" or "בקרוב". */
  status?: ReactNode;
  /** Muted and not clickable. */
  comingSoon?: boolean;
  /** Usually a Button. */
  cta?: ReactNode;
}

export function CourseCard({
  title,
  description,
  image,
  imageAlt,
  emoji = '🍼',
  tone = 'peach',
  meta = [],
  price,
  status,
  comingSoon = false,
  cta,
  className,
  ...rest
}: CourseCardProps) {
  return (
    <Card
      as="article"
      padding="none"
      hoverLift={!comingSoon}
      aria-disabled={comingSoon || undefined}
      className={cx('bs-course-card', comingSoon && 'bs-course-card--soon', className)}
      {...rest}
    >
      <div className={cx('bs-course-card__media', toneClass(tone))}>
        {image ? (
          <img className="bs-course-card__img" src={image} alt={imageAlt ?? ''} />
        ) : (
          <span className="bs-course-card__emoji" aria-hidden="true">{emoji}</span>
        )}
        {status && <Badge variant="pill" className="bs-course-card__status">{status}</Badge>}
      </div>
      <div className="bs-course-card__body">
        <h3 className="bs-course-card__title">{title}</h3>
        {description && <p className="bs-course-card__desc">{description}</p>}
        {meta.length > 0 && (
          <ul className="bs-course-card__meta">
            {meta.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )}
        {(price || cta) && (
          <div className="bs-course-card__footer">
            {price && <span className="bs-course-card__price">{price}</span>}
            {cta}
          </div>
        )}
      </div>
    </Card>
  );
}
```

`packages/ui/src/components/CourseCard/CourseCard.css`:

```css
.bs-course-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.bs-course-card__media {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 16 / 9;
  background: var(--bs-tone);
}

.bs-course-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bs-course-card__emoji {
  font-size: 64px;
  line-height: 1;
}

.bs-course-card__status {
  position: absolute;
  inset-block-start: var(--space-3);
  inset-inline-start: var(--space-3);
}

.bs-course-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  flex: 1;
  padding: var(--space-5) var(--space-5) var(--space-6);
}

.bs-course-card__title {
  font-size: var(--text-h3);
}

.bs-course-card__desc {
  color: var(--color-ink-soft);
}

.bs-course-card__meta {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.bs-course-card__meta li {
  padding: 2px var(--space-3);
  border-radius: var(--radius-pill);
  background: var(--surface-cream);
  font-size: var(--text-caption);
  color: var(--color-ink-soft);
}

.bs-course-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-block-start: auto;
  padding-block-start: var(--space-3);
}

.bs-course-card__price {
  font-family: var(--font-heading);
  font-size: var(--text-h3);
  color: var(--color-brand-700);
}

.bs-course-card--soon {
  opacity: 0.6;
  filter: saturate(0.4);
  pointer-events: none;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test --workspace @babysteps/ui -- PriceCard CourseCard`
Expected: PASS, 6 tests.

- [ ] **Step 5: Write TestimonialCard and all stories**

`packages/ui/src/components/TestimonialCard/TestimonialCard.tsx`:

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Avatar } from '../Avatar/Avatar';
import { StarRating } from '../StarRating/StarRating';
import { Card } from '../Card/Card';

export interface TestimonialCardProps extends HTMLAttributes<HTMLElement> {
  quote: ReactNode;
  name: string;
  /** Short context, e.g. "אמא של אמירי, 5 חודשים". */
  detail?: ReactNode;
  /** Photo URL. Initials are shown without it. */
  avatar?: string;
  /** 0 to 5. null hides the stars. */
  rating?: number | null;
}

export function TestimonialCard({ quote, name, detail, avatar, rating = 5, className, ...rest }: TestimonialCardProps) {
  return (
    <Card as="figure" padding="lg" className={cx('bs-testimonial', className)} {...rest}>
      {rating != null && <StarRating value={rating} size={18} />}
      <blockquote className="bs-testimonial__quote">{quote}</blockquote>
      <figcaption className="bs-testimonial__author">
        <Avatar name={name} src={avatar} size="sm" decorative />
        <span className="bs-testimonial__who">
          <strong className="bs-testimonial__name">{name}</strong>
          {detail && <span className="bs-testimonial__detail">{detail}</span>}
        </span>
      </figcaption>
    </Card>
  );
}
```

`packages/ui/src/components/TestimonialCard/TestimonialCard.css`:

```css
.bs-testimonial {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  height: 100%;
}

.bs-testimonial::before {
  content: '”';
  position: absolute;
  inset-block-start: var(--space-2);
  inset-inline-end: var(--space-5);
  font-family: var(--font-heading);
  font-size: 5rem;
  line-height: 1;
  color: var(--surface-peach);
  pointer-events: none;
}

.bs-testimonial__quote {
  position: relative;
  flex: 1;
  color: var(--color-ink-soft);
  overflow-wrap: anywhere;
}

.bs-testimonial__author {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding-block-start: var(--space-4);
  border-block-start: 1px solid var(--color-border);
}

.bs-testimonial__who {
  display: grid;
}

.bs-testimonial__name {
  color: var(--color-brand-700);
}

.bs-testimonial__detail {
  font-size: var(--text-caption);
  color: var(--color-ink-muted);
}
```

`packages/ui/src/components/TestimonialCard/TestimonialCard.stories.tsx`:

```tsx
import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { TestimonialCard } from './TestimonialCard';

const meta = {
  title: 'Landing/TestimonialCard',
  component: TestimonialCard,
  args: {
    quote: 'תודה רבה ירדן על הכל! כבר קורס שני שאני איתך, אין כמוך ❤️',
    name: 'אוריה',
    detail: 'אמא של נועם, 5 חודשים',
  },
} satisfies Meta<typeof TestimonialCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const narrow: Decorator = (Story) => <div style={{ maxWidth: 380 }}><Story /></div>;

export const Default: Story = { decorators: [narrow] };
export const WithPhoto: Story = { args: { avatar: '/about.jpg', name: 'כרמל' }, decorators: [narrow] };
export const NoRating: Story = { args: { rating: null }, decorators: [narrow] };
export const LongText: Story = {
  args: {
    name: 'טל',
    quote:
      'ירדנוש אהובה שלי, מעבר לזה שאת חברה את אשת מקצוע נדירה 😍 תודה על כל העזרה, על הליווי הצמוד ועל התמיכה! ללא ספק למדתי ממך מלא ואני בטוחה שכולן פה יכולות להעיד על כך. איזה כיף שיש אותך!! זכינו בך וכמובן שמחכות לקורס הבא ❤️❤️❤️ https://www.instagram.com/a-very-long-link-that-should-wrap-inside-the-card',
  },
  decorators: [narrow],
};
```

`packages/ui/src/components/PriceCard/PriceCard.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PriceCard } from './PriceCard';
import { Button } from '../Button/Button';

const meta = {
  title: 'Landing/PriceCard',
  component: PriceCard,
  args: {
    title: 'תשלום דרך PayPal',
    description: 'משלמות דרך PayPal ומקבלות מייל עם פרטי גישה, מיד אחרי התשלום.',
    price: '₪175',
    oldPrice: '₪205',
    priceNote: 'תשלום חד-פעמי',
    features: ['גישה מלאה לכל הסרטונים', 'ליווי אישי בווטסאפ', 'גישה מיידית, ללא עיכובים'],
    cta: <Button icon="arrow">שלמי וקבלי גישה מיידית</Button>,
  },
} satisfies Meta<typeof PriceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Plain: Story = { render: (args) => <div style={{ maxWidth: 380 }}><PriceCard {...args} /></div> };
export const Featured: Story = {
  args: { featured: true, badge: 'הכי מומלץ' },
  render: (args) => <div style={{ maxWidth: 380, paddingBlockStart: 'var(--space-4)' }}><PriceCard {...args} /></div>,
};
export const SideBySide: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-5)', maxWidth: 820, paddingBlockStart: 'var(--space-4)' }}>
      <PriceCard {...args} featured badge="הכי מומלץ" />
      <PriceCard
        title="העברה ידנית"
        description="ביט או Paybox, ואז הודעת אישור בווטסאפ."
        price="₪175"
        oldPrice="₪205"
        priceNote="תשלום חד-פעמי"
        features={['גישה מלאה לכל הסרטונים', 'ליווי אישי בווטסאפ']}
        cta={<Button variant="whatsapp">שלחי אישור בווטסאפ</Button>}
      />
    </div>
  ),
};
```

`packages/ui/src/components/CourseCard/CourseCard.stories.tsx`:

```tsx
import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { CourseCard } from './CourseCard';
import { Button } from '../Button/Button';

const meta = {
  title: 'Landing/CourseCard',
  component: CourseCard,
  args: {
    title: 'קורס התהפכות',
    description: '10 סרטוני הדרכה פרקטיים, 6 טיפי זהב וליווי אישי בווטסאפ. כל הכלים לעזור לתינוק שלך להתהפך בביטחון.',
    emoji: '🔄',
    status: 'זמין עכשיו',
    meta: ['10 סרטונים', 'ליווי בווטסאפ', '200+ אמהות'],
    price: '₪105',
    cta: <Button size="sm" icon="arrow" href="/challenge/rolling/">לקורס ולרכישה</Button>,
  },
} satisfies Meta<typeof CourseCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const narrow: Decorator = (Story) => <div style={{ maxWidth: 380 }}><Story /></div>;

export const Available: Story = { decorators: [narrow] };
export const WithImage: Story = { args: { image: '/rolling-teaser-poster.jpg', imageAlt: 'תינוק על מזרן' }, decorators: [narrow] };
export const ComingSoon: Story = {
  args: {
    title: 'קורס שכיבה על הבטן',
    description: 'קורס מקיף שיעזור לך לעודד את התינוק ליהנות מהשכיבה על הבטן ולחזק את הבסיס המוטורי שלו.',
    emoji: '🤱',
    tone: 'mint',
    status: 'בקרוב',
    comingSoon: true,
    meta: [],
    price: undefined,
    cta: undefined,
  },
  decorators: [narrow],
};
export const LongText: Story = {
  args: {
    title: 'קורס מקיף להתפתחות מוטורית בשנה הראשונה: התהפכות, זחילה, ישיבה ועמידה',
    description: 'תיאור ארוך במיוחד שבודק שהטקסט נשבר יפה בתוך הכרטיס ולא יוצא ממנו גם במסך צר של טלפון נייד.',
  },
  decorators: [narrow],
};
```

- [ ] **Step 6: Register styles and exports**

Append to `packages/ui/src/styles.css`:

```css
@import './components/TestimonialCard/TestimonialCard.css';
@import './components/PriceCard/PriceCard.css';
@import './components/CourseCard/CourseCard.css';
```

Append to `packages/ui/src/index.ts`:

```ts
export { TestimonialCard, type TestimonialCardProps } from './components/TestimonialCard/TestimonialCard';
export { PriceCard, type PriceCardProps } from './components/PriceCard/PriceCard';
export { CourseCard, type CourseCardProps } from './components/CourseCard/CourseCard';
```

- [ ] **Step 7: Run tests and typecheck**

Run: `npm test --workspace @babysteps/ui && npm run typecheck --workspace @babysteps/ui`
Expected: PASS, typecheck exit 0.

- [ ] **Step 8: Commit**

```bash
git add packages/ui
git commit -m "feat(ui): add TestimonialCard, PriceCard and CourseCard"
```

---

### Task 8: Interactive landing blocks (VideoFrame, FAQ, StickyCTA)

**Files:**
- Create: `packages/ui/src/components/VideoFrame/{VideoFrame.tsx,VideoFrame.css,VideoFrame.stories.tsx,VideoFrame.test.tsx}`
- Create: `packages/ui/src/components/FAQ/{FAQ.tsx,FAQ.css,FAQ.stories.tsx,FAQ.test.tsx}`
- Create: `packages/ui/src/components/StickyCTA/{StickyCTA.tsx,StickyCTA.css,StickyCTA.stories.tsx}`
- Modify: `packages/ui/src/styles.css`, `packages/ui/src/index.ts`

**Interfaces:**
- Consumes: `cx` (Task 1), `Icon` (Task 2), `Button` (Task 3)
- Produces:
  - `VideoFrame({ poster?, src?, label = 'הפעלת הסרטון', aspect: '16/9' | '9/16' | '4/5' | '1/1' = '16/9', onPlay?, caption? })`. Clicking play calls `onPlay`; with `src` it swaps to a playing `<video controls>`.
  - `interface FAQItem { question: ReactNode; answer: ReactNode }`; `FAQ({ items, defaultOpen?: number | null = null })`. One item open at a time.
  - `StickyCTA({ title, subtitle?, action, position: 'fixed' | 'static' = 'fixed' })`. Fixed: a bottom bar on screens under 768px, hidden on larger screens.

- [ ] **Step 1: Write the failing tests**

`packages/ui/src/components/FAQ/FAQ.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FAQ } from './FAQ';

const items = [
  { question: 'לאיזה גיל הקורס מתאים?', answer: 'מגיל 3 חודשים ועד שהתינוק מתהפך לשני הצדדים.' },
  { question: 'כמה זמן יש לי גישה?', answer: 'הגישה לסרטונים היא לשנה מלאה.' },
];

function q(name: string) {
  return screen.getByRole('button', { name });
}

describe('FAQ', () => {
  it('starts closed and opens an item on click', async () => {
    render(<FAQ items={items} />);
    expect(q('לאיזה גיל הקורס מתאים?')).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(items[0].answer)).not.toBeVisible();
    await userEvent.click(q('לאיזה גיל הקורס מתאים?'));
    expect(q('לאיזה גיל הקורס מתאים?')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(items[0].answer)).toBeVisible();
  });

  it('keeps only one item open', async () => {
    render(<FAQ items={items} />);
    await userEvent.click(q('לאיזה גיל הקורס מתאים?'));
    await userEvent.click(q('כמה זמן יש לי גישה?'));
    expect(q('לאיזה גיל הקורס מתאים?')).toHaveAttribute('aria-expanded', 'false');
    expect(q('כמה זמן יש לי גישה?')).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes an open item when clicked again', async () => {
    render(<FAQ items={items} defaultOpen={0} />);
    await userEvent.click(q('לאיזה גיל הקורס מתאים?'));
    expect(q('לאיזה גיל הקורס מתאים?')).toHaveAttribute('aria-expanded', 'false');
  });

  it('links each button to its panel', () => {
    render(<FAQ items={items} defaultOpen={1} />);
    const button = q('כמה זמן יש לי גישה?');
    const panel = document.getElementById(button.getAttribute('aria-controls')!);
    expect(panel).toHaveAttribute('role', 'region');
    expect(panel).toHaveTextContent(items[1].answer);
  });

  it('opens with the keyboard', async () => {
    render(<FAQ items={items} />);
    q('לאיזה גיל הקורס מתאים?').focus();
    await userEvent.keyboard('{Enter}');
    expect(q('לאיזה גיל הקורס מתאים?')).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard(' ');
    expect(q('לאיזה גיל הקורס מתאים?')).toHaveAttribute('aria-expanded', 'false');
  });

  it('ignores an out-of-range defaultOpen', () => {
    render(<FAQ items={items} defaultOpen={5} />);
    expect(screen.getAllByRole('button').every((b) => b.getAttribute('aria-expanded') === 'false')).toBe(true);
  });
});
```

`packages/ui/src/components/VideoFrame/VideoFrame.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VideoFrame } from './VideoFrame';

describe('VideoFrame', () => {
  it('calls onPlay when the play button is clicked', async () => {
    const onPlay = vi.fn();
    render(<VideoFrame poster="/poster.jpg" onPlay={onPlay} />);
    await userEvent.click(screen.getByRole('button', { name: 'הפעלת הסרטון' }));
    expect(onPlay).toHaveBeenCalledTimes(1);
  });

  it('swaps to a video with controls when src is set', async () => {
    const { container } = render(<VideoFrame poster="/poster.jpg" src="/teaser.mp4" />);
    expect(container.querySelector('video')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'הפעלת הסרטון' }));
    const video = container.querySelector('video');
    expect(video).toHaveAttribute('src', '/teaser.mp4');
    expect(video).toHaveAttribute('controls');
  });

  it('shows a placeholder, not a broken image, without a poster', () => {
    const { container } = render(<VideoFrame />);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('.bs-video-frame__placeholder')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test --workspace @babysteps/ui -- FAQ VideoFrame`
Expected: FAIL, `Failed to resolve import "./FAQ"` and `"./VideoFrame"`.

- [ ] **Step 3: Write FAQ and VideoFrame**

`packages/ui/src/components/FAQ/FAQ.tsx`:

```tsx
import { useId, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Icon } from '../Icon/Icon';

export interface FAQItem {
  question: ReactNode;
  answer: ReactNode;
}

export interface FAQProps extends HTMLAttributes<HTMLDivElement> {
  items: FAQItem[];
  /** Index of the item open at first. */
  defaultOpen?: number | null;
}

export function FAQ({ items, defaultOpen = null, className, ...rest }: FAQProps) {
  const baseId = useId();
  const [open, setOpen] = useState<number | null>(defaultOpen);

  return (
    <div className={cx('bs-faq', className)} {...rest}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const buttonId = `${baseId}-q${i}`;
        const panelId = `${baseId}-a${i}`;
        return (
          <div key={i} className={cx('bs-faq__item', isOpen && 'bs-faq__item--open')}>
            <h3 className="bs-faq__heading">
              <button
                id={buttonId}
                type="button"
                className="bs-faq__button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span>{item.question}</span>
                <Icon name="chevron" size={20} className="bs-faq__chevron" />
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={buttonId} className="bs-faq__panel" hidden={!isOpen}>
              <div className="bs-faq__answer">{item.answer}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

`packages/ui/src/components/FAQ/FAQ.css`:

```css
.bs-faq {
  display: grid;
  gap: var(--space-3);
}

.bs-faq__item {
  background: var(--surface-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--duration-base) var(--ease-soft);
}

.bs-faq__item--open {
  box-shadow: var(--shadow-md);
}

.bs-faq__heading {
  font-family: var(--font-body);
  font-size: var(--text-body);
}

.bs-faq__button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  width: 100%;
  padding: var(--space-4) var(--space-5);
  border: 0;
  border-radius: inherit;
  background: none;
  color: var(--color-brand-700);
  font-weight: 700;
  text-align: start;
  cursor: pointer;
}

.bs-faq__chevron {
  color: var(--color-accent);
  transition: transform var(--duration-base) var(--ease-soft);
}

.bs-faq__item--open .bs-faq__chevron {
  transform: rotate(180deg);
}

.bs-faq__answer {
  padding: 0 var(--space-5) var(--space-5);
  color: var(--color-ink-soft);
}
```

`packages/ui/src/components/VideoFrame/VideoFrame.tsx`:

```tsx
import { useState, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Icon } from '../Icon/Icon';

export interface VideoFrameProps extends HTMLAttributes<HTMLElement> {
  poster?: string;
  /** Video URL. When set, play swaps the poster for a <video>. */
  src?: string;
  /** Accessible name of the play button. */
  label?: string;
  aspect?: '16/9' | '9/16' | '4/5' | '1/1';
  onPlay?: () => void;
  caption?: ReactNode;
}

export function VideoFrame({
  poster,
  src,
  label = 'הפעלת הסרטון',
  aspect = '16/9',
  onPlay,
  caption,
  className,
  ...rest
}: VideoFrameProps) {
  const [playing, setPlaying] = useState(false);

  const play = () => {
    onPlay?.();
    if (src) setPlaying(true);
  };

  return (
    <figure className={cx('bs-video-frame', className)} {...rest}>
      <div className="bs-video-frame__stage" style={{ aspectRatio: aspect.replace('/', ' / ') }}>
        {playing && src ? (
          <video className="bs-video-frame__video" src={src} poster={poster} controls autoPlay playsInline />
        ) : (
          <>
            {poster ? (
              <img className="bs-video-frame__poster" src={poster} alt="" />
            ) : (
              <div className="bs-video-frame__placeholder" />
            )}
            <button type="button" className="bs-video-frame__play" aria-label={label} onClick={play}>
              <Icon name="play" size={32} />
            </button>
          </>
        )}
      </div>
      {caption && <figcaption className="bs-video-frame__caption">{caption}</figcaption>}
    </figure>
  );
}
```

`packages/ui/src/components/VideoFrame/VideoFrame.css`:

```css
.bs-video-frame {
  display: grid;
  gap: var(--space-3);
}

.bs-video-frame__stage {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-xl);
  background: var(--surface-cocoa);
  box-shadow: var(--shadow-lg);
}

.bs-video-frame__poster,
.bs-video-frame__video,
.bs-video-frame__placeholder {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bs-video-frame__placeholder {
  background:
    radial-gradient(circle at 30% 30%, var(--surface-peach), transparent 55%),
    radial-gradient(circle at 70% 70%, var(--surface-mint), transparent 55%),
    var(--surface-blush);
}

.bs-video-frame__play {
  position: absolute;
  inset: 0;
  margin: auto;
  display: grid;
  place-items: center;
  width: 76px;
  height: 76px;
  border: 0;
  border-radius: 50%;
  background: var(--surface-card);
  color: var(--color-brand-600);
  box-shadow: var(--shadow-brand);
  cursor: pointer;
  transition: transform var(--duration-base) var(--ease-soft);
}

/* The triangle's visual center sits left of its box; nudge it right. */
.bs-video-frame__play .bs-icon {
  translate: 2px 0;
}

.bs-video-frame__play::after {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 2px solid var(--surface-card);
  opacity: 0.7;
  animation: bs-ripple 2s var(--ease-soft) infinite;
}

.bs-video-frame__play:hover {
  transform: scale(1.06);
}

@keyframes bs-ripple {
  from {
    transform: scale(0.9);
    opacity: 0.8;
  }
  to {
    transform: scale(1.4);
    opacity: 0;
  }
}

.bs-video-frame__caption {
  text-align: center;
  font-size: var(--text-caption);
  color: var(--color-ink-muted);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test --workspace @babysteps/ui -- FAQ VideoFrame`
Expected: PASS, 9 tests.

- [ ] **Step 5: Write StickyCTA and the stories**

`packages/ui/src/components/StickyCTA/StickyCTA.tsx`:

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';

export interface StickyCTAProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Usually a small Button. */
  action: ReactNode;
  /**
   * fixed: bottom bar on phones only (hidden from 768px up). Give the page
   * padding-block-end of about 96px so the bar does not cover content.
   * static: renders in place (previews, docs).
   */
  position?: 'fixed' | 'static';
}

export function StickyCTA({ title, subtitle, action, position = 'fixed', className, ...rest }: StickyCTAProps) {
  return (
    <div className={cx('bs-sticky-cta', `bs-sticky-cta--${position}`, className)} {...rest}>
      <div className="bs-sticky-cta__text">
        <strong className="bs-sticky-cta__title">{title}</strong>
        {subtitle && <span className="bs-sticky-cta__subtitle">{subtitle}</span>}
      </div>
      <div className="bs-sticky-cta__action">{action}</div>
    </div>
  );
}
```

`packages/ui/src/components/StickyCTA/StickyCTA.css`:

```css
.bs-sticky-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--surface-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.bs-sticky-cta--fixed {
  position: fixed;
  inset-inline: var(--space-3);
  inset-block-end: var(--space-3);
  z-index: 50;
}

@media (min-width: 768px) {
  .bs-sticky-cta--fixed {
    display: none;
  }
}

.bs-sticky-cta__text {
  display: grid;
  min-width: 0;
}

.bs-sticky-cta__title {
  color: var(--color-brand-700);
}

.bs-sticky-cta__subtitle {
  font-size: var(--text-caption);
  color: var(--color-ink-muted);
}

.bs-sticky-cta__action {
  flex-shrink: 0;
}
```

`packages/ui/src/components/StickyCTA/StickyCTA.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { StickyCTA } from './StickyCTA';
import { Button } from '../Button/Button';

const meta = {
  title: 'Landing/StickyCTA',
  component: StickyCTA,
  args: {
    title: 'קורס מתהפכים',
    subtitle: '₪175 · גישה מיידית',
    action: <Button size="sm" icon="arrow">לרכישה</Button>,
    position: 'static',
  },
} satisfies Meta<typeof StickyCTA>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Static: Story = { render: (args) => <div style={{ maxWidth: 420 }}><StickyCTA {...args} /></div> };
export const FixedOnMobile: Story = {
  args: { position: 'fixed' },
  globals: { viewport: { value: 'mobile2', isRotated: false } },
  render: (args) => (
    <div style={{ minHeight: '120vh', paddingBlockEnd: 96 }}>
      <p>גללי למטה. הפס קבוע בתחתית המסך בטלפון בלבד.</p>
      <StickyCTA {...args} />
    </div>
  ),
};
```

`packages/ui/src/components/FAQ/FAQ.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FAQ } from './FAQ';

const meta = {
  title: 'Landing/FAQ',
  component: FAQ,
  args: {
    items: [
      { question: 'לאיזה גיל הקורס מתאים?', answer: 'מגיל 3 חודשים ועד שהתינוק מתהפך בביטחון לשני הצדדים.' },
      { question: 'כמה זמן יש לי גישה לסרטונים?', answer: 'הגישה היא לשנה מלאה, ואפשר לצפות כמה פעמים שרוצים.' },
      { question: 'איך עובד הליווי בווטסאפ?', answer: 'שולחת לי סרטון קצר של התרגול, ואני מחזירה פידבק ודיוק אישי.' },
      { question: 'מה אם התינוק שלי כבר מתהפך לצד אחד?', answer: 'מצוין! הקורס עוזר גם לאזן ולהתהפך לצד השני.' },
    ],
  },
} satisfies Meta<typeof FAQ>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = { render: (args) => <div style={{ maxWidth: 720 }}><FAQ {...args} /></div> };
export const FirstOpen: Story = { args: { defaultOpen: 0 }, render: (args) => <div style={{ maxWidth: 720 }}><FAQ {...args} /></div> };
```

`packages/ui/src/components/VideoFrame/VideoFrame.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { VideoFrame } from './VideoFrame';

const meta = {
  title: 'Landing/VideoFrame',
  component: VideoFrame,
  args: { poster: '/rolling-teaser-poster.jpg', caption: 'הצצה לקורס, דקה וחצי' },
} satisfies Meta<typeof VideoFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Landscape: Story = { render: (args) => <div style={{ maxWidth: 720 }}><VideoFrame {...args} /></div> };
export const Portrait: Story = { args: { aspect: '9/16', caption: undefined }, render: (args) => <div style={{ maxWidth: 320 }}><VideoFrame {...args} /></div> };
export const NoPoster: Story = { args: { poster: undefined, caption: undefined }, render: (args) => <div style={{ maxWidth: 720 }}><VideoFrame {...args} /></div> };
```

- [ ] **Step 6: Register styles and exports**

Append to `packages/ui/src/styles.css`:

```css
@import './components/VideoFrame/VideoFrame.css';
@import './components/FAQ/FAQ.css';
@import './components/StickyCTA/StickyCTA.css';
```

Append to `packages/ui/src/index.ts`:

```ts
export { VideoFrame, type VideoFrameProps } from './components/VideoFrame/VideoFrame';
export { FAQ, type FAQProps, type FAQItem } from './components/FAQ/FAQ';
export { StickyCTA, type StickyCTAProps } from './components/StickyCTA/StickyCTA';
```

- [ ] **Step 7: Run tests and typecheck**

Run: `npm test --workspace @babysteps/ui && npm run typecheck --workspace @babysteps/ui`
Expected: PASS, typecheck exit 0.

- [ ] **Step 8: Commit**

```bash
git add packages/ui
git commit -m "feat(ui): add VideoFrame, FAQ and StickyCTA"
```

---

### Task 9: App form and feedback (TextField, Alert, ProgressBar)

**Files:**
- Create: `packages/ui/src/components/TextField/{TextField.tsx,TextField.css,TextField.stories.tsx,TextField.test.tsx}`
- Create: `packages/ui/src/components/Alert/{Alert.tsx,Alert.css,Alert.stories.tsx,Alert.test.tsx}`
- Create: `packages/ui/src/components/ProgressBar/{ProgressBar.tsx,ProgressBar.css,ProgressBar.stories.tsx,ProgressBar.test.tsx}`
- Modify: `packages/ui/src/styles.css`, `packages/ui/src/index.ts`

**Interfaces:**
- Consumes: `cx`, `clampPercent` (Task 1), `Icon`, `IconName` (Task 2)
- Produces:
  - `TextField({ label, type: 'text' | 'email' | 'password' | 'tel' = 'text', hint?, error?, id?, ...inputProps })`. email, tel and password inputs get `dir="ltr"`.
  - `type AlertVariant = 'success' | 'error' | 'warning' | 'info'`; `Alert({ variant = 'info', title?, children? })`. `error` uses `role="alert"`, the rest `role="status"`.
  - `ProgressBar({ value, label?, showValue = true, size: 'sm' | 'md' = 'md' })`. `role="progressbar"`, value clamped 0..100.

The spec lists three Alert variants. `warning` is added because the token exists and the app will need it (for example, "access ends soon").

- [ ] **Step 1: Write the failing tests**

`packages/ui/src/components/TextField/TextField.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TextField } from './TextField';

describe('TextField', () => {
  it('labels the input', () => {
    render(<TextField label="אימייל" type="email" />);
    const input = screen.getByLabelText('אימייל');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('dir', 'ltr');
  });

  it('links hint and error through aria-describedby and marks the input invalid', () => {
    render(<TextField label="סיסמה" type="password" hint="לפחות 8 תווים" error="הסיסמה שגויה" />);
    const input = screen.getByLabelText('סיסמה');
    const ids = input.getAttribute('aria-describedby')!.split(' ');
    const texts = ids.map((id) => document.getElementById(id)?.textContent);
    expect(texts).toEqual(['לפחות 8 תווים', 'הסיסמה שגויה']);
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('keeps a caller aria-describedby and has no aria-invalid without an error', () => {
    render(<TextField label="שם" aria-describedby="external" />);
    const input = screen.getByLabelText('שם');
    expect(input).toHaveAttribute('aria-describedby', 'external');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('dir');
  });
});
```

`packages/ui/src/components/Alert/Alert.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert } from './Alert';

describe('Alert', () => {
  it('uses role alert for errors', () => {
    render(<Alert variant="error" title="ההתחברות נכשלה">בדקי את האימייל והסיסמה.</Alert>);
    expect(screen.getByRole('alert')).toHaveTextContent('ההתחברות נכשלה');
  });

  it('uses role status for the other variants', () => {
    render(<Alert variant="success" title="נשלח מייל לאיפוס סיסמה" />);
    expect(screen.getByRole('status')).toHaveTextContent('נשלח מייל לאיפוס סיסמה');
  });
});
```

`packages/ui/src/components/ProgressBar/ProgressBar.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('exposes the value and label', () => {
    render(<ProgressBar value={40} label="התקדמות בקורס" />);
    const bar = screen.getByRole('progressbar', { name: 'התקדמות בקורס' });
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('clamps out-of-range and invalid values', () => {
    const { rerender } = render(<ProgressBar value={140} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    rerender(<ProgressBar value={Number.NaN} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('can hide the number', () => {
    render(<ProgressBar value={50} showValue={false} />);
    expect(screen.queryByText('50%')).toBeNull();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test --workspace @babysteps/ui -- TextField Alert ProgressBar`
Expected: FAIL, `Failed to resolve import` for all three.

- [ ] **Step 3: Write TextField, Alert and ProgressBar**

`packages/ui/src/components/TextField/TextField.tsx`:

```tsx
import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Icon } from '../Icon/Icon';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label: ReactNode;
  type?: 'text' | 'email' | 'password' | 'tel';
  hint?: ReactNode;
  /** Shows the message in red and sets aria-invalid. */
  error?: ReactNode;
}

const LTR_TYPES = new Set(['email', 'password', 'tel']);

export function TextField({
  label,
  type = 'text',
  hint,
  error,
  id,
  className,
  'aria-describedby': describedBy,
  ...rest
}: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? `${autoId}-input`;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedByIds =
    [describedBy, hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cx('bs-text-field', error ? 'bs-text-field--error' : null, className)}>
      <label htmlFor={inputId} className="bs-text-field__label">
        {label}
      </label>
      <input
        {...rest}
        id={inputId}
        type={type}
        dir={LTR_TYPES.has(type) ? 'ltr' : undefined}
        className="bs-text-field__input"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedByIds}
      />
      {hint && (
        <p id={hintId} className="bs-text-field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="bs-text-field__error">
          <Icon name="close" size={14} />
          {error}
        </p>
      )}
    </div>
  );
}
```

`packages/ui/src/components/TextField/TextField.css`:

```css
.bs-text-field {
  display: grid;
  gap: var(--space-1);
}

.bs-text-field__label {
  font-weight: 500;
  color: var(--color-brand-700);
}

.bs-text-field__input {
  width: 100%;
  min-height: 48px;
  padding: var(--space-3) var(--space-4);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--surface-card);
  color: var(--color-ink);
  transition:
    border-color var(--duration-fast) var(--ease-soft),
    box-shadow var(--duration-fast) var(--ease-soft);
}

/* LTR values (email, phone) still line up with the RTL label. */
.bs-text-field__input[dir='ltr'] {
  text-align: right;
}

.bs-text-field__input::placeholder {
  color: var(--color-ink-muted);
}

.bs-text-field__input:focus {
  outline: none;
  border-color: var(--color-brand-600);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-brand-600) 15%, transparent);
}

.bs-text-field__hint {
  font-size: var(--text-caption);
  color: var(--color-ink-muted);
}

.bs-text-field--error .bs-text-field__input {
  border-color: var(--color-error);
}

.bs-text-field--error .bs-text-field__input:focus {
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-error) 15%, transparent);
}

.bs-text-field__error {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-caption);
  font-weight: 500;
  color: var(--color-error);
}
```

`packages/ui/src/components/Alert/Alert.tsx`:

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Icon, type IconName } from '../Icon/Icon';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

const ICONS: Record<AlertVariant, IconName> = {
  success: 'check',
  error: 'close',
  warning: 'clock',
  info: 'sparkle',
};

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: AlertVariant;
  title?: ReactNode;
}

export function Alert({ variant = 'info', title, className, children, ...rest }: AlertProps) {
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cx('bs-alert', `bs-alert--${variant}`, className)}
      {...rest}
    >
      <span className="bs-alert__icon" aria-hidden="true">
        <Icon name={ICONS[variant]} size={16} />
      </span>
      <div className="bs-alert__content">
        {title && <p className="bs-alert__title">{title}</p>}
        {children && <div className="bs-alert__body">{children}</div>}
      </div>
    </div>
  );
}
```

`packages/ui/src/components/Alert/Alert.css`:

```css
.bs-alert {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border-inline-start: 4px solid var(--bs-alert);
  background: color-mix(in srgb, var(--bs-alert) 10%, var(--surface-card));
  color: var(--color-ink);
}

.bs-alert--success { --bs-alert: var(--color-success); }
.bs-alert--error { --bs-alert: var(--color-error); }
.bs-alert--warning { --bs-alert: var(--color-warning); }
.bs-alert--info { --bs-alert: var(--color-brand-500); }

.bs-alert__icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--bs-alert);
  color: var(--color-on-brand);
}

.bs-alert__title {
  font-weight: 700;
}

.bs-alert__body {
  font-size: var(--text-caption);
  color: var(--color-ink-soft);
}
```

`packages/ui/src/components/ProgressBar/ProgressBar.tsx`:

```tsx
import { useId, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { clampPercent } from '../../utils/number';

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  /** 0 to 100. Clamped; invalid values show 0. */
  value: number;
  label?: ReactNode;
  showValue?: boolean;
  size?: 'sm' | 'md';
}

export function ProgressBar({ value, label, showValue = true, size = 'md', className, ...rest }: ProgressBarProps) {
  const labelId = useId();
  const pct = clampPercent(value);
  return (
    <div className={cx('bs-progress', `bs-progress--${size}`, className)} {...rest}>
      {(label || showValue) && (
        <div className="bs-progress__top">
          {label && <span id={labelId}>{label}</span>}
          {showValue && <span className="bs-progress__value">{pct}%</span>}
        </div>
      )}
      <div
        className="bs-progress__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : `${pct}%`}
      >
        <span className="bs-progress__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
```

`packages/ui/src/components/ProgressBar/ProgressBar.css`:

```css
.bs-progress {
  display: grid;
  gap: var(--space-2);
}

.bs-progress__top {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  font-size: var(--text-caption);
  color: var(--color-ink-soft);
}

.bs-progress__value {
  font-weight: 700;
  color: var(--color-brand-600);
}

.bs-progress__track {
  overflow: hidden;
  border-radius: var(--radius-pill);
  background: var(--surface-peach);
}

.bs-progress--md .bs-progress__track { height: 10px; }
.bs-progress--sm .bs-progress__track { height: 6px; }

/* A block fills from the inline start, so it grows right-to-left in RTL. */
.bs-progress__fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--color-accent), var(--color-brand-600));
  transition: width var(--duration-base) var(--ease-soft);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test --workspace @babysteps/ui -- TextField Alert ProgressBar`
Expected: PASS, 8 tests.

- [ ] **Step 5: Write the stories**

`packages/ui/src/components/TextField/TextField.stories.tsx`:

```tsx
import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { TextField } from './TextField';

const meta = {
  title: 'App/TextField',
  component: TextField,
  args: { label: 'אימייל', type: 'email', placeholder: 'name@example.com' },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

const narrow: Decorator = (Story) => <div style={{ maxWidth: 360 }}><Story /></div>;

export const Email: Story = { decorators: [narrow] };
export const PasswordWithHint: Story = { args: { label: 'סיסמה', type: 'password', placeholder: '', hint: 'קיבלת את הסיסמה במייל אחרי הרכישה' }, decorators: [narrow] };
export const WithError: Story = { args: { error: 'האימייל או הסיסמה שגויים', defaultValue: 'yarden@example' }, decorators: [narrow] };
export const Text: Story = { args: { label: 'שם מלא', type: 'text', placeholder: 'ירדן שוהם' }, decorators: [narrow] };
```

`packages/ui/src/components/Alert/Alert.stories.tsx`:

```tsx
import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { Alert } from './Alert';

const meta = {
  title: 'App/Alert',
  component: Alert,
  args: { title: 'נשלח אלייך מייל לאיפוס הסיסמה', children: 'לא מוצאת? כדאי לבדוק גם בתיקיית הספאם.' },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

const narrow: Decorator = (Story) => <div style={{ maxWidth: 480 }}><Story /></div>;

export const Success: Story = { args: { variant: 'success' }, decorators: [narrow] };
export const Error: Story = { args: { variant: 'error', title: 'ההתחברות נכשלה', children: 'בדקי את האימייל והסיסמה ונסי שוב.' }, decorators: [narrow] };
export const Warning: Story = { args: { variant: 'warning', title: 'הגישה לקורס מסתיימת בעוד 7 ימים', children: undefined }, decorators: [narrow] };
export const Info: Story = { args: { variant: 'info', title: 'טיפ: אפשר לצפות בסרטונים גם מהטלפון', children: undefined }, decorators: [narrow] };
```

`packages/ui/src/components/ProgressBar/ProgressBar.stories.tsx`:

```tsx
import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { ProgressBar } from './ProgressBar';

const meta = {
  title: 'App/ProgressBar',
  component: ProgressBar,
  args: { value: 40, label: '4 מתוך 10 שיעורים' },
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

const narrow: Decorator = (Story) => <div style={{ maxWidth: 420 }}><Story /></div>;

export const InProgress: Story = { decorators: [narrow] };
export const Complete: Story = { args: { value: 100, label: 'הקורס הושלם' }, decorators: [narrow] };
export const Small: Story = { args: { size: 'sm', showValue: false, label: undefined }, decorators: [narrow] };
```

- [ ] **Step 6: Register styles and exports**

Append to `packages/ui/src/styles.css`:

```css
@import './components/TextField/TextField.css';
@import './components/Alert/Alert.css';
@import './components/ProgressBar/ProgressBar.css';
```

Append to `packages/ui/src/index.ts`:

```ts
export { TextField, type TextFieldProps } from './components/TextField/TextField';
export { Alert, type AlertProps, type AlertVariant } from './components/Alert/Alert';
export { ProgressBar, type ProgressBarProps } from './components/ProgressBar/ProgressBar';
```

- [ ] **Step 7: Run tests and typecheck**

Run: `npm test --workspace @babysteps/ui && npm run typecheck --workspace @babysteps/ui`
Expected: PASS, typecheck exit 0. Note: the `Error` story export shadows the global `Error` inside that file only; if the linter or typecheck complains, rename it `ErrorState` and keep `name: 'Error'` on the story.

- [ ] **Step 8: Commit**

```bash
git add packages/ui
git commit -m "feat(ui): add TextField, Alert and ProgressBar"
```

---

### Task 10: App course blocks (AppHeader, CourseProgressCard, LessonListItem)

**Files:**
- Create: `packages/ui/src/components/AppHeader/{AppHeader.tsx,AppHeader.css,AppHeader.stories.tsx,AppHeader.test.tsx}`
- Create: `packages/ui/src/components/CourseProgressCard/{CourseProgressCard.tsx,CourseProgressCard.css,CourseProgressCard.stories.tsx,CourseProgressCard.test.tsx}`
- Create: `packages/ui/src/components/LessonListItem/{LessonListItem.tsx,LessonListItem.css,LessonListItem.stories.tsx,LessonListItem.test.tsx}`
- Modify: `packages/ui/src/styles.css`, `packages/ui/src/index.ts`

**Interfaces:**
- Consumes: `cx`, `clampPercent`, `formatDuration`, `BrandLogo` (Task 1), `Icon`, `Avatar` (Task 2), `Badge`, `Button` (Task 3), `Container` (Task 4), `ProgressBar` (Task 9)
- Produces:
  - `AppHeader({ logo?: BrandLogo, title?, userName?, onSignOut?, signOutLabel = 'התנתקות' })`
  - `CourseProgressCard({ title, image?, lessonsDone, lessonsTotal, progress?, href, ctaLabel? })`. Progress comes from `lessonsDone / lessonsTotal` unless `progress` is set; `lessonsTotal = 0` gives 0%.
  - `type LessonState = 'todo' | 'current' | 'done' | 'locked'`; `LessonListItem({ title, index?, durationSec?, state = 'todo', href? })` renders an `<li>`. Wrap items in `<ol className="bs-lesson-list">`. `durationSec` matches the Firestore `lessons.durationSec` field.

The spec names the prop `duration`. This plan calls it `durationSec` to match the Firestore field and make the unit clear.

- [ ] **Step 1: Write the failing tests**

`packages/ui/src/components/LessonListItem/LessonListItem.test.tsx`:

```tsx
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LessonListItem } from './LessonListItem';

function inList(ui: ReactElement) {
  return render(<ol className="bs-lesson-list">{ui}</ol>);
}

describe('LessonListItem', () => {
  it('links to the lesson and shows the duration', () => {
    inList(<LessonListItem title="תרגיל 1: הכנה על הגב" href="/app/lesson/l1" durationSec={185} index={1} />);
    expect(screen.getByRole('link', { name: /תרגיל 1: הכנה על הגב/ })).toHaveAttribute('href', '/app/lesson/l1');
    expect(screen.getByText('3:05')).toBeInTheDocument();
  });

  it('a locked lesson is not a link and says it is locked', () => {
    inList(<LessonListItem title="בונוס: הכנה לזחילה" href="/app/lesson/l9" state="locked" />);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('נעול')).toHaveClass('bs-visually-hidden');
  });

  it('marks the current lesson for assistive tech', () => {
    inList(<LessonListItem title="תרגיל 2" href="/app/lesson/l2" state="current" />);
    expect(screen.getByRole('link')).toHaveAttribute('aria-current', 'step');
    expect(screen.getByText('השיעור הבא')).toBeVisible();
  });

  it('omits an invalid duration', () => {
    const { container } = inList(<LessonListItem title="תרגיל 3" durationSec={-1} />);
    expect(container.querySelector('.bs-lesson__time')).toBeNull();
  });
});
```

`packages/ui/src/components/CourseProgressCard/CourseProgressCard.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CourseProgressCard } from './CourseProgressCard';

describe('CourseProgressCard', () => {
  it('computes progress from lessons and links to the course', () => {
    render(<CourseProgressCard title="קורס התהפכות" lessonsDone={5} lessonsTotal={10} href="/app/course/rolling" />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/app/course/rolling');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
    expect(screen.getByText('להמשך צפייה')).toBeInTheDocument();
  });

  it('shows 0% and a start label when there are no lessons', () => {
    render(<CourseProgressCard title="קורס חדש" lessonsDone={0} lessonsTotal={0} href="/app/course/new" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByText('להתחלת הקורס')).toBeInTheDocument();
  });

  it('marks a finished course and never shows more done than total', () => {
    render(<CourseProgressCard title="קורס התהפכות" lessonsDone={12} lessonsTotal={10} href="/x" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByText('הושלם')).toBeInTheDocument();
    expect(screen.getByText('10 מתוך 10 שיעורים')).toBeInTheDocument();
  });

  it('shows a fallback instead of a broken image', () => {
    const { container } = render(<CourseProgressCard title="קורס" lessonsDone={1} lessonsTotal={4} href="/x" />);
    expect(container.querySelector('img')).toBeNull();
  });
});
```

`packages/ui/src/components/AppHeader/AppHeader.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppHeader } from './AppHeader';

describe('AppHeader', () => {
  it('shows the user and signs out', async () => {
    const onSignOut = vi.fn();
    render(<AppHeader title="מתחילים בקטן" userName="נועה לוי" onSignOut={onSignOut} />);
    expect(screen.getByText('נועה לוי')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'התנתקות' }));
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it('has no user area when signed out', () => {
    const { container } = render(<AppHeader title="מתחילים בקטן" />);
    expect(container.querySelector('.bs-app-header__user')).toBeNull();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test --workspace @babysteps/ui -- LessonListItem CourseProgressCard AppHeader`
Expected: FAIL, `Failed to resolve import` for all three.

- [ ] **Step 3: Write LessonListItem**

`packages/ui/src/components/LessonListItem/LessonListItem.tsx`:

```tsx
import type { LiHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { formatDuration } from '../../utils/time';
import { Icon } from '../Icon/Icon';

export type LessonState = 'todo' | 'current' | 'done' | 'locked';

export interface LessonListItemProps extends Omit<LiHTMLAttributes<HTMLLIElement>, 'title'> {
  title: ReactNode;
  /** Lesson number shown in the marker (todo and current states). */
  index?: number;
  /** Length in seconds (Firestore lessons.durationSec). */
  durationSec?: number;
  state?: LessonState;
  /** Ignored when locked. */
  href?: string;
}

const HIDDEN_STATE: Partial<Record<LessonState, string>> = {
  done: 'הושלם',
  locked: 'נעול',
};

export function LessonListItem({ title, index, durationSec, state = 'todo', href, className, ...rest }: LessonListItemProps) {
  const time = formatDuration(durationSec);
  const marker =
    state === 'done' ? <Icon name="check" size={18} />
    : state === 'locked' ? <Icon name="lock" size={18} />
    : index != null ? index
    : <Icon name="play" size={16} />;

  const inner = (
    <>
      <span className="bs-lesson__marker" aria-hidden="true">{marker}</span>
      <span className="bs-lesson__text">
        <span className="bs-lesson__title">{title}</span>
        {state === 'current' && <span className="bs-lesson__state">השיעור הבא</span>}
        {HIDDEN_STATE[state] && <span className="bs-visually-hidden">{HIDDEN_STATE[state]}</span>}
      </span>
      {time && (
        <span className="bs-lesson__time" dir="ltr">
          <Icon name="clock" size={14} />
          {time}
        </span>
      )}
    </>
  );

  const linkable = href !== undefined && state !== 'locked';

  return (
    <li className={cx('bs-lesson', `bs-lesson--${state}`, className)} {...rest}>
      {linkable ? (
        <a className="bs-lesson__row" href={href} aria-current={state === 'current' ? 'step' : undefined}>
          {inner}
        </a>
      ) : (
        <div className="bs-lesson__row" aria-disabled={state === 'locked' || undefined}>
          {inner}
        </div>
      )}
    </li>
  );
}
```

`packages/ui/src/components/LessonListItem/LessonListItem.css`:

```css
.bs-lesson-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--space-2);
}

.bs-lesson__row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--surface-card);
  color: inherit;
  text-decoration: none;
  transition:
    border-color var(--duration-fast) var(--ease-soft),
    box-shadow var(--duration-fast) var(--ease-soft);
}

a.bs-lesson__row:hover {
  border-color: var(--color-brand-500);
  box-shadow: var(--shadow-sm);
}

.bs-lesson__marker {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--surface-peach);
  color: var(--color-brand-600);
  font-weight: 700;
}

.bs-lesson__text {
  display: grid;
  flex: 1;
  min-width: 0;
}

.bs-lesson__title {
  font-weight: 500;
  overflow-wrap: anywhere;
}

.bs-lesson__state {
  font-size: var(--text-caption);
  font-weight: 700;
  color: var(--color-accent);
}

.bs-lesson__time {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  flex-shrink: 0;
  font-size: var(--text-caption);
  color: var(--color-ink-muted);
}

.bs-lesson--current .bs-lesson__row {
  border: 2px solid var(--color-brand-600);
  background: color-mix(in srgb, var(--surface-peach) 45%, var(--surface-card));
}

.bs-lesson--current .bs-lesson__marker {
  background: var(--color-brand-600);
  color: var(--color-on-brand);
}

.bs-lesson--done .bs-lesson__marker {
  background: var(--surface-mint);
  color: var(--color-success);
}

.bs-lesson--done .bs-lesson__title {
  color: var(--color-ink-soft);
}

.bs-lesson--locked .bs-lesson__row {
  background: var(--surface-cream);
  cursor: not-allowed;
}

.bs-lesson--locked .bs-lesson__marker {
  background: var(--surface-card);
  color: var(--color-ink-muted);
}

.bs-lesson--locked .bs-lesson__title {
  color: var(--color-ink-muted);
}
```

- [ ] **Step 4: Write CourseProgressCard and AppHeader**

`packages/ui/src/components/CourseProgressCard/CourseProgressCard.tsx`:

```tsx
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { clampPercent } from '../../utils/number';
import { Icon } from '../Icon/Icon';
import { Badge } from '../Badge/Badge';
import { ProgressBar } from '../ProgressBar/ProgressBar';

export interface CourseProgressCardProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'title'> {
  title: ReactNode;
  image?: string;
  lessonsDone: number;
  lessonsTotal: number;
  /** Overrides the percent computed from lessons. */
  progress?: number;
  href: string;
  /** Overrides the automatic "start / continue / watch again" label. */
  ctaLabel?: ReactNode;
}

function safeCount(n: number): number {
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

export function CourseProgressCard({
  title,
  image,
  lessonsDone,
  lessonsTotal,
  progress,
  href,
  ctaLabel,
  className,
  ...rest
}: CourseProgressCardProps) {
  const total = safeCount(lessonsTotal);
  const done = Math.min(safeCount(lessonsDone), total);
  const pct = clampPercent(progress ?? (total > 0 ? (done / total) * 100 : 0));
  const label = ctaLabel ?? (pct >= 100 ? 'לצפייה חוזרת' : pct > 0 ? 'להמשך צפייה' : 'להתחלת הקורס');

  return (
    <a href={href} className={cx('bs-course-progress', className)} {...rest}>
      <div className="bs-course-progress__media">
        {image ? (
          <img className="bs-course-progress__img" src={image} alt="" />
        ) : (
          <span className="bs-course-progress__emoji" aria-hidden="true">🍼</span>
        )}
        {pct >= 100 && (
          <Badge variant="pill" icon="check" className="bs-course-progress__done">
            הושלם
          </Badge>
        )}
      </div>
      <div className="bs-course-progress__body">
        <h3 className="bs-course-progress__title">{title}</h3>
        <ProgressBar value={pct} label={`${done} מתוך ${total} שיעורים`} />
        <span className="bs-course-progress__cta">
          {label}
          <Icon name="arrow" size={18} />
        </span>
      </div>
    </a>
  );
}
```

`packages/ui/src/components/CourseProgressCard/CourseProgressCard.css`:

```css
.bs-course-progress {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--surface-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  color: inherit;
  text-decoration: none;
  overflow-wrap: anywhere;
  transition:
    transform var(--duration-base) var(--ease-soft),
    box-shadow var(--duration-base) var(--ease-soft);
}

.bs-course-progress:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.bs-course-progress__media {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 16 / 9;
  background: var(--surface-peach);
}

.bs-course-progress__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bs-course-progress__emoji {
  font-size: 56px;
  line-height: 1;
}

.bs-course-progress__done {
  position: absolute;
  inset-block-start: var(--space-3);
  inset-inline-start: var(--space-3);
}

.bs-course-progress__body {
  display: grid;
  gap: var(--space-4);
  padding: var(--space-5);
}

.bs-course-progress__title {
  font-size: var(--text-h3);
}

.bs-course-progress__cta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-weight: 700;
  color: var(--color-brand-600);
}
```

`packages/ui/src/components/AppHeader/AppHeader.tsx`:

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import type { BrandLogo } from '../../utils/brand';
import { Avatar } from '../Avatar/Avatar';
import { Button } from '../Button/Button';
import { Container } from '../Container/Container';

export interface AppHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  logo?: BrandLogo;
  title?: ReactNode;
  /** Signed-in student. Omit when signed out. */
  userName?: string;
  onSignOut?: () => void;
  signOutLabel?: string;
}

export function AppHeader({ logo, title, userName, onSignOut, signOutLabel = 'התנתקות', className, ...rest }: AppHeaderProps) {
  return (
    <header className={cx('bs-app-header', className)} {...rest}>
      <Container width="base" className="bs-app-header__inner">
        <a className="bs-app-header__brand" href={logo?.href ?? '/app/my-courses'}>
          {logo && <img className="bs-app-header__logo" src={logo.src} alt={logo.alt} />}
          {title && <span className="bs-app-header__title">{title}</span>}
        </a>
        {(userName || onSignOut) && (
          <div className="bs-app-header__user">
            {userName && (
              <>
                <Avatar name={userName} size="sm" decorative />
                <span className="bs-app-header__name">{userName}</span>
              </>
            )}
            {onSignOut && (
              <Button variant="ghost" size="sm" icon="logout" onClick={onSignOut}>
                {signOutLabel}
              </Button>
            )}
          </div>
        )}
      </Container>
    </header>
  );
}
```

`packages/ui/src/components/AppHeader/AppHeader.css`:

```css
.bs-app-header {
  background: var(--surface-card);
  border-block-end: 1px solid var(--color-border);
}

.bs-app-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  min-height: 64px;
}

.bs-app-header__brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  text-decoration: none;
}

.bs-app-header__logo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.bs-app-header__title {
  font-family: var(--font-heading);
  font-size: 1.125rem;
  color: var(--color-brand-700);
}

.bs-app-header__user {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.bs-app-header__name {
  font-weight: 500;
  color: var(--color-ink-soft);
}

@media (max-width: 479px) {
  .bs-app-header__name {
    display: none;
  }
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test --workspace @babysteps/ui -- LessonListItem CourseProgressCard AppHeader`
Expected: PASS, 10 tests.

- [ ] **Step 6: Write the stories**

`packages/ui/src/components/LessonListItem/LessonListItem.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { LessonListItem } from './LessonListItem';

const meta = {
  title: 'App/LessonListItem',
  component: LessonListItem,
  args: { title: 'תרגיל 1: הכנה על הגב', index: 1, durationSec: 185, href: '#' },
  decorators: [(Story) => <ol className="bs-lesson-list" style={{ maxWidth: 560 }}><Story /></ol>],
} satisfies Meta<typeof LessonListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Todo: Story = {};
export const Current: Story = { args: { state: 'current' } };
export const Done: Story = { args: { state: 'done' } };
export const Locked: Story = { args: { state: 'locked', title: 'בונוס: הכנה לשלב הזחילה' } };
export const FullList: Story = {
  decorators: [],
  render: () => (
    <ol className="bs-lesson-list" style={{ maxWidth: 560 }}>
      <LessonListItem index={1} title="היכרות: למה התהפכות חשובה" durationSec={142} state="done" href="#" />
      <LessonListItem index={2} title="תרגיל 1: הכנה על הגב" durationSec={185} state="done" href="#" />
      <LessonListItem index={3} title="תרגיל 2: העברת משקל לצד" durationSec={240} state="current" href="#" />
      <LessonListItem index={4} title="תרגיל 3: מהבטן לגב" durationSec={205} href="#" />
      <LessonListItem index={5} title="בונוס: הכנה לשלב הזחילה" durationSec={320} state="locked" href="#" />
    </ol>
  ),
};
export const LongText: Story = {
  args: { title: 'תרגיל ארוך במיוחד עם שם שנשבר לשתי שורות לפחות גם במסך צר של טלפון נייד', state: 'current' },
};
```

`packages/ui/src/components/CourseProgressCard/CourseProgressCard.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CourseProgressCard } from './CourseProgressCard';

const meta = {
  title: 'App/CourseProgressCard',
  component: CourseProgressCard,
  args: { title: 'קורס התהפכות', lessonsDone: 4, lessonsTotal: 10, href: '#', image: '/rolling-teaser-poster.jpg' },
  decorators: [(Story) => <div style={{ maxWidth: 380 }}><Story /></div>],
} satisfies Meta<typeof CourseProgressCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InProgress: Story = {};
export const NotStarted: Story = { args: { lessonsDone: 0 } };
export const Complete: Story = { args: { lessonsDone: 10 } };
export const NoImage: Story = { args: { image: undefined, title: 'קורס שכיבה על הבטן' } };
```

`packages/ui/src/components/AppHeader/AppHeader.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppHeader } from './AppHeader';

const meta = {
  title: 'App/AppHeader',
  component: AppHeader,
  parameters: { bsFlush: true },
  args: {
    logo: { src: '/logo-peach.png', alt: '' },
    title: 'מתחילים בקטן',
    userName: 'נועה לוי',
    onSignOut: () => {},
  },
} satisfies Meta<typeof AppHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedIn: Story = {};
export const SignedOut: Story = { args: { userName: undefined, onSignOut: undefined } };
```

- [ ] **Step 7: Register styles and exports**

Append to `packages/ui/src/styles.css`:

```css
@import './components/AppHeader/AppHeader.css';
@import './components/CourseProgressCard/CourseProgressCard.css';
@import './components/LessonListItem/LessonListItem.css';
```

Append to `packages/ui/src/index.ts`:

```ts
export { AppHeader, type AppHeaderProps } from './components/AppHeader/AppHeader';
export { CourseProgressCard, type CourseProgressCardProps } from './components/CourseProgressCard/CourseProgressCard';
export { LessonListItem, type LessonListItemProps, type LessonState } from './components/LessonListItem/LessonListItem';
```

- [ ] **Step 8: Run tests and typecheck**

Run: `npm test --workspace @babysteps/ui && npm run typecheck --workspace @babysteps/ui`
Expected: PASS, typecheck exit 0.

- [ ] **Step 9: Commit**

```bash
git add packages/ui
git commit -m "feat(ui): add AppHeader, CourseProgressCard and LessonListItem"
```

---
### Task 11: Example pages, visual pass and docs

**Files:**
- Create: `packages/ui/src/examples/LandingPage.stories.tsx`
- Create: `packages/ui/src/examples/AppScreens.stories.tsx`
- Create: `packages/ui/README.md`
- Modify: `CLAUDE.md` (project root)

**Interfaces:**
- Consumes: every component exported from `packages/ui/src/index.ts` (Tasks 1 to 10)
- Produces: two example story files (`Examples/LandingPage`, `Examples/AppScreens`) that show whole pages built only from the library. They are the reference compositions for Yarden's review and for the design-sync conventions header in Task 12.

- [ ] **Step 1: Write the landing page example**

`packages/ui/src/examples/LandingPage.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  CourseCard,
  CredentialPill,
  Divider,
  FAQ,
  FeatureSteps,
  Footer,
  Hero,
  HighlightBox,
  PriceCard,
  ProblemCard,
  Section,
  SectionHeading,
  SiteNav,
  StarRating,
  StickyCTA,
  TestimonialCard,
  VideoFrame,
} from '../index';

const grid = (min: number) => ({
  display: 'grid',
  gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`,
  gap: 'var(--space-5)',
});

function LandingPage() {
  return (
    <div style={{ paddingBlockEnd: 96 }}>
      <SiteNav
        logo={{ src: '/logo-peach.png', alt: '' }}
        title="מתחילים בקטן"
        links={[
          { label: 'מה בקורס', href: '#content' },
          { label: 'מי אני', href: '#about' },
          { label: 'המלצות', href: '#reviews' },
        ]}
        cta={{ label: 'לרכישה', href: '#register' }}
      />
      <Hero
        tag="קורס דיגיטלי · צפייה מיידית"
        title={<>לעזור לבייבי שלך <em>להתהפך</em>, בצורה רגועה ומקצועית</>}
        subtitle="היי אהובה, כאן ירדן. בניתי עבורך קורס דיגיטלי ממוקד שייתן לך את כל הכלים לעזור לתינוק שלך לעבור את שלב ההתהפכות, בביטחון מלא."
        actions={
          <>
            <Button size="lg" icon="arrow" href="#register">רכישה וגישה מיידית</Button>
            <Button size="lg" variant="outline" href="#content">מה יש בקורס?</Button>
          </>
        }
        proof={<><StarRating value={5} size={16} /><span>200+ אמהות מרוצות</span></>}
        media={<VideoFrame poster="/rolling-teaser-poster.jpg" caption="הצצה לקורס" />}
      />
      <Divider variant="wave" from="peach" tone="white" />
      <Section tone="white">
        <SectionHeading eyebrow="מזהה את עצמך?" title="האם זה המצב אצלכם כרגע?" />
        <div style={grid(240)}>
          <ProblemCard emoji="🙆" title="התינוק לא מתהפך כלל" text="אתם מנסים, אבל הוא עדיין לא עושה את התנועה בעצמו." />
          <ProblemCard emoji="🔄" title="מתהפך רק לפעמים" text="יש ניסיונות, אבל ההתהפכות לא קורית בצורה עקבית." />
          <ProblemCard emoji="↩️" title="מתהפך לכיוון אחד בלבד" text="מצליח לצד אחד אבל מתקשה עם הצד השני." />
        </div>
        <div style={{ marginBlockStart: 'var(--space-6)' }}>
          <HighlightBox icon="sparkle" title="אם הכרת לפחות אחד מהמצבים האלה">
            הקורס הזה נבנה בדיוק בשבילך. בצעדים קטנים, עם הידיים, מהסלון שלך.
          </HighlightBox>
        </div>
      </Section>
      <Section tone="cream" id="content" width="narrow">
        <SectionHeading eyebrow="תוכן הקורס" title={<>מה <em>מחכה לך</em> בפנים?</>} />
        <FeatureSteps
          steps={[
            { title: '10 סרטוני הדרכה פרקטיים', text: 'תרגילים מפורטים שניתן ליישם מיד, ללא ציוד מיוחד.' },
            { title: '6 טיפי זהב', text: 'טיפים מעשיים שיעזרו לך ללוות את התינוק בצורה הכי נכונה.' },
            { title: 'בונוס: הכנה לשלב הזחילה', text: 'סרטון שבונה את התשתית המוטורית לשלב הבא.' },
            { title: 'ליווי אישי בווטסאפ', text: 'שולחת לי סרטון של התרגול, ואני מחזירה פידבק אישי.', badge: 'הכי שווה' },
          ]}
        />
      </Section>
      <Section tone="mint" id="about">
        <SectionHeading eyebrow="מי אני?" title="ירדן שוהם" lead="אמא לשניים ומלווה התפתחותית מוסמכת. מגיעה מעולם החינוך, עם למעלה מ-6 שנות ניסיון." />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', justifyContent: 'center' }}>
          <CredentialPill>מלווה התפתחותית מוסמכת</CredentialPill>
          <CredentialPill icon="heart">מדריכת בייבי יוגה</CredentialPill>
          <CredentialPill icon="baby">עיסוי תינוקות</CredentialPill>
        </div>
      </Section>
      <Section tone="white" id="reviews">
        <SectionHeading eyebrow="חוויות מהשטח" title="מה אומרות האמהות?" />
        <div style={grid(280)}>
          <TestimonialCard name="כרמל" quote="תוכן שכל אמא חייבת לצרוך, ברמה הכי נעימה ומקיפה. כיף לצפות ובמיוחד לתרגל." />
          <TestimonialCard name="טל" quote="תודה על כל העזרה, על הליווי הצמוד ועל התמיכה! למדתי ממך מלא." />
          <TestimonialCard name="אוריה" quote="כבר קורס שני שאני איתך, אין כמוך ❤️" />
        </div>
      </Section>
      <Section tone="peach" id="register">
        <SectionHeading eyebrow="הצטרפות לקורס" title="בחרי את הדרך הנוחה לך" />
        <div style={{ ...grid(280), maxWidth: 820, marginInline: 'auto', paddingBlockStart: 'var(--space-4)' }}>
          <PriceCard
            featured
            badge="הכי מומלץ"
            title="תשלום דרך PayPal"
            description="מקבלות מייל עם פרטי גישה, מיד אחרי התשלום."
            price="₪175"
            oldPrice="₪205"
            priceNote="תשלום חד-פעמי"
            features={['גישה מלאה לכל הסרטונים', 'ליווי אישי בווטסאפ', 'גישה מיידית']}
            cta={<Button icon="arrow">שלמי וקבלי גישה מיידית</Button>}
          />
          <PriceCard
            title="העברה ידנית"
            description="ביט או Paybox, ואז הודעת אישור בווטסאפ."
            price="₪175"
            oldPrice="₪205"
            priceNote="תשלום חד-פעמי"
            features={['גישה מלאה לכל הסרטונים', 'ליווי אישי בווטסאפ']}
            cta={<Button variant="whatsapp">שלחי אישור בווטסאפ</Button>}
          />
        </div>
      </Section>
      <Section tone="white" width="narrow">
        <SectionHeading title="שאלות נפוצות" />
        <FAQ
          items={[
            { question: 'לאיזה גיל הקורס מתאים?', answer: 'מגיל 3 חודשים ועד שהתינוק מתהפך בביטחון לשני הצדדים.' },
            { question: 'כמה זמן יש לי גישה?', answer: 'שנה מלאה, ואפשר לצפות כמה פעמים שרוצים.' },
            { question: 'איך עובד הליווי בווטסאפ?', answer: 'שולחת לי סרטון קצר של התרגול, ואני מחזירה פידבק אישי.' },
          ]}
        />
      </Section>
      <Section tone="cream">
        <SectionHeading title="עוד קורסים" />
        <div style={grid(280)}>
          <CourseCard title="קורס התהפכות" emoji="🔄" status="זמין עכשיו" price="₪105" meta={['10 סרטונים', 'ליווי בווטסאפ']} cta={<Button size="sm" icon="arrow">לקורס</Button>} />
          <CourseCard title="קורס שכיבה על הבטן" emoji="🤱" tone="mint" status="בקרוב" comingSoon description="לעודד את התינוק ליהנות מהשכיבה על הבטן." />
        </div>
      </Section>
      <Footer
        logo={{ src: '/logo-peach.png', alt: 'מתחילים בקטן' }}
        title="ירדן שוהם · מתחילים בקטן"
        tagline="מלווה התפתחותית · קורסים דיגיטליים לתינוקות"
        social={[
          { label: 'WhatsApp', href: 'https://wa.me/972542366243', icon: 'whatsapp' },
          { label: 'Instagram', href: 'https://instagram.com/', icon: 'instagram' },
        ]}
        note="© 2026 ירדן שוהם · כל הזכויות שמורות"
      />
      <StickyCTA title="קורס מתהפכים" subtitle="₪175 · גישה מיידית" action={<Button size="sm" icon="arrow" href="#register">לרכישה</Button>} />
    </div>
  );
}

const meta = {
  title: 'Examples/LandingPage',
  component: LandingPage,
  parameters: { bsFlush: true },
} satisfies Meta<typeof LandingPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RollingCourse: Story = {};
```

- [ ] **Step 2: Write the app screens example**

`packages/ui/src/examples/AppScreens.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Alert,
  AppHeader,
  Button,
  Card,
  Container,
  CourseProgressCard,
  LessonListItem,
  ProgressBar,
  SectionHeading,
  TextField,
  VideoFrame,
} from '../index';

const logo = { src: '/logo-peach.png', alt: '' };

function Login() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 'var(--space-5)', background: 'var(--surface-peach)' }}>
      <Card padding="lg" style={{ width: '100%', maxWidth: 420, display: 'grid', gap: 'var(--space-4)' }}>
        <img src="/logo-peach.png" alt="" style={{ width: 64, height: 64, borderRadius: '50%', marginInline: 'auto' }} />
        <SectionHeading level={1} title="כניסה לקורסים" lead="פרטי הכניסה נשלחו אלייך במייל אחרי הרכישה." style={{ marginBlockEnd: 0 }} />
        <Alert variant="error" title="האימייל או הסיסמה שגויים" />
        <TextField label="אימייל" type="email" placeholder="name@example.com" />
        <TextField label="סיסמה" type="password" />
        <Button fullWidth type="submit">כניסה</Button>
        <Button fullWidth variant="ghost" size="sm">שכחתי סיסמה</Button>
      </Card>
    </div>
  );
}

function MyCourses() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <AppHeader logo={logo} title="מתחילים בקטן" userName="נועה לוי" onSignOut={() => {}} />
      <Container width="base" style={{ paddingBlock: 'var(--space-7)' }}>
        <SectionHeading align="start" level={1} title="הקורסים שלי" lead="שמחה שאת כאן. ממשיכות מאיפה שעצרת?" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
          <CourseProgressCard title="קורס התהפכות" image="/rolling-teaser-poster.jpg" lessonsDone={4} lessonsTotal={10} href="#" />
          <CourseProgressCard title="קורס שכיבה על הבטן" lessonsDone={0} lessonsTotal={8} href="#" />
        </div>
      </Container>
    </div>
  );
}

function LessonScreen() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <AppHeader logo={logo} title="מתחילים בקטן" userName="נועה לוי" onSignOut={() => {}} />
      <Container width="base" style={{ paddingBlock: 'var(--space-6)', display: 'grid', gap: 'var(--space-6)' }}>
        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          <Button variant="ghost" size="sm" href="#" style={{ justifySelf: 'start' }}>חזרה לקורס</Button>
          <VideoFrame poster="/rolling-teaser-poster.jpg" />
          <SectionHeading align="start" level={1} eyebrow="שיעור 3 מתוך 10" title="תרגיל 2: העברת משקל לצד" lead="מניחים את התינוק על הגב, ומעבירים בעדינות את המשקל לצד אחד." />
        </div>
        <Card padding="md" style={{ display: 'grid', gap: 'var(--space-4)' }}>
          <ProgressBar value={30} label="3 מתוך 10 שיעורים" />
          <ol className="bs-lesson-list">
            <LessonListItem index={1} title="היכרות: למה התהפכות חשובה" durationSec={142} state="done" href="#" />
            <LessonListItem index={2} title="תרגיל 1: הכנה על הגב" durationSec={185} state="done" href="#" />
            <LessonListItem index={3} title="תרגיל 2: העברת משקל לצד" durationSec={240} state="current" href="#" />
            <LessonListItem index={4} title="תרגיל 3: מהבטן לגב" durationSec={205} href="#" />
            <LessonListItem index={5} title="בונוס: הכנה לשלב הזחילה" durationSec={320} state="locked" />
          </ol>
        </Card>
      </Container>
    </div>
  );
}

const meta = {
  title: 'Examples/AppScreens',
  parameters: { bsFlush: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoginScreen: Story = { render: () => <Login /> };
export const MyCoursesScreen: Story = { render: () => <MyCourses /> };
export const Lesson: Story = { render: () => <LessonScreen /> };
```

- [ ] **Step 3: Typecheck and build Storybook**

Run: `npm run typecheck --workspace @babysteps/ui && npm run build-storybook --workspace @babysteps/ui -- --quiet`
Expected: exit 0 for both.

- [ ] **Step 4: Visual pass at phone and desktop width**

Run: `npm run storybook --workspace @babysteps/ui`. For each story below, check it at a phone viewport (360 to 414px wide) and at desktop (1280px):

- `Examples/LandingPage/RollingCourse`
- `Examples/AppScreens/LoginScreen`, `MyCoursesScreen`, `Lesson`
- `Landing/TestimonialCard/LongText`, `Landing/CourseCard/LongText`, `App/LessonListItem/LongText`

Expected for every one:
- No horizontal scroll at phone width (in the browser console: `document.documentElement.scrollWidth <= window.innerWidth` is `true` inside the story iframe).
- All text is right-aligned, and arrows point left.
- Headings use the rounded Varela Round font (not bold, not the fallback).
- The long URL in `TestimonialCard/LongText` wraps inside the card.

Fix any problem in the component's CSS, not in the story. Rerun `npm test --workspace @babysteps/ui` after any fix.

- [ ] **Step 5: Write the package README**

`packages/ui/README.md`:

````markdown
# @babysteps/ui

The "Warm Nest" design system for מתחילים בקטן. React components, tokens and fonts.
Hebrew and RTL first.

## Commands (run from the repo root)

| Command | What it does |
| --- | --- |
| `npm run ui:storybook` | Storybook on http://localhost:6006 |
| `npm run ui:build` | Builds `packages/ui/dist/` (JS, CSS, fonts, `.d.ts`) |
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
````

- [ ] **Step 6: Document the package in the project CLAUDE.md**

In `CLAUDE.md`, after the "Key files" section, add:

```markdown
## Design system (`packages/ui/`, `@babysteps/ui`)

- npm workspace package with the "Warm Nest" React components (30), tokens and fonts.
  Spec: `docs/superpowers/specs/2026-09-24-ui-design-system-design.md`.
- TypeScript + plain `bs-` prefixed CSS that reads only `src/tokens.css` variables.
  Logical CSS properties only (RTL). No Tailwind.
- `npm run ui:storybook` for the style guide, `npm run ui:build` for `dist/`.
- The live site does not use it yet. A later phase rebuilds the site in React on top of it.
- Synced to Claude Design with the design-sync skill (config in `.design-sync/`).
```

In the "Testing" section of `CLAUDE.md`, change the first bullet to:

```markdown
- `npm test` → root Vitest tests (`tests/`), then the `@babysteps/ui` tests. Run before
  committing changes to `lib/`, `api/` or `packages/ui/`.
```

- [ ] **Step 7: Run everything once more**

Run: `npm test && npm run ui:build && npm run typecheck --workspace @babysteps/ui`
Expected: all PASS, exit 0.

- [ ] **Step 8: Commit**

```bash
git add packages/ui CLAUDE.md
git commit -m "feat(ui): add example pages, README and project docs"
```

---

### Task 12: Sync to Claude Design

This task runs the design-sync skill. It is interactive: it asks the user to approve creating the Claude Design project and one upload approval. Do not start it from a subagent; run it in the main session.

**Files:**
- Create (by the skill): `.design-sync/config.json`, `.design-sync/NOTES.md`, `.design-sync/conventions.md`
- Output (not committed): `ds-bundle/` and the skill's scratch folders. Add them to `.gitignore` if the skill does not.

**Interfaces:**
- Consumes: the built package and Storybook from Tasks 1 to 11
- Produces: a Claude Design project (proposed name "מתחילים בקטן · Warm Nest") holding every component, and a conventions header for its design agent.

- [ ] **Step 1: Check the starting point**

Run: `npm test && npm run ui:build && npm run build-storybook --workspace @babysteps/ui -- --quiet && git status --short`
Expected: all PASS; working tree clean.

- [ ] **Step 2: Run the design-sync skill**

Invoke `/design-sync`. Give it these facts when it asks:
- Shape: `storybook`. Storybook config dir: `packages/ui/.storybook`. The package to run from is `packages/ui`.
- Package manager: npm workspaces at the repo root (`npm ci` at the root, then work in `packages/ui`).
- New project name: "מתחילים בקטן · Warm Nest".
- Stories under `Foundations/*` and `Examples/*` are reference pages, not components. If the converter treats them as components and they fail verification, exclude them in the config rather than editing them.

- [ ] **Step 3: Conventions header content**

When the skill reaches "Author the conventions header", `.design-sync/conventions.md` must cover (validated against the build, as the skill requires):
- Wrap every screen in `BsRoot`. Without it, text is not RTL and fonts and colors are missing.
- Build landing pages as a stack of `Section` blocks with `tone` (cream, white, peach, mint, sky, blush, cocoa), each starting with a `SectionHeading`. `Hero` opens the page, `Footer` closes it. `Divider variant="wave"` between two tones.
- Layout glue uses tokens only: `var(--space-1..9)`, `var(--radius-sm|md|lg|xl|pill)`, `var(--surface-*)`, `var(--color-*)`, `var(--shadow-sm|md|lg|brand)`. No raw colors, no Tailwind classes.
- `<em>` inside a heading gives the terracotta highlight.
- App screens: `AppHeader` on top, content in `Container`, lessons in `<ol className="bs-lesson-list">` with `LessonListItem`.
- One snippet adapted from `Examples/LandingPage`.

- [ ] **Step 4: Commit the sync config**

```bash
git add .design-sync .gitignore
git commit -m "chore(design-sync): sync @babysteps/ui to Claude Design"
```

- [ ] **Step 5: Hand-off**

Give the user the Claude Design project URL and one line on what to try first: design a new challenge landing page from `Examples/LandingPage`.
