/**
 * Error types for App Store Connect API.
 */

export interface ApiError {
  id: string;
  status: string;
  code: string;
  title: string;
  detail: string;
  source?: {
    pointer?: string;
    parameter?: string;
  };
}

export interface ApiErrorResponse {
  errors: ApiError[];
}

export class AppStoreConnectError extends Error {
  public readonly status: number;
  public readonly errors: ApiError[];
  public readonly isRetryable: boolean;

  constructor(status: number, errors: ApiError[], isRetryable = false) {
    const message = errors.map((e) => `${e.title}: ${e.detail}`).join("; ");
    super(message);
    this.name = "AppStoreConnectError";
    this.status = status;
    this.errors = errors;
    this.isRetryable = isRetryable;
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class RateLimitError extends Error {
  public readonly retryAfter?: number;

  constructor(retryAfter?: number) {
    super("Rate limit exceeded. Please try again later.");
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

/**
 * Parse error response from App Store Connect API.
 */
export function parseErrorResponse(
  status: number,
  body: unknown
): AppStoreConnectError {
  const isRetryable = status >= 500 || status === 429;

  if (typeof body === "object" && body !== null && "errors" in body) {
    const errorResponse = body as ApiErrorResponse;
    return new AppStoreConnectError(status, errorResponse.errors, isRetryable);
  }

  // Fallback for non-standard error responses
  return new AppStoreConnectError(
    status,
    [
      {
        id: "unknown",
        status: String(status),
        code: "UNKNOWN_ERROR",
        title: "Unknown Error",
        detail: typeof body === "string" ? body : JSON.stringify(body),
      },
    ],
    isRetryable
  );
}

/**
 * Format an error for MCP tool response.
 */
export function formatErrorForMcp(error: unknown): string {
  if (error instanceof AppStoreConnectError) {
    const errorDetails = error.errors
      .map((e) => {
        let msg = `[${e.code}] ${e.title}: ${e.detail}`;
        if (e.source?.pointer) {
          msg += ` (at ${e.source.pointer})`;
        }
        return msg;
      })
      .join("\n");
    return `App Store Connect API Error (${error.status}):\n${errorDetails}`;
  }

  if (error instanceof AuthenticationError) {
    return `Authentication Error: ${error.message}`;
  }

  if (error instanceof RateLimitError) {
    let msg = error.message;
    if (error.retryAfter) {
      msg += ` Retry after ${error.retryAfter} seconds.`;
    }
    return msg;
  }

  if (error instanceof Error) {
    return `Error: ${error.message}`;
  }

  return `Unknown error: ${String(error)}`;
}
