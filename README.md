# Jupiter Perps SDK

A comprehensive TypeScript SDK for the Jupiter Perpetuals Protocol on Solana. Built with `@solana/kit` for modern, tree-shakable, and type-safe interactions.

## Features

- **Full Protocol Coverage**: Open/close positions, JLP liquidity, swaps, borrows
- **Type-Safe**: Full TypeScript support with comprehensive type definitions
- **Two Transaction Modes**: Build instructions yourself or get fully built transactions
- **Priority Fee Estimation**: Automatic compute unit and priority fee calculation
- **WebSocket Subscriptions**: Real-time position and account updates
- **Jupiter Swap Integration**: Cross-custody swaps via Jupiter aggregator
- **Calculations**: PnL, liquidation price, funding rates, fees, and more

## Installation

```bash
npm install jupiter-perps-sdk
# or
yarn add jupiter-perps-sdk
# or
pnpm add jupiter-perps-sdk
```

## Quick Start

```typescript
import { createJupiterPerpsClient, CUSTODY_ADDRESSES, usdToBigint } from 'jupiter-perps-sdk';
import { address } from '@solana/kit';

const client = createJupiterPerpsClient({
  rpcUrl: 'https://api.mainnet-beta.solana.com',
});

// Get pool data
const pool = await client.accounts.pool.getPool();
console.log('Pool AUM:', pool.aumUsdLast.toString());

// Get custody info
const solCustody = await client.accounts.pool.getCustody('SOL');
console.log('SOL long positions:', solCustody.longPositionsCount.toString());
```

## Client Configuration

```typescript
import { createJupiterPerpsClient } from 'jupiter-perps-sdk';
import { createSolanaRpc, createSolanaRpcSubscriptions } from '@solana/kit';

// Simple configuration
const client = createJupiterPerpsClient({
  rpcUrl: 'https://api.mainnet-beta.solana.com',
});

// Advanced configuration with custom transports
const client = createJupiterPerpsClient({
  rpc: createSolanaRpc('https://my-custom-rpc.com'),
  rpcSubscriptions: createSolanaRpcSubscriptions('wss://my-custom-rpc.com'),
  commitment: 'confirmed',
});
```

## Account Fetching

### Pool & Custody

```typescript
// Get pool
const pool = await client.accounts.pool.getPool();

// Get custody by name or address
const solCustody = await client.accounts.pool.getCustody('SOL');
const ethCustody = await client.accounts.pool.getCustody('ETH');
const usdcCustody = await client.accounts.pool.getCustody('USDC');

// Get all custodies
const allCustodies = await client.accounts.pool.getAllCustodies();

// Get pool with all custodies
const poolInfo = await client.accounts.pool.getPoolWithCustodies();
```

### Positions

```typescript
const owner = address('YOUR_WALLET_ADDRESS');

// Get position by address
const position = await client.accounts.position.getPosition(positionAddress);

// Get all positions for a wallet
const myPositions = await client.accounts.position.getPositionsByOwner(owner);

// Get position PDA
const positionPda = await client.position.findByOwner(owner, custody);
```

### Borrows

```typescript
// Get borrow position
const borrow = await client.accounts.borrow.getBorrowPosition(borrowAddress);

// Get borrow position by owner
const myBorrow = await client.accounts.borrow.getBorrowPositionByOwner(
  owner,
  CUSTODY_ADDRESSES.USDC
);
```

## Position Management

### Open Position (Market)

```typescript
const owner = address('YOUR_WALLET_ADDRESS');
const collateralCustody = CUSTODY_ADDRESSES.USDC;
const positionCustody = CUSTODY_ADDRESSES.SOL;

// Get instruction
const openInstruction = await client.position.open({
  owner,
  custody: positionCustody,
  collateralCustody,
  side: 'long',
  sizeUsdDelta: usdToBigint(1000),      // $1000 position
  collateralTokenDelta: usdToBigint(200), // $200 collateral
  priceSlippage: usdToBigint(100),       // $100 slippage tolerance
  inputMint: usdcMint,                   // Optional: for swaps
});

// Build and send transaction
const transaction = await client.buildTransaction({
  instructions: [openInstruction],
  feePayer: owner,
});

const simulation = await client.simulateTransaction(transaction);
console.log('Compute units:', simulation.unitsConsumed);
```

