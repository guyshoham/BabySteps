// scripts/create-tester.js — create or reset the tester account.
//
// Run locally (never on Vercel):
//   node --env-file=.env scripts/create-tester.js --dry-run   # print what would happen
//   node --env-file=.env scripts/create-tester.js             # write to Firebase
//
// The tester is also an admin (custom claim admin: true), so it can open /app/admin.
// Uses TESTER_EMAIL (default tester@babysteps.test) and TESTER_PASSWORD from .env.
// If TESTER_PASSWORD is missing, a password is generated and appended to .env.
// Safe to re-run: the password is reset to TESTER_PASSWORD and every course
// enrollment is a merge on a fixed document id.
import { readFileSync, appendFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  upsertUserWithPassword, listCourses, ensureEnrollment, findUserByEmail, getClaims, setClaims,
} from "../lib/firebase-admin.js";
import { applyAdmin } from "../lib/set-admin-core.js";
import {
  runCreateTester, readablePassword, publishedCourseIds, DEFAULT_TESTER_EMAIL,
} from "../lib/tester-core.js";

const DRY_RUN = process.argv.includes("--dry-run");
const ENV_PATH = fileURLToPath(new URL("../.env", import.meta.url));

const email = process.env.TESTER_EMAIL || DEFAULT_TESTER_EMAIL;
let password = process.env.TESTER_PASSWORD;
let generated = false;

if (!password) {
  password = readablePassword();
  generated = true;
}

if (DRY_RUN) {
  const existing = await findUserByEmail(email);
  const courses = publishedCourseIds(await listCourses());
  console.log("email:", email);
  console.log("user:", existing ? `exists (${existing.uid}) → password would be reset` : "missing → would be created");
  console.log("courses to enroll:", courses.join(", ") || "(none)");
  console.log("admin claim: would be set (other claims kept)");
  if (generated) console.log("TESTER_PASSWORD missing → would generate one and append it to .env");
  console.log("dry run — nothing written");
  process.exit(0);
}

if (generated) {
  const current = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, "utf8") : "";
  const sep = current && !current.endsWith("\n") ? "\n" : "";
  const emailLine = process.env.TESTER_EMAIL ? "" : `TESTER_EMAIL=${email}\n`;
  appendFileSync(ENV_PATH, `${sep}${emailLine}TESTER_PASSWORD=${password}\n`);
}

const result = await runCreateTester(
  {
    upsertUser: upsertUserWithPassword, listCourses, ensureEnrollment,
    grantAdmin: (uid) => applyAdmin({ getClaims, setClaims }, uid, true),
  },
  { email, password }
);

console.log("email:", email);
console.log("uid:", result.uid, result.created ? "(created)" : "(existing, password reset)");
console.log("enrolled in:", result.courseIds.join(", ") || "(no courses found)");
console.log("admin:", result.adminChanged ? "yes (claim set)" : "yes (already)");
if (generated) console.log("password (new, saved to .env):", password);
process.exit(0);
