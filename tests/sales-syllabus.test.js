// The sales page lists the real course contents (the syllabus). This test keeps that
// list in step with scripts/course-data.js, the one source for lessons.
//
// The page marks each lesson title with data-lesson="<lesson id>". Titles in the data
// still hold em dashes ("חימום — חלק א") until the L4 reseed, and the marketing pages
// use no em or en dashes, so the page writes them with a comma ("חימום, חלק א").
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { DATA } from "../scripts/course-data.js";

const html = readFileSync("challenge/rolling/index.html", "utf8");

// Page form of a data title: a dash between two words becomes a comma.
const pageTitle = (title) => title.replace(/\s*[—–]\s*/g, ", ").trim();

const pageLessons = new Map(
  [...html.matchAll(/<[a-z]+\b[^>]*\bdata-lesson="([^"]+)"[^>]*>([^<]*)</g)].map(
    ([, id, text]) => [id, text.replace(/\s+/g, " ").trim()],
  ),
);

const lessons = DATA.lessons
  .filter((l) => l.courseId === "rolling")
  .sort((a, b) => a.order - b.order);

describe("rolling sales page syllabus", () => {
  it("pageTitle turns a dash into a comma", () => {
    expect(pageTitle("חימום — חלק א")).toBe("חימום, חלק א");
    expect(pageTitle("שעון")).toBe("שעון");
  });

  it("lists every rolling lesson, with the title from course-data", () => {
    const expected = lessons.map((l) => [l.id, pageTitle(l.title)]);
    const actual = lessons.map((l) => [l.id, pageLessons.get(l.id)]);
    expect(actual).toEqual(expected);
  });

  it("lists no lesson that is not in course-data", () => {
    const known = new Set(lessons.map((l) => l.id));
    expect([...pageLessons.keys()].filter((id) => !known.has(id))).toEqual([]);
  });

  it("keeps the course order", () => {
    const order = [...pageLessons.keys()];
    expect(order).toEqual(lessons.map((l) => l.id));
  });

  it("shows the counts that match the data", () => {
    const videos = lessons.filter((l) => l.kind === "video").length;
    const tips = lessons.filter((l) => l.kind === "image").length;
    expect(html).toContain(`${videos} סרטונים`);
    expect(html).toContain(`${tips} טיפי זהב`);
  });
});
