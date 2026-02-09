import { z } from "zod";
import { get } from "../client/api-client.js";

// Types for App Store Connect API responses
interface App {
  type: "apps";
  id: string;
  attributes: {
    name: string;
    bundleId: string;
    sku: string;
    primaryLocale: string;
    isOrEverWasMadeForKids: boolean;
    contentRightsDeclaration?: string;
  };
  relationships?: {
    appStoreVersions?: { data: Array<{ type: string; id: string }> };
    builds?: { data: Array<{ type: string; id: string }> };
  };
}

interface AppStoreVersion {
  type: "appStoreVersions";
  id: string;
  attributes: {
    platform: string;
    versionString: string;
    appStoreState: string;
    releaseType?: string;
    createdDate: string;
  };
}

// Tool definitions
export const appsTools = {
  list_apps: {
    description:
      "List all apps in your App Store Connect account. Returns app name, bundle ID, SKU, and other metadata.",
    inputSchema: z.object({
      filter_name: z
        .string()
        .optional()
        .describe("Filter apps by name (case-insensitive contains match)"),
      filter_bundle_id: z.string().optional().describe("Filter apps by bundle ID"),
      limit: z
        .number()
        .min(1)
        .max(200)
        .default(50)
        .describe("Maximum number of apps to return (1-200)"),
    }),
    handler: async (input: { filter_name?: string; filter_bundle_id?: string; limit?: number }) => {
      const params: Record<string, string | undefined> = {
        limit: String(input.limit ?? 50),
      };

      if (input.filter_name) {
        params["filter[name]"] = input.filter_name;
      }
      if (input.filter_bundle_id) {
        params["filter[bundleId]"] = input.filter_bundle_id;
      }

      const response = await get<App[]>("/apps", params);

      const apps = response.data.map((app) => ({
        id: app.id,
        name: app.attributes.name,
        bundleId: app.attributes.bundleId,
        sku: app.attributes.sku,
        primaryLocale: app.attributes.primaryLocale,
      }));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ apps, total: apps.length }, null, 2),
          },
        ],
      };
    },
  },

  get_app: {
    description: "Get detailed information about a specific app by its App Store Connect ID.",
    inputSchema: z.object({
      app_id: z.string().describe("The App Store Connect app ID"),
      include: z
        .array(z.enum(["appStoreVersions", "builds", "betaGroups"]))
        .optional()
        .describe("Related resources to include in the response"),
    }),
    handler: async (input: { app_id: string; include?: string[] }) => {
      const params: Record<string, string | undefined> = {};

      if (input.include && input.include.length > 0) {
        params.include = input.include.join(",");
      }

      const response = await get<App>(`/apps/${input.app_id}`, params);

      const app = {
        id: response.data.id,
        ...response.data.attributes,
        included: response.included,
      };

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(app, null, 2),
          },
        ],
      };
    },
  },

  get_app_versions: {
    description:
      "Get all App Store versions for a specific app, including version string, platform, and release state.",
    inputSchema: z.object({
      app_id: z.string().describe("The App Store Connect app ID"),
      platform: z
        .enum(["IOS", "MAC_OS", "TV_OS", "VISION_OS"])
        .optional()
        .describe("Filter by platform"),
      state: z
        .enum([
          "DEVELOPER_REMOVED_FROM_SALE",
          "DEVELOPER_REJECTED",
          "IN_REVIEW",
          "INVALID_BINARY",
          "METADATA_REJECTED",
          "PENDING_APPLE_RELEASE",
          "PENDING_CONTRACT",
          "PENDING_DEVELOPER_RELEASE",
          "PREPARE_FOR_SUBMISSION",
          "PREORDER_READY_FOR_SALE",
          "PROCESSING_FOR_APP_STORE",
          "READY_FOR_REVIEW",
          "READY_FOR_SALE",
          "REJECTED",
          "REMOVED_FROM_SALE",
          "WAITING_FOR_EXPORT_COMPLIANCE",
          "WAITING_FOR_REVIEW",
          "REPLACED_WITH_NEW_VERSION",
          "NOT_APPLICABLE",
        ])
        .optional()
        .describe("Filter by App Store state"),
      limit: z
        .number()
        .min(1)
        .max(200)
        .default(50)
        .describe("Maximum number of versions to return"),
    }),
    handler: async (input: {
      app_id: string;
      platform?: string;
      state?: string;
      limit?: number;
    }) => {
      const params: Record<string, string | undefined> = {
        "fields[appStoreVersions]": "platform,versionString,appStoreState,releaseType,createdDate",
        limit: String(input.limit ?? 50),
      };

      if (input.platform) {
        params["filter[platform]"] = input.platform;
      }
      if (input.state) {
        params["filter[appStoreState]"] = input.state;
      }

      const response = await get<AppStoreVersion[]>(
        `/apps/${input.app_id}/appStoreVersions`,
        params
      );

      const versions = response.data.map((version) => ({
        id: version.id,
        ...version.attributes,
      }));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ versions, total: versions.length }, null, 2),
          },
        ],
      };
    },
  },
};
