# Receipts for every sale (עוסק פטור)

Backlog item: F2 (P1). Researched on 2026-09-25. All prices and features were checked on
that date. Prices are before VAT unless marked. Yarden is עוסק פטור, so she cannot reclaim the
18% VAT on these subscriptions. The "real cost" columns add it.

## Decision (2026-09-25)

Yarden keeps Paperless and issues every receipt by hand for now, for PayPal and Bit/Paybox sales
alike. The ₪50 a month API package is not worth it at today's volume. Revisit when sales reach
about 5 a month: then buy the package and follow "The Make flow" and "Setup steps" below.

## Summary

- Yarden must issue a **קבלה** (receipt) for every payment, the same day. Not a חשבונית מס.
- The "חשבוניות ישראל" allocation number rules apply only to **tax invoices**. They do not
  apply to her receipts.
- Yarden already issues receipts by hand in **Paperless** (פייפרלס,
  [paperless.tax](https://www.paperless.tax/)). Paperless has a public REST API that Make can
  call, with an API key header. It can create a קבלה (type `3`) with PayPal as the payment app.
- **Recommendation: keep Paperless and automate it.** Add the "אוטומציות וקישוריות" package
  (₪50 a month) and one HTTP module in Make after the enroll call. One system, one receipt
  number series, and her accountant keeps seeing everything in the same place.
- EZcount (₪24 a month) is cheaper, but it would be a second system with a second number
  series. It stays in this doc as the fallback.
- Bit/Paybox sales: Yarden keeps issuing those receipts by hand in Paperless, as today.

## 1. What the law asks of an עוסק פטור

| Rule | Detail | Source |
| --- | --- | --- |
| Which document | A receipt (שובר קבלה) for every payment. An עוסק פטור collects no VAT and may not issue a tax invoice. | [הוראות ניהול פנקסי חשבונות, סעיף 2א, 5](https://www.nevo.co.il/law_html/law01/255_179.htm); [midrag Q&A with accountants](https://www.midrag.co.il/Expanel/Question/1866) |
| Minimum books | A small business (עוסק זעיר) keeps receipts (or a daily cash book) plus a file of outside documents. | [סעיף 2א](https://he.wikisource.org/wiki/%D7%94%D7%95%D7%A8%D7%90%D7%95%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94_(%D7%A0%D7%99%D7%94%D7%95%D7%9C_%D7%A4%D7%A0%D7%A7%D7%A1%D7%99_%D7%97%D7%A9%D7%91%D7%95%D7%A0%D7%95%D7%AA)) |
| When | At the time the money is received. The duty does not depend on the buyer asking. | [friendlyinvoice guide](https://friendlyinvoice.co.il/blog/kabala-osek-patur); [סעיף 5](https://www.nevo.co.il/law_html/law01/255_179.htm) |
| What it must show | Running number, business name and ID, date, payer name (and address, except cash retail), amount, what it is for, signature (not needed on a signed computerized document). | [סעיף 5(א)](https://www.nevo.co.il/law_html/law01/255_179.htm) |
| Numbering | One running series, no number used twice. Software does this for you. | [סעיף 5(א)](https://www.nevo.co.il/law_html/law01/255_179.htm) |
| Digital receipt | Allowed as a "מסמך ממוחשב" with a secure electronic signature. Paperless and the other services sign the PDF. | [סעיף 18ב](https://www.nevo.co.il/law_html/law01/255_179.htm) |
| Keeping | 7 years from the end of the tax year, or 6 years from filing that year's report, whichever is later. The services keep the copies online. | [סעיף 25](https://he.wikisource.org/wiki/%D7%94%D7%95%D7%A8%D7%90%D7%95%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94_(%D7%A0%D7%99%D7%94%D7%95%D7%9C_%D7%A4%D7%A0%D7%A7%D7%A1%D7%99_%D7%97%D7%A9%D7%91%D7%95%D7%A0%D7%95%D7%AA)) |

**חשבוניות ישראל (allocation numbers): does not apply to her receipts.** The Tax Authority's
VAT instruction 01/2025 (7 Dec 2025) says an allocation number is needed for a **חשבונית מס**
that includes VAT, above ₪10,000 from 1.1.2026 and above ₪5,000 from 1.6.2026, when the buyer is
an עוסק מורשה and asks for it. A receipt from an עוסק פטור is not a tax invoice and has no VAT.
Also, one course costs ₪175, far below the threshold. Source:
[הוראת ביצוע מע"מ 01/2025](https://www.gov.il/BlobFolder/policy/inst-071225-1/he/vat_inst-071225-1.pdf).
Note: one blog ([bizsuccess](https://bizsuccess.co.il/%D7%9E%D7%A1%D7%A4%D7%A8-%D7%94%D7%A7%D7%A6%D7%A2%D7%94-%D7%94%D7%90%D7%9D-%D7%A8%D7%9C%D7%95%D7%95%D7%A0%D7%98%D7%99-%D7%9C%D7%A2%D7%95%D7%A1%D7%A7-%D7%A4%D7%98%D7%95%D7%A8/))
claims the opposite. It has the dates wrong and contradicts the primary source above.

Open point for the accountant: the old text of סעיף 18ב asks for the buyer's consent to get
documents by email. Ask whether a line on the sales page ("הקבלה תישלח למייל") is enough.

## 2. Paperless (what Yarden uses today)

The product is **Paperless, "הנהלת חשבונות ללא נייר"**, at
[www.paperless.tax](https://www.paperless.tax/) (marketing site
[home.paperless.tax](https://home.paperless.tax/), help center
[academy-bu.paperless.tax](https://academy-bu.paperless.tax/he/)). The domain paperless.co.il
does not exist (DNS lookup fails). Paperless is built around the accountant (מייצג): the
accountant sees the income without extra work.

| Question | Answer | Source |
| --- | --- | --- |
| Plan she needs for receipts | "הפקת מסמכים": ₪15 a month before VAT with an accountant, up to 50 documents, then 0.2 agorot per document. ₪20 without an accountant. | [חבילות ותשלומים](https://academy-bu.paperless.tax/he/articles/12792234-%D7%97%D7%91%D7%99%D7%9C%D7%95%D7%AA-%D7%95%D7%AA%D7%A9%D7%9C%D7%95%D7%9E%D7%99%D7%9D); [packagesbu](https://home.paperless.tax/packagesbu) |
| Plan needed for the API | "אוטומציות וקישוריות": ₪50 a month (the page gives no VAT note; the help center says its prices are before VAT). The API returns error 12 "חסרה חבילת אוטומציות וקישוריות" without it. | [packagesbu](https://home.paperless.tax/packagesbu); [Swagger spec](https://api.paperless.tax/swagger/ui) |
| API | Yes. REST, JSON, documented in Swagger. Auth is an API key in the `X-API-KEY` header. The key is in Settings, "חיבורים והרשאות", "Paperless API". | [פייפרלס API](https://academy-bu.paperless.tax/he/articles/13904892-%D7%A4%D7%99%D7%99%D7%A4%D7%A8%D7%9C%D7%A1-api); [Swagger](https://api.paperless.tax/swagger/ui) (spec at `https://pl-apis-prod-il.azurewebsites.net/swagger.json`) |
| Endpoints | `PUT /api/invoices/create`, `GET /api/invoices/test-connection`, `PUT /api/documents/search`, `PUT /api/clients/search`, products, reports. | Swagger |
| Receipt for עוסק פטור | `type.iType = 3` is "Receipt (קבלה)". A receipt must have payments (error 9 otherwise). | Swagger |
| PayPal as payment method | `payments[].iType = 5` (App) with `iApp = 5` (Paypal). Bit is `iApp = 1`, Paybox `iApp = 2`. | Swagger |
| Emails the buyer | The API article says that after a sale "המסמך ישלח ללקוח", and the create call takes `client.sEmail`. The Swagger has no explicit "send email" flag. **Confirm in the test run.** | [פייפרלס API](https://academy-bu.paperless.tax/he/articles/13904892-%D7%A4%D7%99%D7%99%D7%A4%D7%A8%D7%9C%D7%A1-api) |
| Duplicate guard | `type.sUniqueID`: "used to prevent duplicates with the same id **within the next minute**". Error 14 "מסמך בעל אותו מזהה כבר הופק". Weak: it does not protect a re-run an hour later. | Swagger |
| External id | `client.sExternalID` for the client. No field for a payment reference, so put the PayPal id in `type.sRemark` (printed at the bottom of the document) and in `payments[].sAccount`. | Swagger |
| Test mode | `type.bIsPreview: true` makes only a draft and returns its preview URL. No sandbox account needed. | Swagger |
| Webhooks | Out of Paperless (for example to a CRM). Not needed here. | [Webhooks](https://academy-bu.paperless.tax/he/articles/15324942-webhooks) |
| Make / Zapier app | None found. No Make page for Paperless (`make.com/en/integrations/paperless` is 404). Make's generic HTTP module is enough. | checked 2026-09-25 |
| Own PayPal link | The "אוטומציות וקישוריות" package lists "PayPal" among payment links it can issue documents from. The app asks for a PayPal REST Client ID, Secret, Token and Webhook ID, so it uses PayPal REST webhooks, not IPN. Setup is not documented in the help center. | [packagesbu](https://home.paperless.tax/packagesbu); Paperless web app settings screen |

Both API hosts answer: `https://api.paperless.tax/api/invoices/test-connection` and the
Swagger's `https://pl-apis-prod-il.azurewebsites.net/...` return `{"iCode":1,"sMessage":"מפתח לא
תקין"}` without a key (checked 2026-09-25). Use `api.paperless.tax`, which the Paperless app
itself uses.

## 3. Other services compared (fallback)

VAT rate used: 18% from 1.1.2025 ([gov.il](https://www.gov.il/he/pages/dec1270-2024)).

| Service | Cheapest plan with API | Price / month (before VAT) | Documents / month | Make | Emails receipt to buyer | Hebrew | Own PayPal link |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Paperless** (today) | הפקת מסמכים + אוטומציות וקישוריות | ₪15 + ₪50 | 50, then 0.2 agorot each | No app. REST API, Make HTTP module | Yes per help article (to verify) | Yes | Yes, REST webhooks |
| **EZcount (Hyp)** | גבעול | ₪24 monthly, ₪21 on yearly (₪252) | 50, then ₪0.75 each | No app. REST API, Make HTTP module | Yes, by default (`dont_send_email: 0`) | Yes, default | Yes, IPN based |
| **iCount** | Advanced | ₪32 (up to 10 docs), ₪59 (up to 100) | see price | **Verified Make app** with "Create Document" | Yes | Yes | Yes, "Connect" in settings |
| **Morning (Green Invoice)** | Best | ₪54 monthly, ₪45 yearly | 50 | Two community Make apps. Both need Best or higher | Yes | Yes | Yes, IPN based, Best and up |
| **SUMIT** | Paid plan | from ₪19 to ₪25 (the two SUMIT pages differ) | about 50 "actions" | Official SUMIT app in Make | Yes | Yes | Mentioned, not checked |
| **Invoice4U** | Pink | ₪21 (₪252/year) | 50 | No Make app found. API exists, plan and price not stated | Yes | Yes | Yes, mentioned |

Sources (all checked 2026-09-25):
EZcount prices [hyp.co.il/digital-invoice-pricing](https://hyp.co.il/digital-invoice-pricing/)
(ezcount.co.il/pricing redirects there); EZcount API
[Postman docs v1.4.5](https://documenter.getpostman.com/view/16363118/TzkyNLWB);
EZcount PayPal [ezcount.co.il/automated-invoicing-paypal-payment](https://www.ezcount.co.il/automated-invoicing-paypal-payment);
iCount prices [icount.co.il/plans](https://www.icount.co.il/plans/); iCount Make app
[make.com/en/integrations/icount](https://www.make.com/en/integrations/icount);
iCount PayPal [help.icount.co.il/integration/paypal](https://help.icount.co.il/integration/paypal/);
Morning prices [greeninvoice.co.il/pricing](https://www.greeninvoice.co.il/pricing/); Morning Make
apps [apps.make.com/green-invoice-y563os](https://apps.make.com/green-invoice-y563os),
[apps.make.com/morning-9g3otg](https://apps.make.com/morning-9g3otg); Morning PayPal
[greeninvoice.co.il/help-center/connect-paypal](https://www.greeninvoice.co.il/help-center/connect-paypal/);
SUMIT [sumit.co.il/foryou/biz](https://www.sumit.co.il/foryou/biz),
[Make app](https://help.sumit.co.il/he/articles/5840257-%D7%90%D7%99%D7%A0%D7%98%D7%92%D7%A8%D7%A6%D7%99%D7%94-%D7%9E%D7%9C%D7%90%D7%94-%D7%A2%D7%9D-make);
Invoice4U [pricelist](https://www.invoice4u.co.il/pricelist-invoice/). Rivhit was not
compared: its cheapest online plan is about ₪49 a month
([adircpa, Aug 2026](https://adircpa.com/guides/invoicing-software-israel)).

Gaps: Morning's API docs (greeninvoice.docs.apiary.io) returned 404/502 on the check date.
SUMIT's paid plan price differs between its own pages.

### Why not the services' own PayPal link?

A PayPal account has **one** IPN address, and ours already points to Make (it drives
`/api/enroll`). EZcount and Morning read PayPal through IPN, so they would break enrollment.
PayPal allows a per-payment `notify_url` only for buttons or API calls, not for our payment
links ([PayPal IPN setup](https://developer.paypal.com/api/nvp-soap/ipn/IPNSetup/)).

Paperless's own PayPal link uses PayPal REST webhooks, which are separate from IPN, so it might
not clash. But its setup is not documented, and it would issue a receipt for **every** PayPal
payment with no filter. The Make route is documented, testable, and keeps one place for the
whole sale. **Never run both**: that makes two receipts per sale.

## 4. The Make flow (Paperless)

Today: PayPal IPN → Make webhook (module 1) → filter "Completed + course_2" → HTTP POST
`/api/enroll` (module 2). See `docs/make/paypal-enroll.blueprint.json`.

Add after module 2:

- **Module 3, Data store → Get a record** (duplicate guard). Data store `receipts`, key
  `{{1.txnId}}`.
- **Filter** between 3 and 4: continue only if module 3 found no record.
- **Module 4, HTTP → Make a request** (creates the receipt).
- **Module 5, Data store → Add/replace a record**: key `{{1.txnId}}`, fields
  `docNumber = {{4.data.invoices[1].sInvoiceNumber}}`, `url = {{4.data.invoices[1].sURL}}`.

Why the data store: Paperless blocks a repeated `sUniqueID` only for one minute. Make's
History re-run, or a repeated PayPal IPN, can come later than that. The data store stops a
second receipt. It costs about 2 more credits per sale. The free Make plan has 1,000 credits a
month ([make.com/en/pricing](https://www.make.com/en/pricing)).

PayPal field mapping:

| PayPal IPN field | Make field (module 1) | Paperless field |
| --- | --- | --- |
| `payer_email` | `1.payer.email` | `client.sEmail` |
| `first_name`, `last_name` | `1.payer.firstName`, `1.payer.lastName` | `client.sName` (required) |
| `mc_gross` (full amount before PayPal fee) | `1.gross` | `items[0].dPrice`, `payments[0].dAmount` |
| `mc_currency` | `1.currency` | none: the API has no currency field. Our payment link is in ILS. |
| `txn_id` | `1.txnId` | `type.sUniqueID`, `type.sRemark`, `payments[0].sAccount` |
| `payment_date` (`HH:MM:SS Mmm DD, YYYY PDT`) | `1.paymentDate` | not used; `dtDue` is today in Israel time |
| `item_name` | `1.itemName` | `items[0].sProductName` |

IPN field meanings: [PayPal IPN variables](https://developer.paypal.com/api/nvp-soap/ipn/IPNandPDTVariables/).
`mc_gross` is what the buyer paid, before the PayPal fee. The receipt must show this amount.

Module 4 settings:

- URL `https://api.paperless.tax/api/invoices/create`
- Method **PUT** (not POST), body raw, content type `application/json`, parse response Yes.
- Header `X-API-KEY: PASTE_PAPERLESS_API_KEY` (keep the real key only in Make).
- Body:

```json
{
  "type": {
    "iType": 3,
    "bIsPreview": false,
    "sRemark": "PayPal {{1.txnId}}",
    "sUniqueID": "paypal-{{1.txnId}}"
  },
  "client": {
    "sName": "{{ifempty(trim(1.payer.firstName + \" \" + 1.payer.lastName); 1.payer.email)}}",
    "sEmail": "{{1.payer.email}}",
    "sExternalID": "{{1.payer.email}}",
    "bIsFixed": true,
    "bIsEng": false
  },
  "items": [
    { "sProductName": "קורס מתחילים בקטן: מתגלגלים", "dCount": 1, "dPrice": {{1.gross}}, "bVAT0": false }
  ],
  "payments": [
    {
      "iType": 5,
      "iApp": 5,
      "dAmount": {{1.gross}},
      "dtDue": "{{formatDate(now; \"YYYY-MM-DDTHH:mm:ss\"; \"Asia/Jerusalem\")}}",
      "sAccount": "{{1.txnId}}"
    }
  ]
}
```

Notes on the body:

- `iType: 3` is קבלה. `iType: 5` with `iApp: 5` is "App: PayPal". All codes are from the Swagger.
- `items` is optional in the Swagger for a receipt. Keep one line so the receipt says what was
  paid for ("what it is for" is a required receipt detail). If Paperless rejects items on a
  receipt, remove `items` and put the course name in `sRemark`.
- `dPrice` is "before VAT". An עוסק פטור has no VAT, so price = amount paid. Check in the test
  that the receipt shows ₪175 and no VAT line.
- The response gives `invoices[].sInvoiceNumber`, `sURL`, `sDownloadPageURL` and `sDocumentID`.
- First runs: set `"bIsPreview": true`. Paperless makes only a draft and returns a preview URL.

Error cases:

- If `/api/enroll` returns 502 (enrolled, welcome email failed), module 2 fails and the receipt
  modules do not run. Re-running from History creates the receipt then. The data store blocks
  a double receipt.
- If enrollment fails for good, the receipt is still owed. Issue it by hand in Paperless.
  Option: put modules 3 to 5 on their own router branch right after the filter, so the
  receipt never waits on enrollment. The backlog asked for "after enroll", so this doc keeps
  that order.
- Paperless errors come back as HTTP 400 with `iCode`: 12 means the automation package is
  missing, 9 means no payment, 16 means no client name, 14 means duplicate.
- Refunds: create a cancel document with `type.sBasedOnDocID` = the receipt's `sDocumentID`
  (Swagger: "Optional document ID when canceling a previous document"), or do it by hand.

## 5. Manual fallback (Bit / Paybox, failed runs)

Bit and Paybox money never reaches PayPal or Make. Yarden keeps doing what she does today, the
same day:

1. Check the money arrived in the Bit or Paybox app.
2. In Paperless: issue a קבלה, payment "אפליקציה" with Bit or Paybox, the buyer's name and email.
3. Enroll her: `node --env-file=.env scripts/enroll-manual.js <email> rolling --ref bit-<date>`
   (see "Paid but no access" in `docs/go-live-checklist.md`).

Because PayPal receipts now also land in Paperless, all receipts share one number series.

## 6. Cost at 5, 20 and 50 sales a month

Real cost = price + 18% VAT. Hand time assumes 3 minutes per receipt (estimate, not measured).
Paperless rows show only the **extra** cost on top of the "הפקת מסמכים" package she already pays.

| Option | 5 sales | 20 sales | 50 sales | Hand work | Number series |
| --- | --- | --- | --- | --- | --- |
| By hand in Paperless (today) | ₪0 extra | ₪0 extra | ₪0 extra | 15 / 60 / 150 min a month | one |
| **Paperless + אוטומציות וקישוריות** | **₪59 extra** | **₪59 extra** | **₪59 extra** | Bit/Paybox only | **one** |
| EZcount גבעול monthly, keep Paperless for Bit/Paybox | ₪28.32 extra | ₪28.32 extra | ₪28.32 extra | Bit/Paybox only | two |
| EZcount גבעול yearly, keep Paperless | ₪24.78 extra | ₪24.78 extra | ₪24.78 extra | Bit/Paybox only | two |
| Move fully to EZcount, cancel Paperless docs | ₪28.32 minus ₪17.70 saved = ₪10.62 extra | same | same | Bit/Paybox only | one (new) |
| iCount Advanced | ₪37.76 (≤10) | ₪69.62 (≤100) | ₪69.62 | Bit/Paybox only | two |
| Morning Best, monthly | ₪63.72 | ₪63.72 | ₪63.72 | Bit/Paybox only | two |

The ₪17.70 saved is the ₪15 "הפקת מסמכים" package plus VAT. If Yarden's Paperless use is part
of her accountant's service, cancelling it may not be possible or may cost more elsewhere.

At ₪175 a course, the Paperless package costs about 6.7% of revenue at 5 sales, 1.7% at 20 and
0.7% at 50. Below about 5 sales a month, doing it by hand in Paperless stays a fair choice: it
costs nothing extra and takes about 15 minutes a month. A missed or late receipt is a legal
problem, so automation matters more as sales grow.

## Recommendation

**Automate in Paperless.** Add the "אוטומציות וקישוריות" package (₪50 a month) and the Make
modules in section 4. One system, one receipt number series, no second subscription to learn,
and the accountant keeps her current view. Bit/Paybox receipts stay manual in Paperless.

If ₪50 a month is too much for the early months, keep issuing receipts by hand in Paperless
until sales pass about 5 a month, then turn the package on.

Fallback: EZcount גבעול (₪24 a month) with the same Make pattern. Only choose it if Yarden
stops issuing in Paperless (one new series), or if her accountant confirms that two systems
with two number series are fine and how the EZcount income reaches the books. The EZcount
request is in the appendix.

## Setup steps (Paperless)

1. Yarden: Paperless → הגדרות → חבילות ותשלומים → join "אוטומציות וקישוריות".
2. Yarden: הגדרות → חיבורים והרשאות → click the "Paperless API" box → click the key icon →
   copy the key. Send it to Guy in a private channel, never in the repo.
3. Guy: in Make, `GET https://api.paperless.tax/api/invoices/test-connection` with header
   `X-API-KEY`. Expect 200.
4. Guy: clone the scenario. Create the data store `receipts` (key: text). Add modules 3 to 5
   with `"bIsPreview": true`. Run `scripts/fake-payment.sh` with a test email. Open the preview
   URL and check the type (קבלה), amount, no VAT line, the name, and the PayPal id at the bottom.
5. Turn `bIsPreview` to `false`. Do one real ₪1 test payment if the accountant agrees, or wait
   for the first real sale. Check: the receipt appears in Paperless with the next running
   number, the buyer gets the email, and a History re-run does **not** make a second receipt.
   If no email arrives, ask Paperless support how to send API documents, or add a Make email
   step with `{{4.data.invoices[1].sDownloadPageURL}}`.
6. Do **not** also connect PayPal inside Paperless (two receipts per sale).
7. Export the blueprint to `docs/make/paypal-enroll.blueprint.json` with the placeholder
   `PASTE_PAPERLESS_API_KEY`.
8. Add "הקבלה תישלח למייל" to the sales page after the accountant says it is enough.
9. Update `docs/go-live-checklist.md` with the receipt step and the manual Bit/Paybox steps.

## Decisions for Yarden

1. Approve the Paperless "אוטומציות וקישוריות" package (₪50 a month), or keep receipts manual
   for now and turn it on later.
2. Create the Paperless API key and share it with Guy privately.
3. Ask the accountant: (a) is a sales page line enough consent for emailed receipts, (b) is it
   fine to issue PayPal receipts via the API into the same Paperless account, and (c) only if
   choosing EZcount: are two systems with two number series acceptable, and how does that
   income reach the books.

## Appendix: EZcount request (fallback only)

`POST https://api.ezcount.co.il/api/createDoc` (test: `https://demo.ezcount.co.il/api/createDoc`,
separate free demo key). Codes from the
[EZcount API docs](https://documenter.getpostman.com/view/16363118/TzkyNLWB): type `400` is
קבלה, payment type `91` is "Web transfer (Pay, Paypal)". `transaction_id` is a lasting
duplicate guard: "if you will send the same transaction_id again, we will not create a new doc".
The account needs a digital signature set up before the API works.

```json
{
  "api_key": "PASTE_EZCOUNT_API_KEY",
  "developer_email": "PASTE_ACCOUNT_EMAIL",
  "type": 400,
  "lang": "he",
  "transaction_id": "paypal-{{1.txnId}}",
  "description": "קורס מתחילים בקטן: {{1.itemName}}",
  "customer_name": "{{ifempty(trim(1.payer.firstName + \" \" + 1.payer.lastName); 1.payer.email)}}",
  "customer_email": "{{1.payer.email}}",
  "payment": [
    {
      "payment_type": 91,
      "payment_sum": {{1.gross}},
      "date": "{{formatDate(now; \"DD/MM/YYYY\"; \"Asia/Jerusalem\")}}",
      "wt_vendor": "PayPal",
      "wt_transaction_id": "{{1.txnId}}"
    }
  ],
  "price_total": {{1.gross}},
  "dont_send_email": 0,
  "send_copy": 1
}
```
