import { describe, it, expect, beforeEach } from "vitest";
import {
  parseRateLimitHeaders,
  getRateLimitStatus,
  isApproachingLimit,
  shouldWarnAboutRateLimit,
  calculateBackoff,
  sleep,
} from "../../src/utils/rate-limiter.js";

describe("Rate Limiter", () => {
  beforeEach(() => {
    // Reset rate limit info by parsing a header that resets to defaults
    const headers = new Headers();
    headers.set("x-rate-limit", "user-hour-lim:3600;user-hour-rem:3600;");
    parseRateLimitHeaders(headers);
  });

  describe("parseRateLimitHeaders", () => {
    it("should parse rate limit headers correctly", () => {
      const headers = new Headers();
      headers.set("x-rate-limit", "user-hour-lim:3600;user-hour-rem:2500;");

      parseRateLimitHeaders(headers);

      const status = getRateLimitStatus();
      expect(status.hourlyLimit).toBe(3600);
      expect(status.hourlyRemaining).toBe(2500);
      expect(status.lastUpdated).toBeGreaterThan(0);
    });

    it("should handle missing rate limit header", () => {
      const headers = new Headers();
      const statusBefore = getRateLimitStatus();

      parseRateLimitHeaders(headers);

      const statusAfter = getRateLimitStatus();
      // Should remain unchanged
      expect(statusAfter.hourlyLimit).toBe(statusBefore.hourlyLimit);
      expect(statusAfter.hourlyRemaining).toBe(statusBefore.hourlyRemaining);
    });

    it("should update lastUpdated timestamp", () => {
      const headers = new Headers();
      headers.set("x-rate-limit", "user-hour-lim:3600;user-hour-rem:3000;");

      const before = Date.now();
      parseRateLimitHeaders(headers);
      const after = Date.now();

      const status = getRateLimitStatus();
      expect(status.lastUpdated).toBeGreaterThanOrEqual(before);
      expect(status.lastUpdated).toBeLessThanOrEqual(after);
    });

    it("should handle partial header data", () => {
      const headers = new Headers();
      headers.set("x-rate-limit", "user-hour-rem:1000;");

      parseRateLimitHeaders(headers);

      const status = getRateLimitStatus();
      expect(status.hourlyRemaining).toBe(1000);
    });
  });

  describe("getRateLimitStatus", () => {
    it("should return a copy of rate limit info", () => {
      const status1 = getRateLimitStatus();
      const status2 = getRateLimitStatus();

      // Should be different objects
      expect(status1).not.toBe(status2);
      // But with same values
      expect(status1).toEqual(status2);
    });
  });

  describe("isApproachingLimit", () => {
    it("should return true when remaining is less than 100", () => {
      const headers = new Headers();
      headers.set("x-rate-limit", "user-hour-rem:50;");
      parseRateLimitHeaders(headers);

      expect(isApproachingLimit()).toBe(true);
    });

    it("should return false when remaining is 100 or more", () => {
      const headers = new Headers();
      headers.set("x-rate-limit", "user-hour-rem:100;");
      parseRateLimitHeaders(headers);

      expect(isApproachingLimit()).toBe(false);
    });
  });

  describe("shouldWarnAboutRateLimit", () => {
    it("should return true when remaining is less than 500", () => {
      const headers = new Headers();
      headers.set("x-rate-limit", "user-hour-rem:400;");
      parseRateLimitHeaders(headers);

      expect(shouldWarnAboutRateLimit()).toBe(true);
    });

    it("should return false when remaining is 500 or more", () => {
      const headers = new Headers();
      headers.set("x-rate-limit", "user-hour-rem:500;");
      parseRateLimitHeaders(headers);

      expect(shouldWarnAboutRateLimit()).toBe(false);
    });
  });

  describe("calculateBackoff", () => {
    it("should calculate exponential backoff", () => {
      const attempt0 = calculateBackoff(0, 1000, 60000);
      const attempt1 = calculateBackoff(1, 1000, 60000);
      const attempt2 = calculateBackoff(2, 1000, 60000);
      const attempt3 = calculateBackoff(3, 1000, 60000);

      // Base delays: 1s, 2s, 4s, 8s (plus jitter)
      expect(attempt0).toBeGreaterThanOrEqual(1000);
      expect(attempt0).toBeLessThan(1250); // 1000 + 25% jitter

      expect(attempt1).toBeGreaterThanOrEqual(2000);
      expect(attempt1).toBeLessThan(2500);

      expect(attempt2).toBeGreaterThanOrEqual(4000);
      expect(attempt2).toBeLessThan(5000);

      expect(attempt3).toBeGreaterThanOrEqual(8000);
      expect(attempt3).toBeLessThan(10000);
    });

    it("should respect max delay", () => {
      const delay = calculateBackoff(10, 1000, 60000);
      expect(delay).toBeLessThanOrEqual(60000);
    });

    it("should use custom base delay", () => {
      const delay = calculateBackoff(0, 500, 60000);
      expect(delay).toBeGreaterThanOrEqual(500);
      expect(delay).toBeLessThan(625); // 500 + 25% jitter
    });
  });

  describe("sleep", () => {
    it("should sleep for specified duration", async () => {
      const start = Date.now();
      await sleep(100);
      const end = Date.now();

      const duration = end - start;
      expect(duration).toBeGreaterThanOrEqual(90); // Allow some margin
      expect(duration).toBeLessThan(200); // Should not be too long
    });
  });
});
