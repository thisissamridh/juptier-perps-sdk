import { Address } from '@solana/kit';
import { AccountFetcher } from './fetcher.js';
import {
  JLP_POOL_ADDRESS,
  CUSTODY_ADDRESSES,
  CustodyName,
} from '../constants.js';
import { findCustodyPda, findPositionPda, findBorrowPositionPda } from '../utils/pda.js';
import type { PoolAccount, CustodyAccount, PositionAccount, BorrowPositionAccount } from '../types/accounts.js';

export interface PoolInfo {
  address: Address;
  account: PoolAccount;
  custodies: Map<Address, CustodyAccount>;
}

export interface PositionInfo {
  address: Address;
  account: PositionAccount;
  custody: CustodyAccount;
}

// ─── PoolFetcher ──────────────────────────────────────────────────────────────

/** Fetches and decodes Pool accounts from the chain. */
export class PoolFetcher {
  private readonly fetcher: AccountFetcher;

  constructor(fetcher: AccountFetcher) {
    this.fetcher = fetcher;
  }

  async getPool(poolAddress: Address = JLP_POOL_ADDRESS): Promise<PoolAccount> {
    return this.fetcher.getPool(poolAddress);
  }

  async getCustody(custodyOrName: Address | CustodyName): Promise<CustodyAccount> {
    const address = typeof custodyOrName === 'string' && custodyOrName in CUSTODY_ADDRESSES
      ? CUSTODY_ADDRESSES[custodyOrName as CustodyName]
      : custodyOrName;
    return this.fetcher.getCustody(address as Address);
  }

  async getAllCustodies(poolAddress: Address = JLP_POOL_ADDRESS): Promise<Map<Address, CustodyAccount>> {
    const pool = await this.getPool(poolAddress);
    const custodyMap = new Map<Address, CustodyAccount>();

    await Promise.all(
      pool.custodies.map(async (custodyAddress) => {
        const custody = await this.fetcher.getCustody(custodyAddress);
        custodyMap.set(custodyAddress, custody);
      })
    );

    return custodyMap;
  }

  async getPoolWithCustodies(poolAddress: Address = JLP_POOL_ADDRESS): Promise<PoolInfo> {
    const [pool, custodies] = await Promise.all([
      this.getPool(poolAddress),
      this.getAllCustodies(poolAddress),
    ]);
    return { address: poolAddress, account: pool, custodies };
  }

  async getCustodyByMint(mint: Address, poolAddress: Address = JLP_POOL_ADDRESS): Promise<CustodyAccount> {
    const custodyPda = await findCustodyPda(poolAddress, mint);
    return this.fetcher.getCustody(custodyPda);
  }

  async getKnownCustodies(): Promise<Record<CustodyName, CustodyAccount>> {
    const results = {} as Record<CustodyName, CustodyAccount>;

    await Promise.all(
      (Object.keys(CUSTODY_ADDRESSES) as CustodyName[]).map(async (name) => {
        results[name] = await this.getCustody(name);
      })
    );

    return results;
  }
}

// ─── PositionFetcher ──────────────────────────────────────────────────────────

export class PositionFetcher {
  private readonly fetcher: AccountFetcher;

  constructor(fetcher: AccountFetcher) {
    this.fetcher = fetcher;
  }

  async getPosition(positionAddress: Address): Promise<PositionInfo> {
    const position = await this.fetcher.getPosition(positionAddress);
    const custody = await this.fetcher.getCustody(position.custody);
    return { address: positionAddress, account: position, custody };
  }

  async getPositionByOwner(
    owner: Address,
    custody: Address,
    poolAddress: Address = JLP_POOL_ADDRESS,
  ): Promise<PositionAccount | null> {
    try {
      const positionPda = await findPositionPda(poolAddress, custody, owner);
      return await this.fetcher.getPosition(positionPda);
    } catch {
      return null;
    }
  }

  async getPositionsByOwner(owner: Address): Promise<PositionInfo[]> {
    const positions: PositionInfo[] = [];

    for (const custodyName of Object.keys(CUSTODY_ADDRESSES) as CustodyName[]) {
      try {
        const custody = CUSTODY_ADDRESSES[custodyName];
        const positionPda = await findPositionPda(JLP_POOL_ADDRESS, custody, owner);
        const position = await this.fetcher.getPosition(positionPda);

        if (position.sizeUsd > 0n) {
          const custodyAccount = await this.fetcher.getCustody(custody);
          positions.push({ address: positionPda, account: position, custody: custodyAccount });
        }
      } catch {
        continue;
      }
    }

    return positions;
  }
}

// ─── BorrowFetcher ────────────────────────────────────────────────────────────

export class BorrowFetcher {
  private readonly fetcher: AccountFetcher;

  constructor(fetcher: AccountFetcher) {
    this.fetcher = fetcher;
  }

  async getBorrowPosition(address: Address): Promise<BorrowPositionAccount> {
    return this.fetcher.getBorrowPosition(address);
  }

  async getBorrowPositionByOwner(
    owner: Address,
    custody: Address,
    poolAddress: Address = JLP_POOL_ADDRESS,
  ): Promise<BorrowPositionAccount | null> {
    try {
      const borrowPda = await findBorrowPositionPda(poolAddress, custody, owner);
      return await this.fetcher.getBorrowPosition(borrowPda);
    } catch {
      return null;
    }
  }
}
