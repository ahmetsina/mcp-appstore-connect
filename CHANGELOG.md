# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2025-01-28

### Added
- Comprehensive installation instructions for multiple AI agents:
  - Claude Code (CLI and manual)
  - Cursor
  - Windsurf
  - Claude Desktop
- Required environment variables table
- Troubleshooting section
- npm and license badges

### Changed
- Improved README structure and documentation
- Updated server version to 1.2.0

## [1.1.0] - 2025-01-28

### Added
- 31 new "set" function tools for modifying App Store Connect data
- **Metadata Tools** (6 tools):
  - `update_version_localization` - Update App Store version localization (description, keywords, what's new, promotional text, URLs)
  - `create_version_localization` - Create new version localization for a new language
  - `get_app_info` - Get app info ID needed for app-level localizations
  - `list_app_info_localizations` - List app info localizations (name, subtitle, privacy policy)
  - `update_app_info_localization` - Update app info localization (app name, subtitle, privacy policy)
  - `create_app_info_localization` - Create app info localization for a new language
- **Build Management Tools** (9 tools):
  - `update_build` - Update build attributes (export compliance/encryption)
  - `set_build_for_version` - Associate a build with an App Store version
  - `submit_build_for_beta_review` - Submit build for TestFlight beta review
  - `get_beta_review_status` - Get beta app review submission status
  - `list_beta_build_localizations` - List "What to Test" notes for a build
  - `update_beta_build_localization` - Update "What to Test" notes
  - `create_beta_build_localization` - Create "What to Test" notes for new locale
  - `add_build_to_beta_group` - Add build to TestFlight beta group
  - `remove_build_from_beta_group` - Remove build from beta group
- **App Review & Submission Tools** (9 tools):
  - `get_app_store_review_detail` - Get review details (contact info, demo account, notes)
  - `update_app_store_review_detail` - Update review details for submission
  - `create_app_store_review_detail` - Create review details for a version
  - `get_age_rating_declaration` - Get age rating settings
  - `update_age_rating_declaration` - Update age rating content declarations
  - `get_phased_release` - Get phased release status
  - `create_phased_release` - Create phased release (gradual rollout)
  - `update_phased_release` - Pause, resume, or complete phased release
  - `delete_phased_release` - Delete phased release configuration
- **Pricing & Categories Tools** (8 tools):
  - `list_app_categories` - List available App Store categories
  - `update_app_categories` - Update app's primary/secondary categories
  - `list_territories` - List all territories with currency codes
  - `list_app_price_points` - List price points for an app in a territory
  - `get_app_price_schedule` - Get current price schedule
  - `set_app_price_schedule` - Set app pricing
  - `get_app_availability` - Get territories where app is available
  - `set_app_availability` - Set app availability by territory

### Changed
- API client `del` function now supports request body for relationship deletions
- Total tool count increased from 23 to 54

## [1.0.0] - 2025-01-28

### Added
- Initial release of MCP App Store Connect server
- JWT authentication with token caching
- API client with retry logic and rate limiting
- 23 tools across 6 categories:
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

[Unreleased]: https://github.com/ahmetsina/mcp-appstore-connect/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/ahmetsina/mcp-appstore-connect/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/ahmetsina/mcp-appstore-connect/releases/tag/v1.0.0
