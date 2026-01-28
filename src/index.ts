#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { validateConfig } from "./config.js";
import { formatErrorForMcp } from "./utils/error-handler.js";

// Import tools
import { appsTools } from "./tools/apps.js";
import { testflightTools } from "./tools/testflight.js";
import { reviewsTools } from "./tools/reviews.js";
import { analyticsTools } from "./tools/analytics.js";
import { versionsTools } from "./tools/versions.js";
import { subscriptionsTools } from "./tools/subscriptions.js";
import { metadataTools } from "./tools/metadata.js";
import { buildsTools } from "./tools/builds.js";
import { reviewTools } from "./tools/review.js";
import { pricingTools } from "./tools/pricing.js";

// Import resources
import { appResources, appResourceTemplates } from "./resources/app-info.js";

// Create MCP server
const server = new McpServer({
  name: "mcp-appstore-connect",
  version: "1.1.0",
});

/**
 * Wrap a tool handler with error handling.
 */
function wrapHandler<T, R>(
  handler: (input: T) => Promise<R>
): (input: T) => Promise<R | { content: Array<{ type: "text"; text: string }>; isError: true }> {
  return async (input: T) => {
    try {
      return await handler(input);
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: formatErrorForMcp(error),
          },
        ],
        isError: true as const,
      };
    }
  };
}

/**
 * Register all tools with the MCP server.
 */
