/**
 * Rate limiter for App Store Connect API.
 *
 * Rate limits:
 * - ~3,600 requests per hour (rolling window)
 * - ~300-350 requests per minute (undocumented)
 */

interface RateLimitInfo {
  hourlyLimit: number;
  hourlyRemaining: number;
  lastUpdated: number;
}

const rateLimitInfo: RateLimitInfo = {
  hourlyLimit: 3600,
  hourlyRemaining: 3600,
  lastUpdated: Date.now(),
};

/**
 * Parse rate limit information from response headers.
 * Header format: user-hour-lim:3600;user-hour-rem:3121;
 */
export function parseRateLimitHeaders(headers: Headers): void {
  const rateLimitHeader = headers.get("x-rate-limit");
  if (!rateLimitHeader) return;

  const parts = rateLimitHeader.split(";");
  for (const part of parts) {
    const [key, value] = part.split(":");
    if (key === "user-hour-lim") {
      rateLimitInfo.hourlyLimit = parseInt(value, 10);
    } else if (key === "user-hour-rem") {
      rateLimitInfo.hourlyRemaining = parseInt(value, 10);
    }
  }
  rateLimitInfo.lastUpdated = Date.now();
}

/**
 * Get current rate limit status.
 */
export function getRateLimitStatus(): RateLimitInfo {
  return { ...rateLimitInfo };
}

/**
 * Check if we're approaching rate limits.
 * Returns true if we should slow down requests.
 */
export function isApproachingLimit(): boolean {
  return rateLimitInfo.hourlyRemaining < 100;
}

/**
 * Check if we should warn about rate limits.
 */
export function shouldWarnAboutRateLimit(): boolean {
  return rateLimitInfo.hourlyRemaining < 500;
}

/**
 * Calculate backoff delay with jitter for retries.
 * @param attempt - Current retry attempt (0-indexed)
 * @param baseDelay - Base delay in milliseconds (default 1000ms)
 * @param maxDelay - Maximum delay in milliseconds (default 60000ms)
 */
export function calculateBackoff(attempt: number, baseDelay = 1000, maxDelay = 60000): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, etc.
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  // Add jitter (0-25% of delay)
  const jitter = exponentialDelay * Math.random() * 0.25;
  return Math.min(exponentialDelay + jitter, maxDelay);
}

/**
 * Sleep for a specified duration.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
