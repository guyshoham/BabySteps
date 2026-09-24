# Research: our own Hebrew transactional emails (G4 + F4)

Date: 2026-09-25. All prices and limits below were checked on this date. Prices change often, so check again before you sign up.

## The problem

- **G4.** Today the only email a buyer gets is Firebase's built-in "reset password" email.
  `lib/firebase-admin.js` `sendWelcome()` calls `accounts:sendOobCode` with `requestType: "PASSWORD_RESET"`.
  We cannot change its subject or body (`EMAIL_TEMPLATE_UPDATE_NOT_ALLOWED`), and the link opens an English Firebase page.
- **F4.** `lib/enroll-core.js` sends that email only when `!user.hasSignedIn`.
  A student who already logs in and buys a second course gets nothing from us.
- **Goal.** Send two emails of our own, in Hebrew, from our own address:
  1. Welcome: "choose your password" link to a Hebrew page on our site.
  2. Course added: "הקורס נוסף לחשבון שלך" with a login link.

## 1. Make the password link ourselves (Firebase Admin SDK)

`getAuth().generatePasswordResetLink(email, actionCodeSettings)` **returns a link and does not send any email.**
The docs say the link should be "inserted into the custom password reset email and then emailed to the corresponding user using a custom SMTP server".
Source: https://firebase.google.com/docs/auth/admin/email-action-links (checked 2026-09-25).

`actionCodeSettings`:

| Field | Meaning for us |
| --- | --- |
| `url` | The continue URL. Firebase passes it on as `continueUrl`. Use `https://<site>/app/login`. |
| `handleCodeInApp` | For mobile apps. Leave it `false`. |
| `linkDomain` | For custom Firebase Hosting link domains in mobile apps. Not needed. |

### The link points to Firebase, not to us

The returned link opens `https://<project>.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=...&apiKey=...&continueUrl=...&lang=...`.
Firebase lets you set a "custom action URL" per template in the console (Authentication > Templates).
Source: https://firebase.google.com/docs/auth/custom-email-handler (checked 2026-09-25).
Two problems with that for us:

- Our template settings are locked (the same lock that gives `EMAIL_TEMPLATE_UPDATE_NOT_ALLOWED`).
- Another project on Vercel reports that the action URL field refused their Vercel domain.
  Source: https://github.com/pat792/set-picks/issues/1049 (checked 2026-09-25).

**So we do not depend on that setting.** We read the `oobCode` from the returned link and build our own link:

```js
const firebaseLink = await adminAuth().generatePasswordResetLink(email, { url: LOGIN_URL });
const oobCode = new URL(firebaseLink).searchParams.get("oobCode");
const ourLink = `${SITE_URL}/app/auth-action?mode=resetPassword&oobCode=${encodeURIComponent(oobCode)}`;
```

The new page `app/auth-action.html` (Hebrew, RTL) uses the Web SDK v10 from the CDN, like our other pages:

1. `verifyPasswordResetCode(auth, oobCode)` → returns the email. Show "בחרי סיסמה עבור <email>".
2. The student types a password. `confirmPasswordReset(auth, oobCode, newPassword)`.
3. `signInWithEmailAndPassword(auth, email, newPassword)`, then go to `/app/my-courses`.
4. On `auth/expired-action-code` or `auth/invalid-action-code`: show a Hebrew message and a "שלחו לי קישור חדש" button.

Both functions are listed in the custom handler docs above. This is the same page the TODO calls `/app/set-password`; one name is enough. `/app/auth-action` also leaves room for other modes later.

### Link lifetime: 1 hour

The password reset code expires after **1 hour**. Source: https://medium.com/@beard0/firebase-admin-auth-link-expiration-times-9b5b090eae37 (a Firebase team answer quoted there, checked 2026-09-25). The console "Expire after" setting is on the same locked template page.
This is already true today. A buyer who opens the welcome email the next morning gets a dead link.
The "send me a new link" button fixes this. It can call Firebase's `sendPasswordResetEmail` (stock email, works today) or, better, a small `POST /api/password-link` that sends our own email again. That endpoint must be rate limited and must answer the same way for unknown emails.

