import { z } from "zod";
import { get, post, patch } from "../client/api-client.js";

// Types
interface AppCategory {
  type: "appCategories";
  id: string;
  attributes: {
    platforms: string[];
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
  relationships?: {
    primaryCategory?: { data: { type: string; id: string } | null };
    primarySubcategoryOne?: { data: { type: string; id: string } | null };
    primarySubcategoryTwo?: { data: { type: string; id: string } | null };
    secondaryCategory?: { data: { type: string; id: string } | null };
    secondarySubcategoryOne?: { data: { type: string; id: string } | null };
    secondarySubcategoryTwo?: { data: { type: string; id: string } | null };
  };
}

interface Territory {
  type: "territories";
  id: string;
  attributes: {
    currency: string;
  };
}

interface AppPricePoint {
  type: "appPricePoints";
  id: string;
  attributes: {
    customerPrice: string;
    proceeds: string;
    priceTier?: string;
  };
}

interface AppPriceSchedule {
  type: "appPriceSchedules";
  id: string;
}

export const pricingTools = {
  // ============================================
  // App Category Tools
  // ============================================

  list_app_categories: {
    description:
      "List all available App Store categories. Use this to find category IDs for updating your app's categorization.",
    inputSchema: z.object({
      platform: z
        .enum(["IOS", "MAC_OS", "TV_OS"])
        .optional()
        .describe("Filter categories by platform"),
      limit: z.number().min(1).max(200).default(200).describe("Number of categories to return"),
    }),
    handler: async (input: { platform?: string; limit?: number }) => {
      const params: Record<string, string | undefined> = {
        limit: String(input.limit ?? 200),
      };

      if (input.platform) {
        params["filter[platforms]"] = input.platform;
      }

      const response = await get<AppCategory[]>("/appCategories", params);

      const categories = response.data.map((cat) => ({
        id: cat.id,
        platforms: cat.attributes.platforms,
      }));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                categories,
                total: categories.length,
                note: "Category IDs are like 'GAMES', 'BUSINESS', 'EDUCATION', etc.",
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  update_app_categories: {
    description:
      "Update an app's primary and secondary categories. Get the app info ID from get_app_info first.",
    inputSchema: z.object({
      app_info_id: z.string().describe("The App Info ID (from get_app_info)"),
      primary_category_id: z
        .string()
        .optional()
        .describe("Primary category ID (e.g., GAMES, BUSINESS, EDUCATION)"),
      primary_subcategory_one_id: z
        .string()
        .optional()
        .describe("Primary subcategory 1 ID (for Games category)"),
      primary_subcategory_two_id: z
        .string()
        .optional()
        .describe("Primary subcategory 2 ID (for Games category)"),
      secondary_category_id: z.string().optional().describe("Secondary category ID"),
      secondary_subcategory_one_id: z.string().optional().describe("Secondary subcategory 1 ID"),
      secondary_subcategory_two_id: z.string().optional().describe("Secondary subcategory 2 ID"),
    }),
    handler: async (input: {
      app_info_id: string;
      primary_category_id?: string;
      primary_subcategory_one_id?: string;
      primary_subcategory_two_id?: string;
      secondary_category_id?: string;
      secondary_subcategory_one_id?: string;
      secondary_subcategory_two_id?: string;
    }) => {
      const relationships: Record<string, { data: { type: string; id: string } | null }> = {};

      if (input.primary_category_id !== undefined) {
        relationships.primaryCategory = input.primary_category_id
          ? { data: { type: "appCategories", id: input.primary_category_id } }
          : { data: null };
      }
      if (input.primary_subcategory_one_id !== undefined) {
        relationships.primarySubcategoryOne = input.primary_subcategory_one_id
          ? { data: { type: "appCategories", id: input.primary_subcategory_one_id } }
          : { data: null };
      }
      if (input.primary_subcategory_two_id !== undefined) {
        relationships.primarySubcategoryTwo = input.primary_subcategory_two_id
          ? { data: { type: "appCategories", id: input.primary_subcategory_two_id } }
          : { data: null };
      }
      if (input.secondary_category_id !== undefined) {
        relationships.secondaryCategory = input.secondary_category_id
          ? { data: { type: "appCategories", id: input.secondary_category_id } }
          : { data: null };
      }
      if (input.secondary_subcategory_one_id !== undefined) {
        relationships.secondarySubcategoryOne = input.secondary_subcategory_one_id
          ? { data: { type: "appCategories", id: input.secondary_subcategory_one_id } }
          : { data: null };
      }
      if (input.secondary_subcategory_two_id !== undefined) {
        relationships.secondarySubcategoryTwo = input.secondary_subcategory_two_id
          ? { data: { type: "appCategories", id: input.secondary_subcategory_two_id } }
          : { data: null };
      }

      const body = {
        data: {
          type: "appInfos",
          id: input.app_info_id,
          relationships,
        },
      };

      const response = await patch<AppInfo>(`/appInfos/${input.app_info_id}`, body);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: true,
                appInfo: {
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
  // Territory & Price Point Tools
  // ============================================

  list_territories: {
    description: "List all App Store territories (countries/regions) with their currency codes.",
    inputSchema: z.object({
      limit: z.number().min(1).max(200).default(200).describe("Number of territories to return"),
    }),
    handler: async (input: { limit?: number }) => {
      const params: Record<string, string> = {
        limit: String(input.limit ?? 200),
      };

      const response = await get<Territory[]>("/territories", params);

      const territories = response.data.map((t) => ({
        id: t.id,
        currency: t.attributes.currency,
      }));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                territories,
                total: territories.length,
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  list_app_price_points: {
    description:
      "List available price points for an app in a specific territory. Use this to find the price point ID for setting prices.",
    inputSchema: z.object({
      app_id: z.string().describe("The App Store Connect app ID"),
      territory: z.string().default("USA").describe("Territory code (e.g., USA, GBR, JPN, DEU)"),
      limit: z.number().min(1).max(200).default(50).describe("Number of price points to return"),
    }),
    handler: async (input: { app_id: string; territory?: string; limit?: number }) => {
      const params: Record<string, string> = {
        "filter[territory]": input.territory ?? "USA",
        include: "territory",
        limit: String(input.limit ?? 50),
      };

      const response = await get<AppPricePoint[]>(`/apps/${input.app_id}/appPricePoints`, params);

      const pricePoints = response.data.map((pp) => ({
        id: pp.id,
        customerPrice: pp.attributes.customerPrice,
        proceeds: pp.attributes.proceeds,
        priceTier: pp.attributes.priceTier,
      }));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                territory: input.territory ?? "USA",
                pricePoints,
                total: pricePoints.length,
                note: "Use the price point ID when setting app prices",
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  get_app_price_schedule: {
    description: "Get the current price schedule for an app, including base territory and pricing.",
    inputSchema: z.object({
      app_id: z.string().describe("The App Store Connect app ID"),
    }),
    handler: async (input: { app_id: string }) => {
      const params: Record<string, string> = {
        include: "baseTerritory,manualPrices,automaticPrices",
      };

      const response = await get<AppPriceSchedule>(
        `/apps/${input.app_id}/appPriceSchedule`,
        params
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                priceSchedule: response.data
                  ? {
                      id: response.data.id,
                    }
                  : null,
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

  set_app_price_schedule: {
    description:
      "Set the price schedule for an app. This sets the base territory and manual prices. WARNING: This overwrites the existing schedule.",
    inputSchema: z.object({
      app_id: z.string().describe("The App Store Connect app ID"),
      base_territory: z.string().default("USA").describe("Base territory code (e.g., USA, GBR)"),
      price_point_id: z
        .string()
        .describe("Price point ID for the base territory (use list_app_price_points to find)"),
      start_date: z
        .string()
        .optional()
        .describe("When the price takes effect (ISO 8601 date). Omit for immediate."),
    }),
    handler: async (input: {
      app_id: string;
      base_territory?: string;
      price_point_id: string;
      start_date?: string;
    }) => {
      const manualPriceData: Record<string, unknown> = {
        type: "appPrices",
        attributes: {},
        relationships: {
          appPricePoint: {
            data: {
              type: "appPricePoints",
              id: input.price_point_id,
            },
          },
        },
      };

      if (input.start_date) {
        (manualPriceData.attributes as Record<string, unknown>).startDate = input.start_date;
      }

      const body = {
        data: {
          type: "appPriceSchedules",
          relationships: {
            app: {
              data: {
                type: "apps",
                id: input.app_id,
              },
            },
            baseTerritory: {
              data: {
                type: "territories",
                id: input.base_territory ?? "USA",
              },
            },
            manualPrices: {
              data: [manualPriceData],
            },
          },
        },
      };

      const response = await post<AppPriceSchedule>("/appPriceSchedules", body);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: true,
                priceSchedule: {
                  id: response.data.id,
                },
                message:
                  "Price schedule created. Automatic prices for other territories will be calculated based on the base price.",
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
  // App Availability Tools
  // ============================================

  get_app_availability: {
    description: "Get the availability (territories where the app is available) for an app.",
    inputSchema: z.object({
      app_id: z.string().describe("The App Store Connect app ID"),
    }),
    handler: async (input: { app_id: string }) => {
      const params: Record<string, string> = {
        include: "availableTerritories",
        "fields[territories]": "currency",
      };

      interface AppAvailability {
        type: "appAvailabilities";
        id: string;
        attributes: {
          availableInNewTerritories: boolean;
        };
      }

      const response = await get<AppAvailability>(`/apps/${input.app_id}/appAvailability`, params);

      const territories =
        response.included
          ?.filter((item: unknown) => (item as { type: string }).type === "territories")
          .map((t: unknown) => ({
            id: (t as Territory).id,
            currency: (t as Territory).attributes.currency,
          })) ?? [];

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                availability: response.data
                  ? {
                      id: response.data.id,
                      availableInNewTerritories: response.data.attributes.availableInNewTerritories,
                    }
                  : null,
                territories,
                totalTerritories: territories.length,
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  set_app_availability: {
    description:
      "Set app availability and the territories where it should be available. WARNING: This replaces the current availability.",
    inputSchema: z.object({
      app_id: z.string().describe("The App Store Connect app ID"),
      available_in_new_territories: z
        .boolean()
        .default(true)
        .describe("Automatically make app available in new territories Apple adds"),
      territory_ids: z
        .array(z.string())
        .describe(
          "Array of territory codes where app should be available (e.g., ['USA', 'GBR', 'JPN'])"
        ),
    }),
    handler: async (input: {
      app_id: string;
      available_in_new_territories?: boolean;
      territory_ids: string[];
    }) => {
      const body = {
        data: {
          type: "appAvailabilities",
          attributes: {
            availableInNewTerritories: input.available_in_new_territories ?? true,
          },
          relationships: {
            app: {
              data: {
                type: "apps",
                id: input.app_id,
              },
            },
            availableTerritories: {
              data: input.territory_ids.map((id) => ({
                type: "territories",
                id,
              })),
            },
          },
        },
      };

      interface AppAvailability {
        type: "appAvailabilities";
        id: string;
        attributes: {
          availableInNewTerritories: boolean;
        };
      }

      const response = await post<AppAvailability>("/appAvailabilities", body);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: true,
                availability: {
                  id: response.data.id,
                  ...response.data.attributes,
                },
                territoriesSet: input.territory_ids.length,
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
