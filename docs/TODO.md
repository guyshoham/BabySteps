# TODO backlog

Deferred work for this repo. One line per item, IDs never change.

Categories: `G` = go-live · `U` = UI/UX · `D` = dev tooling · `H` = housekeeping.
Priority: `P0` data loss or wrong money · `P1` blocks sales or big UX · `P2` polish · `P3` nice to have.

The step-by-step provisioning list lives in `docs/go-live-checklist.md`. This file only tracks
what is still open.

## Go-live

- [x] **[G1] P1 — Wire Make to `/api/enroll`.** Make is PayPal → filter (`paymentStatus`=Completed
  AND `raw` contains `course_2`) → HTTP `POST /api/enroll`. Firebase sends the welcome email.
  → done 2026-09-24: fake IPN via `scripts/fake-payment.sh` created the user, the email link set
  a password, login and video playback worked.
- [ ] **[G2] P1 — Run one real payment end to end.** `docs/go-live-checklist.md:187`. Depends on
  G1. **Fix:** buy once through PayPal, watch the Make execution, set a password from the Firebase email and log in.

- [ ] **[G3] P1 — Stop fake payments.** The Make PayPal webhook accepts unverified IPNs, so
  anyone with the hook URL gets free access. **Fix:** verify each IPN with PayPal
  (`cmd=_notify-validate`) before enrolling, in Make or in `/api/enroll`.
- [ ] **[G4] P2 — Better welcome email.** Firebase refuses custom subject/body
  (`EMAIL_TEMPLATE_UPDATE_NOT_ALLOWED`), so buyers get the stock Hebrew "reset password" email,
  and the link opens an English Firebase page. **Fix:** set Firebase Public-facing name to
  `מתחילים בקטן` now; later send our own email and host a Hebrew `/app/set-password` page.

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
