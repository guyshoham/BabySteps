# React rebuild: build plan

Date: 2026-09-25
Status: draft, waiting for owner review
Backlog: A10 (also closes A2, and gives U6 and L1 to L7 a home)

## 1. Why this doc

`@babysteps/ui` exists, but nothing builds or serves it. The site has no build step. Vercel
serves the repo root as static files, and routing is two rewrites in `vercel.json`. Three
things block a React site today:

- `packages/ui` points at `dist/`, which is gitignored and never built on Vercel.
- `lib/firebase-admin.js:6` imports `app/firebase-config.js`, and `:10` hardcodes
  `https://baby-steps-murex.vercel.app/app/login`. Moving `app/` breaks the server, and preview
  deploys send welcome links to prod.
- The repo root is public (A2): `/docs/TODO.md`, `/CLAUDE.md`, `/lib/*.js` all return 200.

This doc picks the stack, the folder layout, the exact deploy config and a safe order of work.

## 2. Goals and non-goals

**Goals**

- Every page (marketing and `/app/*`) is built in React from `@babysteps/ui`.
- Cost stays at $0 on Vercel Hobby. No server rendering at request time.
- `api/enroll.js` and `api/video-url.js` stay as they are, with no new function invocations.
- Every current URL keeps working, including links in emails, PayPal and WhatsApp.
- Only the build output is public (fixes A2).
- Ship in small steps. Each step is one PR, testable on a preview URL, and easy to roll back.

**Non-goals**

- New features. L1 to L7 and U6 land inside the screen steps, but they are their own tickets.
- A CMS, SSR, edge middleware, or a custom domain move.
- Changing Firestore, R2, Make or the `api/` contract.
- Porting to TypeScript outside `apps/web` and `packages/ui`.

## 3. Options

| | A: Vite + React Router SPA, prerendered marketing (`apps/web`) | B: Astro for marketing, React islands, React SPA for `/app` | C: Next.js |
| --- | --- | --- | --- |
| Toolchain | Vite, same as `packages/ui` | Astro plus Vite plus React | Next (Turbopack) |
| Marketing HTML | Prerendered at build, then hydrated | Static, zero JS by default | Static export or SSG |
| `/app/*` | One client SPA, fallback HTML | React SPA inside Astro (`client:only`) | Client pages, dynamic routes need care |
| Root `api/` functions | Keep as is | Keep as is | Next ignores root `api/`; move to route handlers |
| Runtime cost | $0 (static + 2 functions) | $0 | $0 if kept static, but easy to slip into SSR |
| Marketing JS | React runtime, about 60 KB gz | Near zero | React runtime |
| Learning and upkeep | One router, one mental model | Two frameworks, two routing systems | Biggest framework, most config |

**Recommendation: A.** Reasons:

1. **It keeps `api/` untouched.** Vercel builds the root `api/` folder as Node functions in any
   non-Next project, and file tracing pulls in `../lib/*.js`. Next would force a rewrite of both
   handlers.
2. **No server needed.** React Router framework mode with `ssr: false` plus `prerender` writes
   real HTML for the marketing pages at build time. Crawlers and WhatsApp previews get full
   content and `og:` tags. The gated pages cannot be prerendered anyway (they need the user), so
   a client SPA is the natural fit.
3. **One toolchain.** `packages/ui` is already Vite 8 + React 19. Same config style, same tests.
4. **Cheap to learn and keep.** One router, one layout tree, shared components between
   marketing and app (for example `SiteNav`, `Footer`, `CourseCard`).

B is the best choice if marketing page weight becomes the top concern. A costs about 60 KB of
gzipped JS on the landing pages. That is acceptable at this scale, and we can move marketing to
Astro later without touching `/app`.

Note: npm's current React Router is **v8.4.0** (the backlog said v7). `ssr: false` +
`prerender` works in v8 as documented at reactrouter.com/how-to/pre-rendering.

## 4. Folder layout

