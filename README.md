# MCP App Store Connect

An MCP (Model Context Protocol) server for Apple's App Store Connect API. This server enables AI assistants to manage iOS/macOS apps, TestFlight, analytics, reviews, subscriptions, and more.

## Features

- **App Management**: List apps, get app details, view app versions
- **TestFlight**: Manage builds, beta testers, and beta groups
- **Customer Reviews**: List reviews, respond to reviews
- **Analytics**: Access sales reports, finance reports, and analytics data
- **Version Management**: Create versions, update metadata, submit for review
- **Subscriptions & IAP**: Manage subscription groups, in-app purchases, and pricing
- **Metadata Management**: Update app descriptions, keywords, what's new, app name, subtitle, privacy policy
- **Build Management**: Set builds for versions, submit for beta review, manage beta localizations
- **App Review**: Configure review details, age ratings, and phased releases
- **Pricing & Availability**: Set app pricing, categories, and territory availability

**54 tools** available for comprehensive App Store Connect automation.

## Prerequisites

1. **Apple Developer Account** with App Store Connect access
2. **API Key** from App Store Connect:
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Navigate to Users and Access > Keys
   - Generate an API key with appropriate permissions
   - Download the .p8 private key file (you can only download it once!)
   - Note your Issuer ID and Key ID

## Installation

### Install from npm (Recommended)

```bash
npm install -g mcp-appstore-connect
```

Or install locally in your project:

```bash
npm install mcp-appstore-connect
```

### Install from source

```bash
# Clone or download this repository
git clone https://github.com/ahmetsina/mcp-appstore-connect.git
cd mcp-appstore-connect

# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Set your credentials:

```env
APP_STORE_ISSUER_ID=your-issuer-id
APP_STORE_KEY_ID=your-key-id

