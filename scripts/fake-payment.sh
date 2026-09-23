#!/usr/bin/env bash
# Send a fake PayPal IPN ("Completed" payment for course_2) to the Make webhook.
# Tests the full path: Make -> /api/enroll -> Firebase user + welcome email.
#
# Usage:
#   scripts/fake-payment.sh [email]   # reads MAKE_HOOK_URL from env, else from .env
#
# The hook URL is read from MAKE_HOOK_URL and never stored in the repo:
# anyone who has it can fake a payment, because Make does not verify IPNs with PayPal.
set -euo pipefail

EMAIL="${1:-guyshoham28+fake$(date +%s)@gmail.com}"

# Fall back to the repo's .env if MAKE_HOOK_URL is not exported.
ENV_FILE="$(cd "$(dirname "$0")/.." && pwd)/.env"
if [[ -z "${MAKE_HOOK_URL:-}" && -f "$ENV_FILE" ]]; then
  MAKE_HOOK_URL="$(sed -n 's/^MAKE_HOOK_URL=//p' "$ENV_FILE" | tail -1 | tr -d '"'"'"'\r')"
fi
: "${MAKE_HOOK_URL:?Set MAKE_HOOK_URL in .env (see .env.example)}"

TXN="FAKE-$(date +%s)"
TRACK="$(openssl rand -hex 6)"

echo "Sending fake IPN: email=$EMAIL txn_id=$TXN"
curl -sS -w '\nHTTP %{http_code}\n' -X POST "$MAKE_HOOK_URL" \
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
  --data-urlencode "mc_gross=1.00" \
  --data-urlencode "mc_currency=ILS" \
  --data-urlencode "txn_id=$TXN" \
  --data-urlencode "ipn_track_id=$TRACK" \
  --data-urlencode "charset=UTF-8" \
  --data-urlencode "notify_version=3.9"

echo "Make answers 'Accepted' at once. Check the scenario History, then Firebase Auth for $EMAIL."
