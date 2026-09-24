# design-sync notes: @babysteps/ui

Repo: npm workspace; the design system is `packages/ui` (`@babysteps/ui`). Build with
`npm run ui:build` (root). Converter flags: `--node-modules ./node_modules` (root; react is
hoisted) `--entry ./packages/ui/dist/index.js`. Reference storybook: run
`npx storybook build -c .storybook -o <repo>/.design-sync/sb-reference` from `packages/ui`.

## Fixes
- [GENERAL] `.storybook/preview` decorator failed to bundle (`No loader is configured for
  ".woff2"`: base.css imports @fontsource) -> set `cfg.provider: {"component": "BsRoot"}`,
  which is the real wrapper the decorator applied anyway.
- [GENERAL] Converter drops all-caps exports as constants (`isComponentName` regex
  `^[A-Z][A-Z0-9_]+$`), so `FAQ` vanished -> renamed the component to `Faq` in the repo
  (commit 5b7c844). Keep component names PascalCase, never all caps.
- [GENERAL] Story images from `.storybook/public` (`/about.jpg`) do not exist in previews ->
  stories import images via `packages/ui/.storybook/assets.ts` (`storyAssets.*`); the
  converter inlines them as data URLs (commit 8aa12df). New stories must use `storyAssets`.
- [GENERAL] Preview capture is 900x700; storybook captures full page height. Tall stories get
  cut -> `cfg.overrides.<Name>.viewport` (Section 900x1000, CourseCard 900x800).
- Framing: storybook canvas is padded cream (`bs-story--pad`); previews render in a BsRoot
  strip. Ignore that difference when grading.
- Titles `Foundations/Tokens`, `Examples/LandingPage`, `Examples/AppScreens` are reference
  pages, excluded via `titleMap: null`.

## Re-sync risks
- Story cap: compare checks the first 6 stories per component. Button has 10; the tail
  (Sizes, FullWidth, AsLink, LongLabelFullWidth) was never graded one by one. Raise with
  `--max-stories 10` if Button changes.
- `StickyCTA/FixedOnMobile` renders nothing at the 900px capture width (the bar hides from
  768px up), so both sides are empty and it graded match. The card's useful story is `Static`.
- Viewport overrides (Section 900x1000, CourseCard 900x800) fit today's stories. A taller
  new story gets cut at the bottom of the preview only: raise the override.
- Fonts are base64-inlined into `_ds_bundle.css` (~320 KB) because Vite library mode inlines
  CSS assets. If the package build changes to emit font files, re-check `[FONT_*]` tags.
- New stories must import images through `.storybook/assets.ts`; a `/public` path shows a
  broken image in previews while storybook still looks fine.
- Component names must stay PascalCase (not all caps) or the converter drops them silently
  (look for "excluded N enum/type/context/hook exports" with N > 0).
- Toolchain at first sync: React 19.3, Storybook 10.6, Vite 8.3, TypeScript 5.9, Node 26.