# Option 1: Private key content (replace newlines with \n)
APP_STORE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Option 2: Path to .p8 file
APP_STORE_PRIVATE_KEY_PATH=/path/to/AuthKey_XXXXXXXXXX.p8
```

## Usage with Claude Code

### If installed via npm (global)

Add to your Claude Code MCP settings (`~/.cursor/mcp.json` on macOS):

```json
{
  "mcpServers": {
    "appstore-connect": {
      "command": "npx",
      "args": ["-y", "mcp-appstore-connect"],
      "env": {
        "APP_STORE_ISSUER_ID": "your-issuer-id",
        "APP_STORE_KEY_ID": "your-key-id",
        "APP_STORE_PRIVATE_KEY_PATH": "/path/to/AuthKey.p8"
      }
    }
  }
}
```

### If installed from source

Add to your Claude Code MCP settings:

```json
{
  "mcpServers": {
    "appstore-connect": {
      "command": "node",
      "args": ["/path/to/mcp-appstore-connect/dist/index.js"],
      "env": {
        "APP_STORE_ISSUER_ID": "your-issuer-id",
        "APP_STORE_KEY_ID": "your-key-id",
        "APP_STORE_PRIVATE_KEY_PATH": "/path/to/AuthKey.p8"
      }
    }
  }
}
```

Or run in development mode:

```bash
npm run dev
```

## Available Tools

### Apps
| Tool | Description |
|------|-------------|
| `list_apps` | List all apps in your account |
| `get_app` | Get detailed app information |
| `get_app_versions` | List app versions |

### TestFlight
| Tool | Description |
|------|-------------|
| `list_builds` | List TestFlight builds |
| `get_build` | Get build details |
| `list_beta_testers` | List beta testers |
| `add_beta_tester` | Add tester to beta group |
| `remove_beta_tester` | Remove a beta tester |
| `list_beta_groups` | List beta groups |

### Reviews
| Tool | Description |
|------|-------------|
| `list_reviews` | Get customer reviews |
| `get_review` | Get specific review |
| `respond_to_review` | Reply to a review |
| `delete_review_response` | Delete a response |

### Analytics
| Tool | Description |
|------|-------------|
| `list_analytics_report_requests` | List analytics requests |
| `create_analytics_report_request` | Create analytics request |
| `list_analytics_reports` | List available reports |
| `get_sales_reports_info` | Sales report info |
| `get_finance_reports_info` | Finance report info |

### Versions
| Tool | Description |
|------|-------------|
| `create_app_version` | Create new version |
| `update_app_version` | Update version metadata |
| `submit_for_review` | Submit for App Store review |
| `get_app_store_state` | Check review status |
| `get_version_localization` | Get localization info |

### Subscriptions & IAP
| Tool | Description |
|------|-------------|
| `list_subscription_groups` | List subscription groups |
| `list_subscriptions` | List subscriptions |
| `get_subscription` | Get subscription details |
| `list_in_app_purchases` | List IAPs |
| `get_in_app_purchase` | Get IAP details |
| `get_subscription_prices` | Get pricing info |

### Metadata (Version & App Info Localizations)
| Tool | Description |
|------|-------------|
| `update_version_localization` | Update description, keywords, what's new, promotional text, URLs |
| `create_version_localization` | Create localization for a new language |
| `get_app_info` | Get app info ID for app-level localizations |
| `list_app_info_localizations` | List localizations (name, subtitle, privacy policy) |
| `update_app_info_localization` | Update app name, subtitle, privacy policy |
| `create_app_info_localization` | Create app info localization for new language |

### Build Management
| Tool | Description |
|------|-------------|
| `update_build` | Update build attributes (export compliance) |
| `set_build_for_version` | Associate a build with an App Store version |
| `submit_build_for_beta_review` | Submit build for TestFlight beta review |
| `get_beta_review_status` | Get beta app review submission status |
| `list_beta_build_localizations` | List "What to Test" notes |
| `update_beta_build_localization` | Update "What to Test" notes |
| `create_beta_build_localization` | Create "What to Test" for new locale |
| `add_build_to_beta_group` | Add build to TestFlight group |
| `remove_build_from_beta_group` | Remove build from beta group |

### App Review & Submission
| Tool | Description |
|------|-------------|
| `get_app_store_review_detail` | Get review details (contact, demo account, notes) |
| `update_app_store_review_detail` | Update review details for submission |
| `create_app_store_review_detail` | Create review details for a version |
| `get_age_rating_declaration` | Get age rating settings |
| `update_age_rating_declaration` | Update age rating content declarations |
| `get_phased_release` | Get phased release status |
| `create_phased_release` | Create phased release (gradual rollout) |
| `update_phased_release` | Pause, resume, or complete phased release |
| `delete_phased_release` | Delete phased release configuration |

### Pricing & Categories
| Tool | Description |
|------|-------------|
| `list_app_categories` | List available App Store categories |
| `update_app_categories` | Update app's primary/secondary categories |
| `list_territories` | List all territories with currency codes |
| `list_app_price_points` | List price points for an app in a territory |
| `get_app_price_schedule` | Get current price schedule |
| `set_app_price_schedule` | Set app pricing |
| `get_app_availability` | Get territories where app is available |
| `set_app_availability` | Set app availability by territory |

## Resources

The server also exposes MCP resources:

- `appstore://apps` - List of all apps
- `appstore://apps/{appId}` - Specific app details
- `appstore://apps/{appId}/reviews` - App reviews

## Rate Limits

The App Store Connect API has rate limits:
- ~3,600 requests per hour
- ~300 requests per minute

The server automatically handles rate limiting with:
- Rate limit header parsing
- Exponential backoff on 429 errors
- Warning logs when approaching limits

## Error Handling

The server provides detailed error messages for:
- Authentication failures (invalid credentials)
- Rate limit exceeded
- Invalid requests (400 errors)
- Server errors (5xx with retry)

## Development

```bash
# Run in development mode
npm run dev

# Type check
npm run typecheck

# Run tests
npm test

# Lint
npm run lint

# Build for production
npm run build
```

## License

MIT
