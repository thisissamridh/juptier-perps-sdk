# Claude Code Configuration

This document outlines preferences and guidelines for working with Claude Code on this project.

## Development Stack

- **Language:** TypeScript
- **Runtime:** Node.js 18+
- **Package Manager:** npm
- **Testing:** tsx for integration tests

## Code Style & Patterns

- Use `@solana/kit` (web3.js v2) for Solana interactions
- Prefer typed function parameters over loose `any` types
- Add JSDoc comments to all exported functions and classes
- Use `const` by default, avoid `let` and `var`
- Prefer functional patterns over class-based where possible

## Key Files & Directories

```
src/
  ├── constants.ts          # Global addresses and constants
  ├── types/                # Type definitions (enums, interfaces)
  ├── codecs/               # Account codec definitions
  ├── accounts/             # Account fetchers (shared single instance)
  ├── instructions/         # Instruction builders
  ├── utils/                # Utilities (PDA, formatting, calculations)
  ├── client/               # Main JupiterPerpsClient
  ├── rpc/                  # RPC utilities (priority fees, subscriptions, tx building)
  ├── swap/                 # Jupiter swap integration
  └── idl/                  # IDL and discriminators
tests/
  └── integration-test.ts   # Integration tests (RPC-dependent)
examples/                   # Usage examples
```

## Important Architecture Decisions

1. **Single Shared AccountFetcher** — All pool/position/borrow fetchers use one fetcher instance to avoid duplication
2. **TTL Cache** — Account data cached for 5000ms (configurable) to reduce RPC calls
3. **Cross-Platform APIs** — Use `TextEncoder` instead of Node.js `Buffer` for seed encoding
4. **Typed Program Addresses** — Source from `@solana-program/*` packages, keep local overrides where needed
5. **Priority Fee Estimation** — Uses actual writable accounts from instructions for accurate fee data

## Common Tasks

### Type Check
```bash
npx tsc --noEmit
```

### Run Tests
```bash
npx tsx tests/integration-test.ts
```

### Build
```bash
npx tsc
```

### Add New Instruction
1. Create type in `src/types/instructions.ts`
2. Add IDL discriminator to `src/idl/discriminators.ts`
3. Implement builder in `src/instructions/*.ts`
4. Export from `src/instructions/index.ts`
5. Add to `JupiterPerpsClient.instructions` namespace

### Add New Account Fetcher
1. Create codec in `src/codecs/accounts.ts`
2. Add type in `src/types/accounts.ts`
3. Implement fetcher method in existing fetcher class
4. Ensure it uses shared `AccountFetcher` instance (no new RPC clients)

## Known Limitations

- RPC calls may timeout in some environments (integration tests marked as HTTP 403)
- `@solana-program/associated-token-account` doesn't exist as a package; ATA derivation is custom
- Some package versions require specific `@solana/kit` compatibility (currently @2.3.0)

## Branching & Commits

- Branch naming: `feature/` or `fix/` prefix
- Commit messages: imperative mood, descriptive ("add X" not "added X")
- Small, focused commits preferred over large monolithic ones

## Documentation

- All exported functions need JSDoc comments
- Add inline comments for non-obvious logic
- Keep README.md up-to-date with usage examples
- Add examples for new features in `examples/` directory

## Testing & Validation

- Run `tsc --noEmit` before committing
- Manual test with integration tests when adding RPC-dependent features
- Verify PDA calculations against on-chain state when possible
- Test across commitment levels (processed, confirmed, finalized)

## Contact & Questions

- Author: Samridh Singh (thisissamridh)
- This is a community-built SDK, not official Jupiter Perpetuals documentation
- For protocol questions, refer to [Jupiter docs](https://jup.ag/docs)
