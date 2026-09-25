// app/lesson-outline.js: jump to any lesson from the lesson page.
// - the step bar: on desktop each segment is a link with a tooltip,
//   on phones it stays a plain picture of the progress
// - "תוכן הקורס": the grouped lesson list, in the side column on desktop and
//   in a bottom sheet on phones
//
// The top part is pure (no DOM, no Firebase) and unit tested. The DOM part
// builds with textContent/setAttribute only, never innerHTML, because titles
// come from Firestore. Motion lives in app/lesson.css.

import { groupLessons, lessonIcon as rowIcon } from "./course-sections.js";
import { instantly } from "./lesson-moment.js";

// Desktop means a wide screen with a real mouse. Touch laptops and tablets
// count as phones here: a hover tooltip does not work with a finger.
export const DESKTOP_NAV_QUERY = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";

const SPRITE = "/assets/icons/sprite.svg";
const asSet = (s) => (s instanceof Set ? s : new Set(s ?? []));

export const lessonHref = (id) => `/app/lesson/${encodeURIComponent(id)}`;

// Screen reader name of a step link: "שיעור 3: אקורדיון" (+ ", בוצע").
export function segmentLabel({ index, title, done }) {
  const name = String(title ?? "").trim();
  const base = name ? `שיעור ${index}: ${name}` : `שיעור ${index}`;
  return done ? `${base}, בוצע` : base;
}

// Tooltip text over a step link: "שיעור 3 · אקורדיון".
export function segmentTip({ index, title }) {
  const name = String(title ?? "").trim();
  return name ? `שיעור ${index} · ${name}` : `שיעור ${index}`;
}

// lessons: [{ id, title, kind, order, ... }] in course order (the order the
// page already loaded them in). One entry per lesson for the step bar:
// { id, index (1 based), title, done, current, label, tip }.
export function stepItems(lessons, completedIds, currentId) {
  const done = asSet(completedIds);
  return (Array.isArray(lessons) ? lessons : []).map((l, i) => {
    const item = {
      id: l.id, index: i + 1, title: l.title ?? "",
      done: done.has(l.id), current: l.id === currentId,
    };
    return { ...item, label: segmentLabel(item), tip: segmentTip(item) };
  });
}

// The grouped list, same groups as the course page:
// [{ key, label, done, total, items: [{ id, index, title, icon, done, current }] }].
// `index` is the lesson's place in the course, so it matches the step bar.
export function outlineGroups(lessons, completedIds, currentId) {
  const list = Array.isArray(lessons) ? lessons : [];
  const done = asSet(completedIds);
  const place = new Map(list.map((l, i) => [l.id, i + 1]));
  return groupLessons(list).map((g) => {
    const items = g.lessons.map((l) => ({
      id: l.id, index: place.get(l.id), title: l.title ?? "",
      icon: rowIcon(l, g.key), done: done.has(l.id), current: l.id === currentId,
    }));
    return {
      key: g.key, label: g.label, items,
      total: items.length, done: items.filter((it) => it.done).length,
    };
  });
}

// Where the tooltip goes, in viewport pixels. It sits below the anchor,
// centered on it, so it never covers the lesson title above the bar. It
// flips above only when there is no room below (and room above, under the
// sticky header: `topInset`). It never leaves the viewport: near an edge it
// slides in and the arrow keeps pointing at the anchor.
// anchor: { left, right, top, bottom }; tip: { width, height };
// view: { width, height }. Returns { left, top, side, arrow } where `arrow` is
// the arrow's distance from the tip's left edge.
export function placeTip(anchor, tip, view, { gap = 8, margin = 8, topInset = 0 } = {}) {
  const center = (anchor.left + anchor.right) / 2;
  const maxLeft = Math.max(margin, view.width - margin - tip.width);
  const left = Math.min(Math.max(center - tip.width / 2, margin), maxLeft);
  const below = anchor.bottom + gap;
  const above = anchor.top - gap - tip.height;
  const fitsBelow = below + tip.height <= view.height - margin;
  const side = !fitsBelow && above >= topInset + margin ? "top" : "bottom";
  const top = side === "top" ? above : below;
  const arrowPad = 10;
  const arrow = Math.min(Math.max(center - left, arrowPad), Math.max(arrowPad, tip.width - arrowPad));
  return { left, top, side, arrow };
}

// ─── DOM ─────────────────────────────────

function icon(doc, id, cls) {
  const NS = "http://www.w3.org/2000/svg";
  const svg = doc.createElementNS(NS, "svg");
  svg.setAttribute("class", `app-icon ${cls}`);
  svg.setAttribute("aria-hidden", "true");
  const use = doc.createElementNS(NS, "use");
  use.setAttribute("href", `${SPRITE}#${id}`);
  svg.appendChild(use);
  return svg;
}

