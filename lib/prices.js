// lib/prices.js — the one place course prices live (in ₪).
// The HTML stays static: each price is written as <span data-price="<courseId>">₪N</span>.
// After changing a price here, run `npm run sync-prices`, then `npm test`.
// The PayPal payment link's amount is set in PayPal and must be changed there too.
export const PRICES = {
  rolling: 175,
};

const TAGGED = /(<span\b[^>]*\bdata-price="([^"]+)"[^>]*>)([^<]*)(<\/span>)/g;

export const formatPrice = (n) => `₪${n}`;

// Rewrite every tagged price from `prices`. Throws on an unknown course id.
export function applyPrices(html, prices = PRICES) {
  return html.replace(TAGGED, (_, open, id, _old, close) => {
    if (!(id in prices)) throw new Error(`unknown data-price id: ${id}`);
    return `${open}${formatPrice(prices[id])}${close}`;
  });
}

// Problems a test should fail on: a tagged price that does not match the config,
// or a ₪ amount that is not tagged (mark a deliberate one with data-price-ignore).
export function findPriceProblems(html, prices = PRICES) {
  const problems = [];
  for (const [, , id, text] of html.matchAll(TAGGED)) {
    if (!(id in prices)) problems.push(`unknown data-price id: ${id}`);
    else if (text !== formatPrice(prices[id])) problems.push(`data-price="${id}" shows ${text}, config says ${formatPrice(prices[id])}`);
  }
  const rest = html
    .replace(TAGGED, "")
    .replace(/<span\b[^>]*\bdata-price-ignore\b[^>]*>[^<]*<\/span>/g, "");
  for (const [m] of rest.matchAll(/₪\s?\d[\d,.]*/g)) problems.push(`untagged price: ${m}`);
  return problems;
}
