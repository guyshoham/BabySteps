// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { mountAppHeader, SITE_NAME } from "../app/app-shell.js";

const ROOT = join(import.meta.dirname, "..");

describe("mountAppHeader", () => {
  beforeEach(() => { document.body.replaceChildren(document.createElement("main")); });

  it("puts a header with the logo and site name first in body, linking to the site", () => {
    const { header } = mountAppHeader();
    expect(document.body.firstElementChild).toBe(header);
    const brand = header.querySelector("a.app-brand");
    expect(brand.getAttribute("href")).toBe("/");
    expect(brand.querySelector("img").getAttribute("src")).toBe("/assets/logos/logo-peach.png");
    expect(brand.textContent).toBe(SITE_NAME);
    expect(header.querySelector("#signout")).toBeNull();
  });

  it("shows the email as text, never as HTML", () => {
    const { header, showUser } = mountAppHeader();
    showUser("<img src=x onerror=alert(1)>@a.com", () => {});
    const email = header.querySelector("#app-user-email");
    expect(email.textContent).toBe("<img src=x onerror=alert(1)>@a.com");
    expect(email.querySelector("img")).toBeNull();
  });

  it("calls onSignOut when the sign-out button is clicked", async () => {
    const { header, showUser } = mountAppHeader();
    const onSignOut = vi.fn().mockResolvedValue();
    showUser("mom@example.com", onSignOut);
    const btn = header.querySelector("#signout");
    expect(btn.textContent).toBe("יציאה");
    btn.click();
    expect(onSignOut).toHaveBeenCalledTimes(1);
    expect(btn.disabled).toBe(true);
  });

  it("turns the button back on if sign-out fails", async () => {
    const { header, showUser } = mountAppHeader();
    vi.spyOn(console, "error").mockImplementation(() => {});
    showUser("mom@example.com", () => Promise.reject(new Error("offline")));
    const btn = header.querySelector("#signout");
    btn.click();
    await new Promise((r) => setTimeout(r, 0));
    expect(btn.disabled).toBe(false);
  });

  it("a second showUser only updates the email", () => {
    const { header, showUser } = mountAppHeader();
    showUser("a@example.com", () => {});
    showUser("b@example.com", () => {});
    expect(header.querySelectorAll("#signout")).toHaveLength(1);
    expect(header.querySelector("#app-user-email").textContent).toBe("b@example.com");
  });
});

describe("home screen install", () => {
  const manifest = JSON.parse(readFileSync(join(ROOT, "app/manifest.webmanifest"), "utf8"));

  it("manifest has the fields a phone needs", () => {
    expect(manifest).toMatchObject({
      name: "מתחילים בקטן",
      start_url: "/app/my-courses",
      display: "standalone",
      dir: "rtl",
      lang: "he",
      theme_color: "#704229",
      background_color: "#fdf6f0",
    });
    const sizes = manifest.icons.map((i) => i.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
    expect(manifest.icons.some((i) => i.purpose === "maskable")).toBe(true);
  });

  it("every manifest icon file exists", () => {
    for (const icon of manifest.icons) {
      expect(existsSync(join(ROOT, icon.src))).toBe(true);
    }
    expect(existsSync(join(ROOT, "assets/icons/apple-touch-icon.png"))).toBe(true);
  });

  for (const page of ["login", "my-courses", "course", "lesson", "auth-action"]) {
    it(`app/${page}.html links the manifest, theme color and icons`, () => {
      const html = readFileSync(join(ROOT, `app/${page}.html`), "utf8");
      expect(html).toContain('<link rel="manifest" href="/app/manifest.webmanifest" />');
      expect(html).toContain('<meta name="theme-color" content="#704229" />');
      expect(html).toContain('<link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png" />');
      expect(html).toContain('<meta name="apple-mobile-web-app-title" content="מתחילים בקטן" />');
      expect(html).toContain('<link rel="stylesheet" href="/app/app.css" />');
      expect(html).toContain('from "/app/app-shell.js"');
    });
  }
});