## 2. Providers

Our volume: a few hundred emails a month, a few per day. Every option below has a plain HTTPS JSON API, so we can call it with `fetch` from a Vercel function and add no npm package.

| Provider | Free tier | First paid plan | Node SDK | Notes | Source |
| --- | --- | --- | --- | --- | --- |
| **Resend** | 3,000/month, **100/day**, 3 domains, 30 day logs | Pro $20/month, 50,000/month, $0.90 per extra 1,000 | `resend` | Only native email integration on the Vercel Marketplace. Very simple API. | https://resend.com/pricing |
| **Brevo** | **300/day** (about 9,000/month), transactional included, no Brevo logo on free | Starter from $9/month, no daily cap ("Sent by Brevo" footer on Starter unless you pay the add-on) | `@getbrevo/brevo` | Also a marketing tool; heavier dashboard and account review. | https://help.brevo.com/hc/en-us/articles/208589409-About-Brevo-s-pricing-plans |
| **Postmark** | **100/month**, no expiry | Basic $15/month, 10,000/month, $1.80 per extra 1,000 | `postmark` | Best known for inbox rates, but the free tier is only for testing. | https://postmarkapp.com/pricing |
| **Mailgun** | **100/day**, 1 custom domain | Basic $15/month, 10,000/month | `mailgun.js` | Fine, but no reason to pick it over Resend here. | https://www.mailgun.com/pricing/ |
| **Amazon SES** | Up to $200 AWS Free Tier credits, 6 months free plan, credits used within 12 months | Essentials $0.16 per 1,000 (a la carte $0.10 per 1,000) | `@aws-sdk/client-sesv2` | Cheapest by far later. New accounts start in a sandbox: only verified recipients, 200/day, 1/second, until AWS approves a request. Needs an AWS account and IAM keys. | https://aws.amazon.com/ses/pricing/ , https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html |

All checked 2026-09-25.

