// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  instantly, renderSteps, fillStep, setDoneButton, announce, setFinish, setUpNext, fillUpNext,
  lessonIcon, DONE_TEXT, NOT_DONE_TEXT, DONE_ANNOUNCE,
} from "../app/lesson-moment.js";
import { stepStates } from "../app/lesson-nav.js";

const ROOT = join(import.meta.dirname, "..");
const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));

function doneButton() {
  const btn = document.createElement("button");
  const label = document.createElement("span");
  label.className = "done-label";
  label.textContent = NOT_DONE_TEXT;
  btn.append(label);
  document.body.append(btn);
  return btn;
}

beforeEach(() => { document.body.replaceChildren(); document.body.className = ""; });

describe("instantly", () => {
  it("turns transitions off only while the change runs", () => {
    const el = document.createElement("div");
    let during = null;
    instantly(el, () => { during = el.classList.contains("is-instant"); });
    expect(during).toBe(true);
    expect(el.classList.contains("is-instant")).toBe(false);
  });
});

describe("renderSteps and fillStep", () => {
  it("builds one step per lesson with done and current states", () => {
    const bar = document.createElement("div");
    renderSteps(bar, stepStates(["a", "b", "c"], ["a"], "b"), "בוצעו 1 מתוך 3 שיעורים");
    const segs = [...bar.children];
    expect(segs.map((s) => s.dataset.id)).toEqual(["a", "b", "c"]);
    expect(segs.map((s) => s.classList.contains("is-done"))).toEqual([true, false, false]);
    expect(segs.map((s) => s.classList.contains("is-current"))).toEqual([false, true, false]);
    expect(bar.getAttribute("aria-label")).toBe("בוצעו 1 מתוך 3 שיעורים");
  });
  it("reuses the same elements on refresh", () => {
    const bar = document.createElement("div");
    renderSteps(bar, stepStates(["a", "b"], [], "a"), "");
    const first = bar.children[0];
    renderSteps(bar, stepStates(["a", "b"], ["a"], "a"), "");
    expect(bar.children[0]).toBe(first);
    expect(first.classList.contains("is-done")).toBe(true);
  });
  it("fills and empties one step", () => {
    const bar = document.createElement("div");
    renderSteps(bar, stepStates(["a", "b"], [], "b"), "");
    fillStep(bar, "b", true);
    expect(bar.children[1].classList.contains("is-done")).toBe(true);
    fillStep(bar, "b", false, { instant: true });
    expect(bar.children[1].classList.contains("is-done")).toBe(false);
    expect(() => fillStep(bar, "missing", true)).not.toThrow();
  });
});

describe("setDoneButton", () => {
  it("shows the done state with the right label and aria-pressed", () => {
    const btn = doneButton();
    setDoneButton(btn, true, { animate: true });
    expect(btn.classList.contains("is-done")).toBe(true);
    expect(btn.getAttribute("aria-pressed")).toBe("true");
    expect(btn.querySelector(".done-label").textContent).toBe(DONE_TEXT);
  });
  it("goes back to not done", () => {
    const btn = doneButton();
    setDoneButton(btn, true);
    setDoneButton(btn, false);
    expect(btn.classList.contains("is-done")).toBe(false);
    expect(btn.getAttribute("aria-pressed")).toBe("false");
    expect(btn.querySelector(".done-label").textContent).toBe(NOT_DONE_TEXT);
  });
});

describe("announce", () => {
  it("writes the text to the live region on the next frame", async () => {
    const live = document.createElement("p");
    live.textContent = DONE_ANNOUNCE;
    announce(live, DONE_ANNOUNCE);
    expect(live.textContent).toBe("");
    await nextFrame();
    expect(live.textContent).toBe(DONE_ANNOUNCE);
  });
});

