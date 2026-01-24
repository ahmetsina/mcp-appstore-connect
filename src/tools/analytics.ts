import { z } from "zod";
import { get, post } from "../client/api-client.js";

// Types
interface AnalyticsReportRequest {
  type: "analyticsReportRequests";
  id: string;
  attributes: {
    accessType: string;
    stoppedDueToInactivity: boolean;
  };
}

interface AnalyticsReport {
  type: "analyticsReports";
  id: string;
  attributes: {
    name: string;
    category: string;
  };
}

interface SalesReport {
  vendorNumber: string;
  reportType: string;
  reportSubType: string;
  dateType: string;
  reportDate: string;
}

export const analyticsTools = {
  list_analytics_report_requests: {
    description:
      "List analytics report requests for an app. These are used to access advanced analytics data.",
    inputSchema: z.object({
      app_id: z.string().describe("The App Store Connect app ID"),
      limit: z
        .number()
        .min(1)
        .max(200)
        .default(50)
        .describe("Maximum number of requests to return"),
    }),
    handler: async (input: { app_id: string; limit?: number }) => {
      const params: Record<string, string | undefined> = {
        "filter[app]": input.app_id,
        limit: String(input.limit ?? 50),
      };

      const response = await get<AnalyticsReportRequest[]>(
        "/analyticsReportRequests",
        params
      );

      const requests = response.data.map((req) => ({
        id: req.id,
        ...req.attributes,
      }));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ requests, total: requests.length }, null, 2),
          },
        ],
      };
    },
  },

  create_analytics_report_request: {
    description:
      "Create a new analytics report request for an app. This initiates the generation of analytics reports.",
    inputSchema: z.object({
      app_id: z.string().describe("The App Store Connect app ID"),
      access_type: z
        .enum(["ONE_TIME_SNAPSHOT", "ONGOING"])
        .describe(
          "ONE_TIME_SNAPSHOT for historical data, ONGOING for continuous access"
        ),
    }),
    handler: async (input: { app_id: string; access_type: string }) => {
      const body = {
        data: {
          type: "analyticsReportRequests",
          attributes: {
            accessType: input.access_type,
          },
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

      const response = await post<AnalyticsReportRequest>(
        "/analyticsReportRequests",
        body
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: true,
                request: {
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

  list_analytics_reports: {
    description:
      "List available analytics reports for a report request. Reports contain metrics like downloads, sessions, crashes, etc.",
    inputSchema: z.object({
      report_request_id: z.string().describe("The analytics report request ID"),
      category: z
        .enum([
          "APP_USAGE",
          "APP_STORE_ENGAGEMENT",
          "COMMERCE",
          "FRAMEWORK_USAGE",
          "PERFORMANCE",
        ])
        .optional()
        .describe("Filter by report category"),
      limit: z
        .number()
        .min(1)
        .max(200)
        .default(50)
        .describe("Maximum number of reports to return"),
    }),
    handler: async (input: {
      report_request_id: string;
      category?: string;
      limit?: number;
    }) => {
      const params: Record<string, string | undefined> = {
        limit: String(input.limit ?? 50),
      };

      if (input.category) {
        params["filter[category]"] = input.category;
      }

      const response = await get<AnalyticsReport[]>(
        `/analyticsReportRequests/${input.report_request_id}/reports`,
        params
      );

      const reports = response.data.map((report) => ({
        id: report.id,
        ...report.attributes,
      }));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ reports, total: reports.length }, null, 2),
          },
        ],
      };
    },
  },

  get_sales_reports_info: {
    description:
      "Get information about available sales and trends reports. Note: Actual report download requires handling gzip data.",
    inputSchema: z.object({
      vendor_number: z
        .string()
        .describe("Your vendor number from App Store Connect"),
      report_type: z
        .enum([
          "SALES",
          "PRE_ORDER",
          "NEWSSTAND",
          "SUBSCRIPTION",
          "SUBSCRIPTION_EVENT",
          "SUBSCRIBER",
          "SUBSCRIPTION_OFFER_CODE_REDEMPTION",
          "INSTALLS",
          "FIRST_ANNUAL",
        ])
        .describe("Type of sales report"),
      report_sub_type: z
        .enum(["SUMMARY", "DETAILED", "SUMMARY_INSTALL_TYPE", "SUMMARY_TERRITORY", "SUMMARY_CHANNEL"])
        .describe("Sub-type of the report"),
      frequency: z
        .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
        .describe("Report frequency"),
      report_date: z
        .string()
        .describe("Report date in format YYYY-MM-DD (daily), YYYYMMDD (weekly uses Sunday date), YYYY-MM (monthly)"),
    }),
    handler: async (input: {
      vendor_number: string;
      report_type: string;
      report_sub_type: string;
      frequency: string;
      report_date: string;
    }) => {
      // Note: The actual salesReports endpoint returns gzip-compressed TSV data
      // This tool returns info about the report parameters
      const reportInfo: SalesReport = {
        vendorNumber: input.vendor_number,
        reportType: input.report_type,
        reportSubType: input.report_sub_type,
        dateType: input.frequency,
        reportDate: input.report_date,
      };

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                info: "Sales reports are returned as gzip-compressed TSV files.",
                endpoint: "/salesReports",
                parameters: reportInfo,
                note: "To download the actual report, make a GET request to /salesReports with these filter parameters. The response will be gzip-compressed TSV data.",
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  get_finance_reports_info: {
    description:
      "Get information about available finance reports. Finance reports contain earnings, payments, and tax data.",
    inputSchema: z.object({
      vendor_number: z
        .string()
        .describe("Your vendor number from App Store Connect"),
      region_code: z
        .string()
        .describe("Two-letter region code (e.g., US, EU, JP)"),
      report_type: z
        .enum(["FINANCIAL", "FINANCE_DETAIL"])
        .describe("Type of finance report"),
      fiscal_year: z.string().describe("Fiscal year (e.g., 2024)"),
      fiscal_period: z
        .string()
        .describe("Fiscal period within the year (e.g., 01-12)"),
    }),
    handler: async (input: {
      vendor_number: string;
      region_code: string;
      report_type: string;
      fiscal_year: string;
      fiscal_period: string;
    }) => {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                info: "Finance reports are returned as gzip-compressed TSV files.",
                endpoint: "/financeReports",
                parameters: {
                  vendorNumber: input.vendor_number,
                  regionCode: input.region_code,
                  reportType: input.report_type,
                  fiscalYear: input.fiscal_year,
                  fiscalPeriod: input.fiscal_period,
                },
                note: "To download the actual report, make a GET request to /financeReports with these filter parameters.",
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
