import {
  Address,
  getProgramDerivedAddress,
  getAddressEncoder,
} from '@solana/kit';
import {
  JUPITER_PERPETUALS_PROGRAM_ID,
  PERPETUALS_ADDRESS,
  JUPITER_PERPETUALS_EVENT_AUTHORITY,
  PERPETUALS_SEED,
  TRANSFER_AUTHORITY_SEED,
  POOL_SEED,
  CUSTODY_SEED,
  POSITION_SEED,
  POSITION_REQUEST_SEED,
  BORROW_POSITION_SEED,
  TOKEN_LEDGER_SEED,
  EVENT_AUTHORITY_SEED,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '../constants.js';
import type { RequestChange } from '../types/index.js';

const addressEncoder = getAddressEncoder();
const textEncoder = new TextEncoder();

function addrBytes(addr: Address): Uint8Array {
  return new Uint8Array(addressEncoder.encode(addr));
}

function seedBytes(seed: string): Uint8Array {
  return textEncoder.encode(seed);
}

function counterBytes(counter: bigint): Uint8Array {
  const buf = new ArrayBuffer(8);
  new DataView(buf).setBigUint64(0, counter, true);
  return new Uint8Array(buf);
}

// ─── Constant PDAs ────────────────────────────────────────────────────────────
// These are deterministic and never change — return the pre-computed constant
// instead of re-running sha256 on every call.

/** Returns the Perpetuals global account PDA (constant). */
export async function findPerpetualsPda(): Promise<Address> {
  return PERPETUALS_ADDRESS;
}

/** Returns the event authority PDA (constant). */
export async function findEventAuthorityPda(): Promise<Address> {
  return JUPITER_PERPETUALS_EVENT_AUTHORITY;
}

// ─── Variable PDAs ────────────────────────────────────────────────────────────

export async function findTransferAuthorityPda(): Promise<Address> {
  const [pda] = await getProgramDerivedAddress({
    programAddress: JUPITER_PERPETUALS_PROGRAM_ID,
    seeds: [seedBytes(TRANSFER_AUTHORITY_SEED)],
  });
  return pda;
}

export async function findPoolPda(name: string = 'JLP'): Promise<Address> {
  const [pda] = await getProgramDerivedAddress({
    programAddress: JUPITER_PERPETUALS_PROGRAM_ID,
    seeds: [seedBytes(POOL_SEED), seedBytes(name)],
  });
  return pda;
}

export async function findCustodyPda(
  poolAddress: Address,
  custodyMint: Address,
): Promise<Address> {
  const [pda] = await getProgramDerivedAddress({
    programAddress: JUPITER_PERPETUALS_PROGRAM_ID,
    seeds: [seedBytes(CUSTODY_SEED), addrBytes(poolAddress), addrBytes(custodyMint)],
  });
  return pda;
}

/** Derives the on-chain position PDA for a given pool, custody, and owner. */
export async function findPositionPda(
  poolAddress: Address,
  custodyAddress: Address,
  ownerAddress: Address,
): Promise<Address> {
  const [pda] = await getProgramDerivedAddress({
    programAddress: JUPITER_PERPETUALS_PROGRAM_ID,
    seeds: [
      seedBytes(POSITION_SEED),
      addrBytes(poolAddress),
      addrBytes(custodyAddress),
      addrBytes(ownerAddress),
    ],
  });
  return pda;
}

/**
 * Derives a position request PDA.
 * The `counter` must be provided explicitly; use `findNextPositionRequestCounter`
 * if you do not already know it.
 */
/** Derives the position-request PDA for a pending increase or decrease. */
export async function findPositionRequestPda(
  positionAddress: Address,
  requestChange: RequestChange,
  counter: bigint = 0n,
): Promise<Address> {
  const [pda] = await getProgramDerivedAddress({
    programAddress: JUPITER_PERPETUALS_PROGRAM_ID,
    seeds: [
      seedBytes(POSITION_REQUEST_SEED),
      addrBytes(PERPETUALS_ADDRESS), // constant — no async lookup needed
      addrBytes(positionAddress),
      seedBytes(requestChange),
      counterBytes(counter),
    ],
  });
  return pda;
}

export async function findBorrowPositionPda(
  poolAddress: Address,
  custodyAddress: Address,
  ownerAddress: Address,
): Promise<Address> {
  const [pda] = await getProgramDerivedAddress({
    programAddress: JUPITER_PERPETUALS_PROGRAM_ID,
    seeds: [
      seedBytes(BORROW_POSITION_SEED),
      addrBytes(poolAddress),
      addrBytes(custodyAddress),
      addrBytes(ownerAddress),
    ],
  });
  return pda;
}

export async function findTokenLedgerPda(
  ownerAddress: Address,
  mintAddress: Address,
): Promise<Address> {
  const [pda] = await getProgramDerivedAddress({
    programAddress: JUPITER_PERPETUALS_PROGRAM_ID,
    seeds: [
      seedBytes(TOKEN_LEDGER_SEED),
      addrBytes(ownerAddress),
      addrBytes(mintAddress),
    ],
  });
  return pda;
}

/**
 * Derives the Associated Token Account address for a given owner + mint.
 * seeds = [owner, token_program, mint], program = ASSOCIATED_TOKEN_PROGRAM_ID
 */
export async function findAssociatedTokenAddress(
  owner: Address,
  mint: Address,
): Promise<Address> {
  const [ata] = await getProgramDerivedAddress({
    programAddress: ASSOCIATED_TOKEN_PROGRAM_ID,
    seeds: [addrBytes(owner), addrBytes(TOKEN_PROGRAM_ID), addrBytes(mint)],
  });
  return ata;
}
