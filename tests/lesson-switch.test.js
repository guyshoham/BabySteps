import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  lessonIdFromPath, neighborIds, lessonState, switchTarget, switchAnnouncement,
  lessonDocTitle, shouldFlushPosition, resumeAt,
} from "../app/lesson-switch.js";

const ids = ["a", "b", "c"];
const ORIGIN = "https://baby-steps.example";
const click = (over = {}) => ({
  href: `${ORIGIN}/app/lesson/b`, target: "", download: false, button: 0,
  ctrlKey: false, metaKey: false, shiftKey: false, altKey: false, defaultPrevented: false,
  ...over,
});
const page = { origin: ORIGIN, lessonIds: ids };

describe("lessonIdFromPath", () => {
  it("reads the id from a lesson path", () => {
    expect(lessonIdFromPath("/app/lesson/rolling-03")).toBe("rolling-03");
  });
  it("decodes escaped ids", () => {
    expect(lessonIdFromPath("/app/lesson/a%20b")).toBe("a b");
  });
  it("accepts a trailing slash", () => {
    expect(lessonIdFromPath("/app/lesson/x/")).toBe("x");
  });
  it("is null for other pages and broken escapes", () => {
    expect(lessonIdFromPath("/app/course/rolling")).toBeNull();
    expect(lessonIdFromPath("/app/lesson/")).toBeNull();
    expect(lessonIdFromPath("/app/lesson/a/b")).toBeNull();
    expect(lessonIdFromPath("/app/lesson/%E0%A4%A")).toBeNull();
    expect(lessonIdFromPath(undefined)).toBeNull();
  });
});

describe("neighborIds", () => {
  it("gives prev and next in order", () => {
    expect(neighborIds(ids, "b")).toEqual(["a", "c"]);
  });
  it("skips the missing side at the ends", () => {
    expect(neighborIds(ids, "a")).toEqual(["b"]);
    expect(neighborIds(ids, "c")).toEqual(["b"]);
  });
  it("is empty for an unknown lesson or no list", () => {
    expect(neighborIds(ids, "x")).toEqual([]);
    expect(neighborIds(null, "a")).toEqual([]);
  });
});

describe("lessonState", () => {
  it("describes a middle lesson", () => {
    expect(lessonState(ids, new Set(["b"]), "b")).toEqual({
      position: { index: 2, total: 3 }, positionText: "שיעור 2 מתוך 3",
      prev: "a", next: "c", isLast: false, done: true,
    });
  });
  it("marks the last lesson", () => {
    const s = lessonState(ids, [], "c");
    expect(s.isLast).toBe(true);
    expect(s.next).toBeNull();
    expect(s.done).toBe(false);
  });
  it("an unknown lesson is not last and has no position", () => {
    const s = lessonState(ids, [], "x");
    expect(s).toMatchObject({ position: null, positionText: "", prev: null, next: null, isLast: false });
  });
});

describe("switchTarget", () => {
  it("a plain left click on a course lesson switches", () => {
    expect(switchTarget(click(), page)).toBe("b");
  });
  it("works with a relative href", () => {
    expect(switchTarget(click({ href: "/app/lesson/c" }), page)).toBe("c");
  });
  it("modifier keys and other buttons keep the browser behavior", () => {
    for (const k of ["ctrlKey", "metaKey", "shiftKey", "altKey"]) {
      expect(switchTarget(click({ [k]: true }), page)).toBeNull();
    }
    expect(switchTarget(click({ button: 1 }), page)).toBeNull();
  });
  it("new tab targets, downloads and handled clicks are left alone", () => {
    expect(switchTarget(click({ target: "_blank" }), page)).toBeNull();
    expect(switchTarget(click({ download: true }), page)).toBeNull();
    expect(switchTarget(click({ defaultPrevented: true }), page)).toBeNull();
    expect(switchTarget(click({ target: "_self" }), page)).toBe("b");
  });
  it("other sites, other pages and other courses do a normal load", () => {
    expect(switchTarget(click({ href: "https://evil.example/app/lesson/b" }), page)).toBeNull();
    expect(switchTarget(click({ href: `${ORIGIN}/app/course/rolling` }), page)).toBeNull();
    expect(switchTarget(click({ href: `${ORIGIN}/app/lesson/tummy-01` }), page)).toBeNull();
  });
  it("does nothing before the course has loaded", () => {
    expect(switchTarget(click(), { origin: ORIGIN, lessonIds: null })).toBeNull();
    expect(switchTarget(null, page)).toBeNull();
  });
});

describe("switchAnnouncement", () => {
  it("says where and what", () => {
    expect(switchAnnouncement({ index: 4, total: 18 }, " אקורדיון ")).toBe("שיעור 4 מתוך 18: אקורדיון");
  });
  it("falls back to whatever is known", () => {
    expect(switchAnnouncement(null, "טיפ")).toBe("טיפ");
    expect(switchAnnouncement({ index: 1, total: 2 }, "")).toBe("שיעור 1 מתוך 2");
  });
});

describe("lessonDocTitle", () => {
  it("puts the lesson first", () => {
    expect(lessonDocTitle("אקורדיון")).toBe("אקורדיון | מתחילים בקטן");
  });
  it("has a default for an empty title", () => {
    expect(lessonDocTitle("")).toBe("שיעור | מתחילים בקטן");
  });
});

describe("shouldFlushPosition", () => {
  const base = { attached: true, currentTime: 42.6, lastSaved: 30, ended: false };
  it("writes a position that moved since the last save", () => {
    expect(shouldFlushPosition(base)).toBe(true);
  });
  it("skips when nothing new is there", () => {
    expect(shouldFlushPosition({ ...base, lastSaved: 42.1 })).toBe(false);
    expect(shouldFlushPosition({ ...base, currentTime: 0 })).toBe(false);
    expect(shouldFlushPosition({ ...base, currentTime: NaN })).toBe(false);
  });
  it("skips an ended video and a lesson whose video never loaded", () => {
    expect(shouldFlushPosition({ ...base, ended: true })).toBe(false);
    expect(shouldFlushPosition({ ...base, attached: false })).toBe(false);
  });
});

describe("resumeAt", () => {
  it("prefers the position saved on this page", () => {
    const saved = new Map([["a", 50]]);
    const loaded = new Map([["a", 20], ["b", 7]]);
    expect(resumeAt("a", { saved, loaded })).toBe(50);
    expect(resumeAt("b", { saved, loaded })).toBe(7);
    expect(resumeAt("c", { saved, loaded })).toBe(0);
    expect(resumeAt("a")).toBe(0);
  });
});

// The page wiring cannot run in Node, so these guard the parts that are easy
// to lose in a later edit.
describe("app/lesson.html wiring", () => {
  const html = readFileSync(join(import.meta.dirname, "..", "app", "lesson.html"), "utf8");
  it("preloads its modules", () => {
    for (const m of ["firebase-client", "firebase-config", "video-url-cache", "lesson-switch"]) {
      expect(html).toContain(`<link rel="modulepreload" href="/app/${m}.js"`);
    }
  });
  it("the title can take focus after a switch", () => {
    expect(html).toMatch(/<h1 id="title"[^>]*tabindex="-1"/);
  });
  it("uses history and one listener set per lesson", () => {
    expect(html).toContain("history.pushState");
    expect(html).toContain('addEventListener("popstate"');
    expect(html).toContain("new AbortController()");
    expect(html).toContain("location.assign(");
  });
  it("never builds the page from data with innerHTML", () => {
    expect(html).not.toMatch(/innerHTML/);
  });
});
