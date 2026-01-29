import { z } from "zod";
import { get, post, patch } from "../client/api-client.js";

// Types
interface AppStoreVersion {
  type: "appStoreVersions";
  id: string;
  attributes: {
    platform: string;
    versionString: string;
    appStoreState: string;
    releaseType?: string;
    earliestReleaseDate?: string;
    createdDate: string;
    downloadable: boolean;
  };
}

interface AppStoreVersionSubmission {
  type: "appStoreVersionSubmissions";
  id: string;
}

export const versionsTools = {
  create_app_version: {
    description: "Create a new App Store version for an app. Use this to prepare a new release.",
    inputSchema: z.object({
      app_id: z.string().describe("The App Store Connect app ID"),
      version_string: z.string().describe("Version number (e.g., 1.2.3)"),
      platform: z.enum(["IOS", "MAC_OS", "TV_OS", "VISION_OS"]).describe("Target platform"),
      release_type: z
        .enum(["MANUAL", "AFTER_APPROVAL", "SCHEDULED"])
        .default("AFTER_APPROVAL")
        .describe("When to release after approval"),
      earliest_release_date: z
        .string()
        .optional()
        .describe("For SCHEDULED release type, ISO 8601 date (e.g., 2024-03-15T00:00:00Z)"),
    }),
    handler: async (input: {
      app_id: string;
      version_string: string;
      platform: string;
      release_type?: string;
      earliest_release_date?: string;
    }) => {
      const attributes: Record<string, unknown> = {
        platform: input.platform,
        versionString: input.version_string,
        releaseType: input.release_type ?? "AFTER_APPROVAL",
      };

      if (input.earliest_release_date) {
        attributes.earliestReleaseDate = input.earliest_release_date;
      }

      const body = {
        data: {
          type: "appStoreVersions",
          attributes,
          relationships: {
            app: {
              data: {
                type: "apps",
                id: input.app_id,
              },
            },
          },
        },
      };

      const response = await post<AppStoreVersion>("/appStoreVersions", body);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: true,
                version: {
                  id: response.data.id,
                  ...response.data.attributes,
                },
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  update_app_version: {
    description: "Update an existing App Store version's metadata.",
    inputSchema: z.object({
      version_id: z.string().describe("The App Store version ID"),
      version_string: z.string().optional().describe("New version number"),
      release_type: z
        .enum(["MANUAL", "AFTER_APPROVAL", "SCHEDULED"])
        .optional()
        .describe("When to release after approval"),
      earliest_release_date: z.string().optional().describe("For SCHEDULED release, ISO 8601 date"),
      downloadable: z.boolean().optional().describe("Whether the version is downloadable"),
    }),
    handler: async (input: {
      version_id: string;
      version_string?: string;
      release_type?: string;
      earliest_release_date?: string;
      downloadable?: boolean;
    }) => {
      const attributes: Record<string, unknown> = {};

      if (input.version_string !== undefined) {
        attributes.versionString = input.version_string;
      }
      if (input.release_type !== undefined) {
        attributes.releaseType = input.release_type;
      }
      if (input.earliest_release_date !== undefined) {
        attributes.earliestReleaseDate = input.earliest_release_date;
      }
      if (input.downloadable !== undefined) {
        attributes.downloadable = input.downloadable;
      }

      const body = {
        data: {
          type: "appStoreVersions",
          id: input.version_id,
          attributes,
        },
      };

      const response = await patch<AppStoreVersion>(`/appStoreVersions/${input.version_id}`, body);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: true,
                version: {
                  id: response.data.id,
                  ...response.data.attributes,
                },
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  submit_for_review: {
    description:
      "Submit an App Store version for App Store review. The version must be in PREPARE_FOR_SUBMISSION state.",
    inputSchema: z.object({
      version_id: z.string().describe("The App Store version ID to submit"),
    }),
    handler: async (input: { version_id: string }) => {
      const body = {
        data: {
          type: "appStoreVersionSubmissions",
          relationships: {
            appStoreVersion: {
              data: {
                type: "appStoreVersions",
                id: input.version_id,
              },
            },
          },
        },
      };

      const response = await post<AppStoreVersionSubmission>("/appStoreVersionSubmissions", body);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: true,
                message: "Version submitted for App Store review",
                submission: {
                  id: response.data.id,
                },
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  get_app_store_state: {
    description:
      "Get the current App Store state of a version (e.g., PREPARE_FOR_SUBMISSION, IN_REVIEW, READY_FOR_SALE).",
    inputSchema: z.object({
      version_id: z.string().describe("The App Store version ID"),
    }),
    handler: async (input: { version_id: string }) => {
      const response = await get<AppStoreVersion>(`/appStoreVersions/${input.version_id}`);

      const stateDescriptions: Record<string, string> = {
        DEVELOPER_REMOVED_FROM_SALE: "Removed from sale by developer",
        DEVELOPER_REJECTED: "Rejected by developer",
        IN_REVIEW: "Currently being reviewed by Apple",
        INVALID_BINARY: "Binary is invalid",
        METADATA_REJECTED: "Metadata was rejected",
        PENDING_APPLE_RELEASE: "Waiting for Apple to release",
        PENDING_CONTRACT: "Waiting for contract completion",
        PENDING_DEVELOPER_RELEASE: "Waiting for developer to release",
        PREPARE_FOR_SUBMISSION: "Ready to submit for review",
        PREORDER_READY_FOR_SALE: "Pre-order is live",
        PROCESSING_FOR_APP_STORE: "Processing for App Store",
        READY_FOR_REVIEW: "Ready for Apple review",
        READY_FOR_SALE: "Live on the App Store",
        REJECTED: "Rejected by Apple",
        REMOVED_FROM_SALE: "Removed from sale",
        WAITING_FOR_EXPORT_COMPLIANCE: "Waiting for export compliance",
        WAITING_FOR_REVIEW: "In queue for review",
        REPLACED_WITH_NEW_VERSION: "Replaced by newer version",
        NOT_APPLICABLE: "State not applicable",
      };

      const state = response.data.attributes.appStoreState;

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                versionId: response.data.id,
                versionString: response.data.attributes.versionString,
                platform: response.data.attributes.platform,
                state: state,
                stateDescription: stateDescriptions[state] || "Unknown state",
                releaseType: response.data.attributes.releaseType,
                createdDate: response.data.attributes.createdDate,
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  get_version_localization: {
    description:
      "Get localization information for an App Store version (what's new, description, etc.).",
    inputSchema: z.object({
      version_id: z.string().describe("The App Store version ID"),
      locale: z.string().optional().describe("Filter by locale (e.g., en-US, ja, fr-FR)"),
    }),
    handler: async (input: { version_id: string; locale?: string }) => {
      // Use include parameter to get localizations via GET_INSTANCE instead of GET_COLLECTION
      // The API doesn't allow direct GET_COLLECTION on appStoreVersionLocalizations
      const params: Record<string, string | undefined> = {
        include: "appStoreVersionLocalizations",
        "fields[appStoreVersionLocalizations]":
          "locale,description,keywords,whatsNew,promotionalText,marketingUrl,supportUrl",
      };

      const response = await get<AppStoreVersion>(
        `/appStoreVersions/${input.version_id}`,
        params
      );

      interface LocalizationData {
        type: "appStoreVersionLocalizations";
        id: string;
        attributes: {
          locale: string;
          description?: string;
          keywords?: string;
          whatsNew?: string;
          promotionalText?: string;
          marketingUrl?: string;
          supportUrl?: string;
        };
      }

      // Extract localizations from included data
      let localizations = ((response.included as LocalizationData[] | undefined) || [])
        .filter((item) => item.type === "appStoreVersionLocalizations")
        .map((loc) => ({
          id: loc.id,
          ...loc.attributes,
        }));

      // Apply client-side filtering for locale if specified
      if (input.locale) {
        localizations = localizations.filter((loc) => loc.locale === input.locale);
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ localizations, total: localizations.length }, null, 2),
          },
        ],
      };
    },
  },
};
