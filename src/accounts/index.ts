import { Rpc, SolanaRpcApi } from '@solana/kit';
import { PoolFetcher, PositionFetcher, BorrowFetcher } from './pool.js';
import { AccountFetcher } from './fetcher.js';

export { AccountFetcher } from './fetcher.js';
export { PoolFetcher, PositionFetcher, BorrowFetcher, PoolInfo, PositionInfo } from './pool.js';

export interface AccountsConfig {
  rpc: Rpc<SolanaRpcApi>;
  commitment?: 'processed' | 'confirmed' | 'finalized';
  cacheTtlMs?: number;
}

/** Provides typed access to all on-chain account data. */
export class AccountsClient {
  readonly pool: PoolFetcher;
  readonly position: PositionFetcher;
  readonly borrow: BorrowFetcher;
  /** Low-level fetcher — all higher-level fetchers share this single instance. */
  readonly fetcher: AccountFetcher;

  /** @param config RPC connection and optional cache TTL settings. */
  constructor(config: AccountsConfig) {
    this.fetcher = new AccountFetcher(config);
    this.pool     = new PoolFetcher(this.fetcher);
    this.position = new PositionFetcher(this.fetcher);
    this.borrow   = new BorrowFetcher(this.fetcher);
  }
}

export function createAccountsClient(config: AccountsConfig): AccountsClient {
  return new AccountsClient(config);
}
