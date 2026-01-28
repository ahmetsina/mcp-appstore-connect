import { z } from "zod";
import { get, post, patch } from "../client/api-client.js";

// Types
interface AppStoreVersionLocalization {
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

interface AppInfoLocalization {
  type: "appInfoLocalizations";
  id: string;
  attributes: {
    locale: string;
    name?: string;
    subtitle?: string;
    privacyPolicyText?: string;
    privacyPolicyUrl?: string;
    privacyChoicesUrl?: string;
  };
}

interface AppInfo {
  type: "appInfos";
  id: string;
  attributes: {
    appStoreState: string;
    appStoreAgeRating?: string;
    brazilAgeRating?: string;
    brazilAgeRatingV2?: string;
    kidsAgeBand?: string;
  };
}

export const metadataTools = {
  // ============================================
  // Version Localization Tools
  // ============================================

  update_version_localization: {
    description:
      "Update an App Store version localization (description, keywords, what's new, etc.). Use get_version_localization first to get the localization ID.",
    inputSchema: z.object({
      localization_id: z.string().describe("The version localization ID"),
      description: z.string().optional().describe("App description for the App Store listing"),
      keywords: z
        .string()
        .optional()
        .describe("Keywords for App Store search (comma-separated, max 100 chars)"),
      whats_new: z.string().optional().describe("What's new in this version (release notes)"),
      promotional_text: z
        .string()
        .optional()
        .describe("Promotional text (can be updated without new version)"),
      marketing_url: z.string().optional().describe("Marketing URL for this locale"),
      support_url: z.string().optional().describe("Support URL for this locale"),
    }),
    handler: async (input: {
      localization_id: string;
      description?: string;
      keywords?: string;
      whats_new?: string;
      promotional_text?: string;
      marketing_url?: string;
      support_url?: string;
    }) => {
      const attributes: Record<string, unknown> = {};

      if (input.description !== undefined) {
        attributes.description = input.description;
      }
      if (input.keywords !== undefined) {
        attributes.keywords = input.keywords;
      }
      if (input.whats_new !== undefined) {
        attributes.whatsNew = input.whats_new;
      }
      if (input.promotional_text !== undefined) {
        attributes.promotionalText = input.promotional_text;
      }
      if (input.marketing_url !== undefined) {
        attributes.marketingUrl = input.marketing_url;
      }
      if (input.support_url !== undefined) {
        attributes.supportUrl = input.support_url;
      }

      const body = {
        data: {
          type: "appStoreVersionLocalizations",
          id: input.localization_id,
          attributes,
        },
      };

      const response = await patch<AppStoreVersionLocalization>(
        `/appStoreVersionLocalizations/${input.localization_id}`,
        body
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: true,
                localization: {
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

  create_version_localization: {
    description:
      "Create a new App Store version localization for a specific locale. Use this to add support for a new language.",
    inputSchema: z.object({
      version_id: z.string().describe("The App Store version ID"),
      locale: z.string().describe("Locale code (e.g., en-US, ja, fr-FR, de-DE, zh-Hans)"),
      description: z.string().optional().describe("App description"),
      keywords: z.string().optional().describe("Keywords (comma-separated, max 100 chars)"),
      whats_new: z.string().optional().describe("What's new in this version"),
      promotional_text: z.string().optional().describe("Promotional text"),
      marketing_url: z.string().optional().describe("Marketing URL"),
      support_url: z.string().optional().describe("Support URL"),
    }),
    handler: async (input: {
      version_id: string;
      locale: string;
      description?: string;
      keywords?: string;
      whats_new?: string;
      promotional_text?: string;
      marketing_url?: string;
      support_url?: string;
    }) => {
      const attributes: Record<string, unknown> = {
        locale: input.locale,
      };

      if (input.description !== undefined) {
        attributes.description = input.description;
      }
      if (input.keywords !== undefined) {
        attributes.keywords = input.keywords;
      }
      if (input.whats_new !== undefined) {
        attributes.whatsNew = input.whats_new;
      }
      if (input.promotional_text !== undefined) {
        attributes.promotionalText = input.promotional_text;
      }
      if (input.marketing_url !== undefined) {
        attributes.marketingUrl = input.marketing_url;
      }
      if (input.support_url !== undefined) {
        attributes.supportUrl = input.support_url;
      }

      const body = {
        data: {
          type: "appStoreVersionLocalizations",
          attributes,
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

      const response = await post<AppStoreVersionLocalization>(
        "/appStoreVersionLocalizations",
        body
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: true,
                localization: {
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

  // ============================================
  // App Info Localization Tools
  // ============================================

  get_app_info: {
    description:
      "Get app info for an app. Returns the app info ID needed for updating app-level localizations (name, subtitle).",
    inputSchema: z.object({
      app_id: z.string().describe("The App Store Connect app ID"),
    }),
    handler: async (input: { app_id: string }) => {
      const response = await get<AppInfo[]>(`/apps/${input.app_id}/appInfos`);

      const appInfos = response.data.map((info) => ({
        id: info.id,
        ...info.attributes,
      }));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                appInfos,
                total: appInfos.length,
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  list_app_info_localizations: {
    description:
      "List all app info localizations for an app info. Returns localization IDs and current values for name, subtitle, privacy policy.",
    inputSchema: z.object({
      app_info_id: z.string().describe("The App Info ID (from get_app_info)"),
      locale: z.string().optional().describe("Filter by specific locale"),
    }),
    handler: async (input: { app_info_id: string; locale?: string }) => {
      const params: Record<string, string | undefined> = {};

      if (input.locale) {
        params["filter[locale]"] = input.locale;
      }

      const response = await get<AppInfoLocalization[]>(
        `/appInfos/${input.app_info_id}/appInfoLocalizations`,
        params
      );

      const localizations = response.data.map((loc) => ({
        id: loc.id,
        ...loc.attributes,
      }));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                localizations,
                total: localizations.length,
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  update_app_info_localization: {
    description:
      "Update an app info localization (app name, subtitle, privacy policy). Use list_app_info_localizations first to get the localization ID.",
    inputSchema: z.object({
      localization_id: z.string().describe("The app info localization ID"),
      name: z.string().optional().describe("App name for this locale (max 30 chars)"),
      subtitle: z.string().optional().describe("App subtitle for this locale (max 30 chars)"),
      privacy_policy_text: z.string().optional().describe("Privacy policy text (for tvOS)"),
      privacy_policy_url: z.string().optional().describe("Privacy policy URL"),
      privacy_choices_url: z
        .string()
        .optional()
        .describe("Privacy choices URL (for CCPA compliance)"),
    }),
    handler: async (input: {
      localization_id: string;
      name?: string;
      subtitle?: string;
      privacy_policy_text?: string;
      privacy_policy_url?: string;
      privacy_choices_url?: string;
    }) => {
      const attributes: Record<string, unknown> = {};

      if (input.name !== undefined) {
        attributes.name = input.name;
      }
      if (input.subtitle !== undefined) {
        attributes.subtitle = input.subtitle;
      }
      if (input.privacy_policy_text !== undefined) {
        attributes.privacyPolicyText = input.privacy_policy_text;
      }
      if (input.privacy_policy_url !== undefined) {
        attributes.privacyPolicyUrl = input.privacy_policy_url;
      }
      if (input.privacy_choices_url !== undefined) {
        attributes.privacyChoicesUrl = input.privacy_choices_url;
      }

      const body = {
        data: {
          type: "appInfoLocalizations",
          id: input.localization_id,
          attributes,
        },
      };

      const response = await patch<AppInfoLocalization>(
        `/appInfoLocalizations/${input.localization_id}`,
        body
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: true,
                localization: {
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

  create_app_info_localization: {
    description:
      "Create a new app info localization for a specific locale. Use this to add app name and subtitle for a new language.",
    inputSchema: z.object({
      app_info_id: z.string().describe("The App Info ID (from get_app_info)"),
      locale: z.string().describe("Locale code (e.g., en-US, ja, fr-FR)"),
      name: z.string().optional().describe("App name (max 30 chars)"),
      subtitle: z.string().optional().describe("App subtitle (max 30 chars)"),
      privacy_policy_text: z.string().optional().describe("Privacy policy text (for tvOS)"),
      privacy_policy_url: z.string().optional().describe("Privacy policy URL"),
      privacy_choices_url: z.string().optional().describe("Privacy choices URL"),
    }),
    handler: async (input: {
      app_info_id: string;
      locale: string;
      name?: string;
      subtitle?: string;
      privacy_policy_text?: string;
      privacy_policy_url?: string;
      privacy_choices_url?: string;
    }) => {
      const attributes: Record<string, unknown> = {
        locale: input.locale,
      };

      if (input.name !== undefined) {
        attributes.name = input.name;
      }
      if (input.subtitle !== undefined) {
        attributes.subtitle = input.subtitle;
      }
      if (input.privacy_policy_text !== undefined) {
        attributes.privacyPolicyText = input.privacy_policy_text;
      }
      if (input.privacy_policy_url !== undefined) {
        attributes.privacyPolicyUrl = input.privacy_policy_url;
      }
      if (input.privacy_choices_url !== undefined) {
        attributes.privacyChoicesUrl = input.privacy_choices_url;
      }

      const body = {
        data: {
          type: "appInfoLocalizations",
          attributes,
          relationships: {
            appInfo: {
              data: {
                type: "appInfos",
                id: input.app_info_id,
              },
            },
          },
        },
      };

      const response = await post<AppInfoLocalization>("/appInfoLocalizations", body);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: true,
                localization: {
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
};
