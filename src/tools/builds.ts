import { z } from "zod";
import { get, post, patch, del } from "../client/api-client.js";

// Types
interface Build {
  type: "builds";
  id: string;
  attributes: {
    version: string;
    uploadedDate: string;
    expirationDate: string;
    expired: boolean;
    minOsVersion: string;
    iconAssetToken?: {
      templateUrl: string;
      width: number;
      height: number;
    };
    processingState: string;
    buildAudienceType?: string;
    usesNonExemptEncryption?: boolean;
  };
}

interface BetaAppReviewSubmission {
  type: "betaAppReviewSubmissions";
  id: string;
  attributes: {
    betaReviewState: string;
    submittedDate?: string;
  };
}

interface BetaBuildLocalization {
  type: "betaBuildLocalizations";
  id: string;
  attributes: {
    locale: string;
    whatsNew?: string;
  };
}

export const buildsTools = {
  // ============================================
  // Build Update Tools
  // ============================================

  update_build: {
    description:
      "Update a build's attributes like export compliance (encryption usage). Required before distributing a build.",
    inputSchema: z.object({
      build_id: z.string().describe("The build ID"),
      uses_non_exempt_encryption: z
        .boolean()
        .optional()
        .describe(
          "Whether the build uses non-exempt encryption. Set to false if your app only uses standard iOS encryption (HTTPS, etc.)"
        ),
    }),
    handler: async (input: { build_id: string; uses_non_exempt_encryption?: boolean }) => {
      const attributes: Record<string, unknown> = {};

      if (input.uses_non_exempt_encryption !== undefined) {
        attributes.usesNonExemptEncryption = input.uses_non_exempt_encryption;
      }

      const body = {
        data: {
          type: "builds",
          id: input.build_id,
          attributes,
        },
      };

      const response = await patch<Build>(`/builds/${input.build_id}`, body);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: true,
                build: {
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

  set_build_for_version: {
    description:
      "Associate a build with an App Store version. The build must be processed and the version must be in PREPARE_FOR_SUBMISSION state.",
    inputSchema: z.object({
      version_id: z.string().describe("The App Store version ID"),
      build_id: z.string().describe("The build ID to associate with this version"),
    }),
    handler: async (input: { version_id: string; build_id: string }) => {
      const body = {
        data: {
          type: "builds",
          id: input.build_id,
        },
      };

      await patch<null>(`/appStoreVersions/${input.version_id}/relationships/build`, body);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: true,
                message: `Build ${input.build_id} associated with version ${input.version_id}`,
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
  // Beta Review Tools
  // ============================================

  submit_build_for_beta_review: {
    description:
      "Submit a build for TestFlight beta app review. Required for external testing. The build must have export compliance set.",
    inputSchema: z.object({
      build_id: z.string().describe("The build ID to submit for beta review"),
    }),
    handler: async (input: { build_id: string }) => {
      const body = {
        data: {
          type: "betaAppReviewSubmissions",
          relationships: {
            build: {
              data: {
                type: "builds",
                id: input.build_id,
              },
            },
          },
        },
      };

      const response = await post<BetaAppReviewSubmission>("/betaAppReviewSubmissions", body);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: true,
                submission: {
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

  get_beta_review_status: {
    description: "Get the beta app review submission status for a build.",
    inputSchema: z.object({
      build_id: z.string().describe("The build ID"),
    }),
    handler: async (input: { build_id: string }) => {
      const response = await get<BetaAppReviewSubmission>(
        `/builds/${input.build_id}/betaAppReviewSubmission`
      );

      const statusDescriptions: Record<string, string> = {
        WAITING_FOR_REVIEW: "Build is waiting for review",
        IN_REVIEW: "Build is currently being reviewed",
        REJECTED: "Build was rejected",
        APPROVED: "Build was approved for beta testing",
      };

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                buildId: input.build_id,
                submission: response.data
                  ? {
                      id: response.data.id,
                      ...response.data.attributes,
                      statusDescription:
                        statusDescriptions[response.data.attributes.betaReviewState] ||
                        "Unknown status",
                    }
                  : null,
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
  // Beta Build Localization Tools
  // ============================================

  list_beta_build_localizations: {
    description:
      "List all beta build localizations for a build. These contain the 'What to Test' notes shown to TestFlight testers.",
    inputSchema: z.object({
      build_id: z.string().describe("The build ID"),
      locale: z.string().optional().describe("Filter by specific locale"),
    }),
    handler: async (input: { build_id: string; locale?: string }) => {
      const params: Record<string, string | undefined> = {};

      if (input.locale) {
        params["filter[locale]"] = input.locale;
      }

      const response = await get<BetaBuildLocalization[]>(
        `/builds/${input.build_id}/betaBuildLocalizations`,
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

  update_beta_build_localization: {
    description:
      "Update a beta build localization (What to Test notes). Use list_beta_build_localizations to get the localization ID.",
    inputSchema: z.object({
      localization_id: z.string().describe("The beta build localization ID"),
      whats_new: z.string().describe("What to Test notes for TestFlight testers"),
    }),
    handler: async (input: { localization_id: string; whats_new: string }) => {
      const body = {
        data: {
          type: "betaBuildLocalizations",
          id: input.localization_id,
          attributes: {
            whatsNew: input.whats_new,
          },
        },
      };

      const response = await patch<BetaBuildLocalization>(
        `/betaBuildLocalizations/${input.localization_id}`,
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

  create_beta_build_localization: {
    description: "Create a new beta build localization (What to Test notes) for a specific locale.",
    inputSchema: z.object({
      build_id: z.string().describe("The build ID"),
      locale: z.string().describe("Locale code (e.g., en-US, ja, fr-FR)"),
      whats_new: z.string().describe("What to Test notes for TestFlight testers"),
    }),
    handler: async (input: { build_id: string; locale: string; whats_new: string }) => {
      const body = {
        data: {
          type: "betaBuildLocalizations",
          attributes: {
            locale: input.locale,
            whatsNew: input.whats_new,
          },
          relationships: {
            build: {
              data: {
                type: "builds",
                id: input.build_id,
              },
            },
          },
        },
      };

      const response = await post<BetaBuildLocalization>("/betaBuildLocalizations", body);

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
  // Build to Beta Group Tools
  // ============================================

  add_build_to_beta_group: {
    description:
      "Add a build to a beta group for TestFlight distribution. The build must be approved for beta testing (or internal only).",
    inputSchema: z.object({
      beta_group_id: z.string().describe("The beta group ID"),
      build_id: z.string().describe("The build ID to add to the group"),
    }),
    handler: async (input: { beta_group_id: string; build_id: string }) => {
      const body = {
        data: [
          {
            type: "builds",
            id: input.build_id,
          },
        ],
      };

      await post<null>(`/betaGroups/${input.beta_group_id}/relationships/builds`, body);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: true,
                message: `Build ${input.build_id} added to beta group ${input.beta_group_id}`,
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  remove_build_from_beta_group: {
    description: "Remove a build from a beta group.",
    inputSchema: z.object({
      beta_group_id: z.string().describe("The beta group ID"),
      build_id: z.string().describe("The build ID to remove from the group"),
    }),
    handler: async (input: { beta_group_id: string; build_id: string }) => {
      const body = {
        data: [
          {
            type: "builds",
            id: input.build_id,
          },
        ],
      };

      await del<null>(`/betaGroups/${input.beta_group_id}/relationships/builds`, body);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: true,
                message: `Build ${input.build_id} removed from beta group ${input.beta_group_id}`,
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
