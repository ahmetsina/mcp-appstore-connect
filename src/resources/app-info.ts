import { get } from "../client/api-client.js";

// Types
interface App {
  type: "apps";
  id: string;
  attributes: {
    name: string;
    bundleId: string;
    sku: string;
    primaryLocale: string;
  };
}

interface CustomerReview {
  type: "customerReviews";
  id: string;
  attributes: {
    rating: number;
    title?: string;
    body?: string;
    reviewerNickname: string;
    createdDate: string;
    territory: string;
  };
}

/**
 * MCP Resource definitions for App Store Connect data.
 */
export const appResources = {
  /**
   * List all apps - returns a summary of all apps in the account.
   */
  "appstore://apps": {
    name: "All Apps",
    description: "List of all apps in your App Store Connect account",
    mimeType: "application/json",
    handler: async () => {
      const response = await get<App[]>("/apps", { limit: "200" });

      const apps = response.data.map((app) => ({
        id: app.id,
        name: app.attributes.name,
        bundleId: app.attributes.bundleId,
        sku: app.attributes.sku,
        uri: `appstore://apps/${app.id}`,
      }));

      return JSON.stringify({ apps, total: apps.length }, null, 2);
    },
  },
};

/**
 * Dynamic resource templates for parameterized resources.
 */
export const appResourceTemplates = {
  /**
   * Get details for a specific app.
   */
  "appstore://apps/{appId}": {
    name: "App Details",
    description: "Detailed information about a specific app",
    mimeType: "application/json",
    handler: async (params: { appId: string }) => {
      const response = await get<App>(`/apps/${params.appId}`, {
        include: "appStoreVersions",
      });

      interface VersionData {
        id: string;
        attributes: {
          versionString: string;
          appStoreState: string;
          platform: string;
        };
      }

      const versions = (response.included as VersionData[] | undefined)?.map((v) => ({
        id: v.id,
        version: v.attributes.versionString,
        state: v.attributes.appStoreState,
        platform: v.attributes.platform,
      }));

      return JSON.stringify(
        {
          id: response.data.id,
          ...response.data.attributes,
          versions,
        },
        null,
        2
      );
    },
  },

  /**
   * Get reviews for a specific app.
   */
  "appstore://apps/{appId}/reviews": {
    name: "App Reviews",
    description: "Customer reviews for a specific app",
    mimeType: "application/json",
    handler: async (params: { appId: string }) => {
      const response = await get<CustomerReview[]>(`/apps/${params.appId}/customerReviews`, {
        limit: "50",
        sort: "-createdDate",
      });

      const reviews = response.data.map((review) => ({
        id: review.id,
        rating: review.attributes.rating,
        title: review.attributes.title,
        body: review.attributes.body,
        reviewer: review.attributes.reviewerNickname,
        date: review.attributes.createdDate,
        territory: review.attributes.territory,
      }));

      return JSON.stringify({ reviews, total: reviews.length }, null, 2);
    },
  },
};
