# Receipts for every sale (עוסק פטור)

Backlog item: F2 (P1). Researched on 2026-09-25. All prices and features were checked on
that date. Prices are before VAT unless marked. Yarden is עוסק פטור, so she cannot reclaim the
18% VAT on these subscriptions. The "real cost" columns add it.

## Summary

- Yarden must issue a **קבלה** (receipt) for every payment, the same day. Not a חשבונית מס.
- The "חשבוניות ישראל" allocation number rules apply only to **tax invoices**. They do not
  apply to her receipts.
- Cheapest service that Make can call: **EZcount (now part of Hyp), plan "גבעול"**. It costs
  ₪24 a month (₪21 on a yearly plan), allows 50 documents a month, and includes the API.
- Add one **HTTP** module in Make after the enroll call. It creates the receipt and EZcount
  emails it to the buyer in Hebrew. The PayPal `txnId` makes the call safe to re-run.
- Bit/Paybox sales: Yarden issues the receipt by hand in the same EZcount account.

## 1. What the law asks of an עוסק פטור

| Rule | Detail | Source |
| --- | --- | --- |
| Which document | A receipt (שובר קבלה) for every payment. An עוסק פטור collects no VAT and may not issue a tax invoice. | [הוראות ניהול פנקסי חשבונות, סעיף 2א, 5](https://www.nevo.co.il/law_html/law01/255_179.htm); [midrag Q&A with accountants](https://www.midrag.co.il/Expanel/Question/1866) |
| Minimum books | A small business (עוסק זעיר) keeps receipts (or a daily cash book) plus a file of outside documents. | [סעיף 2א](https://he.wikisource.org/wiki/%D7%94%D7%95%D7%A8%D7%90%D7%95%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94_(%D7%A0%D7%99%D7%94%D7%95%D7%9C_%D7%A4%D7%A0%D7%A7%D7%A1%D7%99_%D7%97%D7%A9%D7%91%D7%95%D7%A0%D7%95%D7%AA)) |
| When | At the time the money is received. The duty does not depend on the buyer asking. | [friendlyinvoice guide](https://friendlyinvoice.co.il/blog/kabala-osek-patur); [סעיף 5](https://www.nevo.co.il/law_html/law01/255_179.htm) |
| What it must show | Running number, business name and ID, date, payer name (and address, except cash retail), amount, what it is for, signature (not needed on a signed computerized document). | [סעיף 5(א)](https://www.nevo.co.il/law_html/law01/255_179.htm) |
| Numbering | One running series, no number used twice. Software does this for you. | [סעיף 5(א)](https://www.nevo.co.il/law_html/law01/255_179.htm) |
| Digital receipt | Allowed as a "מסמך ממוחשב" with a secure electronic signature. All the services below sign the PDF. | [סעיף 18ב](https://www.nevo.co.il/law_html/law01/255_179.htm) |
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

## 2. Services compared

VAT rate used: 18% from 1.1.2025 ([gov.il](https://www.gov.il/he/pages/dec1270-2024)).

| Service | Cheapest plan with API | Price / month (before VAT) | Documents / month | Make | Emails receipt to buyer | Hebrew | Own PayPal link |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **EZcount (Hyp)** | גבעול | ₪24 monthly, ₪21 on yearly (₪252) | 50, then ₪0.75 each | No Make app. REST API with JSON, easy from Make's HTTP module | Yes, by default (`dont_send_email: 0`) | Yes, `lang: "he"` is the default | Yes, IPN based, included in גבעול |
| **iCount** | Advanced | ₪32 (up to 10 docs), ₪59 (up to 100) | see price | **Verified Make app** with "Create Document" | Yes | Yes | Yes, "Connect" in settings |
| **Morning (Green Invoice)** | Best | ₪54 monthly, ₪45 yearly | 50 | Two community Make apps (MAXMEL Tech: free; Callbox: "3rd party payment"). Both need Best or higher | Yes | Yes | Yes, IPN based, Best and up |
| **SUMIT** | Paid plan | from ₪19 to ₪25 (the two SUMIT pages differ) | about 50 "actions" | Official SUMIT app in Make ("create document" with email) | Yes | Yes | Mentioned, not checked |
| **SUMIT free** | none (no API listed) | ₪0 | 10 actions | No | Yes (manual) | Yes | No |
| **Invoice4U** | Pink | ₪21 (₪252/year) | 50 | No Make app found. API exists, plan and price not stated | Yes | Yes | Yes, mentioned |
| iCount Express, Morning Basic | no API | ₪276/year; ₪29 | unlimited; 20 | No | manual | Yes | No |

Sources (all checked 2026-09-25):
EZcount prices [hyp.co.il/digital-invoice-pricing](https://hyp.co.il/digital-invoice-pricing/)
(ezcount.co.il/pricing redirects there); EZcount API
[Postman docs v1.4.5](https://documenter.getpostman.com/view/16363118/TzkyNLWB);
EZcount PayPal [ezcount.co.il/automated-invoicing-paypal-payment](https://www.ezcount.co.il/automated-invoicing-paypal-payment);
iCount prices [icount.co.il/plans](https://www.icount.co.il/plans/); iCount Make app
[make.com/en/integrations/icount](https://www.make.com/en/integrations/icount) and
[apps.make.com/icount](https://apps.make.com/icount); iCount PayPal
[help.icount.co.il/integration/paypal](https://help.icount.co.il/integration/paypal/);
Morning prices [greeninvoice.co.il/pricing](https://www.greeninvoice.co.il/pricing/); Morning Make
apps [apps.make.com/green-invoice-y563os](https://apps.make.com/green-invoice-y563os),
[apps.make.com/morning-9g3otg](https://apps.make.com/morning-9g3otg),
[make.com/en/integrations/morning](https://www.make.com/en/integrations/morning); Morning PayPal
[greeninvoice.co.il/help-center/connect-paypal](https://www.greeninvoice.co.il/help-center/connect-paypal/);
SUMIT [sumit.co.il/foryou/biz](https://www.sumit.co.il/foryou/biz),
[pricing help](https://help.sumit.co.il/he/articles/5507895-%D7%90%D7%99%D7%9A-%D7%A2%D7%95%D7%91%D7%93-%D7%94%D7%9E%D7%97%D7%99%D7%A8%D7%95%D7%9F),
[Make app](https://help.sumit.co.il/he/articles/5840257-%D7%90%D7%99%D7%A0%D7%98%D7%92%D7%A8%D7%A6%D7%99%D7%94-%D7%9E%D7%9C%D7%90%D7%94-%D7%A2%D7%9D-make);
Invoice4U [pricelist](https://www.invoice4u.co.il/pricelist-invoice/),
[API page](https://www.invoice4u.co.il/api/). Rivhit was not compared: its cheapest online
plan is about ₪49 a month ([adircpa, Aug 2026](https://adircpa.com/guides/invoicing-software-israel)).

Gaps: Morning's API docs (greeninvoice.docs.apiary.io) returned 404/502 on the check date, so
its field names are not verified here. SUMIT's price for the paid plan differs between its own
pages. Make's page for EZcount, SUMIT and Invoice4U under `make.com/en/integrations/` is 404.

### Why not use the services' own PayPal link?

EZcount, Morning and iCount can each issue receipts straight from PayPal. EZcount and Morning do
it with PayPal **IPN**. A PayPal account has **one** IPN address in its profile, and ours already
points to Make (it drives `/api/enroll`). Morning warns that connecting another platform "עלול
לדרוס את החיבור אלינו". Moving the IPN to EZcount would break enrollment. PayPal allows a
per-payment `notify_url` only for buttons or API calls, not for our payment links
([PayPal IPN setup](https://developer.paypal.com/api/nvp-soap/ipn/IPNSetup/)). So the receipt
must come from Make, which already receives every IPN.

## 3. The Make flow

Today: PayPal IPN → Make webhook (module 1) → filter "Completed + course_2" → HTTP POST
`/api/enroll` (module 2). See `docs/make/paypal-enroll.blueprint.json`.

Add **module 3: HTTP → Make a request**, after module 2.

| PayPal IPN field | Make field (module 1) | Receipt field (EZcount) |
| --- | --- | --- |
| `payer_email` | `1.payer.email` | `customer_email` |
| `first_name`, `last_name` | `1.payer.firstName`, `1.payer.lastName` | `customer_name` |
| `mc_gross` (full amount before PayPal fee) | `1.gross` | `payment[0].payment_sum`, `price_total` |
| `mc_currency` | `1.currency` | `main_currency_iso` (ILS by default) |
| `txn_id` | `1.txnId` | `transaction_id` and `payment[0].wt_transaction_id` |
| `payment_date` (`HH:MM:SS Mmm DD, YYYY PDT`) | `1.paymentDate` | not needed; use today's date |
| `item_name` | `1.itemName` | `description` |

IPN field meanings: [PayPal IPN variables](https://developer.paypal.com/api/nvp-soap/ipn/IPNandPDTVariables/).
Note that `mc_gross` is the amount the buyer paid, before the PayPal fee. The receipt must show
this amount, not the net deposit.

Module 3 settings:

- URL `https://api.ezcount.co.il/api/createDoc` (test first with `https://demo.ezcount.co.il/api/createDoc`, which has its own API key).
- Method POST, body raw, content type `application/json`, parse response Yes, timeout 30+ seconds (EZcount asks for this).
- Body:

```json
{
  "api_key": "PASTE_EZCOUNT_API_KEY",
  "developer_email": "PASTE_ACCOUNT_EMAIL",
  "type": 400,
  "lang": "he",
  "transaction_id": "paypal-{{1.txnId}}",
  "date": "{{formatDate(now; \"DD/MM/YYYY\"; \"Asia/Jerusalem\")}}",
  "description": "קורס מתחילים בקטן: {{1.itemName}}",
  "customer_name": "{{ifempty(trim(1.payer.firstName + \" \" + 1.payer.lastName); 1.payer.email)}}",
  "customer_email": "{{1.payer.email}}",
  "main_currency_iso": "{{ifempty(1.currency; \"ILS\")}}",
  "payment": [
    {
      "payment_type": 91,
      "payment_sum": {{1.gross}},
      "date": "{{formatDate(now; \"DD/MM/YYYY\"; \"Asia/Jerusalem\")}}",
      "wt_vendor": "PayPal",
      "wt_transaction_id": "{{1.txnId}}",
      "comment": "PayPal {{1.txnId}}"
    }
  ],
  "price_total": {{1.gross}},
  "dont_send_email": 0,
  "send_copy": 1
}
```

Why these values (from the EZcount API docs): type `400` is קבלה; payment type `91` is "Web
transfer (Pay, Paypal)"; `lang` `he` is the default; `dont_send_email: 0` emails the PDF to
`customer_email`; `send_copy: 1` sends Yarden a copy. **`transaction_id` makes it idempotent:**
"if you will send the same transaction_id again, we will not create a new doc and instead will
give you a link to the original doc". So re-running a Make run never makes a second receipt.
The PDF is made after the response, so do not download it in the same run.

Error cases:

- If `/api/enroll` returns 502 (enrolled, welcome email failed), module 2 fails and module 3
  does not run. Re-running from History (the existing playbook) creates the receipt then.
- If enrollment fails for good, the receipt is still owed. Issue it by hand (section 4).
  Option: put module 3 on its own router branch right after the filter, so the receipt never
  waits on enrollment. The backlog asked for "after enroll", so this doc keeps that order.
- Refunds: cancel the receipt in EZcount (ביטול קבלה). This links to the refund playbook in TODO.

Make cost: one more module is one more credit per sale. The free plan has 1,000 credits a
month ([make.com/en/pricing](https://www.make.com/en/pricing)). This is not a real cost at our volume.

## 4. Manual fallback (Bit / Paybox, failed runs)

Bit and Paybox money never reaches PayPal or Make. For each such sale, the same day:

1. Check the money arrived in the Bit or Paybox app.
2. In EZcount: new document → קבלה. Customer name and email. Payment type "אחר" with the name
   "Bit" or "Paybox" (API equivalent: type `9` with `other_payment_type_name`). Amount, today's
   date. Save; EZcount emails it.
3. Enroll her: `node --env-file=.env scripts/enroll-manual.js <email> rolling --ref bit-<date>`
   (see "Paid but no access" in `docs/go-live-checklist.md`).

Time: about 2 to 3 minutes a sale (our estimate, not measured). Manual receipts use the same
number series as the automatic ones, so the books stay in one place.

## 5. Cost at 5, 20 and 50 sales a month

Real cost = price + 18% VAT. Hand time assumes 3 minutes per receipt (estimate).

| Option | 5 sales | 20 sales | 50 sales | Hand work |
| --- | --- | --- | --- | --- |
| By hand, SUMIT free (10 docs) | ₪0 | not enough (10 max) | not enough | 15 / 60 / 150 min a month |
| By hand, iCount Express (₪276/yr, unlimited) | ₪27.14 | ₪27.14 | ₪27.14 | 15 / 60 / 150 min a month |
| **EZcount גבעול, monthly** | **₪28.32** | **₪28.32** | **₪28.32** | none |
| EZcount גבעול, yearly | ₪24.78 | ₪24.78 | ₪24.78 | none |
| SUMIT paid (₪19 to ₪25) | ₪22.42 to ₪29.50 | same | same | none |
| iCount Advanced | ₪37.76 (≤10) | ₪69.62 (≤100) | ₪69.62 | none |
| Morning Best, monthly | ₪63.72 | ₪63.72 | ₪63.72 | none |
| Morning Best, yearly | ₪53.10 | ₪53.10 | ₪53.10 | none |

At ₪175 a course, EZcount costs about 3% of revenue at 5 sales and under 0.4% at 50 sales. Doing
it by hand saves about ₪28 a month but costs up to 2.5 hours a month, and a missed or late
receipt is a legal problem. Above 50 sales a month, EZcount charges ₪0.75 per extra document, or
the next plan "שתיל" is ₪36 for 100.

## Recommendation

Use **EZcount (Hyp), plan גבעול**, start monthly (₪24 + VAT) and switch to yearly (₪21) after
the first real sales. Issue PayPal receipts from Make with one HTTP module. Issue Bit/Paybox
receipts by hand in the same account. Pick iCount instead only if a no-code Make module matters
more than price (it costs ₪32 to ₪59).

**Ask first:** does Yarden or her accountant already use an invoicing service? If yes and it has
an API, use that one. Two systems would split the receipt number series.

## Setup steps (EZcount)

1. Test: register free at `demo.ezcount.co.il` and get a demo API key (Settings → API).
2. In Make, clone the scenario. Add module 3 with the demo URL and demo key. Run
   `scripts/fake-payment.sh` with a test email. Check that a receipt appears in the demo account
   and the email arrives in Hebrew. Run it again and check that no second receipt is made.
3. Yarden signs up at ezcount.co.il, plan גבעול. She fills business details as עוסק פטור (name,
   ID number, address, logo) and sets up the digital signature. The API needs "a fully setup
   account with a digital signature".
4. Get the production API key (Settings → API). It differs from the demo key. Keep it only in
   Make, never in the repo. Do **not** turn on EZcount's own PayPal IPN connection (section 2).
5. Switch module 3 to `https://api.ezcount.co.il/api/createDoc` and the real key. In the export
   to `docs/make/paypal-enroll.blueprint.json`, keep placeholders like `PASTE_EZCOUNT_API_KEY`.
6. Add the line "הקבלה תישלח למייל" to the sales page after the accountant says it is enough.
7. First real sale: watch the Make run, open the receipt in EZcount, check the amount, name,
   running number and the PayPal transaction ID in the payment comment.
8. Update `docs/go-live-checklist.md` with the receipt step and the manual Bit/Paybox steps.
