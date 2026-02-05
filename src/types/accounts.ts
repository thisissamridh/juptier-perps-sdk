import type { Address } from '@solana/kit';
import type { Side, RequestType, RequestChange } from './enums.js';
import type { Assets, OracleParams, FundingRateState, JumpRateState, BorrowLendParams, PricingParams, PriceImpactBuffer, Permissions, Fees, PoolApr, Limit, Secp256k1Pubkey } from './common.js';

// IDL: Perpetuals { permissions, pools: vec<publicKey>, admin, transferAuthorityBump: u8, perpetualsBump: u8, inceptionTime: i64 }
export interface PerpetualsAccount {
  permissions: Permissions;
  pools: Address[];
  admin: Address;
  transferAuthorityBump: number;
  perpetualsBump: number;
  inceptionTime: bigint;
}

// IDL: Pool { name: string, custodies: vec<publicKey>, aumUsd: u128, limit, fees, poolApr, maxRequestExecutionSec: i64, bump: u8, lpTokenBump: u8, inceptionTime: i64, parameterUpdateOracle: Secp256k1Pubkey, aumUsdUpdatedAt: i64 }
export interface PoolAccount {
  name: string;
  custodies: Address[];
  aumUsd: bigint;
  limit: Limit;
  fees: Fees;
  poolApr: PoolApr;
  maxRequestExecutionSec: bigint;
  bump: number;
  lpTokenBump: number;
  inceptionTime: bigint;
  parameterUpdateOracle: Secp256k1Pubkey;
  aumUsdUpdatedAt: bigint;
}

// IDL: Custody { pool, mint, tokenAccount, decimals: u8, isStable: bool, oracle, pricing, permissions, targetRatioBps: u64, assets, fundingRateState, bump: u8, tokenAccountBump: u8, increasePositionBps: u64, decreasePositionBps: u64, maxPositionSizeUsd: u64, dovesOracle: publicKey, jumpRateState, dovesAgOracle: publicKey, priceImpactBuffer, borrowLendParameters, borrowsFundingRateState, debt: u128, borrowLendInterestsAccured: u128, borrowLimitInTokenAmount: u64, minInterestFeeBps: u64, minInterestFeeGracePeriodSeconds: u64 }
export interface CustodyAccount {
  pool: Address;
  mint: Address;
  tokenAccount: Address;
  decimals: number;
  isStable: boolean;
  oracle: OracleParams;
  pricing: PricingParams;
  permissions: Permissions;
  targetRatioBps: bigint;
  assets: Assets;
  fundingRateState: FundingRateState;
  bump: number;
  tokenAccountBump: number;
  increasePositionBps: bigint;
  decreasePositionBps: bigint;
  maxPositionSizeUsd: bigint;
  dovesOracle: Address;
  jumpRateState: JumpRateState;
  dovesAgOracle: Address;
  priceImpactBuffer: PriceImpactBuffer;
  borrowLendParameters: BorrowLendParams;
  borrowsFundingRateState: FundingRateState;
  debt: bigint;
  borrowLendInterestsAccured: bigint;
  borrowLimitInTokenAmount: bigint;
  minInterestFeeBps: bigint;
  minInterestFeeGracePeriodSeconds: bigint;
}

// IDL: Position { owner, pool, custody, collateralCustody, openTime: i64, updateTime: i64, side, price: u64, sizeUsd: u64, collateralUsd: u64, realisedPnlUsd: i64, cumulativeInterestSnapshot: u128, lockedAmount: u64, bump: u8 }
export interface PositionAccount {
  owner: Address;
  pool: Address;
  custody: Address;
  collateralCustody: Address;
  openTime: bigint;
  updateTime: bigint;
  side: Side;
  price: bigint;
  sizeUsd: bigint;
  collateralUsd: bigint;
  realisedPnlUsd: bigint;
  cumulativeInterestSnapshot: bigint;
  lockedAmount: bigint;
  bump: number;
}

// IDL: PositionRequest { owner, pool, custody, position, mint, openTime, updateTime, sizeUsdDelta, collateralDelta, requestChange, requestType, side, priceSlippage?, jupiterMinimumOut?, preSwapAmount?, triggerPrice?, triggerAboveThreshold?, entirePosition?, executed: bool, counter: u64, bump: u8, referral?: publicKey }
export interface PositionRequestAccount {
  owner: Address;
  pool: Address;
  custody: Address;
  position: Address;
  mint: Address;
  openTime: bigint;
  updateTime: bigint;
  sizeUsdDelta: bigint;
  collateralDelta: bigint;
  requestChange: RequestChange;
  requestType: RequestType;
  side: Side;
  priceSlippage: bigint | null;
  jupiterMinimumOut: bigint | null;
  preSwapAmount: bigint | null;
  triggerPrice: bigint | null;
  triggerAboveThreshold: boolean | null;
  entirePosition: boolean | null;
  executed: boolean;
  counter: bigint;
  bump: number;
  referral: Address | null;
}

// IDL: BorrowPosition { owner, pool, custody, openTime: i64, updateTime: i64, borrowSize: u128, cumulativeCompoundedInterestSnapshot: u128, lockedCollateral: u64, bump: u8, lastBorrowed: i64 }
export interface BorrowPositionAccount {
  owner: Address;
  pool: Address;
  custody: Address;
  openTime: bigint;
  updateTime: bigint;
  borrowSize: bigint;
  cumulativeCompoundedInterestSnapshot: bigint;
  lockedCollateral: bigint;
  bump: number;
  lastBorrowed: bigint;
}

// IDL: TokenLedger { tokenAccount: publicKey, amount: u64 }
export interface TokenLedgerAccount {
  tokenAccount: Address;
  amount: bigint;
}
