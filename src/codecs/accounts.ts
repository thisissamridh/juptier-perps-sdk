import {
  Codec,
  addCodecSizePrefix,
  getArrayCodec,
  getBooleanCodec,
  getConstantCodec,
  getDataEnumCodec,
  getOptionCodec,
  getStructCodec,
  getU128Codec,
  getU64Codec,
  getU32Codec,
  getU8Codec,
  getI64Codec,
  getI32Codec,
  getF32Codec,
  getUtf8Codec,
  getAddressCodec,
  getUnitCodec,
} from '@solana/kit';
import type {
  PerpetualsAccount,
  PoolAccount,
  CustodyAccount,
  PositionAccount,
  PositionRequestAccount,
  BorrowPositionAccount,
  TokenLedgerAccount,
} from '../types/accounts.js';
import { ACCOUNT_DISCRIMINATORS } from '../idl/discriminators.js';

// ─── Primitives ───────────────────────────────────────────────────────────────

const u8   = getU8Codec();
const u32  = getU32Codec();
const u64  = getU64Codec();
const u128 = getU128Codec();
const i32  = getI32Codec();
const i64  = getI64Codec();
const f32  = getF32Codec();
const bool = getBooleanCodec();
const pubkey = getAddressCodec();

// Borsh string: u32 length prefix + UTF-8 bytes
const borshString = addCodecSizePrefix(getUtf8Codec(), u32);

// Borsh Vec<publicKey>: u32 count prefix + N pubkeys
const vecPubkey = getArrayCodec(pubkey);

// Borsh Option<T>: 1-byte discriminant (0=None, 1=Some) + value
const optionU64    = getOptionCodec(u64);
const optionBool   = getOptionCodec(bool);
const optionPubkey = getOptionCodec(pubkey);

// ─── Enum codecs ──────────────────────────────────────────────────────────────

// IDL: OracleType { None=0, Test=1, Pyth=2 }
export const oracleTypeCodec = getDataEnumCodec([
  ['none', getUnitCodec()],
  ['test', getUnitCodec()],
  ['pyth', getUnitCodec()],
]);

// IDL: Side { None=0, Long=1, Short=2 }
export const sideCodec = getDataEnumCodec([
  ['none',  getUnitCodec()],
  ['long',  getUnitCodec()],
  ['short', getUnitCodec()],
]);

// IDL: RequestChange { None=0, Increase=1, Decrease=2 }
export const requestChangeCodec = getDataEnumCodec([
  ['none',     getUnitCodec()],
  ['increase', getUnitCodec()],
  ['decrease', getUnitCodec()],
]);

// IDL: RequestType { Market=0, Trigger=1 }
export const requestTypeCodec = getDataEnumCodec([
  ['market',  getUnitCodec()],
  ['trigger', getUnitCodec()],
]);

// ─── Shared sub-struct codecs ─────────────────────────────────────────────────

// IDL: OracleParams { oracleAccount, oracleType, buffer: u64, maxPriceAgeSec: u32 }
export const oracleParamsCodec = getStructCodec([
  ['oracleAccount', pubkey],
  ['oracleType',    oracleTypeCodec],
  ['buffer',        u64],
  ['maxPriceAgeSec', u32],
]);

// IDL: PricingParams { tradeImpactFeeScalar, buffer, swapSpread, maxLeverage, maxGlobalLongSizes, maxGlobalShortSizes }
export const pricingParamsCodec = getStructCodec([
  ['tradeImpactFeeScalar', u64],
  ['buffer',               u64],
  ['swapSpread',           u64],
  ['maxLeverage',          u64],
  ['maxGlobalLongSizes',   u64],
  ['maxGlobalShortSizes',  u64],
]);