```
apps/web/                      new workspace, name @babysteps/web
  package.json                 react, react-dom, react-router, firebase, @babysteps/ui
  react-router.config.ts       ssr: false, prerender list, appDirectory: "src"
  vite.config.ts               build.assetsDir: "_app" (see 6.4)
  tsconfig.json
  src/
    root.tsx                   <html lang="he" dir="rtl">, BsRoot, fonts, meta
    routes.ts                  route table
    routes/
      home.tsx                 /
      challenge.rolling.tsx    /challenge/rolling
      challenge.rolling.thank-you.tsx
      challenge.tummy-time.tsx
      terms.tsx, privacy.tsx   /terms, /privacy (T1, T2)
      app.layout.tsx           auth guard + AppHeader for /app/*
      app.login.tsx            /app/login (outside the guard)
      app.my-courses.tsx
      app.course.tsx           /app/course/:slug
      app.lesson.tsx           /app/lesson/:id
      not-found.tsx
    lib/
      firebase.ts              the only file that imports "firebase/*"
      api.ts                   fetch("/api/video-url") with the ID token
      safe-next.js, lesson-nav.js, lesson-progress.js, course-list.js   moved from app/
    config.ts                  reads import.meta.env.VITE_*
  public/
    assets/                    moved from /assets (logos, og images, teaser video)
    robots.txt, sitemap.xml
  legacy/                      temporary: old HTML pages not yet ported (section 7)
api/  lib/  scripts/  tests/   unchanged location
packages/ui/                   unchanged
```

`src` instead of React Router's default `app/` avoids confusion with the old root `app/` folder
and with the `/app` URL.

## 5. Build and deploy config

### 5.1 npm scripts (root `package.json`)

```json
"workspaces": ["packages/*", "apps/*"],
"scripts": {
  "build": "npm run ui:build && npm run build --workspace @babysteps/web",
  "web:dev": "npm run ui:build && npm run dev --workspace @babysteps/web",
  "test": "vitest run && npm test --workspace @babysteps/ui"
}
```

`apps/web/package.json`: `"dev": "react-router dev"`, `"build": "react-router build"`,
`"typecheck": "react-router typegen && tsc"`. During migration, `build` also runs
`node scripts/merge-legacy.js` (section 7).

The UI package is always built first, so `@babysteps/ui` resolves to a fresh `dist/`. That tests
the real package contract. `dist/` stays gitignored.

