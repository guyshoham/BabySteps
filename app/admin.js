// app/admin.js — the admin page (app/admin.html): progress of every student.
// Admins have the Firebase custom claim admin: true (scripts/set-admin.js).
// The server checks it again on every call to /api/admin-progress.
// DOM is built with textContent/setAttribute only, never innerHTML with data.
import { requireAuth, signOut } from "/app/firebase-client.js";
import { mountAppHeader } from "/app/app-shell.js";
import {
  studentRows, summary, lastSeen, lastLesson, lessonStates,
  formatDate, formatFull, relativeTime, sourceLabel,
} from "/app/admin-view.js";

const SPRITE = "/assets/icons/sprite.svg";
const SVG = "http://www.w3.org/2000/svg";
const $ = (id) => document.getElementById(id);

const shell = mountAppHeader();
const user = await requireAuth();
shell.showUser(user.email, async () => {
  await signOut(); location.replace("/app/login");
});

const state = { data: null, courseId: "all", query: "", sort: "activity", showTester: false, open: new Set() };
let coursesById = new Map();

function show(id) {
  $("loading").hidden = true;
  for (const el of ["panel", "denied", "error"]) $(el).hidden = el !== id;
}

try {
  // A new claim reaches the browser only with a new token: refresh once if it is missing.
  let token = await user.getIdTokenResult();
  if (token.claims.admin !== true) token = await user.getIdTokenResult(true);
  if (token.claims.admin !== true) {
    show("denied");
  } else {
    const res = await fetch("/api/admin-progress", { headers: { Authorization: `Bearer ${token.token}` } });
    if (res.status === 401 || res.status === 403) show("denied");
    else if (!res.ok) throw new Error(`admin-progress ${res.status}`);
    else {
      state.data = await res.json();
      coursesById = new Map(state.data.courses.map((c) => [c.id, c]));
      buildControls();
      render();
      show("panel");
    }
  }
} catch (err) {
  console.error(err);
  show("error");
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function icon(id, className) {
  const svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("class", className);
  svg.setAttribute("aria-hidden", "true");
  const use = document.createElementNS(SVG, "use");
  use.setAttribute("href", `${SPRITE}#${id}`);
  svg.appendChild(use);
  return svg;
}

// A date cell: the relative time, and the full date as a tooltip.
function when(iso, empty = "עוד לא") {
  if (!iso) return el("span", "app-muted", empty);
  const t = document.createElement("time");
  t.setAttribute("datetime", iso);
  t.setAttribute("title", formatFull(iso));
  t.textContent = relativeTime(iso);
  return t;
}

function buildControls() {
  const box = $("course-filter");
  const options = [{ id: "all", title: "כל הקורסים" }, ...state.data.courses];
  for (const c of options) {
    const label = el("label", "adm-chip");
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "course";
    input.value = c.id;
    input.checked = c.id === state.courseId;
    input.addEventListener("change", () => { state.courseId = c.id; render(); });
    label.append(input, el("span", "", c.title || c.id));
    box.appendChild(label);
  }
  $("search").addEventListener("input", (e) => { state.query = e.target.value; render(); });
  $("sort").addEventListener("change", (e) => { state.sort = e.target.value; render(); });
  $("show-tester").addEventListener("change", (e) => { state.showTester = e.target.checked; render(); });

  const at = state.data.generatedAt;
  $("updated").textContent = at ? `הנתונים נכונים ל־${formatFull(at)}` : "";
}

function render() {
  const now = new Date();
  const rows = studentRows(state.data, state);
  const s = summary(rows, now);
  $("stat-students").textContent = String(s.students);
  $("stat-active").textContent = String(s.active);
  $("stat-finished").textContent = String(s.finished);
  $("count").textContent = rows.length === 1 ? "מוצגת תלמידה אחת" : `מוצגות ${rows.length} תלמידות`;

  const body = $("rows");
  body.replaceChildren();
  $("no-rows").hidden = rows.length > 0;
  for (const row of rows) body.append(...studentRow(row, now));
}

function studentRow(row, now) {
  const s = row.student;
  const tr = el("tr", "adm-row");
  const detailId = `detail-${s.uid}`;
  const isOpen = state.open.has(s.uid);

  // Email: a button that opens the lesson list.
  const th = document.createElement("th");
  th.setAttribute("scope", "row");
  th.className = "adm-cell-email";
  const btn = el("button", "adm-expand");
  btn.type = "button";
  btn.setAttribute("aria-expanded", String(isOpen));
  btn.setAttribute("aria-controls", detailId);
  const email = el("bdi", "adm-email", s.email || s.uid);
  btn.append(icon("i-chevron-back", "app-icon adm-caret"), email);
  th.appendChild(btn);
  if (s.isTester) th.appendChild(el("span", "adm-badge", "בודק"));

  const joined = cell("הצטרפה");
  joined.textContent = formatDate(s.createdAt);

  const seen = cell("נראתה לאחרונה");
  seen.appendChild(when(lastSeen(s, row.courses), "לא נכנסה"));

  const prog = cell("התקדמות");
  prog.classList.add("adm-cell-progress");
  if (!row.courses.length) prog.appendChild(el("span", "app-muted", "אין קורס"));
  for (const c of row.courses) prog.appendChild(progressLine(c, row.courses.length > 1 || state.courseId === "all"));

  const last = cell("שיעור אחרון");
  const ll = lastLesson(row, coursesById);
  if (ll) {
    last.appendChild(el("span", "adm-last-title", ll.title));
  } else {
    last.appendChild(el("span", "app-muted", "עוד לא התחילה"));
  }

  tr.append(th, joined, seen, prog, last);

  const detail = el("tr", "adm-detail");
  detail.id = detailId;
  detail.hidden = !isOpen;
  const td = document.createElement("td");
  td.setAttribute("colspan", "5");
  td.appendChild(lessonsPanel(row));
  detail.appendChild(td);

  btn.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") !== "true";
    btn.setAttribute("aria-expanded", String(open));
    detail.hidden = !open;
    if (open) state.open.add(s.uid); else state.open.delete(s.uid);
  });
  return [tr, detail];
}

