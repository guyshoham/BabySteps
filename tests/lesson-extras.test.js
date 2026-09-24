import { describe, it, expect } from "vitest";
import {
  whatsAppFeedbackUrl, whatsAppTestimonialUrl, allDone, WHATSAPP_NUMBER,
} from "../app/lesson-extras.js";

const textOf = (url) => new URL(url).searchParams.get("text");

describe("whatsAppFeedbackUrl", () => {
  it("points at Yarden's WhatsApp number", () => {
    const u = new URL(whatsAppFeedbackUrl("שיעור 1"));
    expect(u.origin).toBe("https://wa.me");
    expect(u.pathname).toBe(`/${WHATSAPP_NUMBER}`);
  });
  it("prefills a Hebrew message with the lesson title", () => {
    const url = whatsAppFeedbackUrl("התהפכות מהגב לבטן");
    expect(textOf(url)).toBe("היי ירדן, צילמתי את התרגול של השיעור: התהפכות מהגב לבטן");
    // Hebrew letters are percent-encoded, never raw in the URL.
    expect(url).not.toMatch(/[֐-׿]/);
  });
  it("encodes quotes, ampersands and other URL characters", () => {
    const title = `טיפ "קטן" & גדול #1 ?a=b 'c'`;
    const url = whatsAppFeedbackUrl(title);
    expect(url).not.toContain("&");
    expect(url).not.toContain('"');
    expect(url).not.toContain("#");
    expect(url.split("?").length).toBe(2);
    expect(textOf(url)).toBe(`היי ירדן, צילמתי את התרגול של השיעור: ${title}`);
  });
  it("falls back to a general message without a title", () => {
    expect(textOf(whatsAppFeedbackUrl(undefined))).toBe("היי ירדן, צילמתי את התרגול");
    expect(textOf(whatsAppFeedbackUrl("   "))).toBe("היי ירדן, צילמתי את התרגול");
  });
});

describe("whatsAppTestimonialUrl", () => {
  it("prefills the testimonial message", () => {
    expect(textOf(whatsAppTestimonialUrl())).toBe("היי ירדן, סיימתי את הקורס ורציתי לשתף...");
  });
});

describe("allDone", () => {
  it("is true when every lesson is completed", () => {
    expect(allDone(["a", "b"], new Set(["a", "b"]))).toBe(true);
  });
  it("ignores extra completed ids from other courses", () => {
    expect(allDone(["a", "b"], ["x", "b", "a"])).toBe(true);
  });
  it("is false when one lesson is missing", () => {
    expect(allDone(["a", "b", "c"], new Set(["a", "c"]))).toBe(false);
  });
  it("is false for an empty or missing lesson list", () => {
    expect(allDone([], new Set(["a"]))).toBe(false);
    expect(allDone(undefined, ["a"])).toBe(false);
  });
  it("is false when nothing is completed", () => {
    expect(allDone(["a"], undefined)).toBe(false);
    expect(allDone(["a"], [])).toBe(false);
  });
});
