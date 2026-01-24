import { getAuthorizationHeader, clearTokenCache } from "../auth/jwt.js";
import {
  parseRateLimitHeaders,
  calculateBackoff,
  sleep,
  shouldWarnAboutRateLimit,
  getRateLimitStatus,
} from "../utils/rate-limiter.js";
import {
  parseErrorResponse,
  AuthenticationError,
  RateLimitError,
  AppStoreConnectError,
} from "../utils/error-handler.js";

const BASE_URL = "https://api.appstoreconnect.apple.com/v1";
const MAX_RETRIES = 3;

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  params?: Record<string, string | string[] | undefined>;
}

interface ApiResponse<T> {
  data: T;
  links?: {
    self: string;
    next?: string;
  };
  meta?: {
    paging?: {
      total: number;
      limit: number;
    };
  };
  included?: unknown[];
}

/**
 * Build URL with query parameters.
 */
function buildUrl(
  endpoint: string,
  params?: Record<string, string | string[] | undefined>
): string {
  const url = new URL(`${BASE_URL}${endpoint}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          url.searchParams.set(key, value.join(","));
        } else {
          url.searchParams.set(key, value);
        }
      }
    }
  }

  return url.toString();
}

/**
 * Make a request to the App Store Connect API.
 */
async function makeRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", body, params } = options;
  const url = buildUrl(endpoint, params);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const headers: Record<string, string> = {
        Authorization: getAuthorizationHeader(),
        "Content-Type": "application/json",
      };

      const fetchOptions: RequestInit = {
        method,
        headers,
      };

      if (body) {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, fetchOptions);

      // Parse rate limit headers
      parseRateLimitHeaders(response.headers);

      // Log warning if approaching rate limits
      if (shouldWarnAboutRateLimit()) {
        const status = getRateLimitStatus();
        console.error(
          `Warning: Approaching rate limit. ${status.hourlyRemaining} requests remaining this hour.`
        );
      }

      // Handle success
      if (response.ok) {
        // Handle empty responses (204 No Content)
        if (response.status === 204) {
          return { data: null as T };
        }
        return (await response.json()) as ApiResponse<T>;
      }

      // Handle specific error codes
      if (response.status === 401 || response.status === 403) {
        // Authentication error - clear token cache and retry once
        if (attempt === 0) {
          clearTokenCache();
          continue;
        }
        throw new AuthenticationError(
          `Authentication failed (${response.status}). Check your API key credentials.`
        );
      }

      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        const retryAfterSeconds = retryAfter ? parseInt(retryAfter, 10) : undefined;

        if (attempt < MAX_RETRIES - 1) {
          const delay = retryAfterSeconds
            ? retryAfterSeconds * 1000
            : calculateBackoff(attempt);
          await sleep(delay);
          continue;
        }

        throw new RateLimitError(retryAfterSeconds);
      }

      // Parse error response
      const errorBody = await response.json().catch(() => null);
      const error = parseErrorResponse(response.status, errorBody);

      // Retry on server errors
      if (error.isRetryable && attempt < MAX_RETRIES - 1) {
        const delay = calculateBackoff(attempt);
        await sleep(delay);
        lastError = error;
        continue;
      }

      throw error;
    } catch (error) {
      if (
        error instanceof AppStoreConnectError ||
        error instanceof AuthenticationError ||
        error instanceof RateLimitError
      ) {
        throw error;
      }

      // Network or other errors
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < MAX_RETRIES - 1) {
        const delay = calculateBackoff(attempt);
        await sleep(delay);
        continue;
      }
    }
  }

  throw lastError || new Error("Request failed after maximum retries");
}

/**
 * GET request to the App Store Connect API.
 */
export async function get<T>(
  endpoint: string,
  params?: Record<string, string | string[] | undefined>
): Promise<ApiResponse<T>> {
  return makeRequest<T>(endpoint, { method: "GET", params });
}

/**
 * POST request to the App Store Connect API.
 */
export async function post<T>(
  endpoint: string,
  body: unknown
): Promise<ApiResponse<T>> {
  return makeRequest<T>(endpoint, { method: "POST", body });
}

/**
 * PATCH request to the App Store Connect API.
 */
export async function patch<T>(
  endpoint: string,
  body: unknown
): Promise<ApiResponse<T>> {
  return makeRequest<T>(endpoint, { method: "PATCH", body });
}

/**
 * DELETE request to the App Store Connect API.
 */
export async function del<T>(endpoint: string): Promise<ApiResponse<T>> {
  return makeRequest<T>(endpoint, { method: "DELETE" });
}

/**
 * Fetch all pages of a paginated endpoint.
 */
export async function getAllPages<T>(
  endpoint: string,
  params?: Record<string, string | string[] | undefined>
): Promise<T[]> {
  const allData: T[] = [];
  let nextUrl: string | null = buildUrl(endpoint, params);

  while (nextUrl) {
    // For subsequent requests, use the full URL directly
    const response = await fetch(nextUrl, {
      headers: {
        Authorization: getAuthorizationHeader(),
        "Content-Type": "application/json",
      },
    });

    parseRateLimitHeaders(response.headers);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw parseErrorResponse(response.status, errorBody);
    }

    const data = (await response.json()) as ApiResponse<T[]>;
    allData.push(...data.data);

    nextUrl = data.links?.next || null;
  }

  return allData;
}
