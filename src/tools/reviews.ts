import { z } from "zod";
import { get, post, patch, del } from "../client/api-client.js";

// Types
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

interface CustomerReviewResponse {
  type: "customerReviewResponses";
  id: string;
  attributes: {
    responseBody: string;
    lastModifiedDate: string;
    state: string;
  };
}

export const reviewsTools = {
  list_reviews: {
    description:
      "List customer reviews for an app. Returns rating, title, body, reviewer nickname, date, and territory.",
    inputSchema: z.object({
      app_id: z.string().describe("The App Store Connect app ID"),
      rating: z
        .array(z.enum(["1", "2", "3", "4", "5"]))
        .optional()
        .describe("Filter by rating (1-5 stars)"),
      territory: z.string().optional().describe("Filter by territory code (e.g., USA, GBR, JPN)"),
      sort: z
        .enum(["createdDate", "-createdDate", "rating", "-rating"])
        .default("-createdDate")
        .describe("Sort order (prefix with - for descending)"),
      limit: z.number().min(1).max(200).default(50).describe("Maximum number of reviews to return"),
    }),
    handler: async (input: {
      app_id: string;
      rating?: string[];
      territory?: string;
      sort?: string;
      limit?: number;
    }) => {
      const params: Record<string, string | string[] | undefined> = {
        sort: input.sort ?? "-createdDate",
        limit: String(input.limit ?? 50),
      };

      if (input.rating && input.rating.length > 0) {
        params["filter[rating]"] = input.rating;
      }
      if (input.territory) {
        params["filter[territory]"] = input.territory;
      }

      const response = await get<CustomerReview[]>(`/apps/${input.app_id}/customerReviews`, params);

      const reviews = response.data.map((review) => ({
        id: review.id,
        ...review.attributes,
      }));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ reviews, total: reviews.length }, null, 2),
          },
        ],
      };
    },
  },

  get_review: {
    description: "Get a specific customer review with optional response information.",
    inputSchema: z.object({
      review_id: z.string().describe("The customer review ID"),
      include_response: z
        .boolean()
        .default(true)
        .describe("Include the developer response if one exists"),
    }),
    handler: async (input: { review_id: string; include_response?: boolean }) => {
      const params: Record<string, string | undefined> = {};

      if (input.include_response !== false) {
        params.include = "response";
      }

      const response = await get<CustomerReview>(`/customerReviews/${input.review_id}`, params);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                id: response.data.id,
                ...response.data.attributes,
                response: response.included?.[0],
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  respond_to_review: {
    description:
      "Create or update a response to a customer review. Only one response per review is allowed.",
    inputSchema: z.object({
      review_id: z.string().describe("The customer review ID to respond to"),
      response_body: z.string().max(5970).describe("The response text (max 5970 characters)"),
    }),
    handler: async (input: { review_id: string; response_body: string }) => {
      // First, check if a response already exists
      const existingResponse = await get<CustomerReview>(`/customerReviews/${input.review_id}`, {
        include: "response",
      });

      const responseData = existingResponse.included?.find(
        (inc: unknown) => (inc as { type: string }).type === "customerReviewResponses"
      ) as CustomerReviewResponse | undefined;

      if (responseData) {
        // Update existing response
        const body = {
          data: {
            type: "customerReviewResponses",
            id: responseData.id,
            attributes: {
              responseBody: input.response_body,
            },
          },
        };

        const response = await patch<CustomerReviewResponse>(
          `/customerReviewResponses/${responseData.id}`,
          body
        );

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  action: "updated",
                  response: {
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
      } else {
        // Create new response
        const body = {
          data: {
            type: "customerReviewResponses",
            attributes: {
              responseBody: input.response_body,
            },
            relationships: {
              review: {
                data: {
                  type: "customerReviews",
                  id: input.review_id,
                },
              },
            },
          },
        };

        const response = await post<CustomerReviewResponse>("/customerReviewResponses", body);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  action: "created",
                  response: {
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
      }
    },
  },

  delete_review_response: {
    description: "Delete a response to a customer review.",
    inputSchema: z.object({
      response_id: z.string().describe("The customer review response ID"),
    }),
    handler: async (input: { response_id: string }) => {
      await del(`/customerReviewResponses/${input.response_id}`);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: true,
                message: "Review response deleted successfully",
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
