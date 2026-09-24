#!/usr/bin/env bash
# Send a fake PayPal IPN ("Completed" payment for course_2) to a Make webhook.
# Tests the path: Make -> /api/enroll -> Firebase user + welcome email.
# Run `scripts/fake-payment.sh --help` for usage.
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: scripts/fake-payment.sh [options] [email]

Posts a fake PayPal IPN to a Make webhook, in the shape the PayPal trigger
in docs/make/paypal-enroll.blueprint.json reads:
  payment_status=Completed  item_number=course_2  mc_currency=ILS
  mc_gross=<price of "rolling" in lib/prices.js>  txn_id=FAKE-<time>

Options:
  --url URL      Make webhook URL. Default: $MAKE_HOOK_URL. One of the two is required.
                 The script does not read .env. To use it, run:
                   set -a; . ./.env; set +a; scripts/fake-payment.sh
  --amount N     Send mc_gross=N instead of the price. Use a low value on purpose
                 to test that /api/enroll answers "400 amount below price".
  --yes, -y      Send without asking for confirmation.
  --help, -h     Show this help.

  email          Buyer email. Default: guyshoham28+fake<time>@gmail.com

Notes:
  - Make answers "Accepted" at once. The result is in the scenario History.
  - Once the PayPal IPN check (G3, docs/go-live-checklist.md section 5a) is in the
    scenario, PayPal answers INVALID for these fake IPNs and the run stops there.
    That is by design. Use this script only against a copy of the scenario
    without that step, and never against the live one.
  - Anyone who has the hook URL can fake a payment. Never commit it.
EOF
}

HOOK_URL="${MAKE_HOOK_URL:-}"
AMOUNT=""
ASSUME_YES=0
EMAIL=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help) usage; exit 0 ;;
    -y|--yes) ASSUME_YES=1; shift ;;
    --url)
      [[ $# -ge 2 ]] || { echo "error: --url needs a value" >&2; exit 2; }
      HOOK_URL="$2"; shift 2 ;;
    --url=*) HOOK_URL="${1#--url=}"; shift ;;
    --amount)
      [[ $# -ge 2 ]] || { echo "error: --amount needs a value" >&2; exit 2; }
      AMOUNT="$2"; shift 2 ;;
    --amount=*) AMOUNT="${1#--amount=}"; shift ;;
    -*) echo "error: unknown option: $1 (see --help)" >&2; exit 2 ;;
    *)
      [[ -z "$EMAIL" ]] || { echo "error: only one email allowed" >&2; exit 2; }
      EMAIL="$1"; shift ;;
  esac
done

if [[ -z "$HOOK_URL" ]]; then
  echo "error: no hook URL. Pass --url URL or set MAKE_HOOK_URL (see --help)." >&2
  exit 2
fi

NOW="$(date +%s)"
EMAIL="${EMAIL:-guyshoham28+fake${NOW}@gmail.com}"

# Default amount: the course price from lib/prices.js (course_2 is the "rolling" course).
if [[ -z "$AMOUNT" ]]; then
  REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
  AMOUNT="$(cd "$REPO_ROOT" && node -e "import('./lib/prices.js').then(m=>process.stdout.write(String(m.PRICES.rolling)))")"
fi
if ! [[ "$AMOUNT" =~ ^[0-9]+(\.[0-9]+)?$ ]]; then
  echo "error: amount must be a number, got: $AMOUNT" >&2
  exit 2
fi
AMOUNT="$(printf '%.2f' "$AMOUNT")"

TXN="FAKE-$NOW"
TRACK="$(openssl rand -hex 6)"

# Show only scheme and host, so the secret path of the hook does not land in logs.
HOOK_HOST="$(printf '%s' "$HOOK_URL" | sed -E 's#^([a-zA-Z]+://[^/]+).*#\1#')"

cat <<EOF
About to send a fake PayPal IPN:
  to              $HOOK_HOST/... (path hidden)
  payer_email     $EMAIL
  payment_status  Completed
  item_number     course_2
  mc_gross        $AMOUNT
  mc_currency     ILS
  txn_id          $TXN
EOF

if [[ "$ASSUME_YES" -ne 1 ]]; then
  read -r -p "Send it? [y/N] " ANSWER
  [[ "$ANSWER" =~ ^[Yy]$ ]] || { echo "Cancelled."; exit 1; }
fi

curl -sS --max-time 30 -w '\nHTTP %{http_code}\n' -X POST "$HOOK_URL" \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode "txn_type=web_accept" \
  --data-urlencode "payment_status=Completed" \
  --data-urlencode "payer_email=$EMAIL" \
  --data-urlencode "payer_status=verified" \
  --data-urlencode "first_name=Test" \
  --data-urlencode "last_name=Buyer" \
  --data-urlencode "item_name=קורס מתהפכים" \
  --data-urlencode "item_number=course_2" \
  --data-urlencode "quantity=1" \
  --data-urlencode "mc_gross=$AMOUNT" \
  --data-urlencode "mc_currency=ILS" \
  --data-urlencode "txn_id=$TXN" \
  --data-urlencode "ipn_track_id=$TRACK" \
  --data-urlencode "charset=UTF-8" \
  --data-urlencode "notify_version=3.9"

echo "Make answers 'Accepted' at once. Check the scenario History, then Firebase Auth for $EMAIL."
