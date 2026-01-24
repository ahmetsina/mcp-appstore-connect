import jwt from "jsonwebtoken";
import { getConfig } from "../config.js";

interface CachedToken {
  token: string;
  expiresAt: number;
}

const TOKEN_EXPIRY_SECONDS = 20 * 60; // 20 minutes (max allowed by Apple)
const REFRESH_BEFORE_SECONDS = 2 * 60; // Refresh 2 minutes before expiry

let cachedToken: CachedToken | null = null;

/**
 * Generate a JWT token for App Store Connect API authentication.
 * Uses ES256 algorithm as required by Apple.
 */
export function generateToken(): string {
  const config = getConfig();
  const now = Math.floor(Date.now() / 1000);

  // Check if we have a valid cached token
  if (cachedToken && cachedToken.expiresAt - now > REFRESH_BEFORE_SECONDS) {
    return cachedToken.token;
  }

  const expiresAt = now + TOKEN_EXPIRY_SECONDS;

  const payload = {
    iss: config.issuerId,
    iat: now,
    exp: expiresAt,
    aud: "appstoreconnect-v1",
  };

  const token = jwt.sign(payload, config.privateKey, {
    algorithm: "ES256",
    header: {
      alg: "ES256",
      kid: config.keyId,
      typ: "JWT",
    },
  });

  // Cache the token
  cachedToken = {
    token,
    expiresAt,
  };

  return token;
}

/**
 * Clear the cached token.
 * Useful when you need to force regeneration (e.g., after an auth error).
 */
export function clearTokenCache(): void {
  cachedToken = null;
}

/**
 * Get the authorization header value for API requests.
 */
export function getAuthorizationHeader(): string {
  return `Bearer ${generateToken()}`;
}
