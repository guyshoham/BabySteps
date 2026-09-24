// scripts/enroll-manual.js — give a buyer access by hand.
//
// For Bit/Paybox payments, and for PayPal buyers whose access never arrived
// (typo, partner's PayPal account, failed Make run). Run locally, never on Vercel:
//   node --env-file=.env scripts/enroll-manual.js <email> [courseId] [--ref <paymentRef>] [--no-email] [--dry-run]
//
// Examples:
//   node --env-file=.env scripts/enroll-manual.js buyer@example.com rolling --ref bit-2026-09-24
//   node --env-file=.env scripts/enroll-manual.js buyer@example.com --dry-run
//
// Safe to re-run: the user and the enrollment are merges on fixed ids. The welcome
// ("choose a password") email goes only to users who never signed in.
import {
  listCourseIds, ensureUser, ensureEnrollment, sendWelcome, findUserByEmail,
} from "../lib/firebase-admin.js";
import { runManualEnroll } from "../lib/manual-enroll-core.js";

const flags = new Set();
const positional = [];
let paymentRef;
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--ref") paymentRef = argv[++i];
  else if (argv[i].startsWith("--")) flags.add(argv[i]);
  else positional.push(argv[i]);
}
const flag = (name) => flags.has(name);
const [email, courseId] = positional;

if (!email || flag("--help")) {
  console.log("usage: node --env-file=.env scripts/enroll-manual.js <email> [courseId] [--ref <paymentRef>] [--no-email] [--dry-run]");
  process.exit(email ? 0 : 1);
}

if (flag("--dry-run")) {
  const existing = await findUserByEmail(email.trim().toLowerCase());
  console.log("email:", email);
  console.log("user:", existing ? `exists (${existing.uid})` : "missing → would be created");
  console.log("course:", courseId ?? "(not given)", "· known:", (await listCourseIds()).join(", "));
  console.log("dry run: nothing written");
  process.exit(0);
}

try {
  const r = await runManualEnroll(
    { listCourseIds, ensureUser, ensureEnrollment, sendWelcome },
    { email, courseId, paymentRef, noEmail: flag("--no-email") }
  );
  console.log("email:", r.email);
  console.log("uid:", r.uid, r.created ? "(created)" : "(existing)");
  console.log("enrolled in:", r.courseId);
  if (r.welcomeSent) console.log("welcome email: sent (link to choose a password)");
  else if (r.hasSignedIn) console.log("welcome email: not sent, she already logs in. Tell her the course is in her account.");
  else console.log("welcome email: skipped (--no-email)");
  process.exit(0);
} catch (e) {
  console.error("error:", e.message);
  process.exit(1);
}
