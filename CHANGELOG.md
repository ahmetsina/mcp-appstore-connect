# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of MCP App Store Connect server
- JWT authentication with token caching
- API client with retry logic and rate limiting
- 26 tools across 6 categories:
  - Apps: list_apps, get_app, get_app_versions
  - TestFlight: list_builds, get_build, list_beta_testers, add_beta_tester, remove_beta_tester, list_beta_groups
  - Reviews: list_reviews, get_review, respond_to_review, delete_review_response
  - Analytics: list_analytics_report_requests, create_analytics_report_request, list_analytics_reports, get_sales_reports_info, get_finance_reports_info
  - Versions: create_app_version, update_app_version, submit_for_review, get_app_store_state, get_version_localization
  - Subscriptions: list_subscription_groups, list_subscriptions, get_subscription, list_in_app_purchases, get_in_app_purchase, get_subscription_prices
- MCP resources for app listing and details
- Comprehensive error handling
- Rate limit tracking and warnings
- TypeScript with strict mode
- Unit tests for critical components
- ESLint and Prettier configuration
- GitHub Actions CI workflow

### Changed
- N/A (initial release)

### Deprecated
- N/A (initial release)

### Removed
- N/A (initial release)

### Fixed
- N/A (initial release)

### Security
- N/A (initial release)

## [1.0.0] - 2024-01-XX

### Added
- Initial release

[Unreleased]: https://github.com/your-username/mcp-appstore-connect/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/your-username/mcp-appstore-connect/releases/tag/v1.0.0
