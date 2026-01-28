# MCP App Store Connect

An MCP (Model Context Protocol) server for Apple's App Store Connect API. This server enables AI assistants to manage iOS/macOS apps, TestFlight, analytics, reviews, subscriptions, and more.

## Features

- **App Management**: List apps, get app details, view app versions
- **TestFlight**: Manage builds, beta testers, and beta groups
- **Customer Reviews**: List reviews, respond to reviews
- **Analytics**: Access sales reports, finance reports, and analytics data
- **Version Management**: Create versions, update metadata, submit for review
- **Subscriptions & IAP**: Manage subscription groups, in-app purchases, and pricing

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

# Build for production
npm run build
```

## License

MIT