### Close Position (Market)

```typescript
const closeInstruction = await client.position.close({
  owner,
  position: positionAddress,
  custody: position.custody,
  collateralCustody: position.collateralCustody,
  desiredMint: usdcMint,
  priceSlippage: usdToBigint(100),
  entirePosition: true,
});
```

### Cancel Position Request

```typescript
const cancelInstruction = await client.position.cancel({
  owner,
  position: positionAddress,
  custody: position.custody,
  collateralCustody: position.collateralCustody,
  requestChange: 'increase', // or 'decrease'
});
```

## JLP Liquidity Operations

### Add Liquidity

```typescript
const addLiqIx = await client.jlp.addLiquidity({
  owner,
  custody: CUSTODY_ADDRESSES.SOL,
  tokenAmount: 1_000_000_000n, // 1 SOL
  minimumLpTokenOut: 0n,
});
```

### Remove Liquidity

```typescript
const pool = await client.accounts.pool.getPool();
const minimumTokenOuts = pool.custodies.map(() => 0n);

const removeLiqIx = await client.jlp.removeLiquidity({
  owner,
  lpTokenAmount: 100_000_000n, // 100 JLP
  minimumTokenOuts,
});
```

### Swap in Pool

```typescript
const swapIx = await client.jlp.swap({
  owner,
  inputCustody: CUSTODY_ADDRESSES.USDC,
  outputCustody: CUSTODY_ADDRESSES.SOL,
  amountIn: 1_000_000_000n, // 1000 USDC
  minimumAmountOut: 0n,
});
```

## Borrow Operations

```typescript
// Borrow
const borrowIx = await client.borrow.borrow({
  owner,
  custody: CUSTODY_ADDRESSES.USDC,
  amount: 1_000_000_000n, // 1000 USDC
});

// Repay
const repayIx = await client.borrow.repay({
  owner,
  custody: CUSTODY_ADDRESSES.USDC,
  amount: 500_000_000n, // 500 USDC
});

// Deposit collateral for borrows
const depositIx = await client.borrow.depositCollateral({
  owner,
  custody: CUSTODY_ADDRESSES.SOL,
  amount: 1_000_000_000n, // 1 SOL
});

// Withdraw collateral
const withdrawIx = await client.borrow.withdrawCollateral({
  owner,
  custody: CUSTODY_ADDRESSES.SOL,
  amount: 500_000_000n,
});
```

## Priority Fees & Simulation

```typescript
import { estimatePriorityFees, createComputeBudgetInstructions } from 'jupiter-perps-sdk';

// Estimate priority fees
const feeEstimate = await estimatePriorityFees(rpc, {
  instructions: [openInstruction],
  feePayer: owner,
});

console.log('Recommended fee:', feeEstimate.recommended.toString());
console.log('Compute units:', feeEstimate.computeUnits);

// Create compute budget instructions
const computeBudgetIx = createComputeBudgetInstructions(
  feeEstimate.computeUnits,
  feeEstimate.recommended
);

// Add to transaction
const transaction = await client.buildTransaction({
  instructions: [...computeBudgetIx, openInstruction],
  feePayer: owner,
});
```

## WebSocket Subscriptions

```typescript
import { createPerpsSubscriptions } from 'jupiter-perps-sdk';

const subscriptions = createPerpsSubscriptions({
  rpc,
  rpcSubscriptions,
});

// Subscribe to position updates
const abortController = new AbortController();
const positionUpdates = await subscriptions.subscribeToPositionUpdates(
  owner,
  abortController.signal
);

for await (const update of positionUpdates) {
  console.log('Position update:', update.type, update.address);
  
  if (update.account) {
    console.log('Size USD:', update.account.sizeUsd.toString());
    console.log('Side:', update.account.side);
  }
}

// Unsubscribe
abortController.abort();
```

## Jupiter Swap Integration

