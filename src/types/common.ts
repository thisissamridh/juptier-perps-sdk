import type { Address } from '@solana/kit';
import type { OracleType } from './enums.js';

// IDL: OracleParams { oracleAccount, oracleType, buffer: u64, maxPriceAgeSec: u32 }
export interface OracleParams {
  oracleAccount: Address;
  oracleType: OracleType;
  buffer: bigint;
  maxPriceAgeSec: number;
}

// IDL: OraclePrice { price: u64, exponent: i32 }
export interface OraclePrice {
  price: bigint;
  exponent: number;
}

// IDL: PricingParams { tradeImpactFeeScalar, buffer, swapSpread, maxLeverage, maxGlobalLongSizes, maxGlobalShortSizes }
export interface PricingParams {
  tradeImpactFeeScalar: bigint;
  buffer: bigint;
  swapSpread: bigint;
  maxLeverage: bigint;
  maxGlobalLongSizes: bigint;
  maxGlobalShortSizes: bigint;
}

// IDL: PriceImpactBuffer { openInterest: [i64; 60], lastUpdated, feeFactor, exponent: f32, deltaImbalanceThresholdDecimal, maxFeeBps }
export interface PriceImpactBuffer {
  openInterest: bigint[];
  lastUpdated: bigint;
  feeFactor: bigint;
  exponent: number;
  deltaImbalanceThresholdDecimal: bigint;
  maxFeeBps: bigint;
}

// IDL: FundingRateState { cumulativeInterestRate: u128, lastUpdate: i64, hourlyFundingDbps: u64 }
export interface FundingRateState {
  cumulativeInterestRate: bigint;
  lastUpdate: bigint;
  hourlyFundingDbps: bigint;
}

// IDL: JumpRateState { minRateBps, maxRateBps, targetRateBps, targetUtilizationRate }
export interface JumpRateState {
  minRateBps: bigint;
  maxRateBps: bigint;
  targetRateBps: bigint;
  targetUtilizationRate: bigint;
}

// IDL: BorrowLendParams { borrowsLimitInBps, maintainanceMarginBps, protocolFeeBps, liquidationMargin, liquidationFeeBps }
export interface BorrowLendParams {
  borrowsLimitInBps: bigint;
  maintainanceMarginBps: bigint;
  protocolFeeBps: bigint;
  liquidationMargin: bigint;
  liquidationFeeBps: bigint;
}

// IDL: Fees { swapMultiplier, stableSwapMultiplier, addRemoveLiquidityBps, swapBps, taxBps, stableSwapBps, stableSwapTaxBps, liquidationRewardBps, protocolShareBps }
export interface Fees {
  swapMultiplier: bigint;
  stableSwapMultiplier: bigint;
  addRemoveLiquidityBps: bigint;
  swapBps: bigint;
  taxBps: bigint;
  stableSwapBps: bigint;
  stableSwapTaxBps: bigint;
  liquidationRewardBps: bigint;
  protocolShareBps: bigint;
}

// IDL: Permissions { allowSwap, allowAddLiquidity, allowRemoveLiquidity, allowIncreasePosition, allowDecreasePosition, allowCollateralWithdrawal, allowLiquidatePosition }
export interface Permissions {
  allowSwap: boolean;
  allowAddLiquidity: boolean;
  allowRemoveLiquidity: boolean;
  allowIncreasePosition: boolean;
  allowDecreasePosition: boolean;
  allowCollateralWithdrawal: boolean;
  allowLiquidatePosition: boolean;
}

// IDL: PoolApr { lastUpdated: i64, feeAprBps: u64, realizedFeeUsd: u64 }
export interface PoolApr {
  lastUpdated: bigint;
  feeAprBps: bigint;
  realizedFeeUsd: bigint;
}

// IDL: Assets { feesReserves, owned, locked, guaranteedUsd, globalShortSizes, globalShortAveragePrices }
export interface Assets {
  feesReserves: bigint;
  owned: bigint;
  locked: bigint;
  guaranteedUsd: bigint;
  globalShortSizes: bigint;
  globalShortAveragePrices: bigint;
}

// IDL: Limit { maxAumUsd: u128, tokenWeightageBufferBps: u128, buffer: u64 }
export interface Limit {
  maxAumUsd: bigint;
  tokenWeightageBufferBps: bigint;
  buffer: bigint;
}

// IDL: Secp256k1Pubkey { prefix: u8, key: [u8; 32] }
export interface Secp256k1Pubkey {
  prefix: number;
  key: number[];
}
