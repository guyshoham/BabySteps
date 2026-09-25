import { describe, it, expect } from "vitest";
import { groupLessons, lessonIcon, GROUPS } from "../app/course-sections.js";
import { DATA } from "../scripts/course-data.js";

const ids = (group) => group.lessons.map((l) => l.id);

describe("groupLessons", () => {
  it("splits the real rolling course into 10 videos, 6 tips and 2 extras", () => {
    const lessons = DATA.lessons.filter((l) => l.courseId === "rolling");
    const groups = groupLessons(lessons);
    expect(groups.map((g) => g.key)).toEqual(["videos", "tips", "extras"]);
    expect(groups.map((g) => g.lessons.length)).toEqual([10, 6, 2]);
    expect(groups.map((g) => g.label)).toEqual([GROUPS.videos, GROUPS.tips, GROUPS.extras]);
    expect(ids(groups[2])).toEqual(["rolling-bonus-crawling", "rolling-appendix"]);
  });

  it("sorts by order, not by input order", () => {
    const groups = groupLessons([
      { id: "t1", kind: "image", order: 3 },
      { id: "v2", kind: "video", order: 2 },
      { id: "v1", kind: "video", order: 1 },
      { id: "b", kind: "video", order: 4 },
    ]);
    expect(groups.map(ids)).toEqual([["v1", "v2"], ["t1"], ["b"]]);
  });

  it("puts an unknown or missing kind in extras", () => {
    const groups = groupLessons([
      { id: "v1", kind: "video", order: 1 },
      { id: "pdf", kind: "pdf", order: 2 },
      { id: "none", order: 3 },
      { id: "v2", kind: "video", order: 4 },
    ]);
    expect(groups.map((g) => g.key)).toEqual(["videos", "extras"]);
    expect(groups.map(ids)).toEqual([["v1"], ["pdf", "none", "v2"]]);
  });

  it("keeps all videos in one group when a course has no tips", () => {
    const groups = groupLessons([
      { id: "v1", kind: "video", order: 1 },
      { id: "v2", kind: "video", order: 2 },
    ]);
    expect(groups).toEqual([
      { key: "videos", label: GROUPS.videos, lessons: [
        { id: "v1", kind: "video", order: 1 }, { id: "v2", kind: "video", order: 2 },
      ] },
    ]);
  });

  it("sends lessons without an order to the end, keeping their input order", () => {
    const groups = groupLessons([
      { id: "x", kind: "video" },
      { id: "y", kind: "video" },
      { id: "t", kind: "image", order: 1 },
    ]);
    expect(groups.map(ids)).toEqual([["t"], ["x", "y"]]);
  });

  it("handles empty and bad input", () => {
    expect(groupLessons([])).toEqual([]);
    expect(groupLessons(undefined)).toEqual([]);
    expect(groupLessons([null, 3, { id: "v", kind: "video", order: 1 }]).map(ids)).toEqual([["v"]]);
  });
});

describe("lessonIcon", () => {
  it("picks the sprite icon by group and title", () => {
    expect(lessonIcon({ title: "שעון" }, "videos")).toBe("i-play");
    expect(lessonIcon({ title: "טיפ זהב 1" }, "tips")).toBe("i-photo");
    expect(lessonIcon({ title: "בונוס: הכנה לשלב הזחילה" }, "extras")).toBe("i-gift");
    expect(lessonIcon({ title: "נספח" }, "extras")).toBe("i-paperclip");
    expect(lessonIcon({}, "extras")).toBe("i-paperclip");
  });
});
