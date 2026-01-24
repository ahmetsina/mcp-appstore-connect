import { readFileSync, existsSync } from "fs";

export interface AppStoreConnectConfig {
  issuerId: string;
  keyId: string;
  privateKey: string;
}

function getPrivateKey(): string {
  // First, check for direct private key content
  if (process.env.APP_STORE_PRIVATE_KEY) {
    return process.env.APP_STORE_PRIVATE_KEY.replace(/\\n/g, "\n");
  }

  // Then check for private key path
  const keyPath = process.env.APP_STORE_PRIVATE_KEY_PATH;
  if (keyPath && existsSync(keyPath)) {
    return readFileSync(keyPath, "utf-8");
  }

  throw new Error(
    "Missing App Store Connect private key. Set APP_STORE_PRIVATE_KEY or APP_STORE_PRIVATE_KEY_PATH environment variable."
  );
}

export function getConfig(): AppStoreConnectConfig {
  const issuerId = process.env.APP_STORE_ISSUER_ID;
  const keyId = process.env.APP_STORE_KEY_ID;

  if (!issuerId) {
    throw new Error(
      "Missing APP_STORE_ISSUER_ID environment variable. Get this from App Store Connect > Users and Access > Keys."
    );
  }

  if (!keyId) {
    throw new Error(
      "Missing APP_STORE_KEY_ID environment variable. This is the Key ID from your API key."
    );
  }

  const privateKey = getPrivateKey();

  return {
    issuerId,
    keyId,
    privateKey,
  };
}

export function validateConfig(): void {
  getConfig();
}
