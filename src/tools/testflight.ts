import { z } from "zod";
import { get, post, del } from "../client/api-client.js";

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
    processingState: string;
    buildAudienceType?: string;
    usesNonExemptEncryption?: boolean;
  };
}

interface BetaTester {
  type: "betaTesters";
  id: string;
  attributes: {
    firstName?: string;
    lastName?: string;
    email: string;
    inviteType: string;
    state: string;
  };
}

interface BetaGroup {
  type: "betaGroups";
  id: string;
  attributes: {
    name: string;
    isInternalGroup: boolean;
    publicLinkEnabled?: boolean;
    publicLinkLimit?: number;
    publicLink?: string;
    feedbackEnabled: boolean;
    createdDate: string;
  };
}

export const testflightTools = {
  list_builds: {
    description:
      "List TestFlight builds for an app. Returns build version, upload date, processing state, and expiration info.",
    inputSchema: z.object({
      app_id: z.string().describe("The App Store Connect app ID"),
      processing_state: z
        .enum(["PROCESSING", "FAILED", "INVALID", "VALID"])
        .optional()
        .describe("Filter by processing state"),
      expired: z.boolean().optional().describe("Filter by expiration status"),
      limit: z.number().min(1).max(200).default(50).describe("Maximum number of builds to return"),
    }),
    handler: async (input: {
      app_id: string;
      processing_state?: string;
      expired?: boolean;
      limit?: number;
    }) => {
      const params: Record<string, string | undefined> = {
        "filter[app]": input.app_id,
        limit: String(input.limit ?? 50),
        sort: "-uploadedDate",
      };

      if (input.processing_state) {
        params["filter[processingState]"] = input.processing_state;
      }
      if (input.expired !== undefined) {
        params["filter[expired]"] = String(input.expired);
      }

      const response = await get<Build[]>("/builds", params);

      const builds = response.data.map((build) => ({
        id: build.id,
        ...build.attributes,
      }));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ builds, total: builds.length }, null, 2),
          },
        ],
      };
    },
  },

  get_build: {
    description: "Get detailed information about a specific TestFlight build.",
    inputSchema: z.object({
      build_id: z.string().describe("The build ID"),
      include: z
        .array(z.enum(["app", "betaTesters", "buildBetaDetail"]))
        .optional()
        .describe("Related resources to include"),
    }),
    handler: async (input: { build_id: string; include?: string[] }) => {
      const params: Record<string, string | undefined> = {};

      if (input.include && input.include.length > 0) {
        params.include = input.include.join(",");
      }

      const response = await get<Build>(`/builds/${input.build_id}`, params);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                id: response.data.id,
                ...response.data.attributes,
                included: response.included,
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  list_beta_testers: {
    description:
      "List beta testers for an app or beta group. Returns tester email, name, invite status, and state.",
    inputSchema: z.object({
      app_id: z.string().optional().describe("Filter by app ID"),
      beta_group_id: z.string().optional().describe("Filter by beta group ID"),
      email: z.string().optional().describe("Filter by tester email"),
      limit: z.number().min(1).max(200).default(50).describe("Maximum number of testers to return"),
    }),
    handler: async (input: {
      app_id?: string;
      beta_group_id?: string;
      email?: string;
      limit?: number;
    }) => {
      const params: Record<string, string | undefined> = {
        limit: String(input.limit ?? 50),
      };

      if (input.app_id) {
        params["filter[apps]"] = input.app_id;
      }
      if (input.beta_group_id) {
        params["filter[betaGroups]"] = input.beta_group_id;
      }
      if (input.email) {
        params["filter[email]"] = input.email;
      }

      const response = await get<BetaTester[]>("/betaTesters", params);

      const testers = response.data.map((tester) => ({
        id: tester.id,
        ...tester.attributes,
      }));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ testers, total: testers.length }, null, 2),
          },
        ],
      };
    },
  },

  add_beta_tester: {
    description:
      "Add a beta tester to a beta group. Creates the tester if they don't exist and adds them to the specified group.",
    inputSchema: z.object({
      email: z.string().email().describe("Email address of the beta tester"),
      first_name: z.string().optional().describe("Tester's first name"),
      last_name: z.string().optional().describe("Tester's last name"),
      beta_group_id: z.string().describe("The beta group ID to add the tester to"),
    }),
    handler: async (input: {
      email: string;
      first_name?: string;
      last_name?: string;
      beta_group_id: string;
    }) => {
      const body = {
        data: {
          type: "betaTesters",
          attributes: {
            email: input.email,
            firstName: input.first_name,
            lastName: input.last_name,
          },
          relationships: {
            betaGroups: {
              data: [
                {
                  type: "betaGroups",
                  id: input.beta_group_id,
                },
              ],
            },
          },
        },
      };

      const response = await post<BetaTester>("/betaTesters", body);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: true,
                tester: {
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

  remove_beta_tester: {
    description:
      "Remove a beta tester from TestFlight entirely. This deletes the tester from all beta groups.",
    inputSchema: z.object({
      tester_id: z.string().describe("The beta tester ID to remove"),
    }),
    handler: async (input: { tester_id: string }) => {
      await del(`/betaTesters/${input.tester_id}`);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: true,
                message: "Beta tester removed successfully",
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  list_beta_groups: {
    description:
      "List beta groups for an app. Returns group name, whether it's internal, public link info, and creation date.",
    inputSchema: z.object({
      app_id: z.string().describe("The App Store Connect app ID"),
      is_internal: z.boolean().optional().describe("Filter by internal/external group type"),
      limit: z.number().min(1).max(200).default(50).describe("Maximum number of groups to return"),
    }),
    handler: async (input: { app_id: string; is_internal?: boolean; limit?: number }) => {
      const params: Record<string, string | undefined> = {
        "filter[app]": input.app_id,
        limit: String(input.limit ?? 50),
      };

      if (input.is_internal !== undefined) {
        params["filter[isInternalGroup]"] = String(input.is_internal);
      }

      const response = await get<BetaGroup[]>("/betaGroups", params);

      const groups = response.data.map((group) => ({
        id: group.id,
        ...group.attributes,
      }));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ groups, total: groups.length }, null, 2),
          },
        ],
      };
    },
  },
};
