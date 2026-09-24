import { describe, it, expect } from "vitest";
import { messageFor, HELP_WHATSAPP } from "../app/auth-errors.js";

describe("messageFor", () => {
  it("maps credential errors to the wrong email or password message", () => {
    for (const code of ["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found"]) {
      expect(messageFor(code)).toBe("אימייל או סיסמה שגויים");
    }
  });
  it("tells the user to wait on too many requests", () => {
    expect(messageFor("auth/too-many-requests")).toMatch(/נסי שוב בעוד/);
  });
  it("tells the user to check the connection on a network error", () => {
    expect(messageFor("auth/network-request-failed")).toMatch(/החיבור/);
  });
  it("says the email is not valid", () => {
    expect(messageFor("auth/invalid-email")).toMatch(/לא תקינה/);
  });
  it("falls back to a generic message with the WhatsApp hint", () => {
    for (const code of ["auth/something-new", undefined, null, ""]) {
      expect(messageFor(code)).toMatch(/וואטסאפ/);
      expect(messageFor(code)).not.toBe("אימייל או סיסמה שגויים");
    }
  });
  it("uses reset wording in the reset flow", () => {
    expect(messageFor("auth/unknown", "reset")).toMatch(/מייל איפוס/);
    expect(messageFor("auth/user-not-found", "reset")).toMatch(/מייל איפוס/);
    expect(messageFor("auth/network-request-failed", "reset")).toMatch(/החיבור/);
  });
  it("exports the WhatsApp help link", () => {
    expect(HELP_WHATSAPP).toBe("https://wa.me/972542366243");
  });
});