function registerTools() {
  // Apps tools
  server.tool(
    "list_apps",
    appsTools.list_apps.description,
    appsTools.list_apps.inputSchema.shape,
    wrapHandler(appsTools.list_apps.handler)
  );

  server.tool(
    "get_app",
    appsTools.get_app.description,
    appsTools.get_app.inputSchema.shape,
    wrapHandler(appsTools.get_app.handler)
  );

  server.tool(
    "get_app_versions",
    appsTools.get_app_versions.description,
    appsTools.get_app_versions.inputSchema.shape,
    wrapHandler(appsTools.get_app_versions.handler)
  );

  // TestFlight tools
  server.tool(
    "list_builds",
    testflightTools.list_builds.description,
    testflightTools.list_builds.inputSchema.shape,
    wrapHandler(testflightTools.list_builds.handler)
  );

  server.tool(
    "get_build",
    testflightTools.get_build.description,
    testflightTools.get_build.inputSchema.shape,
    wrapHandler(testflightTools.get_build.handler)
  );

  server.tool(
    "list_beta_testers",
    testflightTools.list_beta_testers.description,
    testflightTools.list_beta_testers.inputSchema.shape,
    wrapHandler(testflightTools.list_beta_testers.handler)
  );

  server.tool(
    "add_beta_tester",
    testflightTools.add_beta_tester.description,
    testflightTools.add_beta_tester.inputSchema.shape,
    wrapHandler(testflightTools.add_beta_tester.handler)
  );

  server.tool(
    "remove_beta_tester",
    testflightTools.remove_beta_tester.description,
    testflightTools.remove_beta_tester.inputSchema.shape,
    wrapHandler(testflightTools.remove_beta_tester.handler)
  );

  server.tool(
    "list_beta_groups",
    testflightTools.list_beta_groups.description,
    testflightTools.list_beta_groups.inputSchema.shape,
    wrapHandler(testflightTools.list_beta_groups.handler)
  );

  // Reviews tools
  server.tool(
    "list_reviews",
    reviewsTools.list_reviews.description,
    reviewsTools.list_reviews.inputSchema.shape,
    wrapHandler(reviewsTools.list_reviews.handler)
  );

  server.tool(
    "get_review",
    reviewsTools.get_review.description,
    reviewsTools.get_review.inputSchema.shape,
    wrapHandler(reviewsTools.get_review.handler)
  );

  server.tool(
    "respond_to_review",
    reviewsTools.respond_to_review.description,
    reviewsTools.respond_to_review.inputSchema.shape,
    wrapHandler(reviewsTools.respond_to_review.handler)
  );

  server.tool(
    "delete_review_response",
    reviewsTools.delete_review_response.description,
    reviewsTools.delete_review_response.inputSchema.shape,
    wrapHandler(reviewsTools.delete_review_response.handler)
  );

  // Analytics tools
  server.tool(
    "list_analytics_report_requests",
    analyticsTools.list_analytics_report_requests.description,
    analyticsTools.list_analytics_report_requests.inputSchema.shape,
    wrapHandler(analyticsTools.list_analytics_report_requests.handler)
  );

  server.tool(
    "create_analytics_report_request",
    analyticsTools.create_analytics_report_request.description,
    analyticsTools.create_analytics_report_request.inputSchema.shape,
    wrapHandler(analyticsTools.create_analytics_report_request.handler)
  );

  server.tool(
    "list_analytics_reports",
    analyticsTools.list_analytics_reports.description,
    analyticsTools.list_analytics_reports.inputSchema.shape,
    wrapHandler(analyticsTools.list_analytics_reports.handler)
  );

  server.tool(
    "get_sales_reports_info",
    analyticsTools.get_sales_reports_info.description,
    analyticsTools.get_sales_reports_info.inputSchema.shape,
    wrapHandler(analyticsTools.get_sales_reports_info.handler)
  );

  server.tool(
    "get_finance_reports_info",
    analyticsTools.get_finance_reports_info.description,
    analyticsTools.get_finance_reports_info.inputSchema.shape,
    wrapHandler(analyticsTools.get_finance_reports_info.handler)
  );

  // Versions tools
  server.tool(
    "create_app_version",
    versionsTools.create_app_version.description,
    versionsTools.create_app_version.inputSchema.shape,
    wrapHandler(versionsTools.create_app_version.handler)
  );

  server.tool(
    "update_app_version",
    versionsTools.update_app_version.description,
    versionsTools.update_app_version.inputSchema.shape,
    wrapHandler(versionsTools.update_app_version.handler)
  );

  server.tool(
    "submit_for_review",
    versionsTools.submit_for_review.description,
    versionsTools.submit_for_review.inputSchema.shape,
    wrapHandler(versionsTools.submit_for_review.handler)
  );

  server.tool(
    "get_app_store_state",
    versionsTools.get_app_store_state.description,
    versionsTools.get_app_store_state.inputSchema.shape,
    wrapHandler(versionsTools.get_app_store_state.handler)
  );

  server.tool(
    "get_version_localization",
    versionsTools.get_version_localization.description,
    versionsTools.get_version_localization.inputSchema.shape,
    wrapHandler(versionsTools.get_version_localization.handler)
  );

  // Subscriptions tools
  server.tool(
    "list_subscription_groups",
    subscriptionsTools.list_subscription_groups.description,
    subscriptionsTools.list_subscription_groups.inputSchema.shape,
    wrapHandler(subscriptionsTools.list_subscription_groups.handler)
  );

  server.tool(
    "list_subscriptions",
    subscriptionsTools.list_subscriptions.description,
    subscriptionsTools.list_subscriptions.inputSchema.shape,
    wrapHandler(subscriptionsTools.list_subscriptions.handler)
  );

  server.tool(
    "get_subscription",
    subscriptionsTools.get_subscription.description,
    subscriptionsTools.get_subscription.inputSchema.shape,
    wrapHandler(subscriptionsTools.get_subscription.handler)
  );

  server.tool(
    "list_in_app_purchases",
    subscriptionsTools.list_in_app_purchases.description,
    subscriptionsTools.list_in_app_purchases.inputSchema.shape,
    wrapHandler(subscriptionsTools.list_in_app_purchases.handler)
  );

  server.tool(
    "get_in_app_purchase",
    subscriptionsTools.get_in_app_purchase.description,
    subscriptionsTools.get_in_app_purchase.inputSchema.shape,
    wrapHandler(subscriptionsTools.get_in_app_purchase.handler)
  );

  server.tool(
    "get_subscription_prices",
    subscriptionsTools.get_subscription_prices.description,
    subscriptionsTools.get_subscription_prices.inputSchema.shape,
    wrapHandler(subscriptionsTools.get_subscription_prices.handler)
  );

  // Metadata tools (App Store version localizations and app info localizations)
  server.tool(
    "update_version_localization",
    metadataTools.update_version_localization.description,
    metadataTools.update_version_localization.inputSchema.shape,
    wrapHandler(metadataTools.update_version_localization.handler)
  );

  server.tool(
    "create_version_localization",
    metadataTools.create_version_localization.description,
    metadataTools.create_version_localization.inputSchema.shape,
    wrapHandler(metadataTools.create_version_localization.handler)
  );

  server.tool(
    "get_app_info",
    metadataTools.get_app_info.description,
    metadataTools.get_app_info.inputSchema.shape,
    wrapHandler(metadataTools.get_app_info.handler)
  );

  server.tool(
    "list_app_info_localizations",
    metadataTools.list_app_info_localizations.description,
    metadataTools.list_app_info_localizations.inputSchema.shape,
    wrapHandler(metadataTools.list_app_info_localizations.handler)
  );

  server.tool(
    "update_app_info_localization",
    metadataTools.update_app_info_localization.description,
    metadataTools.update_app_info_localization.inputSchema.shape,
    wrapHandler(metadataTools.update_app_info_localization.handler)
  );

  server.tool(
    "create_app_info_localization",
    metadataTools.create_app_info_localization.description,
    metadataTools.create_app_info_localization.inputSchema.shape,
    wrapHandler(metadataTools.create_app_info_localization.handler)
  );

  // Build management tools
  server.tool(
    "update_build",
    buildsTools.update_build.description,
    buildsTools.update_build.inputSchema.shape,
    wrapHandler(buildsTools.update_build.handler)
  );

  server.tool(
    "set_build_for_version",
    buildsTools.set_build_for_version.description,
    buildsTools.set_build_for_version.inputSchema.shape,
    wrapHandler(buildsTools.set_build_for_version.handler)
  );

  server.tool(
    "submit_build_for_beta_review",
    buildsTools.submit_build_for_beta_review.description,
    buildsTools.submit_build_for_beta_review.inputSchema.shape,
    wrapHandler(buildsTools.submit_build_for_beta_review.handler)
  );

  server.tool(
    "get_beta_review_status",
    buildsTools.get_beta_review_status.description,
    buildsTools.get_beta_review_status.inputSchema.shape,
    wrapHandler(buildsTools.get_beta_review_status.handler)
  );

  server.tool(
    "list_beta_build_localizations",
    buildsTools.list_beta_build_localizations.description,
    buildsTools.list_beta_build_localizations.inputSchema.shape,
    wrapHandler(buildsTools.list_beta_build_localizations.handler)
  );

  server.tool(
    "update_beta_build_localization",
    buildsTools.update_beta_build_localization.description,
    buildsTools.update_beta_build_localization.inputSchema.shape,
    wrapHandler(buildsTools.update_beta_build_localization.handler)
  );

  server.tool(
    "create_beta_build_localization",
    buildsTools.create_beta_build_localization.description,
    buildsTools.create_beta_build_localization.inputSchema.shape,
    wrapHandler(buildsTools.create_beta_build_localization.handler)
  );

  server.tool(
    "add_build_to_beta_group",
    buildsTools.add_build_to_beta_group.description,
    buildsTools.add_build_to_beta_group.inputSchema.shape,
    wrapHandler(buildsTools.add_build_to_beta_group.handler)
  );

  server.tool(
    "remove_build_from_beta_group",
    buildsTools.remove_build_from_beta_group.description,
    buildsTools.remove_build_from_beta_group.inputSchema.shape,
    wrapHandler(buildsTools.remove_build_from_beta_group.handler)
  );

  // App review and submission tools
  server.tool(
    "get_app_store_review_detail",
    reviewTools.get_app_store_review_detail.description,
    reviewTools.get_app_store_review_detail.inputSchema.shape,
    wrapHandler(reviewTools.get_app_store_review_detail.handler)
  );

  server.tool(
    "update_app_store_review_detail",
    reviewTools.update_app_store_review_detail.description,
    reviewTools.update_app_store_review_detail.inputSchema.shape,
    wrapHandler(reviewTools.update_app_store_review_detail.handler)
  );

  server.tool(
    "create_app_store_review_detail",
    reviewTools.create_app_store_review_detail.description,
    reviewTools.create_app_store_review_detail.inputSchema.shape,
    wrapHandler(reviewTools.create_app_store_review_detail.handler)
  );

  server.tool(
    "get_age_rating_declaration",
    reviewTools.get_age_rating_declaration.description,
    reviewTools.get_age_rating_declaration.inputSchema.shape,
    wrapHandler(reviewTools.get_age_rating_declaration.handler)
  );

  server.tool(
    "update_age_rating_declaration",
    reviewTools.update_age_rating_declaration.description,
    reviewTools.update_age_rating_declaration.inputSchema.shape,
    wrapHandler(reviewTools.update_age_rating_declaration.handler)
  );

  server.tool(
    "get_phased_release",
    reviewTools.get_phased_release.description,
    reviewTools.get_phased_release.inputSchema.shape,
    wrapHandler(reviewTools.get_phased_release.handler)
  );

  server.tool(
    "create_phased_release",
    reviewTools.create_phased_release.description,
    reviewTools.create_phased_release.inputSchema.shape,
    wrapHandler(reviewTools.create_phased_release.handler)
  );

  server.tool(
    "update_phased_release",
    reviewTools.update_phased_release.description,
    reviewTools.update_phased_release.inputSchema.shape,
    wrapHandler(reviewTools.update_phased_release.handler)
  );

  server.tool(
    "delete_phased_release",
    reviewTools.delete_phased_release.description,
    reviewTools.delete_phased_release.inputSchema.shape,
    wrapHandler(reviewTools.delete_phased_release.handler)
  );

  // Pricing and categories tools
  server.tool(
    "list_app_categories",
    pricingTools.list_app_categories.description,
    pricingTools.list_app_categories.inputSchema.shape,
    wrapHandler(pricingTools.list_app_categories.handler)
  );

  server.tool(
    "update_app_categories",
    pricingTools.update_app_categories.description,
    pricingTools.update_app_categories.inputSchema.shape,
    wrapHandler(pricingTools.update_app_categories.handler)
  );

  server.tool(
    "list_territories",
    pricingTools.list_territories.description,
    pricingTools.list_territories.inputSchema.shape,
    wrapHandler(pricingTools.list_territories.handler)
  );

  server.tool(
    "list_app_price_points",
    pricingTools.list_app_price_points.description,
    pricingTools.list_app_price_points.inputSchema.shape,
    wrapHandler(pricingTools.list_app_price_points.handler)
  );

  server.tool(
    "get_app_price_schedule",
    pricingTools.get_app_price_schedule.description,
    pricingTools.get_app_price_schedule.inputSchema.shape,
    wrapHandler(pricingTools.get_app_price_schedule.handler)
  );

  server.tool(
    "set_app_price_schedule",
    pricingTools.set_app_price_schedule.description,
    pricingTools.set_app_price_schedule.inputSchema.shape,
    wrapHandler(pricingTools.set_app_price_schedule.handler)
  );

  server.tool(
    "get_app_availability",
    pricingTools.get_app_availability.description,
    pricingTools.get_app_availability.inputSchema.shape,
    wrapHandler(pricingTools.get_app_availability.handler)
  );

  server.tool(
    "set_app_availability",
    pricingTools.set_app_availability.description,
    pricingTools.set_app_availability.inputSchema.shape,
    wrapHandler(pricingTools.set_app_availability.handler)
  );
}

