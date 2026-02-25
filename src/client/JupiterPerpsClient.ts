import {
  Address,
  Rpc,
  SolanaRpcApi,
  RpcSubscriptions,
  SolanaRpcSubscriptionsApi,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  IInstruction,
  Commitment,
} from '@solana/kit';

import { AccountsClient } from '../accounts/index.js';
import { PerpsSubscriptions } from '../rpc/subscriptions.js';
import {
  createIncreasePositionMarketRequestInstruction,
  createDecreasePositionMarketRequestInstruction,
  createClosePositionRequestInstruction,
  OpenPositionParams,
  ClosePositionParams,
  CancelPositionRequestParams,
} from '../instructions/position.js';
import {
  createAddLiquidityInstruction,
  createRemoveLiquidityInstruction,
  createSwapInstruction,
  AddLiquidityInstructionParams,
  RemoveLiquidityInstructionParams,
  SwapInstructionParams,
} from '../instructions/liquidity.js';
import {
  createBorrowInstruction,
  createRepayInstruction,
  createDepositCollateralInstruction,
  createWithdrawCollateralInstruction,
  BorrowInstructionParams,
  RepayInstructionParams,
  DepositCollateralInstructionParams,
  WithdrawCollateralInstructionParams,
} from '../instructions/borrow.js';
import { CUSTODY_ADDRESSES, CustodyName, JLP_POOL_ADDRESS } from '../constants.js';
import { findPositionPda } from '../utils/pda.js';
import { applySlippageBps, bigintToUsd, usdToBigint } from '../utils/formatting.js';
import { buildTransactionMessage, BuildTransactionOptions } from '../rpc/transaction.js';

export interface JupiterPerpsClientConfig {
  rpc?: Rpc<SolanaRpcApi>;
  rpcSubscriptions?: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
  rpcUrl?: string;
  wsUrl?: string;
  commitment?: Commitment;
  poolAddress?: Address;
  /** TTL for the in-memory account cache (ms). 0 = disabled. Default: 5 000 ms. */
  cacheTtlMs?: number;
}

/** Main entry point for interacting with the Jupiter Perpetuals program. */
export class JupiterPerpsClient {
  readonly rpc: Rpc<SolanaRpcApi>;
  readonly rpcSubscriptions?: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
  /** Typed access to all on-chain account data. */
  readonly accounts: AccountsClient;
  /** Real-time account subscriptions (requires rpcSubscriptions in config). */
  readonly subscriptions?: PerpsSubscriptions;
  readonly commitment: Commitment;
  readonly poolAddress: Address;

  constructor(config: JupiterPerpsClientConfig) {
    this.rpc = config.rpc ?? createSolanaRpc(config.rpcUrl ?? 'https://api.mainnet-beta.solana.com');

    if (config.rpcSubscriptions) {
      this.rpcSubscriptions = config.rpcSubscriptions;
    } else if (config.wsUrl) {
      this.rpcSubscriptions = createSolanaRpcSubscriptions(config.wsUrl);
    }

    this.commitment = config.commitment ?? 'confirmed';
    this.poolAddress = config.poolAddress ?? JLP_POOL_ADDRESS;
    this.accounts = new AccountsClient({
      rpc: this.rpc,
      commitment: this.commitment,
      cacheTtlMs: config.cacheTtlMs,
    });

    // Wire subscriptions to the SAME rpcSubscriptions instance — all watch* calls
    // share one underlying WebSocket connection via @solana/kit multiplexing.
    if (this.rpcSubscriptions) {
      this.subscriptions = new PerpsSubscriptions(this.rpcSubscriptions, this.commitment);
    }
  }

  position = {
    open: (params: Omit<OpenPositionParams, 'pool'>): Promise<IInstruction> =>
      createIncreasePositionMarketRequestInstruction({ ...params, pool: this.poolAddress }),

    close: (params: Omit<ClosePositionParams, 'pool'>): Promise<IInstruction> =>
      createDecreasePositionMarketRequestInstruction({ ...params, pool: this.poolAddress }),

    cancel: (params: Omit<CancelPositionRequestParams, 'pool'>): Promise<IInstruction> =>
      createClosePositionRequestInstruction({ ...params, pool: this.poolAddress }),

    findByOwner: (owner: Address, custody: Address): Promise<Address> =>
      findPositionPda(this.poolAddress, custody, owner),
  };

  jlp = {
    addLiquidity: (params: Omit<AddLiquidityInstructionParams, 'pool'>): Promise<IInstruction> =>
      createAddLiquidityInstruction({ ...params, pool: this.poolAddress }),

    removeLiquidity: (params: Omit<RemoveLiquidityInstructionParams, 'pool'>): Promise<IInstruction> =>
      createRemoveLiquidityInstruction({ ...params, pool: this.poolAddress }),

    swap: (params: Omit<SwapInstructionParams, 'pool'>): Promise<IInstruction> =>
      createSwapInstruction({ ...params, pool: this.poolAddress }),
  };

  borrow = {
    borrow: (params: Omit<BorrowInstructionParams, 'pool'>): Promise<IInstruction> =>
      createBorrowInstruction({ ...params, pool: this.poolAddress }),

    repay: (params: Omit<RepayInstructionParams, 'pool'>): Promise<IInstruction> =>
      createRepayInstruction({ ...params, pool: this.poolAddress }),

    depositCollateral: (params: Omit<DepositCollateralInstructionParams, 'pool'>): Promise<IInstruction> =>
      createDepositCollateralInstruction({ ...params, pool: this.poolAddress }),

    withdrawCollateral: (params: Omit<WithdrawCollateralInstructionParams, 'pool'>): Promise<IInstruction> =>
      createWithdrawCollateralInstruction({ ...params, pool: this.poolAddress }),
  };

  custody = {
    get: (name: CustodyName): Address => CUSTODY_ADDRESSES[name],
  };

  tx = {
    /**
     * Assemble a v0 transaction message with:
     *   - a fresh blockhash
     *   - auto-estimated priority fees (from the instruction's writable accounts)
     *   - SetComputeUnitPrice + SetComputeUnitLimit prepended
     *
     * Pass the returned `message` to your signer, e.g.:
     *   `signTransactionMessageWithSigners(message)`
     */
    build: (options: BuildTransactionOptions) =>
      buildTransactionMessage(this.rpc, options),
  };

  helpers = {
    applySlippage: (price: bigint, slippageBps: number, isLong: boolean): bigint =>
      applySlippageBps(price, BigInt(slippageBps), isLong),
    usdToBigint,
    bigintToUsd,
  };
}

export function createJupiterPerpsClient(config: JupiterPerpsClientConfig): JupiterPerpsClient {
  return new JupiterPerpsClient(config);
}
