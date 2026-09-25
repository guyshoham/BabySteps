// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import {
  DESKTOP_NAV_QUERY, lessonHref, segmentLabel, segmentTip, stepItems, outlineGroups, placeTip,
  renderStepBar, relabelSteps, fillTip, renderOutline,
} from "../app/lesson-outline.js";

const LESSONS = [
  { id: "v1", kind: "video", order: 1, title: "התהפכויות" },
  { id: "v2", kind: "video", order: 2, title: "חימום — חלק א" },
  { id: "t1", kind: "image", order: 3, title: "טיפ זהב 1" },
  { id: "t2", kind: "image", order: 4, title: "טיפ זהב 2" },
  { id: "b1", kind: "video", order: 5, title: "בונוס: הכנה לשלב הזחילה" },
  { id: "x1", kind: "video", order: 6, title: "נספח" },
];

describe("segment labels", () => {
  it("names a step link by number and title", () => {
    expect(segmentLabel({ index: 3, title: "אקורדיון", done: false })).toBe("שיעור 3: אקורדיון");
  });
  it("adds the done state", () => {
    expect(segmentLabel({ index: 3, title: "אקורדיון", done: true })).toBe("שיעור 3: אקורדיון, בוצע");
  });
  it("works without a title", () => {
    expect(segmentLabel({ index: 2, title: undefined, done: false })).toBe("שיעור 2");
    expect(segmentTip({ index: 2, title: "  " })).toBe("שיעור 2");
  });
  it("builds the tooltip text and keeps the title as it is", () => {
    expect(segmentTip({ index: 2, title: "חימום — חלק א" })).toBe("שיעור 2 · חימום — חלק א");
  });
});

describe("stepItems", () => {
  it("marks done and current and numbers from 1", () => {
    const items = stepItems(LESSONS.slice(0, 3), new Set(["v1"]), "v2");
    expect(items.map((s) => [s.id, s.index, s.done, s.current])).toEqual([
      ["v1", 1, true, false], ["v2", 2, false, true], ["t1", 3, false, false],
    ]);
    expect(items[0].label).toBe("שיעור 1: התהפכויות, בוצע");
    expect(items[0].tip).toBe("שיעור 1 · התהפכויות");
  });
  it("accepts an array of done ids and ignores other courses", () => {
    expect(stepItems(LESSONS.slice(0, 1), ["zz", "v1"], "q")[0].done).toBe(true);
  });
  it("is empty for a missing list", () => {
    expect(stepItems(undefined, [], "a")).toEqual([]);
  });
});

describe("outlineGroups", () => {
  it("groups like the course page, with the course number of each lesson", () => {
    const groups = outlineGroups(LESSONS, ["v1", "t2"], "t1");
    expect(groups.map((g) => [g.key, g.done, g.total])).toEqual([
      ["videos", 1, 2], ["tips", 1, 2], ["extras", 0, 2],
    ]);
    expect(groups[1].items.map((it) => [it.id, it.index, it.icon, it.done, it.current])).toEqual([
      ["t1", 3, "i-photo", false, true], ["t2", 4, "i-photo", true, false],
    ]);
    expect(groups[2].items.map((it) => it.icon)).toEqual(["i-gift", "i-paperclip"]);
  });
  it("marks exactly one current lesson", () => {
    const all = outlineGroups(LESSONS, [], "b1").flatMap((g) => g.items);
    expect(all.filter((it) => it.current).map((it) => it.id)).toEqual(["b1"]);
  });
});

describe("placeTip", () => {
  const view = { width: 1280, height: 800 };
  const tip = { width: 200, height: 30 };
  it("centers the tip above the anchor", () => {
    const p = placeTip({ left: 600, right: 620, top: 300, bottom: 324 }, tip, view);
    expect(p).toEqual({ left: 510, top: 262, side: "top", arrow: 100 });
  });
  it("slides in at the left edge and keeps the arrow on the anchor", () => {
    const p = placeTip({ left: 10, right: 30, top: 300, bottom: 324 }, tip, view);
    expect(p.left).toBe(8);
    expect(p.arrow).toBe(12);
  });
  it("slides in at the right edge", () => {
    const p = placeTip({ left: 1260, right: 1278, top: 300, bottom: 324 }, tip, view);
    expect(p.left).toBe(1280 - 8 - 200);
    expect(p.arrow).toBe(190);
  });
  it("flips below when the header leaves no room above", () => {
    const p = placeTip({ left: 600, right: 620, top: 90, bottom: 114 }, tip, view, { topInset: 64 });
    expect(p.side).toBe("bottom");
    expect(p.top).toBe(122);
  });
  it("never starts left of the margin, even when wider than the screen", () => {
    const p = placeTip({ left: 100, right: 120, top: 300, bottom: 324 }, { width: 400, height: 30 }, { width: 300, height: 600 });
    expect(p.left).toBe(8);
  });
});