/**
 * Register resources with the MCP server.
 */
function registerResources() {
  // Static resources
  for (const [uri, resource] of Object.entries(appResources)) {
    server.resource(uri, resource.name, async () => ({
      contents: [
        {
          uri,
          mimeType: resource.mimeType,
          text: await resource.handler(),
        },
      ],
    }));
  }

  // Resource templates
  server.resource("appstore://apps/{appId}", "App Details", async (uri) => {
    const match = uri.href.match(/appstore:\/\/apps\/([^/]+)$/);
    if (!match) {
      throw new Error("Invalid app URI format");
    }
    const template = appResourceTemplates["appstore://apps/{appId}"];
    const text = await template.handler({ appId: match[1] });
    return {
      contents: [
        {
          uri: uri.href,
          mimeType: template.mimeType,
          text,
        },
      ],
    };
  });

  server.resource("appstore://apps/{appId}/reviews", "App Reviews", async (uri) => {
    const match = uri.href.match(/appstore:\/\/apps\/([^/]+)\/reviews$/);
    if (!match) {
      throw new Error("Invalid reviews URI format");
    }
    const template = appResourceTemplates["appstore://apps/{appId}/reviews"];
    const text = await template.handler({ appId: match[1] });
    return {
      contents: [
        {
          uri: uri.href,
          mimeType: template.mimeType,
          text,
        },
      ],
    };
  });
}

/**
 * Main entry point.
 */
async function main() {
  // Validate configuration on startup
  try {
    validateConfig();
  } catch (error) {
    console.error("Configuration error:", error instanceof Error ? error.message : error);
    console.error("\nPlease set the following environment variables:");
    console.error("  APP_STORE_ISSUER_ID - Your Issuer ID from App Store Connect");
    console.error("  APP_STORE_KEY_ID - The Key ID from your API key");
    console.error("  APP_STORE_PRIVATE_KEY - Contents of the .p8 private key file");
    console.error("  (or APP_STORE_PRIVATE_KEY_PATH - Path to the .p8 file)");
    process.exit(1);
  }

  // Register tools and resources
  registerTools();
  registerResources();

  // Connect to STDIO transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("MCP App Store Connect server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