// IDL: Permissions { allowSwap, allowAddLiquidity, allowRemoveLiquidity, allowIncreasePosition, allowDecreasePosition, allowCollateralWithdrawal, allowLiquidatePosition }
export const permissionsCodec = getStructCodec([
  ['allowSwap',                  bool],
  ['allowAddLiquidity',          bool],
  ['allowRemoveLiquidity',       bool],
  ['allowIncreasePosition',      bool],
  ['allowDecreasePosition',      bool],
  ['allowCollateralWithdrawal',  bool],
  ['allowLiquidatePosition',     bool],
]);

// IDL: Assets { feesReserves, owned, locked, guaranteedUsd, globalShortSizes, globalShortAveragePrices }
export const assetsCodec = getStructCodec([
  ['feesReserves',          u64],
  ['owned',                 u64],
  ['locked',                u64],
  ['guaranteedUsd',         u64],
  ['globalShortSizes',      u64],
  ['globalShortAveragePrices', u64],
]);

// IDL: FundingRateState { cumulativeInterestRate: u128, lastUpdate: i64, hourlyFundingDbps: u64 }
export const fundingRateStateCodec = getStructCodec([
  ['cumulativeInterestRate', u128],
  ['lastUpdate',             i64],
  ['hourlyFundingDbps',      u64],
]);

// IDL: JumpRateState { minRateBps, maxRateBps, targetRateBps, targetUtilizationRate }
export const jumpRateStateCodec = getStructCodec([
  ['minRateBps',           u64],
  ['maxRateBps',           u64],
  ['targetRateBps',        u64],
  ['targetUtilizationRate', u64],
]);

// IDL: PriceImpactBuffer { openInterest: [i64; 60], lastUpdated: i64, feeFactor: u64, exponent: f32, deltaImbalanceThresholdDecimal: u64, maxFeeBps: u64 }
export const priceImpactBufferCodec = getStructCodec([
  ['openInterest',                    getArrayCodec(i64, { size: 60 })],
  ['lastUpdated',                     i64],
  ['feeFactor',                       u64],
  ['exponent',                        f32],
  ['deltaImbalanceThresholdDecimal',  u64],
  ['maxFeeBps',                       u64],
]);

// IDL: BorrowLendParams { borrowsLimitInBps, maintainanceMarginBps, protocolFeeBps, liquidationMargin, liquidationFeeBps }
export const borrowLendParamsCodec = getStructCodec([
  ['borrowsLimitInBps',      u64],
  ['maintainanceMarginBps',  u64],
  ['protocolFeeBps',         u64],
  ['liquidationMargin',      u64],
  ['liquidationFeeBps',      u64],
]);

// IDL: Fees { swapMultiplier, stableSwapMultiplier, addRemoveLiquidityBps, swapBps, taxBps, stableSwapBps, stableSwapTaxBps, liquidationRewardBps, protocolShareBps }
export const feesCodec = getStructCodec([
  ['swapMultiplier',          u64],
  ['stableSwapMultiplier',    u64],
  ['addRemoveLiquidityBps',   u64],
  ['swapBps',                 u64],
  ['taxBps',                  u64],
  ['stableSwapBps',           u64],
  ['stableSwapTaxBps',        u64],
  ['liquidationRewardBps',    u64],
  ['protocolShareBps',        u64],
]);

// IDL: PoolApr { lastUpdated: i64, feeAprBps: u64, realizedFeeUsd: u64 }
export const poolAprCodec = getStructCodec([
  ['lastUpdated',    i64],
  ['feeAprBps',      u64],
  ['realizedFeeUsd', u64],
]);

// IDL: Limit { maxAumUsd: u128, tokenWeightageBufferBps: u128, buffer: u64 }
export const limitCodec = getStructCodec([
  ['maxAumUsd',                u128],
  ['tokenWeightageBufferBps',  u128],
  ['buffer',                   u64],
]);

// IDL: Secp256k1Pubkey { prefix: u8, key: [u8; 32] }
export const secp256k1PubkeyCodec = getStructCodec([
  ['prefix', u8],
  ['key',    getArrayCodec(u8, { size: 32 })],
]);

