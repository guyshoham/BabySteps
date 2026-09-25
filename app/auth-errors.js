// app/auth-errors.js: pure helper, Firebase Auth error code -> clear Hebrew message.
// Pass the `code` from a caught Firebase error. `kind` is "signin" (default) or
// "reset" (the forgot-password flow), which changes the wording of the fallback.
export const HELP_WHATSAPP = "https://wa.me/972542366243";

const CREDENTIALS = "אימייל או סיסמה שגויים";

const MESSAGES = {
  "auth/invalid-credential": CREDENTIALS,
  "auth/invalid-login-credentials": CREDENTIALS,
  "auth/wrong-password": CREDENTIALS,
  "auth/user-not-found": CREDENTIALS,
  "auth/too-many-requests": "היו יותר מדי ניסיונות. נסי שוב בעוד כמה דקות.",
  "auth/network-request-failed": "אין חיבור לאינטרנט. בדקי את החיבור ונסי שוב.",
  "auth/invalid-email": "כתובת האימייל לא תקינה. בדקי אותה ונסי שוב.",
  "auth/missing-email": "הזיני אימייל ואז לחצי על \"שכחתי סיסמה\".",
  "auth/user-disabled": "החשבון הזה חסום. כתבי לנו בוואטסאפ ונעזור.",
};

const FALLBACK = {
  signin: "משהו השתבש בכניסה. נסי שוב, ואם זה חוזר כתבי לנו בוואטסאפ.",
  reset: "לא הצלחנו לשלוח מייל איפוס. נסי שוב, ואם זה חוזר כתבי לנו בוואטסאפ.",
};

export function messageFor(code, kind = "signin") {
  const fallback = FALLBACK[kind] ?? FALLBACK.signin;
  // A "wrong email or password" message makes no sense in the reset flow.
  if (kind === "reset" && MESSAGES[code] === CREDENTIALS) return fallback;
  return MESSAGES[code] ?? fallback;
}
