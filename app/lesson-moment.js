// app/lesson-moment.js: the lesson page's visual states. The step bar, the
// "done" moment on the button, the finish card and the "up next" bar.
//
// DOM only, no Firebase, no saving: app/lesson.html decides WHEN a lesson is
// done and saves it; this file only shows it. Motion lives in app/lesson.css
// as CSS transitions, so `prefers-reduced-motion` turns every moment into an
// instant state change. Built with textContent/setAttribute, never innerHTML.

export const DONE_TEXT = "בוצע";
export const NOT_DONE_TEXT = "סמני כבוצע";
export const DONE_ANNOUNCE = "השיעור סומן כבוצע";
export const UNDONE_ANNOUNCE = "הסימון הוסר";

// Applies a state change with transitions off, so it shows at once. Used for
// the first render: a lesson that was done before must not "celebrate" again.
export function instantly(el, change) {
  el.classList.add("is-instant");
  change();
  void el.offsetWidth; // flush styles while transitions are off
  el.classList.remove("is-instant");
}

// Builds (or refreshes) the step bar: one segment per lesson.
// steps: [{ id, done, current }] from stepStates(). label: screen reader text.
export function renderSteps(bar, steps, label) {
  instantly(bar, () => {
    const doc = bar.ownerDocument;
    const byId = new Map([...bar.children].map((el) => [el.dataset.id, el]));
    const segs = steps.map((s) => {
      const seg = byId.get(s.id) ?? doc.createElement("span");
      seg.className = "step";
      seg.dataset.id = s.id;
      seg.classList.toggle("is-done", s.done);
      seg.classList.toggle("is-current", s.current);
      return seg;
    });
    bar.replaceChildren(...segs);
    bar.setAttribute("aria-label", label ?? "");
  });
}

// Fills or empties one step. Animated (a CSS transition) unless `instant`.
export function fillStep(bar, id, done, { instant = false } = {}) {
  const seg = [...bar.children].find((el) => el.dataset.id === id);
  if (!seg) return;
  const apply = () => seg.classList.toggle("is-done", done);
  if (instant) instantly(bar, apply); else apply();
}

// The done toggle. It holds the check svg and a .done-label span.
// animate: true plays the moment (fill, then the check draws itself).
export function setDoneButton(btn, done, { animate = false } = {}) {
  const apply = () => {
    btn.classList.toggle("is-done", done);
    btn.setAttribute("aria-pressed", String(done));
    const label = btn.querySelector(".done-label");
    if (label) label.textContent = done ? DONE_TEXT : NOT_DONE_TEXT;
  };
  if (animate) apply(); else instantly(btn, apply);
}

// Polite live region. Clears first, so the same text is read again.
export function announce(live, text) {
  live.textContent = "";
  const win = live.ownerDocument.defaultView;
  (win?.requestAnimationFrame ?? ((f) => setTimeout(f, 0)))(() => { live.textContent = text; });
}

// Shows the finish card and draws the arc around the portrait once.
// Hiding it resets the arc, so it draws again if it comes back.
export function setFinish(card, show) {
  if (!show) {
    card.hidden = true;
    card.classList.remove("is-drawn");
    return;
  }
  if (!card.hidden) return;
  card.hidden = false;
  void card.offsetWidth; // start the transition from the undrawn arc
  card.classList.add("is-drawn");
}

// The "up next" bar at the bottom of the screen. It stays in the DOM so it
// can slide; when closed it is inert and hidden from screen readers.
export function setUpNext(bar, open) {
  const doc = bar.ownerDocument;
  bar.classList.toggle("is-open", open);
  bar.setAttribute("aria-hidden", String(!open));
  if (open) bar.removeAttribute("inert"); else bar.setAttribute("inert", "");
  doc.body.classList.toggle("has-upnext", open);
}

// Fills the bar. content: { icon, kicker, title, href, action }.
export function fillUpNext(bar, { icon, kicker, title, href, action }) {
  bar.querySelector(".upnext-icon use")?.setAttribute("href", `/assets/icons/sprite.svg#${icon}`);
  bar.querySelector(".upnext-kicker").textContent = kicker ?? "";
  const t = bar.querySelector(".upnext-title");
  t.textContent = title ?? "";
  t.hidden = !title;
  const link = bar.querySelector(".upnext-go");
  link.setAttribute("href", href);
  link.querySelector(".upnext-action").textContent = action ?? "";
}

// Sprite icon for a lesson: image tips get the photo, everything else plays.
export function lessonIcon(lesson) {
  return lesson?.kind === "image" ? "i-photo" : "i-play";
}
