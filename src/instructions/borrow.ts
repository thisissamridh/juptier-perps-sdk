import {
  Address,
  IInstruction,
  AccountRole,
  getU64Encoder,
  getStructEncoder,
} from '@solana/kit';
import {
  JUPITER_PERPETUALS_PROGRAM_ID,
  PERPETUALS_ADDRESS,
  JUPITER_PERPETUALS_EVENT_AUTHORITY,
  JLP_POOL_ADDRESS,
  JLP_MINT_ADDRESS,
  TRANSFER_AUTHORITY_ADDRESS,
  TOKEN_PROGRAM_ID,
  SYSTEM_PROGRAM_ID,
} from '../constants.js';
import { findBorrowPositionPda } from '../utils/pda.js';
import { INSTRUCTION_DISCRIMINATORS } from '../idl/discriminators.js';

const u64 = getU64Encoder();

// BorrowFromCustodyParams / RepayToCustodyParams / DepositParams / WithdrawParams: { amount: u64 }
const amountParamsEncoder = getStructEncoder([['amount', u64]]);

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BorrowInstructionParams {
  owner: Address;
  custody: Address;
  /** Custody's token vault */
  custodyTokenAccount: Address;
  /** Owner's ATA for custody mint */
  userTokenAccount: Address;
  amount: bigint;
  pool?: Address;
}

export interface RepayInstructionParams {
  owner: Address;
  custody: Address;
  custodyTokenAccount: Address;
  userTokenAccount: Address;
  amount: bigint;
  pool?: Address;
}

export interface DepositCollateralInstructionParams {
  owner: Address;
  custody: Address;
  collateralTokenAccount: Address;
  userTokenAccount: Address;
  amount: bigint;
  pool?: Address;
}

export interface WithdrawCollateralInstructionParams {
  owner: Address;
  custody: Address;
  collateralTokenAccount: Address;
  userTokenAccount: Address;
  amount: bigint;
  pool?: Address;
}

export interface LiquidateBorrowInstructionParams {
  liquidator: Address;
  owner: Address;
  custody: Address;
  custodyTokenAccount: Address;
  userTokenAccount: Address;
  amount: bigint;
  pool?: Address;
}

// ─── Instruction builders ────────────────────────────────────────────────────

/** Builds the borrowFromCustody instruction. */
export async function createBorrowInstruction(
  params: BorrowInstructionParams,
): Promise<IInstruction> {
  const { owner, custody, custodyTokenAccount, userTokenAccount, amount, pool = JLP_POOL_ADDRESS } = params;

  const borrowPosition = await findBorrowPositionPda(pool, custody, owner);

  return {
    programAddress: JUPITER_PERPETUALS_PROGRAM_ID,
    accounts: [
      { address: owner,                      role: AccountRole.WRITABLE_SIGNER },
      { address: PERPETUALS_ADDRESS,         role: AccountRole.READONLY },
      { address: pool,                       role: AccountRole.READONLY },
      { address: custody,                    role: AccountRole.WRITABLE },
      { address: TRANSFER_AUTHORITY_ADDRESS, role: AccountRole.READONLY },
      { address: borrowPosition,             role: AccountRole.WRITABLE },
      { address: custodyTokenAccount,        role: AccountRole.WRITABLE },
      { address: userTokenAccount,           role: AccountRole.WRITABLE },
      { address: JLP_MINT_ADDRESS,           role: AccountRole.READONLY },
      { address: TOKEN_PROGRAM_ID,           role: AccountRole.READONLY },
      { address: JUPITER_PERPETUALS_EVENT_AUTHORITY, role: AccountRole.READONLY },
      { address: JUPITER_PERPETUALS_PROGRAM_ID,      role: AccountRole.READONLY },
    ],
    data: new Uint8Array([
      ...INSTRUCTION_DISCRIMINATORS['borrowFromCustody'],
      ...amountParamsEncoder.encode({ amount }),
    ]),
  } as IInstruction;
}

export async function createRepayInstruction(
  params: RepayInstructionParams,
): Promise<IInstruction> {
  const { owner, custody, custodyTokenAccount, userTokenAccount, amount, pool = JLP_POOL_ADDRESS } = params;

  const borrowPosition = await findBorrowPositionPda(pool, custody, owner);

  return {
    programAddress: JUPITER_PERPETUALS_PROGRAM_ID,
    accounts: [
      { address: owner,            role: AccountRole.WRITABLE_SIGNER },
      { address: PERPETUALS_ADDRESS, role: AccountRole.READONLY },
      { address: pool,             role: AccountRole.READONLY },
      { address: custody,          role: AccountRole.WRITABLE },
      { address: borrowPosition,   role: AccountRole.WRITABLE },
      { address: custodyTokenAccount, role: AccountRole.WRITABLE },
      { address: userTokenAccount, role: AccountRole.WRITABLE },
      { address: TOKEN_PROGRAM_ID, role: AccountRole.READONLY },
      { address: JUPITER_PERPETUALS_EVENT_AUTHORITY, role: AccountRole.READONLY },
      { address: JUPITER_PERPETUALS_PROGRAM_ID,      role: AccountRole.READONLY },
    ],
    data: new Uint8Array([
      ...INSTRUCTION_DISCRIMINATORS['repayToCustody'],
      ...amountParamsEncoder.encode({ amount }),
    ]),
  } as IInstruction;
}

