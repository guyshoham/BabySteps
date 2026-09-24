import { describe, it, expect, vi, beforeAll } from "vitest";

const FIREBASE_VARS = ["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY"];

let sendWelcome;
let WELCOME_CONTINUE_URL;

beforeAll(async () => {
  // Import with no Firebase env vars: init is lazy, so this must not throw.
  const saved = {};
  for (const k of FIREBASE_VARS) { saved[k] = process.env[k]; delete process.env[k]; }
  try {
    ({ sendWelcome, WELCOME_CONTINUE_URL } = await import("../lib/firebase-admin.js"));
  } finally {
    for (const k of FIREBASE_VARS) if (saved[k] !== undefined) process.env[k] = saved[k];
  }
});

function fakeFetch({ ok = true, status = 200, json } = {}) {
  return vi.fn(async () => ({
    ok,
    status,
    json: json ?? (async () => ({})),
  }));
}

describe("sendWelcome", () => {
  it("imports without Firebase env vars", () => {
    expect(typeof sendWelcome).toBe("function");
  });

  it("resolves on 200", async () => {
    const f = fakeFetch();
    await expect(sendWelcome("a@b.com", f)).resolves.toBeUndefined();
    expect(f).toHaveBeenCalledTimes(1);
  });

  it("sends a PASSWORD_RESET request in Hebrew for the email", async () => {
    const f = fakeFetch();
    await sendWelcome("a@b.com", f);
    const [url, opts] = f.mock.calls[0];
    expect(url).toMatch(/^https:\/\/identitytoolkit\.googleapis\.com\/v1\/accounts:sendOobCode\?key=/);
    expect(opts.method).toBe("POST");
    expect(opts.headers["X-Firebase-Locale"]).toBe("he");
    const sent = JSON.parse(opts.body);
    expect(sent.requestType).toBe("PASSWORD_RESET");
    expect(sent.email).toBe("a@b.com");
    expect(sent.continueUrl).toBe(WELCOME_CONTINUE_URL);
  });

  it("throws with Firebase's error message on a non-2xx JSON body", async () => {
    const f = fakeFetch({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: "EMAIL_NOT_FOUND" } }),
    });
    await expect(sendWelcome("a@b.com", f)).rejects.toThrow("EMAIL_NOT_FOUND");
  });

  it("throws with HTTP <status> when the error body is not JSON", async () => {
    const f = fakeFetch({
      ok: false,
      status: 503,
      json: async () => { throw new SyntaxError("Unexpected token <"); },
    });
    await expect(sendWelcome("a@b.com", f)).rejects.toThrow("HTTP 503");
  });
});
