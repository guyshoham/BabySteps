// app/app-shell.js — the shared course app header (logo, site name, and on
// signed-in pages the student's email and a sign-out button).
//
// No Firebase import here: pages pass their own sign-out function, so this
// file stays easy to test. Styles live in app/app.css (.app-header...).
// Built with DOM APIs only (textContent/setAttribute), never innerHTML.

export const SITE_NAME = "מתחילים בקטן";
export const LOGO_SRC = "/assets/logos/logo-peach.png";

// Builds the header and puts it first in <body>. Returns { header, showUser }.
// showUser(email, onSignOut) adds the email and the "יציאה" button; call it
// once the user is known. Calling it again only updates the email.
export function mountAppHeader({ doc = document } = {}) {
  const header = doc.createElement("header");
  header.className = "app-header";

  const inner = doc.createElement("div");
  inner.className = "app-header-inner";

  const brand = doc.createElement("a");
  brand.className = "app-brand";
  brand.setAttribute("href", "/");
  const logo = doc.createElement("img");
  logo.className = "app-brand-logo";
  logo.setAttribute("src", LOGO_SRC);
  logo.setAttribute("alt", "");
  logo.setAttribute("width", "40");
  logo.setAttribute("height", "40");
  const name = doc.createElement("span");
  name.className = "app-brand-name";
  name.textContent = SITE_NAME;
  brand.append(logo, name);
  inner.appendChild(brand);

  header.appendChild(inner);
  doc.body.prepend(header);

  let emailEl = null;
  function showUser(email, onSignOut) {
    if (emailEl) { emailEl.textContent = email ?? ""; emailEl.setAttribute("title", email ?? ""); return; }
    const box = doc.createElement("div");
    box.className = "app-user";

    // <bdi> keeps a Latin email in the right order inside the RTL header.
    emailEl = doc.createElement("bdi");
    emailEl.id = "app-user-email";
    emailEl.className = "app-user-email";
    emailEl.textContent = email ?? "";
    emailEl.setAttribute("title", email ?? "");

    const btn = doc.createElement("button");
    btn.type = "button";
    btn.id = "signout";
    btn.className = "app-signout";
    btn.textContent = "יציאה";
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      try {
        await onSignOut();
      } catch (err) {
        console.error("sign out failed", err);
        btn.disabled = false;
      }
    });

    box.append(emailEl, btn);
    inner.appendChild(box);
  }

  return { header, showUser };
}