export async function createDepositCollateralInstruction(
  params: DepositCollateralInstructionParams,
): Promise<IInstruction> {
  const { owner, custody, collateralTokenAccount, userTokenAccount, amount, pool = JLP_POOL_ADDRESS } = params;

  const borrowPosition = await findBorrowPositionPda(pool, custody, owner);

  return {
    programAddress: JUPITER_PERPETUALS_PROGRAM_ID,
    accounts: [
      { address: owner,                      role: AccountRole.WRITABLE_SIGNER },
      { address: PERPETUALS_ADDRESS,         role: AccountRole.READONLY },
      { address: pool,                       role: AccountRole.READONLY },
      { address: custody,                    role: AccountRole.READONLY },
      { address: TRANSFER_AUTHORITY_ADDRESS, role: AccountRole.READONLY },
      { address: borrowPosition,             role: AccountRole.WRITABLE },
      { address: collateralTokenAccount,     role: AccountRole.WRITABLE },
      { address: userTokenAccount,           role: AccountRole.WRITABLE },
      { address: JLP_MINT_ADDRESS,           role: AccountRole.READONLY },
      { address: TOKEN_PROGRAM_ID,           role: AccountRole.READONLY },
      { address: SYSTEM_PROGRAM_ID,          role: AccountRole.READONLY },
      { address: JUPITER_PERPETUALS_EVENT_AUTHORITY, role: AccountRole.READONLY },
      { address: JUPITER_PERPETUALS_PROGRAM_ID,      role: AccountRole.READONLY },
    ],
    data: new Uint8Array([
      ...INSTRUCTION_DISCRIMINATORS['depositCollateralForBorrows'],
      ...amountParamsEncoder.encode({ amount }),
    ]),
  } as IInstruction;
}

export async function createWithdrawCollateralInstruction(
  params: WithdrawCollateralInstructionParams,
): Promise<IInstruction> {
  const { owner, custody, collateralTokenAccount, userTokenAccount, amount, pool = JLP_POOL_ADDRESS } = params;

  const borrowPosition = await findBorrowPositionPda(pool, custody, owner);

  return {
    programAddress: JUPITER_PERPETUALS_PROGRAM_ID,
    accounts: [
      { address: owner,                      role: AccountRole.WRITABLE_SIGNER },
      { address: PERPETUALS_ADDRESS,         role: AccountRole.READONLY },
      { address: pool,                       role: AccountRole.READONLY },
      { address: custody,                    role: AccountRole.WRITABLE },
      { address: TRANSFER_AUTHORITY_ADDRESS, role: AccountRole.READONLY },
      { address: borrowPosition,             role: AccountRole.WRITABLE },
      { address: collateralTokenAccount,     role: AccountRole.WRITABLE },
      { address: userTokenAccount,           role: AccountRole.WRITABLE },
      { address: JLP_MINT_ADDRESS,           role: AccountRole.READONLY },
      { address: TOKEN_PROGRAM_ID,           role: AccountRole.READONLY },
      { address: JUPITER_PERPETUALS_EVENT_AUTHORITY, role: AccountRole.READONLY },
      { address: JUPITER_PERPETUALS_PROGRAM_ID,      role: AccountRole.READONLY },
    ],
    data: new Uint8Array([
      ...INSTRUCTION_DISCRIMINATORS['withdrawCollateralForBorrows'],
      ...amountParamsEncoder.encode({ amount }),
    ]),
  } as IInstruction;
}

export async function createLiquidateBorrowInstruction(
  params: LiquidateBorrowInstructionParams,
): Promise<IInstruction> {
  const { liquidator, owner, custody, custodyTokenAccount, userTokenAccount, amount, pool = JLP_POOL_ADDRESS } = params;

  const borrowPosition = await findBorrowPositionPda(pool, custody, owner);

  return {
    programAddress: JUPITER_PERPETUALS_PROGRAM_ID,
    accounts: [
      { address: liquidator,     role: AccountRole.WRITABLE_SIGNER },
      { address: PERPETUALS_ADDRESS, role: AccountRole.READONLY },
      { address: pool,           role: AccountRole.READONLY },
      { address: custody,        role: AccountRole.WRITABLE },
      { address: borrowPosition, role: AccountRole.WRITABLE },
      { address: custodyTokenAccount, role: AccountRole.WRITABLE },
      { address: userTokenAccount,    role: AccountRole.WRITABLE },
      { address: TOKEN_PROGRAM_ID,    role: AccountRole.READONLY },
      { address: JUPITER_PERPETUALS_EVENT_AUTHORITY, role: AccountRole.READONLY },
      { address: JUPITER_PERPETUALS_PROGRAM_ID,      role: AccountRole.READONLY },
    ],
    data: new Uint8Array([
      ...INSTRUCTION_DISCRIMINATORS['liquidateBorrowPosition'],
      ...amountParamsEncoder.encode({ amount }),
    ]),
  } as IInstruction;
}