describe("setFinish", () => {
  it("shows the card and starts the arc draw once", () => {
    const card = document.createElement("section");
    card.hidden = true;
    setFinish(card, true);
    expect(card.hidden).toBe(false);
    expect(card.classList.contains("is-drawn")).toBe(true);
  });
  it("hides and resets the card", () => {
    const card = document.createElement("section");
    card.hidden = true;
    setFinish(card, true);
    setFinish(card, false);
    expect(card.hidden).toBe(true);
    expect(card.classList.contains("is-drawn")).toBe(false);
  });
});

describe("up next bar", () => {
  function bar() {
    const el = document.createElement("div");
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.classList.add("upnext-icon");
    icon.append(document.createElementNS("http://www.w3.org/2000/svg", "use"));
    const kicker = document.createElement("p"); kicker.className = "upnext-kicker";
    const title = document.createElement("p"); title.className = "upnext-title";
    const go = document.createElement("a"); go.className = "upnext-go";
    const action = document.createElement("span"); action.className = "upnext-action";
    go.append(action);
    el.append(icon, kicker, title, go);
    el.setAttribute("inert", "");
    document.body.append(el);
    return el;
  }
  it("opens and closes, inert and hidden from screen readers when closed", () => {
    const el = bar();
    setUpNext(el, true);
    expect(el.classList.contains("is-open")).toBe(true);
    expect(el.hasAttribute("inert")).toBe(false);
    expect(el.getAttribute("aria-hidden")).toBe("false");
    expect(document.body.classList.contains("has-upnext")).toBe(true);
    setUpNext(el, false);
    expect(el.hasAttribute("inert")).toBe(true);
    expect(el.getAttribute("aria-hidden")).toBe("true");
    expect(document.body.classList.contains("has-upnext")).toBe(false);
  });
  it("fills the text with textContent and the link", () => {
    const el = bar();
    fillUpNext(el, { icon: "i-photo", kicker: "השיעור הבא", title: "<b>טיפ</b>", href: "/app/lesson/x", action: "לשיעור הבא" });
    expect(el.querySelector(".upnext-title").textContent).toBe("<b>טיפ</b>");
    expect(el.querySelector(".upnext-title b")).toBeNull();
    expect(el.querySelector(".upnext-go").getAttribute("href")).toBe("/app/lesson/x");
    expect(el.querySelector("use").getAttribute("href")).toBe("/assets/icons/sprite.svg#i-photo");
    fillUpNext(el, { icon: "i-circle-check", kicker: "סיימת", title: "", href: "/app/course/rolling", action: "לכל השיעורים" });
    expect(el.querySelector(".upnext-title").hidden).toBe(true);
  });
});

describe("lessonIcon", () => {
  it("uses the photo icon for image tips and play for the rest", () => {
    expect(lessonIcon({ kind: "image" })).toBe("i-photo");
    expect(lessonIcon({ kind: "video" })).toBe("i-play");
    expect(lessonIcon({})).toBe("i-play");
    expect(lessonIcon(undefined)).toBe("i-play");
  });
});

describe("lesson page files", () => {
  const html = readFileSync(join(ROOT, "app/lesson.html"), "utf8");
  const css = readFileSync(join(ROOT, "app/lesson.css"), "utf8");
  it("have no em or en dashes and no emoji", () => {
    for (const text of [html, css]) {
      expect(text).not.toMatch(/[\u2013\u2014]/);
      expect(text).not.toMatch(/\p{Extended_Pictographic}/u);
    }
  });
  it("never build DOM with innerHTML and use no scroll listener", () => {
    expect(html).not.toContain("innerHTML");
    expect(html).not.toMatch(/addEventListener\(\s*["']scroll/);
  });
  it("turn transitions off under reduced motion", () => {
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce[\s\S]*transition:\s*none/);
  });
  it("use only the agreed color tokens", () => {
    const allowed = new Set(["--c-cream", "--c-paper", "--c-peach", "--c-brown", "--c-brown-hover",
      "--c-ink", "--c-ink-soft", "--c-ink-muted", "--c-line", "--c-done", "--c-error"]);
    const used = [...css.matchAll(/var\((--c-[a-z-]+)/g)].map((m) => m[1]);
    expect(used.filter((t) => !allowed.has(t))).toEqual([]);
  });
});
