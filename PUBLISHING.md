# Publishing Guide

This guide explains how to publish the MCP App Store Connect server to npm and make it available to others.

## Prerequisites

1. **npm account**: Create an account at [npmjs.com](https://www.npmjs.com) if you don't have one
2. **Two-Factor Authentication**: npm requires 2FA for publishing. Enable it in your npm account settings
3. **Access Token**: Create a granular access token with publish permissions (see Authentication section below)
4. **Login to npm**: Run `npm login` in your terminal or use an access token
5. **Verify package name**: Check that `mcp-appstore-connect` is available on npm (or choose a different name)

## Pre-Publishing Checklist

Before publishing, ensure:

- [ ] All tests pass: `npm run test:run`
- [ ] Code is linted: `npm run lint`
- [ ] Code is formatted: `npm run format:check`
- [ ] Build succeeds: `npm run build`
- [ ] Version number is correct in `package.json`
- [ ] `CHANGELOG.md` is updated
- [ ] `README.md` is complete and accurate
- [ ] Author information is correct in `package.json`
- [ ] Repository URL is correct in `package.json`
- [ ] No sensitive data (API keys, tokens) is committed
- [ ] `.gitignore` excludes build artifacts and secrets

## Publishing Steps

### 1. Update Version Number

Update the version in `package.json` following [Semantic Versioning](https://semver.org/):

- **Patch** (1.0.0 → 1.0.1): Bug fixes
- **Minor** (1.0.0 → 1.1.0): New features (backward compatible)
- **Major** (1.0.0 → 2.0.0): Breaking changes

You can also use npm version commands:

```bash
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0
```

This automatically updates `package.json` and creates a git tag.

### 2. Build the Project

```bash
npm run build
```

### 3. Run Tests

```bash
npm run test:run
```

### 4. Check What Will Be Published

```bash
npm pack --dry-run
```

This shows what files will be included in the package. The `files` field in `package.json` controls this.

### 5. Publish to npm

#### First Time Publishing

```bash
npm publish
```

#### Subsequent Releases

```bash
npm publish
```

If the package is scoped (e.g., `@yourname/mcp-appstore-connect`), make it public:

```bash
npm publish --access public
```

### 6. Verify Publication

1. Check npm: Visit `https://www.npmjs.com/package/mcp-appstore-connect`
2. Test installation:
   ```bash
   npm install -g mcp-appstore-connect
   ```

### 7. Create GitHub Release (Optional)

1. Push the version tag:
   ```bash
   git push origin main --tags
   ```

2. Go to GitHub → Releases → Draft a new release
3. Select the version tag
4. Copy changelog entries
5. Publish the release

## Publishing Checklist

- [ ] Version updated in `package.json`
- [ ] `CHANGELOG.md` updated
- [ ] Tests pass
- [ ] Build succeeds
- [ ] `npm pack --dry-run` shows correct files
- [ ] Published to npm
- [ ] Verified on npm website
- [ ] Git tag created and pushed
- [ ] GitHub release created (optional)

## Updating the Package

For updates:

1. Make your changes
2. Update `CHANGELOG.md`
3. Update version: `npm version patch|minor|major`
4. Build: `npm run build`
5. Test: `npm run test:run`
6. Publish: `npm publish`
7. Push tag: `git push origin main --tags`

## Troubleshooting

### Package name already taken

If `mcp-appstore-connect` is taken, you can:
- Use a scoped package: `@yourname/mcp-appstore-connect`
- Choose a different name
- Contact npm support if it's your package

### Authentication errors

#### Two-Factor Authentication Required

If you see an error like "Two-factor authentication or granular access token with bypass 2fa enabled is required":

**Option 1: Create a Granular Access Token (Recommended)**

1. Go to [npm Access Tokens](https://www.npmjs.com/settings/YOUR_USERNAME/tokens)
2. Click "Generate New Token" → "Granular Access Token"
3. Configure the token:
   - **Token name**: e.g., "mcp-appstore-connect-publish"
   - **Expiration**: Choose appropriate duration
   - **Type**: Select "Publish"
   - **Packages**: Select "Selected packages" and choose your package, or "All packages"
   - **Bypass 2FA**: Enable this option (required for publishing)
4. Click "Generate Token"
5. Copy the token (you won't see it again!)
6. Use the token to authenticate:

```bash
npm login --auth-type=legacy
# When prompted, enter:
# Username: your-npm-username
# Password: YOUR_ACCESS_TOKEN (not your npm password!)
# Email: your-email@example.com
```

Or set it as an environment variable:

```bash
export NPM_TOKEN=your-access-token-here
npm publish
```

**Option 2: Use npm login with 2FA**

If you have 2FA enabled, you'll need to enter your 2FA code when logging in:

```bash
npm login
# Enter username, password, email, and 2FA code when prompted
```

**Option 3: Use .npmrc file**

Create/edit `~/.npmrc`:

```
//registry.npmjs.org/:_authToken=YOUR_ACCESS_TOKEN
```

### Permission errors

Ensure you're the owner/maintainer of the package, or use a scoped package.

### Version already exists

Increment the version number in `package.json`.

## Additional Resources

- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)
- [npm CLI Documentation](https://docs.npmjs.com/cli/v8/commands)
