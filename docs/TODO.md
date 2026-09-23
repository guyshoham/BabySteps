# TODO backlog

Deferred work for this repo. One line per item, IDs never change.

Categories: `G` = go-live · `U` = UI/UX · `D` = dev tooling · `H` = housekeeping.
Priority: `P0` data loss or wrong money · `P1` blocks sales or big UX · `P2` polish · `P3` nice to have.

The step-by-step provisioning list lives in `docs/go-live-checklist.md`. This file only tracks
what is still open.

## Go-live

- [ ] **[G1] P1 — Wire Make to `/api/enroll`.** `docs/go-live-checklist.md:128`. Buyers pay but
  no account is created: the PayPal scenario still enrolls into systeme.io. **Fix:** export the
  Make blueprint + one execution bundle (no Make API token). Find the product field PayPal sends
  (likely `SDBZ5YS6JNKLQ`), set `COURSE_MAP` in Vercel to map it to `rolling`, add the
  HTTP → `POST /api/enroll` step with `x-enroll-secret`, then the welcome email with the login.
- [ ] **[G2] P1 — Run one real payment end to end.** `docs/go-live-checklist.md:187`. Depends on
  G1. **Fix:** buy once through PayPal, watch the Make execution, log in with the emailed password.

## UI/UX

- [ ] **[U1] P2 — Sync the design with Claude Design.** `styles.css`, `app/*.html`. There is no
  design source of truth outside the code. **Fix:** set up a design system in Claude Design from
  the current site (brown `#704229`, cream `#fdf6f0`, Rubik, RTL), then keep it in sync.
- [ ] **[U2] P2 — Improve the UI/UX.** `index.html`, `app/my-courses.html`, `app/course.html`,
  `app/lesson.html`. Depends on U1. **Fix:** review the student pages and the landing pages
  against the synced design, list concrete issues, then fix them one by one.

## Dev tooling

- [x] **[D1] P2 — Tester account.** `lib/firebase-admin.js:29` (`ensureUser`),
  `lib/firebase-admin.js:46` (`ensureEnrollment`). Testing the courses page needs a real login.
  **Fix:** add `scripts/create-tester.js` that creates a fixed tester email with a known password
  (from `.env`, not committed) and enrolls it in all courses with `source: "tester"`. Idempotent,
  so re-running resets the password. → done: 63b7d3e

## Housekeeping

- [ ] **[H1] P3 — Delete `staging/`.** 748 MB of transcoded videos, gitignored. **Fix:** once R2
  playback is confirmed good, `rm -rf staging/`.
- [ ] **[H2] P3 — Update `CLAUDE.md` status.** `CLAUDE.md` still says "built, not yet
  provisioned". **Fix:** mark the platform live and trim the "Remaining work" section to G1/G2.
