import { describe, it, expect } from "vitest";
import {
  AppStoreConnectError,
  AuthenticationError,
  RateLimitError,
  parseErrorResponse,
  formatErrorForMcp,
  type ApiError,
} from "../../src/utils/error-handler.js";

describe("Error Handler", () => {
  describe("AppStoreConnectError", () => {
    it("should create error with correct properties", () => {
      const errors: ApiError[] = [
        {
          id: "test-id",
          status: "400",
          code: "INVALID_REQUEST",
          title: "Invalid Request",
          detail: "The request is invalid",
        },
      ];

      const error = new AppStoreConnectError(400, errors, false);

      expect(error.name).toBe("AppStoreConnectError");
      expect(error.status).toBe(400);
      expect(error.errors).toEqual(errors);
      expect(error.isRetryable).toBe(false);
      expect(error.message).toBe("Invalid Request: The request is invalid");
    });

    it("should mark 5xx errors as retryable", () => {
      const errors: ApiError[] = [
        {
          id: "test-id",
          status: "500",
          code: "INTERNAL_ERROR",
          title: "Internal Error",
          detail: "Server error",
        },
      ];

      const error = new AppStoreConnectError(500, errors, true);
      expect(error.isRetryable).toBe(true);
    });
  });

  describe("AuthenticationError", () => {
    it("should create authentication error", () => {
      const error = new AuthenticationError("Invalid credentials");
      expect(error.name).toBe("AuthenticationError");
      expect(error.message).toBe("Invalid credentials");
    });
  });

  describe("RateLimitError", () => {
    it("should create rate limit error without retry after", () => {
      const error = new RateLimitError();
      expect(error.name).toBe("RateLimitError");
      expect(error.message).toBe("Rate limit exceeded. Please try again later.");
      expect(error.retryAfter).toBeUndefined();
    });

    it("should create rate limit error with retry after", () => {
      const error = new RateLimitError(60);
      expect(error.name).toBe("RateLimitError");
      expect(error.retryAfter).toBe(60);
    });
  });

  describe("parseErrorResponse", () => {
    it("should parse standard error response", () => {
      const body = {
        errors: [
          {
            id: "error-1",
            status: "400",
            code: "INVALID",
            title: "Invalid",
            detail: "Invalid request",
          },
        ],
      };

      const error = parseErrorResponse(400, body);
      expect(error).toBeInstanceOf(AppStoreConnectError);
      expect(error.status).toBe(400);
      expect(error.errors).toHaveLength(1);
      expect(error.isRetryable).toBe(false);
    });

    it("should mark 5xx errors as retryable", () => {
      const body = {
        errors: [
          {
            id: "error-1",
            status: "500",
            code: "SERVER_ERROR",
            title: "Server Error",
            detail: "Internal server error",
          },
        ],
      };

      const error = parseErrorResponse(500, body);
      expect(error.isRetryable).toBe(true);
    });

    it("should mark 429 errors as retryable", () => {
      const body = {
        errors: [
          {
            id: "error-1",
            status: "429",
            code: "RATE_LIMIT",
            title: "Rate Limit",
            detail: "Too many requests",
          },
        ],
      };

      const error = parseErrorResponse(429, body);
      expect(error.isRetryable).toBe(true);
    });

    it("should handle non-standard error responses", () => {
      const error = parseErrorResponse(404, "Not found");
      expect(error).toBeInstanceOf(AppStoreConnectError);
      expect(error.status).toBe(404);
      expect(error.errors).toHaveLength(1);
      expect(error.errors[0].code).toBe("UNKNOWN_ERROR");
    });

    it("should handle null/undefined body", () => {
      const error = parseErrorResponse(500, null);
      expect(error).toBeInstanceOf(AppStoreConnectError);
      expect(error.status).toBe(500);
      expect(error.isRetryable).toBe(true);
    });
  });

  describe("formatErrorForMcp", () => {
    it("should format AppStoreConnectError", () => {
      const errors: ApiError[] = [
        {
          id: "error-1",
          status: "400",
          code: "INVALID",
          title: "Invalid Request",
          detail: "The request is invalid",
          source: { pointer: "/data/attributes/name" },
        },
      ];

      const error = new AppStoreConnectError(400, errors);
      const formatted = formatErrorForMcp(error);

      expect(formatted).toContain("App Store Connect API Error (400)");
      expect(formatted).toContain("[INVALID] Invalid Request: The request is invalid");
      expect(formatted).toContain("(at /data/attributes/name)");
    });

    it("should format AuthenticationError", () => {
      const error = new AuthenticationError("Invalid API key");
      const formatted = formatErrorForMcp(error);
      expect(formatted).toBe("Authentication Error: Invalid API key");
    });

    it("should format RateLimitError without retry after", () => {
      const error = new RateLimitError();
      const formatted = formatErrorForMcp(error);
      expect(formatted).toBe("Rate limit exceeded. Please try again later.");
    });

    it("should format RateLimitError with retry after", () => {
      const error = new RateLimitError(60);
      const formatted = formatErrorForMcp(error);
      expect(formatted).toBe(
        "Rate limit exceeded. Please try again later. Retry after 60 seconds."
      );
    });

    it("should format generic Error", () => {
      const error = new Error("Something went wrong");
      const formatted = formatErrorForMcp(error);
      expect(formatted).toBe("Error: Something went wrong");
    });

    it("should format unknown error types", () => {
      const formatted = formatErrorForMcp("String error");
      expect(formatted).toBe("Unknown error: String error");
    });
  });
});
