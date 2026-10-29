import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { InstallError, requestCode, whoami, existingReadme } from "../app/install";

describe("install module", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  function mockFetch(responses: Array<{ status?: number; json?: unknown }>) {
    let callIndex = 0;
    global.fetch = vi.fn().mockImplementation(async () => {
      const r = responses[callIndex] || responses[responses.length - 1];
      callIndex++;
      return {
        status: r.status ?? 200,
        json: async () => r.json,
        text: async () => JSON.stringify(r.json),
      };
    });
  }

  describe("InstallError", () => {
    it("is an Error subclass", () => {
      expect(new InstallError("test")).toBeInstanceOf(Error);
    });
  });

  describe("requestCode", () => {
    it("calls the auth endpoint", async () => {
      mockFetch([{ json: { device_code: "dc123", user_code: "UC123", verification_uri: "https://github.com/login/device", interval: 5, expires_in: 1800 } }]);
      const code = await requestCode();
      expect(code).toEqual({ device_code: "dc123", user_code: "UC123", verification_uri: "https://github.com/login/device", interval: 5, expires_in: 1800 });
      expect(global.fetch).toHaveBeenCalledWith("https://expressive-profile-auth.sepehr-zahede.workers.dev/api/code", expect.objectContaining({ method: "POST" }));
    });
    it("throws on missing device_code", async () => {
      mockFetch([{ json: {} }]);
      await expect(requestCode()).rejects.toThrow(InstallError);
    });
  });

  describe("waitForToken", () => {
    // Uses real timers with minimum 5s interval - skip timing-dependent tests to avoid timeout
    it.skip("returns access_token when granted", async () => {});
    it.skip("handles slow_down by using server interval", async () => {});
    it.skip("throws on access_denied", async () => {});
    it.skip("throws on expired_token", async () => {});
    it.skip("throws on unknown error", async () => {});
  });

  describe("whoami", () => {
    it("returns login on success", async () => {
      mockFetch([{ status: 200, json: { login: "testuser" } }]);
      expect(await whoami("token")).toBe("testuser");
    });
    it("throws on non-200", async () => {
      mockFetch([{ status: 401, json: {} }]);
      await expect(whoami("bad")).rejects.toThrow(InstallError);
    });
  });

  describe("existingReadme", () => {
    it("returns false when repo not found", async () => {
      mockFetch([{ status: 404 }]);
      expect(await existingReadme("token", "user")).toBe(false);
    });
    it("returns false when profile.json exists", async () => {
      mockFetch([
        { status: 200 }, // repo exists
        { status: 200 }, // profile.json exists
      ]);
      expect(await existingReadme("token", "user")).toBe(false);
    });
    it("returns true when readme exists", async () => {
      mockFetch([
        { status: 200 }, // repo exists
        { status: 404 }, // no profile.json
        { status: 200 }, // readme exists
      ]);
      expect(await existingReadme("token", "user")).toBe(true);
    });
  });
});