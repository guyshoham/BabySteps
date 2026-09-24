import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { applyPrices, findPriceProblems, PRICES } from "../lib/prices.js";
import { PAGES } from "../scripts/pages.js";

describe("applyPrices", () => {
  it("rewrites tagged prices and keeps attributes", () => {
    const html = '<span class="p" data-price="rolling">₪1</span>';
    expect(applyPrices(html, { rolling: 175 })).toBe('<span class="p" data-price="rolling">₪175</span>');
  });
  it("throws on an unknown course id", () => {
    expect(() => applyPrices('<span data-price="nope">₪1</span>', { rolling: 1 })).toThrow(/nope/);
  });
});

describe("findPriceProblems", () => {
  it("flags a wrong tagged price", () => {
    expect(findPriceProblems('<span data-price="rolling">₪105</span>', { rolling: 175 }))
      .toEqual(['data-price="rolling" shows ₪105, config says ₪175']);
  });
  it("flags an untagged price", () => {
    expect(findPriceProblems("<b>₪105</b>", { rolling: 175 })).toEqual(["untagged price: ₪105"]);
  });
  it("allows data-price-ignore", () => {
    expect(findPriceProblems('<span data-price-ignore>₪205</span>', {})).toEqual([]);
  });
});

describe("site pages", () => {
  it.each(PAGES)("%s shows only config prices", (file) => {
    expect(findPriceProblems(readFileSync(file, "utf8"), PRICES)).toEqual([]);
  });
});
