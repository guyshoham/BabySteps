// scripts/sync-prices.js — write the prices from lib/prices.js into the HTML pages.
//   npm run sync-prices
import { readFileSync, writeFileSync } from "node:fs";
import { applyPrices } from "../lib/prices.js";
import { PAGES } from "./pages.js";

for (const file of PAGES) {
  const before = readFileSync(file, "utf8");
  const after = applyPrices(before);
  if (after !== before) { writeFileSync(file, after); console.log("updated", file); }
}
console.log("done");