function cell(label) {
  const td = document.createElement("td");
  td.setAttribute("data-label", label);
  return td;
}

function progressLine(entry, withTitle) {
  const course = coursesById.get(entry.courseId);
  const wrap = el("div", "adm-progress");
  if (withTitle) wrap.appendChild(el("span", "adm-progress-course", course?.title || entry.courseId));
  if (!entry.total) {
    wrap.appendChild(el("span", "app-muted", "אין עדיין שיעורים"));
    return wrap;
  }
  const count = el("span", "adm-progress-count", `${entry.completed}/${entry.total}`);
  count.setAttribute("aria-label", `${entry.completed} מתוך ${entry.total} שיעורים`);
  const bar = el("span", "adm-bar");
  bar.setAttribute("aria-hidden", "true");
  const fill = el("span", "adm-bar-fill");
  const pct = entry.total ? Math.round((entry.completed / entry.total) * 100) : 0;
  fill.style.inlineSize = `${pct}%`;
  if (entry.total && entry.completed >= entry.total) wrap.classList.add("is-done");
  bar.appendChild(fill);
  wrap.append(count, bar);
  return wrap;
}

function lessonsPanel(row) {
  const box = el("div", "adm-lessons");
  if (!row.courses.length) {
    box.appendChild(el("p", "app-muted", "אין לה עדיין קורס."));
    return box;
  }
  for (const entry of row.courses) {
    const course = coursesById.get(entry.courseId);
    const group = el("section", "adm-lesson-group");
    const head = el("div", "adm-lesson-head");
    head.appendChild(el("h2", "adm-lesson-course", course?.title || entry.courseId));
    const meta = [`${entry.completed} מתוך ${entry.total} שיעורים`];
    if (entry.grantedAt) meta.push(`קיבלה גישה ${formatDate(entry.grantedAt)}`);
    if (entry.source) meta.push(sourceLabel(entry.source));
    head.appendChild(el("p", "adm-lesson-meta", meta.join(" · ")));
    group.appendChild(head);

    const list = el("ol", "adm-lesson-list");
    for (const l of lessonStates(course, entry)) {
      const li = el("li", l.done ? "adm-lesson is-done" : "adm-lesson");
      li.appendChild(l.done
        ? icon("i-circle-check", "app-icon adm-lesson-icon")
        : el("span", "adm-lesson-dot"));
      li.appendChild(el("span", "adm-lesson-title", l.title));
      li.appendChild(el("span", "app-sr-only", l.done ? "נצפה" : "לא נצפה"));
      if (l.last) li.appendChild(el("span", "adm-here", "אחרון"));
      list.appendChild(li);
    }
    group.appendChild(list);
    box.appendChild(group);
  }
  return box;
}