// ─── Account codecs ───────────────────────────────────────────────────────────

// IDL: Perpetuals { permissions, pools: vec<publicKey>, admin, transferAuthorityBump: u8, perpetualsBump: u8, inceptionTime: i64 }
export const perpetualsAccountCodec = getStructCodec([
  ['discriminator',        getConstantCodec(ACCOUNT_DISCRIMINATORS['Perpetuals'])],
  ['permissions',          permissionsCodec],
  ['pools',                vecPubkey],
  ['admin',                pubkey],
  ['transferAuthorityBump', u8],
  ['perpetualsBump',       u8],
  ['inceptionTime',        i64],
]) as unknown as Codec<PerpetualsAccount>;

// IDL: Pool { name: string, custodies: vec<publicKey>, aumUsd: u128, limit, fees, poolApr, maxRequestExecutionSec: i64, bump: u8, lpTokenBump: u8, inceptionTime: i64, parameterUpdateOracle: Secp256k1Pubkey, aumUsdUpdatedAt: i64 }
export const poolAccountCodec = getStructCodec([
  ['discriminator',          getConstantCodec(ACCOUNT_DISCRIMINATORS['Pool'])],
  ['name',                   borshString],
  ['custodies',              vecPubkey],
  ['aumUsd',                 u128],
  ['limit',                  limitCodec],
  ['fees',                   feesCodec],
  ['poolApr',                poolAprCodec],
  ['maxRequestExecutionSec', i64],
  ['bump',                   u8],
  ['lpTokenBump',            u8],
  ['inceptionTime',          i64],
  ['parameterUpdateOracle',  secp256k1PubkeyCodec],
  ['aumUsdUpdatedAt',        i64],
]) as unknown as Codec<PoolAccount>;

// IDL: Custody { pool, mint, tokenAccount, decimals: u8, isStable: bool, oracle, pricing, permissions, targetRatioBps: u64, assets, fundingRateState, bump: u8, tokenAccountBump: u8, increasePositionBps: u64, decreasePositionBps: u64, maxPositionSizeUsd: u64, dovesOracle, jumpRateState, dovesAgOracle, priceImpactBuffer, borrowLendParameters, borrowsFundingRateState, debt: u128, borrowLendInterestsAccured: u128, borrowLimitInTokenAmount: u64, minInterestFeeBps: u64, minInterestFeeGracePeriodSeconds: u64 }
export const custodyAccountCodec = getStructCodec([
  ['discriminator',                   getConstantCodec(ACCOUNT_DISCRIMINATORS['Custody'])],
  ['pool',                            pubkey],
  ['mint',                            pubkey],
  ['tokenAccount',                    pubkey],
  ['decimals',                        u8],
  ['isStable',                        bool],
  ['oracle',                          oracleParamsCodec],
  ['pricing',                         pricingParamsCodec],
  ['permissions',                     permissionsCodec],
  ['targetRatioBps',                  u64],
  ['assets',                          assetsCodec],
  ['fundingRateState',                fundingRateStateCodec],
  ['bump',                            u8],
  ['tokenAccountBump',                u8],
  ['increasePositionBps',             u64],
  ['decreasePositionBps',             u64],
  ['maxPositionSizeUsd',              u64],
  ['dovesOracle',                     pubkey],
  ['jumpRateState',                   jumpRateStateCodec],
  ['dovesAgOracle',                   pubkey],
  ['priceImpactBuffer',               priceImpactBufferCodec],
  ['borrowLendParameters',            borrowLendParamsCodec],
  ['borrowsFundingRateState',         fundingRateStateCodec],
  ['debt',                            u128],
  ['borrowLendInterestsAccured',      u128],
  ['borrowLimitInTokenAmount',        u64],
  ['minInterestFeeBps',               u64],
  ['minInterestFeeGracePeriodSeconds', u64],
]) as unknown as Codec<CustodyAccount>;

