import type { PositionAccount, CustodyAccount, PoolAccount } from '../types/accounts.js';
import { RATE_POWER, BPS_POWER } from '../constants.js';

/** Computes unrealized PnL for a position given the current price. */
export function calculateUnrealizedPnl(
  position: PositionAccount,
  currentPrice: bigint
): bigint {
  if (position.price === 0n) return 0n;
  const priceDiff = currentPrice - position.price;
  const pnl = (position.sizeUsd * priceDiff) / position.price;

  if (position.side === 'long') {
    return pnl;
  }
  return -pnl;
}

export function calculateLiquidationPrice(
  position: PositionAccount,
  custody: CustodyAccount
): bigint {
  if (position.sizeUsd === 0n) return 0n;

  const maintenanceMargin = custody.pricing.maxLeverage;
  const collateralRatio = (position.collateralUsd * RATE_POWER) / position.sizeUsd;

  let liquidationPrice: bigint;

  if (position.side === 'long') {
    const priceDrop = position.price * (collateralRatio - maintenanceMargin);
    liquidationPrice = position.price - priceDrop / RATE_POWER;
  } else {
    const priceIncrease = position.price * (collateralRatio - maintenanceMargin);
    liquidationPrice = position.price + priceIncrease / RATE_POWER;
  }

  return liquidationPrice;
}

export function calculateLeverage(position: PositionAccount): bigint {
  if (position.collateralUsd === 0n) return 0n;
  return (position.sizeUsd * RATE_POWER) / position.collateralUsd;
}

export function calculateMarginRatio(position: PositionAccount): bigint {
  if (position.sizeUsd === 0n) return RATE_POWER;
  return (position.collateralUsd * RATE_POWER) / position.sizeUsd;
}

export function calculateUtilization(custody: CustodyAccount): bigint {
  const { assets } = custody;
  if (assets.owned === 0n) return 0n;
  return (assets.locked * RATE_POWER) / assets.owned;
}

export function calculateFundingRate(custody: CustodyAccount): {
  longRate: bigint;
  shortRate: bigint;
} {
  const { assets } = custody;

  if (assets.owned === 0n) {
    return { longRate: 0n, shortRate: 0n };
  }

  // Using guaranteedUsd (long OI) and globalShortSizes (short OI)
  const longRatio = (assets.guaranteedUsd * RATE_POWER) / assets.owned;
  const shortRatio = (assets.globalShortSizes * RATE_POWER) / assets.owned;

  const balance = longRatio - shortRatio;

  return {
    longRate: balance > 0n ? balance : 0n,
    shortRate: balance < 0n ? -balance : 0n,
  };
}

export function calculatePriceImpactFee(
  sizeUsd: bigint,
  custody: CustodyAccount
): bigint {
  const { priceImpactBuffer } = custody;

  if (sizeUsd === 0n) return 0n;

  // feeFactor is in BPS-like units; cap at maxFeeBps
  const fee = (sizeUsd * priceImpactBuffer.feeFactor) / BPS_POWER;
  const maxFee = (sizeUsd * priceImpactBuffer.maxFeeBps) / BPS_POWER;

  return fee < maxFee ? fee : maxFee;
}

export function calculateAddLiquidityFee(
  amount: bigint,
  pool: PoolAccount
): bigint {
  return (amount * pool.fees.addRemoveLiquidityBps) / BPS_POWER;
}

export function calculateRemoveLiquidityFee(
  amount: bigint,
  pool: PoolAccount
): bigint {
  return (amount * pool.fees.addRemoveLiquidityBps) / BPS_POWER;
}

export function calculateSwapFee(
  amountIn: bigint,
  amountOut: bigint,
  pool: PoolAccount
): { feeIn: bigint; feeOut: bigint } {
  const feeIn  = (amountIn  * pool.fees.swapBps) / BPS_POWER;
  const feeOut = (amountOut * pool.fees.swapBps) / BPS_POWER;

  return { feeIn, feeOut };
}

export function isPositionLiquidatable(
  position: PositionAccount,
  currentPrice: bigint,
  custody: CustodyAccount
): boolean {
  const liquidationPrice = calculateLiquidationPrice(position, custody);

  if (position.side === 'long') {
    return currentPrice <= liquidationPrice;
  }
  return currentPrice >= liquidationPrice;
}