### 5.2 `vercel.json` (end state)

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": null,
  "installCommand": "npm ci",
  "buildCommand": "npm run build",
  "outputDirectory": "apps/web/build/client",
  "cleanUrls": true,
  "trailingSlash": false,
  "redirects": [
    { "source": "/index.html", "destination": "/", "permanent": true },
    { "source": "/challenge/:page/index.html", "destination": "/challenge/:page", "permanent": true },
    { "source": "/challenge/rolling/thank-you.html", "destination": "/challenge/rolling/thank-you", "permanent": true },
    { "source": "/app/:page.html", "destination": "/app/:page", "permanent": true }
  ],
  "rewrites": [
    { "source": "/app/:path*", "destination": "/__spa-fallback" }
  ],
  "headers": [
    { "source": "/app/(.*)", "headers": [
      { "key": "X-Frame-Options", "value": "DENY" },
      { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
    ] },
    { "source": "/_app/(.*)", "headers": [
      { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
    ] }
  ]
}
```

- `framework: null` stops Vercel from guessing a preset. The root has no `react-router`
  dependency, but this makes it explicit.
- `outputDirectory` only changes what is served as static files. The root `api/` folder is still
  built as functions. **Step 1 must prove this on a preview** (see 7).
- Vercel checks the file system before rewrites. So prerendered pages (like `/app/login`) and
  `/api/*` are never caught by the `/app/:path*` fallback.
- With `cleanUrls`, Vercel docs say to drop `.html` from rewrite destinations, so the
  destination is `/__spa-fallback`. Check it on the step 1 preview.

### 5.3 CI (`.github/workflows/ci.yml`)

- Replace the "Build design system" step with `npm run build` (it builds the UI first).
- Add `npm run typecheck --workspace @babysteps/web`.
- Add `node scripts/check-build.js`: fails if the output has any `.md`, `lib/`, `docs/`,
  `scripts/`, `packages/` or `firestore.rules`, and if any expected page (`index.html`,
  `challenge/rolling/index.html`, `__spa-fallback.html`, ...) is missing.

## 6. Routing, config and env

### 6.1 URLs that must keep working

| URL | How it is served |
| --- | --- |
| `/` | prerendered `index.html` |
| `/challenge/rolling`, `/challenge/tummy-time` | prerendered |
| `/challenge/rolling/thank-you` (PayPal return) | prerendered, `noindex` |
| `/terms`, `/privacy` | prerendered (new pages from T1, T2) |
| `/app/login` (Firebase `continueUrl`) | prerendered shell, client code |
| `/app/my-courses` | SPA fallback |
| `/app/course/:slug`, `/app/lesson/:id` | SPA fallback via rewrite |
| `/api/enroll`, `/api/video-url` | Vercel functions, unchanged |
| old `*.html` paths | 308 redirects (5.2) |
| `/assets/...` (og images, logos, teaser) | copied from `public/assets` |

The PayPal return URL is set inside PayPal. Check its exact value before step 6.

### 6.2 Firebase web config

- Client: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`,
  `VITE_FIREBASE_APP_ID`, set in Vercel for all environments and listed in `.env.example`. They
  are public by design (`firestore.rules` protect the data). `src/config.ts` fails the build if
  one is missing.
- Firebase moves from the gstatic CDN to the `firebase` npm package. One version in
  `package-lock.json` replaces the version check in `tests/sdk-version.test.js` (A3).
- Server: `lib/firebase-admin.js` reads `process.env.FIREBASE_WEB_API_KEY` inside
  `sendWelcome`, not at import. The `import ... from "../app/firebase-config.js"` line goes away.
  `lib/` then imports nothing from the frontend.

### 6.3 SITE_URL

- `WELCOME_CONTINUE_URL` becomes a function: `${SITE_URL}/app/login`, where `SITE_URL` is
  `process.env.SITE_URL`, else `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` (a Vercel
  system variable). Read at call time.
- The frontend uses `VITE_SITE_URL` for absolute `og:url`, `og:image` and the sitemap.
- The `continueUrl` domain must be in Firebase "Authorized domains". Keep prod as the default for
  preview deploys, so a preview never sends a broken link to a real buyer.

### 6.4 Vite asset folder clash

Vite writes hashed JS and CSS to `/assets/` by default. That is the same path as our images and
videos. Set `build.assetsDir: "_app"` so the two never mix, and so `/_app/*` can be cached
forever.

## 7. Migration order

The trick that makes small steps possible: old pages move, unchanged, into `apps/web/legacy/`.
A small `scripts/merge-legacy.js` runs after `react-router build`. It renames React Router's
`index.html` fallback to `__spa-fallback.html` if `/` is not prerendered yet, then copies
`legacy/` into the output. Each later step deletes the legacy files it replaces. Step 6 deletes
the script.

Every step: one PR, check the Vercel preview URL, merge, check prod. **Rollback:** use Vercel
"Instant Rollback" to the last good deploy, then `git revert` the PR. No step changes Firestore
or R2, so rollback never needs a data fix.

| # | Step | What changes | How to test | Rollback risk |
| --- | --- | --- | --- | --- |
| 1 | Pipeline + one page | `apps/web`, new `vercel.json`, CI, `git mv` of all public files into `legacy/` and `public/`, env moves in `lib/firebase-admin.js`, test paths updated. One React page: `/terms` (or a React 404 if the terms text is not ready) | `curl` every URL in 6.1 on the preview: 200. `/docs/TODO.md`, `/lib/r2.js`, `/CLAUDE.md` return 404 (A2). `POST /api/enroll` without secret returns 401, not 404. Run `scripts/fake-payment.sh` on preview and check the welcome email link | Medium: first build config. Instant Rollback |
| 2 | Login | `/app/login` in React (`TextField`, `Alert`, L6 errors and hint). Delete `legacy/app/login.html` | Log in as tester, bad password, network off, "forgot password", `?next=` with an evil URL | Low |
| 3 | My courses | `/app/my-courses`, `/app` layout with auth guard and `AppHeader` (U6). L2 one-course skip | Tester with 1 and 2 courses, logged out redirect, empty state | Low |
| 4 | Course | `/app/course/:slug` with `LessonListItem`, `ProgressBar`, "continue" button (L2, L3). Drop the old course rewrite | Wrong slug shows "not found", not "no access". Progress matches Firestore | Low |
| 5 | Lesson | `/app/lesson/:id`, signed URL via `api.ts`, portrait fit, 90% done (L5), prev/next, finish (L7). Delete `legacy/app/` and `tests/sdk-version.test.js` | Watch a video on a phone, non-enrolled user gets 403, progress saves, image lessons | Medium: the paid core. Test on iPhone Safari |
| 6 | Marketing pages | `/`, `/challenge/*`, thank-you in React, prerendered, with `meta()` for `og:` tags. Delete `legacy/`, `styles.css`, `merge-legacy.js` | Compare old and new HTML `<head>` (title, `og:*`). Test share previews with the WhatsApp and Facebook debuggers. Check price tags test (`lib/prices.js`) against the new source. Lighthouse on mobile | Medium: SEO and sales. Ship one page per PR if needed |

Step 6 comes last because the marketing pages sell today and work fine. The app screens gain the
most from the rebuild (U6, L1 to L7).

## 8. Risks

- **SEO.** Prerendered HTML holds the full text, so crawlers see what they see today. Risk is a
  lost `<title>`, `meta description` or canonical. Mitigation: a build check that each marketing
  page has them, and keep `sitemap.xml` and `robots.txt`.
- **Share previews.** WhatsApp does not run JS. `og:*` tags must be in the prerendered HTML with
  absolute URLs from `VITE_SITE_URL`. Test each page in the debuggers before and after.
- **Hebrew fonts.** `@babysteps/ui` self-hosts Rubik and Varela Round (Hebrew and Latin subsets).
  Preload the two main `woff2` files in `root.tsx`, use `font-display: swap`, and drop the Google
  Fonts link. Varela Round has one Hebrew weight, so headings must not ask for bold.
- **Firebase bundle size.** Auth + Firestore is about 100 to 150 KB gzipped. Load it only in the
  `/app` routes (route code splitting), so marketing pages never download it. Consider
  `firebase/firestore/lite` (much smaller): the app only does one-off reads and `setDoc`, no live
  listeners.
- **`api/` bundling.** If Vercel stops tracing `../lib/*.js` with a subfolder output, the
  functions fail. Step 1 tests both endpoints on the preview before merge.
- **Price tags test.** `tests/` checks `data-price` tags in the HTML pages. After step 6 it must
  read the React source or the build output instead.
- **Hydration mismatch** on prerendered pages if a component reads `window` during render. Keep
  browser-only code in `useEffect`.

## 9. Open decisions for the owner

1. **Stack:** approve option A, or choose B (Astro) for lighter marketing pages?
2. **Firebase config:** env vars (recommended here), or one committed `config/firebase-web.js`
   at the root that both `lib/` and `apps/web` import (no Vercel setup, one source)?
3. **Firestore lite:** use `firebase/firestore/lite` to save bundle size?
4. **Step 1 page:** is the `/terms` text (T1) ready, or ship a React 404 page first?
5. **Preview deploys:** should previews send welcome links to prod (safe default) or to the
   preview URL (needs `*.vercel.app` in Firebase authorized domains)?
6. **Custom domain:** if one is coming, do it before step 6, so `SITE_URL`, `og:url` and the
   sitemap change once.
7. **Design first:** steps 2 to 5 wait for the U6 screen designs in Claude Design and Yarden's
   feedback. Step 1 can start now.