// Builds (or refreshes) the step bar. interactive: links with a name each
// (desktop), else plain spans hidden from screen readers, and the bar is one
// picture with `label` as its name. Same elements are reused, so a refresh
// never restarts a fill that is playing.
export function renderStepBar(bar, items, { interactive = false, label = "" } = {}) {
  instantly(bar, () => {
    const doc = bar.ownerDocument;
    const tag = interactive ? "A" : "SPAN";
    const byId = new Map([...bar.children].map((el) => [el.dataset.id, el]));
    const segs = items.map((s) => {
      let seg = byId.get(s.id);
      if (!seg || seg.tagName !== tag) seg = doc.createElement(tag.toLowerCase());
      seg.className = "step";
      seg.dataset.id = s.id;
      seg.classList.toggle("is-done", s.done);
      seg.classList.toggle("is-current", s.current);
      if (interactive) {
        seg.setAttribute("href", lessonHref(s.id));
        seg.setAttribute("aria-label", s.label);
        if (s.current) seg.setAttribute("aria-current", "page"); else seg.removeAttribute("aria-current");
        seg.removeAttribute("aria-hidden");
      } else {
        seg.setAttribute("aria-hidden", "true");
      }
      return seg;
    });
    bar.replaceChildren(...segs);
    bar.classList.toggle("is-links", interactive);
    bar.setAttribute("role", interactive ? "group" : "img");
    bar.setAttribute("aria-label", label);
  });
}

// Updates only the names of the step links (after the done toggle), without
// touching classes, so the fill moment keeps playing.
export function relabelSteps(bar, items) {
  const byId = new Map(items.map((s) => [s.id, s]));
  for (const seg of bar.children) {
    const s = byId.get(seg.dataset.id);
    if (s && seg.tagName === "A") seg.setAttribute("aria-label", s.label);
  }
}

// Fills the tooltip: the text and a green check when the lesson is done.
export function fillTip(tipEl, item) {
  const doc = tipEl.ownerDocument;
  const text = doc.createElement("span");
  text.className = "step-tip-text";
  text.textContent = item.tip;
  const parts = [text];
  if (item.done) parts.push(icon(doc, "i-circle-check", "step-tip-done"));
  tipEl.replaceChildren(...parts);
}

// The grouped lesson list. prefix keeps the heading ids unique when the list
// is on the page twice (side column and sheet).
export function renderOutline(box, groups, { prefix = "outline" } = {}) {
  const doc = box.ownerDocument;
  const sections = groups.map((g) => {
    const section = doc.createElement("section");
    section.className = `outline-group outline-group--${g.key}`;
    const headId = `${prefix}-${g.key}`;
    section.setAttribute("aria-labelledby", headId);

    const head = doc.createElement("div");
    head.className = "outline-group-head";
    const h = doc.createElement("h3");
    h.id = headId;
    h.className = "outline-group-title";
    h.textContent = g.label;
    const meta = doc.createElement("span");
    meta.className = "outline-group-meta";
    meta.textContent = `${g.done} מתוך ${g.total}`;
    head.append(h, meta);

    const list = doc.createElement("ol");
    list.className = "outline-list";
    for (const it of g.items) {
      const a = doc.createElement("a");
      a.className = "outline-row" + (it.done ? " is-done" : "") + (it.current ? " is-current" : "");
      a.setAttribute("href", lessonHref(it.id));
      a.dataset.id = it.id;
      if (it.current) a.setAttribute("aria-current", "page");
      const title = doc.createElement("span");
      title.className = "outline-title";
      title.textContent = it.title;
      // Tips are narrow tiles: a done tip shows the check in place of its icon.
      const tile = g.key === "tips";
      a.append(tile && it.done
        ? icon(doc, "i-check", "outline-done")
        : icon(doc, it.icon, "outline-icon"), title);
      if (it.done && !tile) a.append(icon(doc, "i-check", "outline-done"));
      if (it.done) {
        const sr = doc.createElement("span");
        sr.className = "app-sr-only";
        sr.textContent = ", בוצע";
        a.append(sr);
      }
      const li = doc.createElement("li");
      li.append(a);
      list.append(li);
    }
    section.append(head, list);
    return section;
  });
  box.replaceChildren(...sections);
}

// Scrolls a list box (not the page) so the current row sits in its middle.
export function centerCurrent(box) {
  const row = box.querySelector(".outline-row.is-current");
  if (!row) return;
  const boxRect = box.getBoundingClientRect();
  const rowRect = row.getBoundingClientRect();
  const offset = rowRect.top - boxRect.top + box.scrollTop;
  box.scrollTop = Math.max(0, offset - (box.clientHeight - rowRect.height) / 2);
}