describe("renderStepBar", () => {
  const items = stepItems(LESSONS.slice(0, 3), ["v1"], "v2");
  it("on desktop builds named links, the current one marked as the page", () => {
    const bar = document.createElement("div");
    renderStepBar(bar, items, { interactive: true, label: "בוצעו 1 מתוך 3 שיעורים" });
    const segs = [...bar.children];
    expect(segs.map((s) => s.tagName)).toEqual(["A", "A", "A"]);
    expect(segs[0].getAttribute("href")).toBe("/app/lesson/v1");
    expect(segs[0].getAttribute("aria-label")).toBe("שיעור 1: התהפכויות, בוצע");
    expect(segs[1].getAttribute("aria-current")).toBe("page");
    expect(segs[0].hasAttribute("aria-current")).toBe(false);
    expect(bar.getAttribute("role")).toBe("group");
    expect(bar.classList.contains("is-links")).toBe(true);
  });
  it("on phones builds hidden spans and the bar is one picture", () => {
    const bar = document.createElement("div");
    renderStepBar(bar, items, { interactive: false, label: "בוצעו 1 מתוך 3 שיעורים" });
    const segs = [...bar.children];
    expect(segs.map((s) => s.tagName)).toEqual(["SPAN", "SPAN", "SPAN"]);
    expect(segs.every((s) => s.getAttribute("aria-hidden") === "true" && !s.hasAttribute("href"))).toBe(true);
    expect(bar.getAttribute("role")).toBe("img");
    expect(bar.getAttribute("aria-label")).toBe("בוצעו 1 מתוך 3 שיעורים");
    expect(segs.map((s) => s.classList.contains("is-done"))).toEqual([true, false, false]);
    expect(segs.map((s) => s.classList.contains("is-current"))).toEqual([false, true, false]);
  });
  it("reuses the elements on refresh and swaps them when the mode changes", () => {
    const bar = document.createElement("div");
    renderStepBar(bar, items, { interactive: true });
    const first = bar.children[0];
    renderStepBar(bar, items, { interactive: true });
    expect(bar.children[0]).toBe(first);
    renderStepBar(bar, items, { interactive: false });
    expect(bar.children[0].tagName).toBe("SPAN");
  });
  it("relabels the links without touching the classes", () => {
    const bar = document.createElement("div");
    renderStepBar(bar, items, { interactive: true });
    bar.children[1].classList.add("is-done");
    relabelSteps(bar, stepItems(LESSONS.slice(0, 3), ["v1", "v2"], "v2"));
    expect(bar.children[1].getAttribute("aria-label")).toBe("שיעור 2: חימום — חלק א, בוצע");
    expect(bar.children[1].classList.contains("is-done")).toBe(true);
  });
});

describe("fillTip", () => {
  it("writes the text as text, with a check only when done", () => {
    const tip = document.createElement("div");
    fillTip(tip, { tip: "<b>x</b>", done: false });
    expect(tip.textContent).toBe("<b>x</b>");
    expect(tip.querySelector("b, svg")).toBeNull();
    fillTip(tip, { tip: "שיעור 1 · התהפכויות", done: true });
    expect(tip.querySelector("use").getAttribute("href")).toBe("/assets/icons/sprite.svg#i-circle-check");
  });
});

describe("renderOutline", () => {
  it("builds three groups of links, the current one marked, titles as text", () => {
    const box = document.createElement("div");
    const lessons = [...LESSONS, { id: "evil", kind: "video", order: 7, title: "<img src=x onerror=alert(1)>" }];
    renderOutline(box, outlineGroups(lessons, ["v1", "t2"], "t1"), { prefix: "side" });
    expect([...box.querySelectorAll("h3")].map((h) => [h.id, h.textContent])).toEqual([
      ["side-videos", "סרטוני הדרכה"], ["side-tips", "טיפי זהב"], ["side-extras", "בונוס ונספח"],
    ]);
    const rows = [...box.querySelectorAll("a.outline-row")];
    expect(rows).toHaveLength(7);
    expect(box.querySelector("img")).toBeNull();
    const current = box.querySelectorAll('[aria-current="page"]');
    expect(current).toHaveLength(1);
    expect(current[0].getAttribute("href")).toBe(lessonHref("t1"));
    expect(current[0].classList.contains("is-current")).toBe(true);
    const done = rows.filter((r) => r.classList.contains("is-done")).map((r) => r.dataset.id);
    expect(done).toEqual(["v1", "t2"]);
    expect(rows[0].querySelector(".app-sr-only").textContent).toBe(", בוצע");
    expect(box.querySelector(".outline-group-meta").textContent).toBe("1 מתוך 2");
  });
});

describe("desktop query", () => {
  it("needs a wide screen and a real mouse", () => {
    expect(DESKTOP_NAV_QUERY).toBe("(min-width: 1024px) and (hover: hover) and (pointer: fine)");
  });
});
