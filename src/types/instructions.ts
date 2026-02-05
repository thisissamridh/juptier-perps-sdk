import type { Address } from '@solana/kit';
import type { Side } from './enums.js';

export interface InitParams {
  admin: Address;
  transferAuthority: Address;
}

export interface AddPoolParams {
  name: string;
}

export interface AddCustodyParams {
  pricing: {
    useEma: boolean;
    useUnrealizedPnlInAmm: boolean;
    tradeSpreadLong: bigint;
    tradeSpreadShort: bigint;
    swapSpread: bigint;
    borrowSpread: bigint;
    minInitialLeverage: bigint;
    maxLeverage: bigint;
    maxPayoffMult: bigint;
    maxUtilization: bigint;
    maxPositionLockedUsd: bigint;
    maxTotalPositionLockedUsd: bigint;
    lockPeriodMs: bigint;
  };
  oracle: {
    oracleType: number;
    oracleAccount: Address;
    oracleSourceAccount: Address | null;
  };
  permissions: {
    allowSwap: boolean;
    allowAddLiquidity: boolean;
    allowRemoveLiquidity: boolean;
    allowOpenPosition: boolean;
    allowClosePosition: boolean;
    allowPnlWithdrawal: boolean;
    allowCollateralWithdrawal: boolean;
    allowSizeChange: boolean;
    allowBorrow: boolean;
    allowRepay: boolean;
    allowLiquidatePosition: boolean;
    allowLiquidateBorrowPosition: boolean;
    allowStableBorrow: boolean;
    allowVariableBorrow: boolean;
    allowDepositCollateralForBorrow: boolean;
    allowWithdrawCollateralForBorrow: boolean;
    allowDecreasePositionWithInternalSwap: boolean;
    allowIncreasePositionWithInternalSwap: boolean;
  };
  fees: {
    mode: number;
    positionUsd: bigint;
    positionCollateral: bigint;
    positionSize: bigint;
    swapIn: bigint;
    swapOut: bigint;
    addLiquidity: bigint;
    removeLiquidity: bigint;
    stableBorrow: bigint;
    stableBorrowInterest: bigint;
    variableBorrow: bigint;
    variableBorrowInterest: bigint;
    flashLoan: bigint;
  };
  borrowLend: {
    minRate: bigint;
    optimalRate: bigint;
    maxRate: bigint;
    optimalUtilization: bigint;
    maxUtilization: bigint;
    flashLoanFee: bigint;
  };
  positionLimitUsd: bigint;
  targetRatio: bigint;
  priceImpactBuffer: {
    influenceScalerUp: bigint;
    influenceScalerDown: bigint;
    powerUp: bigint;
    powerDown: bigint;
  };
  addAssetImpact: {
    influenceScalerUp: bigint;
    influenceScalerDown: bigint;
    powerUp: bigint;
    powerDown: bigint;
  };
  removeAssetImpact: {
    influenceScalerUp: bigint;
    influenceScalerDown: bigint;
    powerUp: bigint;
    powerDown: bigint;
  };
}

export interface SetCustodyConfigParams {
  permissions?: Partial<{
    allowSwap: boolean;
    allowAddLiquidity: boolean;
    allowRemoveLiquidity: boolean;
    allowOpenPosition: boolean;
    allowClosePosition: boolean;
    allowPnlWithdrawal: boolean;
    allowCollateralWithdrawal: boolean;
    allowSizeChange: boolean;
    allowBorrow: boolean;
    allowRepay: boolean;
    allowLiquidatePosition: boolean;
    allowLiquidateBorrowPosition: boolean;
    allowStableBorrow: boolean;
    allowVariableBorrow: boolean;
    allowDepositCollateralForBorrow: boolean;
    allowWithdrawCollateralForBorrow: boolean;
    allowDecreasePositionWithInternalSwap: boolean;
    allowIncreasePositionWithInternalSwap: boolean;
  }>;
  fees?: Partial<{
    mode: number;
    positionUsd: bigint;
    positionCollateral: bigint;
    positionSize: bigint;
    swapIn: bigint;
    swapOut: bigint;
    addLiquidity: bigint;
    removeLiquidity: bigint;
    stableBorrow: bigint;
    stableBorrowInterest: bigint;
    variableBorrow: bigint;
    variableBorrowInterest: bigint;
    flashLoan: bigint;
  }>;
  positionLimitUsd?: bigint;
  targetRatio?: bigint;
  maxGlobalLongShortDiff?: bigint;
  maxLongPositions?: bigint;
  maxShortPositions?: bigint;
}

export interface CreateIncreasePositionMarketRequestParams {
  counter: bigint;
  collateralTokenDelta: bigint;
  jupiterMinimumOut: bigint | null;
  priceSlippage: bigint;
  side: Side;
  sizeUsdDelta: bigint;
}

export interface CreateDecreasePositionMarketRequestParams {
  collateralUsdDelta: bigint;
  counter: bigint;
  entirePosition: boolean;
  jupiterMinimumOut: bigint | null;
  priceSlippage: bigint;
  sizeUsdDelta: bigint;
}

export interface CreateDecreasePositionRequestParams extends CreateDecreasePositionMarketRequestParams {
  triggerPrice: bigint | null;
  stopLossPrice: bigint | null;
  takeProfitPrice: bigint | null;
}

export interface ClosePositionRequestParams {
  requestChange: 'increase' | 'decrease';
}

export interface AddLiquidityParams {
  tokenAmount: bigint;
  minimumLpTokenOut: bigint;
}

export interface RemoveLiquidityParams {
  lpTokenAmount: bigint;
  minimumTokenOuts: bigint[];
}

export interface SwapParams {
  amountIn: bigint;
  minimumAmountOut: bigint;
}

export interface BorrowFromCustodyParams {
  amount: bigint;
}

export interface RepayToCustodyParams {
  amount: bigint;
}

export interface DepositCollateralForBorrowsParams {
  amount: bigint;
}

export interface WithdrawCollateralForBorrowsParams {
  amount: bigint;
}

export interface LiquidateFullPositionParams {
  counter: bigint;
}

export interface LiquidateBorrowPositionParams {
  amount: bigint;
}

export interface InstantCreateLimitOrderParams {
  collateralTokenDelta: bigint;
  collateralUsd: bigint;
  custody: Address;
  limitPrice: bigint;
  owner: Address;
  side: Side;
  sizeUsd: bigint;
}

export interface InstantCreateTpslParams {
  collateralTokenDelta: bigint;
  collateralUsd: bigint;
  custody: Address;
  owner: Address;
  position: Address;
  side: Side;
  sizeUsd: bigint;
  stopLossPrice: bigint | null;
  takeProfitPrice: bigint | null;
}

export interface InstantIncreasePositionParams {
  collateralTokenDelta: bigint;
  collateralUsd: bigint;
  custody: Address;
  owner: Address;
  side: Side;
  sizeUsd: bigint;
  priceSlippage: bigint;
}

export interface InstantDecreasePositionParams {
  collateralTokenDelta: bigint;
  collateralUsd: bigint;
  custody: Address;
  owner: Address;
  position: Address;
  side: Side;
  sizeUsd: bigint;
  priceSlippage: bigint;
  entirePosition: boolean;
}

export interface SetMaxGlobalSizesParams {
  maxLongPositions: bigint;
  maxShortPositions: bigint;
  maxGlobalLongShortDiff: bigint;
}
