import {
  Address,
  Rpc,
  SolanaRpcApi,
  fetchEncodedAccount,
  ReadonlyUint8Array,
} from '@solana/kit';
import {
  poolAccountCodec,
  custodyAccountCodec,
  positionAccountCodec,
  positionRequestAccountCodec,
  borrowPositionAccountCodec,
  perpetualsAccountCodec,
  getAccountDiscriminator,
} from '../codecs/index.js';
import type { PoolAccount, CustodyAccount, PositionAccount, PositionRequestAccount, BorrowPositionAccount, PerpetualsAccount } from '../types/accounts.js';
import { AccountNotFoundError } from '../errors/index.js';

export interface AccountFetcherConfig {
  rpc: Rpc<SolanaRpcApi>;
  commitment?: 'processed' | 'confirmed' | 'finalized';
  /**
   * How long decoded accounts stay in the in-memory cache (milliseconds).
   * Set to 0 to disable caching entirely. Default: 5 000 ms.
   */
  cacheTtlMs?: number;
}

export class AccountFetcher {
  private readonly rpc: Rpc<SolanaRpcApi>;
  private readonly commitment: 'processed' | 'confirmed' | 'finalized';
  private readonly cacheTtlMs: number;
  private readonly cache = new Map<string, { value: unknown; expiresAt: number }>();

  constructor(config: AccountFetcherConfig) {
    this.rpc = config.rpc;
    this.commitment = config.commitment ?? 'confirmed';
    this.cacheTtlMs = config.cacheTtlMs ?? 5_000;
  }

  private async fetchAndDecode<T>(
    address: Address,
    codec: { decode: (data: ReadonlyUint8Array) => T },
  ): Promise<T> {
    if (this.cacheTtlMs > 0) {
      const hit = this.cache.get(address);
      if (hit && Date.now() < hit.expiresAt) return hit.value as T;
    }

    const account = await fetchEncodedAccount(this.rpc, address, {
      commitment: this.commitment,
    });

    if (!account.exists) {
      throw new AccountNotFoundError(address, 'Account');
    }

    const value = codec.decode(account.data);

    if (this.cacheTtlMs > 0) {
      this.cache.set(address, { value, expiresAt: Date.now() + this.cacheTtlMs });
    }

    return value;
  }

  /** Invalidate all cached entries. */
  clearCache(): void {
    this.cache.clear();
  }

  async getPerpetuals(address: Address): Promise<PerpetualsAccount> {
    return this.fetchAndDecode(address, perpetualsAccountCodec);
  }

  async getPool(address: Address): Promise<PoolAccount> {
    return this.fetchAndDecode(address, poolAccountCodec);
  }

  async getCustody(address: Address): Promise<CustodyAccount> {
    return this.fetchAndDecode(address, custodyAccountCodec);
  }

  async getPosition(address: Address): Promise<PositionAccount> {
    return this.fetchAndDecode(address, positionAccountCodec);
  }

  async getPositionRequest(address: Address): Promise<PositionRequestAccount> {
    return this.fetchAndDecode(address, positionRequestAccountCodec);
  }

  async getBorrowPosition(address: Address): Promise<BorrowPositionAccount> {
    return this.fetchAndDecode(address, borrowPositionAccountCodec);
  }

  getPositionDiscriminator(): Uint8Array {
    return getAccountDiscriminator('position');
  }

  getCustodyDiscriminator(): Uint8Array {
    return getAccountDiscriminator('custody');
  }

  getPoolDiscriminator(): Uint8Array {
    return getAccountDiscriminator('pool');
  }
}
