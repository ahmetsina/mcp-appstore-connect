import { z } from "zod";
import { get } from "../client/api-client.js";

// Types
interface SubscriptionGroup {
  type: "subscriptionGroups";
  id: string;
  attributes: {
    referenceName: string;
  };
}

interface Subscription {
  type: "subscriptions";
  id: string;
  attributes: {
    name: string;
    productId: string;
    familySharable: boolean;
    state: string;
    subscriptionPeriod?: string;
    reviewNote?: string;
    groupLevel?: number;
  };
}

interface InAppPurchase {
  type: "inAppPurchases";
  id: string;
  attributes: {
    name: string;
    productId: string;
    inAppPurchaseType: string;
    state: string;
    reviewNote?: string;
  };
}

interface SubscriptionPrice {
  type: "subscriptionPrices";
  id: string;
  attributes: {
    startDate?: string;
    territory?: string;
  };
}

export const subscriptionsTools = {
  list_subscription_groups: {
    description:
      "List subscription groups for an app. Subscription groups contain related subscription products.",
    inputSchema: z.object({
      app_id: z.string().describe("The App Store Connect app ID"),
      limit: z.number().min(1).max(200).default(50).describe("Maximum number of groups to return"),
    }),
    handler: async (input: { app_id: string; limit?: number }) => {
      const params: Record<string, string | undefined> = {
        limit: String(input.limit ?? 50),
      };

      const response = await get<SubscriptionGroup[]>(
        `/apps/${input.app_id}/subscriptionGroups`,
        params
      );

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

  list_subscriptions: {
    description:
      "List subscriptions within a subscription group. Returns subscription name, product ID, state, and period.",
    inputSchema: z.object({
      subscription_group_id: z.string().describe("The subscription group ID"),
      state: z
        .enum([
          "MISSING_METADATA",
          "READY_TO_SUBMIT",
          "WAITING_FOR_REVIEW",
          "IN_REVIEW",
          "DEVELOPER_ACTION_NEEDED",
          "PENDING_BINARY_APPROVAL",
          "APPROVED",
          "DEVELOPER_REMOVED_FROM_SALE",
          "REMOVED_FROM_SALE",
          "REJECTED",
        ])
        .optional()
        .describe("Filter by subscription state"),
      limit: z
        .number()
        .min(1)
        .max(200)
        .default(50)
        .describe("Maximum number of subscriptions to return"),
    }),
    handler: async (input: { subscription_group_id: string; state?: string; limit?: number }) => {
      const params: Record<string, string | undefined> = {
        limit: String(input.limit ?? 50),
      };

      if (input.state) {
        params["filter[state]"] = input.state;
      }

      const response = await get<Subscription[]>(
        `/subscriptionGroups/${input.subscription_group_id}/subscriptions`,
        params
      );

      const subscriptions = response.data.map((sub) => ({
        id: sub.id,
        ...sub.attributes,
      }));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ subscriptions, total: subscriptions.length }, null, 2),
          },
        ],
      };
    },
  },

  get_subscription: {
    description: "Get detailed information about a specific subscription.",
    inputSchema: z.object({
      subscription_id: z.string().describe("The subscription ID"),
      include: z
        .array(
          z.enum([
            "subscriptionLocalizations",
            "appStoreReviewScreenshot",
            "prices",
            "promotionalOffers",
            "offerCodes",
          ])
        )
        .optional()
        .describe("Related resources to include"),
    }),
    handler: async (input: { subscription_id: string; include?: string[] }) => {
      const params: Record<string, string | undefined> = {};

      if (input.include && input.include.length > 0) {
        params.include = input.include.join(",");
      }

      const response = await get<Subscription>(`/subscriptions/${input.subscription_id}`, params);

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

  list_in_app_purchases: {
    description: "List in-app purchases for an app. Returns IAP name, product ID, type, and state.",
    inputSchema: z.object({
      app_id: z.string().describe("The App Store Connect app ID"),
      type: z
        .enum(["CONSUMABLE", "NON_CONSUMABLE", "NON_RENEWING_SUBSCRIPTION"])
        .optional()
        .describe("Filter by in-app purchase type"),
      state: z
        .enum([
          "MISSING_METADATA",
          "WAITING_FOR_UPLOAD",
          "PROCESSING_CONTENT",
          "READY_TO_SUBMIT",
          "WAITING_FOR_REVIEW",
          "IN_REVIEW",
          "DEVELOPER_ACTION_NEEDED",
          "PENDING_BINARY_APPROVAL",
          "APPROVED",
          "DEVELOPER_REMOVED_FROM_SALE",
          "REMOVED_FROM_SALE",
          "REJECTED",
        ])
        .optional()
        .describe("Filter by state"),
      limit: z.number().min(1).max(200).default(50).describe("Maximum number of IAPs to return"),
    }),
    handler: async (input: { app_id: string; type?: string; state?: string; limit?: number }) => {
      const params: Record<string, string | undefined> = {
        limit: String(input.limit ?? 50),
      };

      if (input.type) {
        params["filter[inAppPurchaseType]"] = input.type;
      }
      if (input.state) {
        params["filter[state]"] = input.state;
      }

      const response = await get<InAppPurchase[]>(`/apps/${input.app_id}/inAppPurchasesV2`, params);

      const iaps = response.data.map((iap) => ({
        id: iap.id,
        ...iap.attributes,
      }));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ inAppPurchases: iaps, total: iaps.length }, null, 2),
          },
        ],
      };
    },
  },

  get_in_app_purchase: {
    description: "Get detailed information about a specific in-app purchase.",
    inputSchema: z.object({
      iap_id: z.string().describe("The in-app purchase ID"),
      include: z
        .array(
          z.enum([
            "inAppPurchaseLocalizations",
            "pricePoints",
            "content",
            "appStoreReviewScreenshot",
            "promotedPurchase",
            "iapPriceSchedule",
          ])
        )
        .optional()
        .describe("Related resources to include"),
    }),
    handler: async (input: { iap_id: string; include?: string[] }) => {
      const params: Record<string, string | undefined> = {};

      if (input.include && input.include.length > 0) {
        params.include = input.include.join(",");
      }

      const response = await get<InAppPurchase>(`/inAppPurchases/${input.iap_id}`, params);

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

  get_subscription_prices: {
    description: "Get pricing information for a subscription across different territories.",
    inputSchema: z.object({
      subscription_id: z.string().describe("The subscription ID"),
      territory: z.string().optional().describe("Filter by territory code (e.g., USA, GBR, JPN)"),
      limit: z.number().min(1).max(200).default(50).describe("Maximum number of prices to return"),
    }),
    handler: async (input: { subscription_id: string; territory?: string; limit?: number }) => {
      const params: Record<string, string | undefined> = {
        limit: String(input.limit ?? 50),
      };

      if (input.territory) {
        params["filter[territory]"] = input.territory;
      }

      const response = await get<SubscriptionPrice[]>(
        `/subscriptions/${input.subscription_id}/prices`,
        params
      );

      const prices = response.data.map((price) => ({
        id: price.id,
        ...price.attributes,
      }));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ prices, total: prices.length }, null, 2),
          },
        ],
      };
    },
  },
};
