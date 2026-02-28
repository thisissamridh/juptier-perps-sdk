# Claude Code Configuration

Community-built Jupiter Perpetuals SDK for Solana. TypeScript + @solana/kit v2.

## Tech Stack

- **Runtime:** Node.js 18+, TypeScript
- **Solana:** @solana/kit@2.3.0 (web3.js v2)
- **Testing:** tsx for integration tests
- **Package Manager:** npm

## Project Structure

```
src/
  constants.ts              # Global addresses, program IDs
  types/                    # Type definitions (enums, interfaces)
  codecs/                   # Account codec definitions
  accounts/                 # AccountFetcher + pool/position/borrow fetchers
  instructions/             # Instruction builders (position, liquidity, borrow)
  utils/                    # PDAs, formatting, calculations (file:line refs below)
  client/                   # JupiterPerpsClient main entry point
  rpc/                      # Priority fees, subscriptions, transaction builder
  swap/                     # Jupiter swap API wrapper
tests/                      # Integration tests (RPC-dependent)
examples/                   # Usage examples
```

## Critical Architecture

- **Single shared AccountFetcher:** See src/accounts/index.ts:14-19. All pool/position/borrow fetchers use ONE fetcher instance (no duplication).
- **TTL Cache:** src/accounts/fetcher.ts:40-50. Caches account data for 5000ms (configurable via `cacheTtlMs`).
- **Cross-platform APIs:** src/utils/pda.ts uses TextEncoder, NOT Node.js Buffer, for seed encoding.
- **Typed Program Addresses:** Sourced from @solana-program/* packages (see src/constants.ts:35-36).

## Code Style

- Imperative commit messages ("add X", not "added X")
- JSDoc on all exported functions/classes
- Prefer `const`, avoid `let`/`var`
- Use AccountRole enum (not magic numbers) — see src/instructions/position.ts:170-185

## Commands

```bash
npx tsc --noEmit          # Type check
npx tsx tests/integration-test.ts  # Run tests
npx tsc                   # Build to dist/
```

## Known Constraints

- RPC-dependent tests may timeout in restricted environments (marked HTTP 403)
- Requires @solana/kit@2.3.0 compatibility (breaking changes in v3+)
- Associated Token Program address kept local (package exports different value)

## Important Files

- **PDA derivation:** See src/utils/pda.ts for all findXPda functions
- **Instruction discriminators:** See src/idl/discriminators.ts
- **Account codecs:** See src/codecs/accounts.ts (uses unsafe casts, necessary for @solana/kit)

## Before Committing

1. Run `npx tsc --noEmit` — must pass
2. Verify no `Buffer.` usage (only TextEncoder for seeds)
3. Check AccountRole enum usage in instructions (not magic 0/1/2/3)
4. Add JSDoc to new exported functions

## Resources

- [Jupiter Docs](https://jup.ag/docs)
- [@solana/kit Docs](https://solana-program-library.github.io/solana-program-library/token/js/)
- Perpetuals on-chain program: `PERPHjGBqRHArX4DySjwM6UJHiR3sWAatqfdBS2qQJu`