**Vercel Marketplace** (https://vercel.com/marketplace/category/messaging, checked 2026-09-25): Resend is the only native email integration. It creates an API key and stores `RESEND_API_KEY` on the Vercel project. Knock and Novu are also listed, but they are notification layers that sit on top of an email provider. They add a moving part we do not need. See https://vercel.com/marketplace/resend.

**Deliverability features.** All five support DKIM signing on your own domain, bounce and complaint webhooks, and a suppression list. Resend, Postmark and Mailgun keep logs you can search, which helps when a buyer says "I got nothing".

**Hebrew and RTL.** All of them send the HTML we give them, so RTL is our job, not theirs. Gmail is known to ignore a lone `dir="rtl"` on `<html>` or `<body>`. The safe pattern:

- Put `dir="rtl"` **and** inline `style="direction:rtl;text-align:right"` on the wrapper `<table>`/`<td>` and on each `<p>`.
- Add a plain text part as well.
- Avoid visual template builders (Brevo drag and drop, MJML by default). They often write `text-align:left` inline and break RTL. Plain template strings in our code avoid this.

Sources: https://medium.com/@tempmailwithpassword/resolving-rtl-text-alignment-issues-in-gmail-html-emails-8e84a99eb38a , https://taxiforemail.com/code/right-to-left-layout/ (checked 2026-09-25).

## 3. Domain: we need one before we can send

The site only lives at `baby-steps-murex.vercel.app`. We cannot add DNS records to `vercel.app`, so we cannot send from it.

**What the mail inbox checks.** Gmail requires every sender to have SPF or DKIM. Above 5,000 emails a day it requires SPF, DKIM and DMARC, with the From domain aligned. Source: https://support.google.com/a/answer/81126 (checked 2026-09-25). We are far below 5,000, but setting up all three is cheap and it keeps us out of spam.

DNS records the provider gives us (on a subdomain such as `mail.<domain>`, so the main domain stays clean):

- SPF: a TXT record that allows the provider to send.
- DKIM: a TXT or CNAME with the provider's public key.
- DMARC: `_dmarc.<domain>` TXT `v=DMARC1; p=none; rua=mailto:<yarden's inbox>`. Move to `p=quarantine` after a few clean weeks.

**Shared or onboarding domains do not work for real buyers.**

- Resend's `onboarding@resend.dev` delivers **only to the Resend account owner's own address**. Source: https://docs.lovable.dev/tips-tricks/resend (checked 2026-09-25).
- Mailgun's sandbox domain and SES's sandbox also only send to verified recipients (see the SES page above).
- Sending from `@gmail.com` through a provider fails DMARC, because Gmail's DMARC policy does not allow other servers to send as gmail.com. Mail gets rejected or goes to spam.

**Cheapest path: buy a domain.**

| Option | Cost | Rules |
| --- | --- | --- |
| `.co.il` | About ₪50 to ₪150 a year, depending on the registrar. Source: https://webshuk.com/co-il-domain-price-in-2025/ (checked 2026-09-25) | Sold only through ISOC-IL accredited registrars (for example LiveDNS, Box, DomainTheNet). `.co.il` is open to "any person or other legal entity" and is "primarily intended for entities operating for-profit". The holder's details (full name, address, email, phone) must be true and accurate, or the domain can be cancelled. Part of it is shown in the public WHOIS. Source: ISOC-IL rules v1.11, https://en.isoc.org.il/il-cctld/dot-il-registration-rules (checked 2026-09-25). |
| `.com` | Registry cost with no markup at Cloudflare Registrar. Source: https://www.cloudflare.com/products/registrar/ (checked 2026-09-25). Check the live price at checkout. | No local rules. Works with any registrar. |

A `.co.il` fits an Israeli brand for Israeli moms. Yarden can register it as an individual (עוסק פטור is fine). The same domain should also become the site domain on Vercel, which fixes the odd `baby-steps-murex` URL in every email.

## 4. Code change sketch

Keep the pattern the repo already uses: pure core, injected deps, real I/O in `lib/`.

### New files

- `lib/email.js`: `sendEmail({ to, subject, html, text })`. One `fetch` to the provider API. Throws on non-2xx with the provider's message. `fetchImpl` is injectable for tests, like `sendWelcome` today. Reads `EMAIL_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO` at call time, not at import.
- `lib/email-templates.js`: pure functions that return `{ subject, html, text }` from plain template strings:
  - `welcomeEmail({ setPasswordUrl, courseTitle })`
  - `courseAddedEmail({ loginUrl, courseTitle })`
  - Every value goes through a small `escapeHtml()`. Course titles come from Firestore, so treat them like the `textContent` rule on our pages.
  - `EMAIL_REPLY_TO` = Yarden's inbox, so a reply reaches a person.

### Changes

- `lib/firebase-admin.js`
  - New `createPasswordLink(email)`: `generatePasswordResetLink`, read `oobCode`, return our `/app/auth-action` URL.
  - `ensureEnrollment()` returns `{ isNew }`: `isNew = !snap.exists` inside the transaction it already runs. `nextEnrollment` in `lib/enrollment-record.js` stays pure and unchanged.
  - `sendWelcome()` (the Firebase `sendOobCode` call) stays as the fallback until the new flow is proven, then goes away.
- `lib/enroll-core.js`, new deps: `createPasswordLink`, `sendEmail`, `getCourseTitle` (optional; the email can work without the title).

```js
const user = await ensureUser(email);
const { isNew } = await ensureEnrollment(user.uid, courseId, paymentRef ?? null);

if (!user.hasSignedIn) {
  // Same rule as today: also covers a Make retry after a failed send.
  const link = await createPasswordLink(email);
  await sendEmail({ to: email, ...welcomeEmail({ setPasswordUrl: link, courseTitle }) });
  // on failure: 502, Make retries (as today)
} else if (isNew) {
  await sendEmail({ to: email, ...courseAddedEmail({ loginUrl, courseTitle }) });
}
```

- `api/enroll.js`: wire the real deps.
- `tests/enroll-core.test.js`: fakes for `sendEmail` and `createPasswordLink`. Cases: new user gets welcome, signed-in user with new course gets "course added", signed-in user with a repeat payment gets nothing, send failure returns 502.
- `tests/email-templates.test.js`: HTML has `dir="rtl"`, values are escaped, text part exists.

### The retry problem for "course added"

`isNew` is true only on the first call. If the "course added" send fails and Make retries, the retry sees `isNew: false` and sends nothing. Two fixes:

- **A. Best effort.** Log the error and still return 200. Simple. The buyer still has PayPal's receipt and can log in.
- **B. Store a flag.** Write `courseAddedEmailAt` on the enrollment doc after a good send. Send when the user has signed in and the flag is missing. Retries then work, like the welcome rule. This needs a second small write and one more test.

B matches how the welcome email already works. A is less code.

### New env vars

`EMAIL_API_KEY` (or `RESEND_API_KEY` if we use the Marketplace integration), `EMAIL_FROM` (for example `"מתחילים בקטן" <hello@mail.<domain>>`), `EMAIL_REPLY_TO`, `SITE_URL`. Add them to `.env.example`.

## 5. Risks

| Risk | How likely | What to do |
| --- | --- | --- |
| Spam folder | Medium for a brand new domain | SPF + DKIM + DMARC before the first send. Send only one to one emails. No link shorteners, no images only. Test with Gmail, Outlook and a Walla/Israeli inbox. Watch bounces in the provider's logs. |
| Link expires (1 hour) | High, already today | "Send me a new link" button on `/app/auth-action`. Say in the email: "הקישור בתוקף לשעה". |
| Daily limit | Low | Resend free is 100/day. A launch day could pass that. On a 429 we return 502 and Make retries later. Upgrade if it happens. |
| Cost | Low | $0 at our volume on Resend or Brevo. The domain is the only fixed cost. |
| Two emails per sale (PayPal receipt + ours) | Certain | That is normal and useful. PayPal's is the receipt; ours is the access. Make ours clearly say what to do next, and mention that PayPal sends the receipt. |
| API key leak | Low | Key only in Vercel env, sending-only scope, domain-restricted if the provider allows it. |
| Provider down | Low | Enroll is idempotent and Make retries. Logs show the failure. |

## Recommendation

Use **Resend** on its free tier, connected through the Vercel Marketplace, with a new **`.co.il`** domain (sending from a `mail.` subdomain). Generate the password link with the Admin SDK, pull out the `oobCode`, and send our own Hebrew emails to a new `/app/auth-action` page. Brevo is the backup if we ever need more than 100 emails a day for free.

### Steps

1. Owner: buy the domain at an ISOC-IL accredited registrar. Point it at Vercel as the site domain.
2. Owner: create a Resend account (through the Vercel Marketplace), add `mail.<domain>`, add the SPF, DKIM and DMARC records, wait for "verified".
3. Code: `lib/email.js`, `lib/email-templates.js`, `createPasswordLink`, `ensureEnrollment` returns `{ isNew }`, update `runEnroll` and its tests.
4. Code: `app/auth-action.html` with the choose password form and the expired link state.
5. Update `WELCOME_CONTINUE_URL` and every hard coded `baby-steps-murex.vercel.app` to `SITE_URL`.
6. Test with the tester account and a real Gmail inbox. Check the headers show `dkim=pass` and `dmarc=pass`.
7. Switch the live flow. Keep the old `sendWelcome` for one release as a fallback, then delete it.

## Open decisions

- `.co.il` or `.com`? And whose name holds it (Yarden, as the business owner, is the natural choice).
- "Course added" retry: best effort (A) or stored flag (B)?
- Should the "send me a new link" button call Firebase's stock email (no new endpoint) or our own `/api/password-link` (our Hebrew email, needs rate limiting)?
- The from name and address, for example `"ירדן - מתחילים בקטן" <hello@mail.<domain>>`.
