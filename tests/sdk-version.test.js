import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

// The Firebase Web SDK must load from one place only. If a page imports the
// CDN with a different version, two SDK copies load and Firestore throws
// "Type does not match the expected instance".
const ROOT = join(import.meta.dirname, "..");
const APP = join(ROOT, "app");
const CLIENT = "app/firebase-client.js";
const CDN = "gstatic.com/firebasejs";

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const files = walk(APP).map((path) => ({
  rel: relative(ROOT, path).split("\\").join("/"),
  text: readFileSync(path, "utf8"),
}));

describe("Firebase SDK version", () => {
  it("only app/firebase-client.js loads the Firebase CDN", () => {
    const offenders = files
      .filter((f) => f.rel !== CLIENT && f.text.includes(CDN))
      .map((f) => f.rel);
    expect(offenders).toEqual([]);
  });

  it("app/firebase-client.js uses a single SDK version", () => {
    const client = files.find((f) => f.rel === CLIENT);
    expect(client).toBeDefined();
    const versions = [...client.text.matchAll(/gstatic\.com\/firebasejs\/([^/]+)\//g)]
      .map((m) => m[1]);
    expect(versions.length).toBeGreaterThan(0);
    expect(new Set(versions).size).toBe(1);
  });
});