// IDL: Position { owner, pool, custody, collateralCustody, openTime: i64, updateTime: i64, side, price: u64, sizeUsd: u64, collateralUsd: u64, realisedPnlUsd: i64, cumulativeInterestSnapshot: u128, lockedAmount: u64, bump: u8 }
export const positionAccountCodec = getStructCodec([
  ['discriminator',              getConstantCodec(ACCOUNT_DISCRIMINATORS['Position'])],
  ['owner',                      pubkey],
  ['pool',                       pubkey],
  ['custody',                    pubkey],
  ['collateralCustody',          pubkey],
  ['openTime',                   i64],
  ['updateTime',                 i64],
  ['side',                       sideCodec],
  ['price',                      u64],
  ['sizeUsd',                    u64],
  ['collateralUsd',              u64],
  ['realisedPnlUsd',             i64],
  ['cumulativeInterestSnapshot', u128],
  ['lockedAmount',               u64],
  ['bump',                       u8],
]) as unknown as Codec<PositionAccount>;

// IDL: PositionRequest { owner, pool, custody, position, mint, openTime, updateTime, sizeUsdDelta, collateralDelta, requestChange, requestType, side, priceSlippage?, jupiterMinimumOut?, preSwapAmount?, triggerPrice?, triggerAboveThreshold?, entirePosition?, executed: bool, counter: u64, bump: u8, referral?: publicKey }
export const positionRequestAccountCodec = getStructCodec([
  ['discriminator',         getConstantCodec(ACCOUNT_DISCRIMINATORS['PositionRequest'])],
  ['owner',                 pubkey],
  ['pool',                  pubkey],
  ['custody',               pubkey],
  ['position',              pubkey],
  ['mint',                  pubkey],
  ['openTime',              i64],
  ['updateTime',            i64],
  ['sizeUsdDelta',          u64],
  ['collateralDelta',       u64],
  ['requestChange',         requestChangeCodec],
  ['requestType',           requestTypeCodec],
  ['side',                  sideCodec],
  ['priceSlippage',         optionU64],
  ['jupiterMinimumOut',     optionU64],
  ['preSwapAmount',         optionU64],
  ['triggerPrice',          optionU64],
  ['triggerAboveThreshold', optionBool],
  ['entirePosition',        optionBool],
  ['executed',              bool],
  ['counter',               u64],
  ['bump',                  u8],
  ['referral',              optionPubkey],
]) as unknown as Codec<PositionRequestAccount>;

// IDL: BorrowPosition { owner, pool, custody, openTime: i64, updateTime: i64, borrowSize: u128, cumulativeCompoundedInterestSnapshot: u128, lockedCollateral: u64, bump: u8, lastBorrowed: i64 }
export const borrowPositionAccountCodec = getStructCodec([
  ['discriminator',                         getConstantCodec(ACCOUNT_DISCRIMINATORS['BorrowPosition'])],
  ['owner',                                 pubkey],
  ['pool',                                  pubkey],
  ['custody',                               pubkey],
  ['openTime',                              i64],
  ['updateTime',                            i64],
  ['borrowSize',                            u128],
  ['cumulativeCompoundedInterestSnapshot',  u128],
  ['lockedCollateral',                      u64],
  ['bump',                                  u8],
  ['lastBorrowed',                          i64],
]) as unknown as Codec<BorrowPositionAccount>;

// IDL: TokenLedger { tokenAccount: publicKey, amount: u64 }
export const tokenLedgerAccountCodec = getStructCodec([
  ['discriminator',  getConstantCodec(ACCOUNT_DISCRIMINATORS['TokenLedger'])],
  ['tokenAccount',   pubkey],
  ['amount',         u64],
]) as unknown as Codec<TokenLedgerAccount>;

export function getAccountDiscriminator(accountName: string): Uint8Array {
  return ACCOUNT_DISCRIMINATORS[accountName] ?? new Uint8Array([]);
}
