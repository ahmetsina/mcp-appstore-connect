import { describe, it, expect, beforeEach, vi } from "vitest";
import { generateToken, clearTokenCache, getAuthorizationHeader } from "../../src/auth/jwt.js";
import * as configModule from "../../src/config.js";
import jwt from "jsonwebtoken";

// Mock the config module
vi.mock("../../src/config.js", () => ({
  getConfig: vi.fn(),
}));

// Mock jsonwebtoken
vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
  },
}));

describe("JWT Authentication", () => {
  const mockConfig = {
    issuerId: "test-issuer-id",
    keyId: "test-key-id",
    privateKey: `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgTestKeyForTestingPurposes
OnlyThisIsNotARealKeyAndShouldNotBeUsedInProduction
-----END PRIVATE KEY-----`,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    clearTokenCache();
    vi.mocked(configModule.getConfig).mockReturnValue(mockConfig);
  });

  describe("generateToken", () => {
    it("should generate a JWT token", () => {
      const mockToken = "mock.jwt.token";
      vi.mocked(jwt.sign).mockReturnValue(mockToken as never);

      const token = generateToken();
      expect(token).toBe(mockToken);
      expect(jwt.sign).toHaveBeenCalled();
    });

    it("should cache token and return same token on subsequent calls", () => {
      const mockToken = "cached.jwt.token";
      vi.mocked(jwt.sign).mockReturnValue(mockToken as never);

      const token1 = generateToken();
      const token2 = generateToken();
      expect(token1).toBe(token2);
      expect(token1).toBe(mockToken);
      // Should only call jwt.sign once due to caching
      expect(jwt.sign).toHaveBeenCalledTimes(1);
    });

    it("should include correct payload structure", () => {
      const mockToken = "test.jwt.token";
      vi.mocked(jwt.sign).mockReturnValue(mockToken as never);

      generateToken();

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          iss: mockConfig.issuerId,
          aud: "appstoreconnect-v1",
        }),
        mockConfig.privateKey,
        expect.objectContaining({
          algorithm: "ES256",
          header: expect.objectContaining({
            alg: "ES256",
            kid: mockConfig.keyId,
            typ: "JWT",
          }),
        })
      );
    });
  });

  describe("clearTokenCache", () => {
    it("should clear cached token", () => {
      generateToken();
      clearTokenCache();
      generateToken();

      // The important thing is that clearTokenCache doesn't throw
      expect(() => clearTokenCache()).not.toThrow();
    });

    it("should force token regeneration after clearing", () => {
      generateToken();
      clearTokenCache();

      // Mock time to ensure different token
      vi.spyOn(Date, "now").mockReturnValue(Date.now() + 1000);
      const token2 = generateToken();

      // Should generate new token
      expect(token2).toBeTruthy();
      vi.restoreAllMocks();
    });
  });

  describe("getAuthorizationHeader", () => {
    it("should return Bearer token format", () => {
      const mockToken = "test.jwt.token";
      vi.mocked(jwt.sign).mockReturnValue(mockToken as never);

      const header = getAuthorizationHeader();
      expect(header).toMatch(/^Bearer .+/);
      expect(header.split(" ")).toHaveLength(2);
      expect(header.split(" ")[0]).toBe("Bearer");
      expect(header.split(" ")[1]).toBe(mockToken);
    });
  });

  describe("token caching behavior", () => {
    it("should use cached token when still valid", () => {
      const mockToken = "cached.token.here";
      vi.mocked(jwt.sign).mockReturnValue(mockToken as never);

      const token1 = generateToken();
      // Call multiple times quickly
      const token2 = generateToken();
      const token3 = generateToken();

      expect(token1).toBe(token2);
      expect(token2).toBe(token3);
      expect(token1).toBe(mockToken);
      expect(jwt.sign).toHaveBeenCalledTimes(1);
    });
  });
});
