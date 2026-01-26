# Contributing to MCP App Store Connect

Thank you for your interest in contributing to MCP App Store Connect! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/mcp-appstore-connect.git`
3. Install dependencies: `npm install`
4. Create a new branch: `git checkout -b feature/your-feature-name`

## Development Setup

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- An Apple Developer account with App Store Connect API access (for testing)

### Environment Variables

Copy `.env.example` to `.env` and fill in your App Store Connect API credentials:

```bash
cp .env.example .env
```

See the [README.md](README.md) for details on obtaining API credentials.

### Available Scripts

- `npm run build` - Build the TypeScript project
- `npm run dev` - Run the server in development mode
- `npm run typecheck` - Type check without building
- `npm test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Check code style
- `npm run lint:fix` - Fix linting issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Making Changes

### Code Style

- Follow the existing code style
- Use TypeScript for all new code
- Run `npm run lint` and `npm run format` before committing
- Ensure all tests pass: `npm run test:run`

### Adding New Tools

1. Create a new file in `src/tools/` or add to an existing tool file
2. Define the tool with:
   - `description`: Clear description of what the tool does
   - `inputSchema`: Zod schema for input validation
   - `handler`: Async function that implements the tool logic
3. Register the tool in `src/index.ts` in the `registerTools()` function
4. Add tests in `tests/tools/`
5. Update the README.md with the new tool

### Adding Tests

- Place test files next to source files or in `tests/` directory
- Use Vitest for testing
- Aim for good test coverage, especially for:
  - Error handling
  - Edge cases
  - API interactions (use mocks)

### Commit Messages

Use clear, descriptive commit messages:

- `feat: add new tool for listing builds`
- `fix: handle rate limit errors correctly`
- `docs: update README with new tool`
- `test: add tests for error handler`

## Submitting Changes

1. Ensure all tests pass: `npm run test:run`
2. Ensure linting passes: `npm run lint`
3. Ensure formatting is correct: `npm run format:check`
4. Ensure the project builds: `npm run build`
5. Push your changes: `git push origin feature/your-feature-name`
6. Create a Pull Request on GitHub

## Pull Request Process

1. Fill out the PR template (if available)
2. Describe your changes clearly
3. Reference any related issues
4. Ensure CI checks pass
5. Request review from maintainers

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback

## Questions?

If you have questions, please open an issue on GitHub with the `question` label.

Thank you for contributing! 🎉
