import { USD_DECIMALS } from '../constants.js';

/** Formats a raw bigint USD value (6 decimals) to a human-readable string. */
export function bigintToUsd(
  value: bigint,
  decimals: number = USD_DECIMALS,
  displayDecimals: number = 2
): string {
  if (value === 0n) return '0.00';
  
  const divisor = BigInt(10 ** decimals);
  const quotient = value / divisor;
  const remainder = value % divisor;
  
  const wholePart = quotient.toString();
  const decimalPart = remainder.toString().padStart(decimals, '0').slice(0, displayDecimals);
  
  return `${wholePart}.${decimalPart}`;
}

/** Parses a human-readable USD string into a raw bigint (6 decimals). */
export function usdToBigint(
  usdValue: string | number,
  decimals: number = USD_DECIMALS
): bigint {
  const str = typeof usdValue === 'number' ? usdValue.toString() : usdValue;
  const [whole, decimal = ''] = str.split('.');
  
  const paddedDecimal = decimal.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole + paddedDecimal);
}

export function tokenAmountToBigint(
  amount: string | number,
  decimals: number
): bigint {
  const str = typeof amount === 'number' ? amount.toString() : amount;
  const [whole, decimal = ''] = str.split('.');
  
  const paddedDecimal = decimal.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole + paddedDecimal);
}

export function bigintToTokenAmount(
  value: bigint,
  decimals: number,
  displayDecimals?: number
): string {
  if (value === 0n) return '0';
  
  const divisor = BigInt(10 ** decimals);
  const quotient = value / divisor;
  const remainder = value % divisor;
  
  const display = displayDecimals ?? Math.min(decimals, 6);
  
  const wholePart = quotient.toString();
  const decimalPart = remainder.toString().padStart(decimals, '0').slice(0, display);
  
  if (decimalPart === '') return wholePart;
  return `${wholePart}.${decimalPart.replace(/0+$/, '') || ''}`;
}

export function applyBps(value: bigint, bps: bigint): bigint {
  return (value * bps) / 10000n;
}

export function applySlippageBps(value: bigint, slippageBps: bigint, isLong: boolean): bigint {
  if (isLong) {
    return value + (value * slippageBps) / 10000n;
  }
  return value - (value * slippageBps) / 10000n;
}

export function calculatePercentage(value: bigint, total: bigint): number {
  if (total === 0n) return 0;
  return Number((value * 10000n) / total) / 100;
}

export function divCeil(a: bigint, b: bigint): bigint {
  const quotient = a / b;
  const remainder = a % b;
  return remainder === 0n ? quotient : quotient + 1n;
}

export function min(a: bigint, b: bigint): bigint {
  return a < b ? a : b;
}

export function max(a: bigint, b: bigint): bigint {
  return a > b ? a : b;
}

export function abs(value: bigint): bigint {
  return value < 0n ? -value : value;
}

export function sign(value: bigint): bigint {
  if (value > 0n) return 1n;
  if (value < 0n) return -1n;
  return 0n;
}