```typescript
import { createJupiterSwapClient } from 'jupiter-perps-sdk';

const swapClient = createJupiterSwapClient();

// Get quote
const quote = await swapClient.getQuote({
  inputMint: solMint,
  outputMint: usdcMint,
  amount: 10_000_000_000n, // 10 SOL
  slippageBps: 50, // 0.5%
});

console.log('Output amount:', quote.outAmount.toString());
console.log('Price impact:', quote.priceImpactPct);

// Get minimum out for position
const minOut = await swapClient.getMinimumOut(
  solMint,
  usdcMint,
  10_000_000_000n,
  50
);
```

## Calculations

```typescript
import {
  calculateUnrealizedPnl,
  calculateLiquidationPrice,
  calculateLeverage,
  calculateFundingRate,
  calculateBorrowFeeRate,
  calculatePriceImpact,
} from 'jupiter-perps-sdk';

// Calculate PnL
const pnl = calculateUnrealizedPnl(position, currentPrice);

// Calculate liquidation price
const liqPrice = calculateLiquidationPrice(position, custody);

// Calculate leverage
const leverage = calculateLeverage(position);

// Calculate funding rate
const { longRate, shortRate } = calculateFundingRate(custody);

// Calculate borrow fee rate
const borrowRate = calculateBorrowFeeRate(custody);

// Calculate price impact
const impact = calculatePriceImpact(sizeUsd, custody, 'long');
```

## Formatting Utilities

```typescript
import {
  usdToBigint,
  bigintToUsd,
  tokenAmountToBigint,
  bigintToTokenAmount,
  applySlippageBps,
} from 'jupiter-perps-sdk';

// Convert USD string to bigint (6 decimals)
const amount = usdToBigint('1000.50'); // 1000500000n

// Convert bigint to USD string
const usdString = bigintToUsd(1000500000n); // '1000.50'

// Convert token amount to bigint
const tokens = tokenAmountToBigint('10.5', 9); // 10500000000n

// Convert bigint to token amount string
const tokenString = bigintToTokenAmount(10500000000n, 9); // '10.5'

// Apply slippage
const priceWithSlippage = applySlippageBps(100_000000n, 100, true); // +1%
```

## PDA Generation

```typescript
import {
  findPerpetualsPda,
  findPoolPda,
  findCustodyPda,
  findPositionPda,
  findPositionRequestPda,
  findBorrowPositionPda,
} from 'jupiter-perps-sdk';

const perpetuals = await findPerpetualsPda();
const pool = await findPoolPda('JLP');
const custody = await findCustodyPda(pool, solMint);
const position = await findPositionPda(pool, custody, owner);
const { address: request, counter } = await findPositionRequestPda(position, 'increase');
const borrowPosition = await findBorrowPositionPda(pool, custody, owner);
```

## Constants

```typescript
import {
  JUPITER_PERPETUALS_PROGRAM_ID,
  JLP_POOL_ADDRESS,
  JLP_MINT_ADDRESS,
  CUSTODY_ADDRESSES,
  USDC_DECIMALS,
  JLP_DECIMALS,
  BPS_POWER,
  RATE_POWER,
} from 'jupiter-perps-sdk';

console.log('Program ID:', JUPITER_PERPETUALS_PROGRAM_ID);
console.log('SOL Custody:', CUSTODY_ADDRESSES.SOL);
console.log('ETH Custody:', CUSTODY_ADDRESSES.ETH);
console.log('BTC Custody:', CUSTODY_ADDRESSES.BTC);
console.log('USDC Custody:', CUSTODY_ADDRESSES.USDC);
console.log('USDT Custody:', CUSTODY_ADDRESSES.USDT);
```

## Error Handling

```typescript
import {
  JupiterPerpsError,
  AccountNotFoundError,
  SimulationError,
  PositionNotFoundError,
  SlippageExceededError,
} from 'jupiter-perps-sdk';

try {
  const position = await client.accounts.position.getPosition(address);
} catch (error) {
  if (error instanceof AccountNotFoundError) {
    console.log('Account not found:', error.address);
  } else if (error instanceof SimulationError) {
    console.log('Simulation failed:', error.logs);
  }
}
```

## License

MIT
