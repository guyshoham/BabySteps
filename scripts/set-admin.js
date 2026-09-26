// scripts/set-admin.js — give or take the admin claim (the admin page, /app/admin).
//
// Run locally (never on Vercel):
//   node --env-file=.env scripts/set-admin.js --email <email> [--remove] [--dry-run]
//
// The user must already have an account (she logged in once, or was enrolled).
// Other custom claims stay as they are. The browser sees the change after its
// login token refreshes: /app/admin forces this once, or sign out and in again.
import { findUserByEmail, getClaims, setClaims } from "../lib/firebase-admin.js";
import { runSetAdmin } from "../lib/set-admin-core.js";

const argv = process.argv.slice(2);
let email;
const flags = new Set();
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--email") email = argv[++i];
  else if (argv[i].startsWith("--")) flags.add(argv[i]);
}
const remove = flags.has("--remove");

if (!email || flags.has("--help")) {
  console.log("usage: node --env-file=.env scripts/set-admin.js --email <email> [--remove] [--dry-run]");
  process.exit(email ? 0 : 1);
}

try {
  if (flags.has("--dry-run")) {
    const clean = email.trim().toLowerCase();
    const user = await findUserByEmail(clean);
    console.log("email:", clean);
    if (!user) {
      console.log("user: missing (no account with this email)");
    } else {
      const isAdmin = (await getClaims(user.uid))?.admin === true;
      console.log("user:", user.uid, "· admin now:", isAdmin ? "yes" : "no");
      console.log("would", remove ? "remove admin" : "make admin", (isAdmin !== remove) ? "(no change)" : "");
    }
    console.log("dry run: nothing written");
    process.exit(0);
  }

  const r = await runSetAdmin({ findUserByEmail, getClaims, setClaims }, { email, remove });
  console.log("email:", r.email);
  console.log("uid:", r.uid);
  console.log("admin:", r.admin ? "yes" : "no", r.changed ? "(changed)" : "(already so, nothing written)");
  process.exit(0);
} catch (e) {
  console.error("error:", e.message);
  process.exit(1);
}
