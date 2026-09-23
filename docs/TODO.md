# TODO backlog

Deferred work for this repo. One line per item, IDs never change.

Categories: `G` = go-live · `U` = UI/UX · `D` = dev tooling · `H` = housekeeping.
Priority: `P0` data loss or wrong money · `P1` blocks sales or big UX · `P2` polish · `P3` nice to have.

The step-by-step provisioning list lives in `docs/go-live-checklist.md`. This file only tracks
what is still open.

## Go-live

- [ ] **[G2] P1 — Run one real payment end to end.** **Fix:** in PayPal
  (`paypal.com/ncp/links/SDBZ5YS6JNKLQ/edit`) set the price to ₪1, keep Product ID `course_2`, pay
  once, watch the Make run, set a password from the email, log in. Then set the price back to ₪175
  right away (a real buyer in that window would pay ₪1) and delete the test user.
- [ ] **[G3] P3 — Stop fake payments.** Low priority until sales grow. The Make PayPal webhook accepts unverified IPNs, so
  anyone with the hook URL gets free access. **Fix:** verify each IPN with PayPal
  (`cmd=_notify-validate`) before enrolling, in Make or in `/api/enroll`.
- [ ] **[G4] P2 — Better welcome email.** Firebase refuses custom subject/body
  (`EMAIL_TEMPLATE_UPDATE_NOT_ALLOWED`), so buyers get the stock Hebrew "reset password" email,
  and the link opens an English Firebase page. The console is locked too ("Email template updates
  are currently unavailable"; only Firebase Support can lift it). Project name must be English, so
  `%APP_NAME%` stays `babysteps-courses` for now. **Fix:** send our own email and host a Hebrew
  `/app/set-password` page.

## UI/UX

- [ ] **[U1] P2 — Sync the design with Claude Design.** `styles.css`, `app/*.html`. There is no
  design source of truth outside the code. **Fix:** set up a design system in Claude Design from
  the current site (brown `#704229`, cream `#fdf6f0`, Rubik, RTL), then keep it in sync.
- [ ] **[U2] P2 — Improve the UI/UX.** `index.html`, `app/my-courses.html`, `app/course.html`,
  `app/lesson.html`. Depends on U1. **Fix:** review the student pages and the landing pages
  against the synced design, list concrete issues, then fix them one by one.

## Housekeeping

- [ ] **[H1] P3 — Delete `staging/`.** 748 MB of transcoded videos, gitignored. **Fix:** once R2
  playback is confirmed good, `rm -rf staging/`.
- [ ] **[H2] P3 — Update `CLAUDE.md` status.** `CLAUDE.md` still says "built, not yet
  provisioned". **Fix:** mark the platform live and trim the "Remaining work" section to the open items here.
