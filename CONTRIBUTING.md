# Contributing

Thanks for your interest in contributing to the Jupiter Perpetuals SDK!

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/thisissamridh/juptier-perps-sdk.git
   cd juptier-perps-sdk
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the project:**
   ```bash
   npx tsc
   ```

4. **Run tests:**
   ```bash
   npx tsx tests/integration-test.ts
   ```

## Development Workflow

- Create a new branch for your feature: `git checkout -b feature/my-feature`
- Make your changes
- Run type checks: `npx tsc --noEmit`
- Run tests to ensure nothing breaks
- Commit with clear messages
- Push and open a pull request

## Code Style

- Use TypeScript for all code
- Follow existing patterns and naming conventions
- Add JSDoc comments to exported functions and classes
- Keep functions focused and modular

## Reporting Issues

Please open an issue on GitHub describing:
- What you're trying to do
- What went wrong
- Steps to reproduce
- Your environment (Node version, OS, etc.)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
