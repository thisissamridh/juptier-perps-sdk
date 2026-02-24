import {
  Address,
  IInstruction,
  AccountRole,
  getU64Encoder,
  getStructEncoder,
  getOptionEncoder,
} from '@solana/kit';
import {
  JUPITER_PERPETUALS_PROGRAM_ID,
  PERPETUALS_ADDRESS,
  JUPITER_PERPETUALS_EVENT_AUTHORITY,
  JLP_POOL_ADDRESS,
  JLP_MINT_ADDRESS,
  TRANSFER_AUTHORITY_ADDRESS,
  TOKEN_PROGRAM_ID,
} from '../constants.js';
import { INSTRUCTION_DISCRIMINATORS } from '../idl/discriminators.js';

const u64        = getU64Encoder();
const optionU64  = getOptionEncoder(u64);

// AddLiquidity2Params: tokenAmountIn, minLpAmountOut, tokenAmountPreSwap?
const addLiquidityParamsEncoder = getStructEncoder([
  ['tokenAmountIn',      u64],
  ['minLpAmountOut',     u64],
  ['tokenAmountPreSwap', optionU64],
]);

// RemoveLiquidity2Params: lpAmountIn, minAmountOut
const removeLiquidityParamsEncoder = getStructEncoder([
  ['lpAmountIn',   u64],
  ['minAmountOut', u64],
]);

// Swap2Params: amountIn, minAmountOut
const swapParamsEncoder = getStructEncoder([
  ['amountIn',     u64],
  ['minAmountOut', u64],
]);

// GetAddLiquidityAmountAndFee2Params (view): tokenAmountIn
const getAddLiquidityParamsEncoder = getStructEncoder([
  ['tokenAmountIn', u64],
]);

// GetRemoveLiquidityAmountAndFee2Params (view): lpAmountIn
const getRemoveLiquidityParamsEncoder = getStructEncoder([
  ['lpAmountIn', u64],
]);

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AddLiquidityInstructionParams {
  owner: Address;
  /** Owner's ATA for the custody mint */
  fundingAccount: Address;
  /** Owner's ATA for JLP */
  lpTokenAccount: Address;
  custody: Address;
  /** Custody's token vault (ATA of transferAuthority for custody mint) */
  custodyTokenAccount: Address;
  /** Doves oracle price account (custody.dovesOracle) */
  custodyDovesPriceAccount: Address;
  /** Pythnet oracle price account (custody.oracle.oracleAccount) */
  custodyPythnetPriceAccount: Address;
  tokenAmountIn: bigint;
  minLpAmountOut: bigint;
  tokenAmountPreSwap?: bigint;
  pool?: Address;
}

export interface RemoveLiquidityInstructionParams {
  owner: Address;
  /** Owner's ATA for the custody mint (receives withdrawn tokens) */
  receivingAccount: Address;
  /** Owner's ATA for JLP */
  lpTokenAccount: Address;
  custody: Address;
  /** Custody's token vault */
  custodyTokenAccount: Address;
  custodyDovesPriceAccount: Address;
  custodyPythnetPriceAccount: Address;
  lpAmountIn: bigint;
  minAmountOut: bigint;
  pool?: Address;
}

export interface SwapInstructionParams {
  owner: Address;
  /** Owner's ATA for inputCustody mint */
  fundingAccount: Address;
  /** Owner's ATA for outputCustody mint */
  receivingAccount: Address;
  inputCustody: Address;
  outputCustody: Address;
  /** Token vault for inputCustody */
  receivingCustodyTokenAccount: Address;
  /** Token vault for outputCustody */
  dispensingCustodyTokenAccount: Address;
  receivingCustodyDovesPriceAccount: Address;
  receivingCustodyPythnetPriceAccount: Address;
  dispensingCustodyDovesPriceAccount: Address;
  dispensingCustodyPythnetPriceAccount: Address;
  amountIn: bigint;
  minAmountOut: bigint;
  pool?: Address;
}

export interface GetAddLiquidityQuoteParams {
  custody: Address;
  custodyDovesPriceAccount: Address;
  custodyPythnetPriceAccount: Address;
  tokenAmountIn: bigint;
  pool?: Address;
}

export interface GetRemoveLiquidityQuoteParams {
  custody: Address;
  custodyDovesPriceAccount: Address;
  custodyPythnetPriceAccount: Address;
  lpAmountIn: bigint;
  pool?: Address;
}

// ─── Instruction builders ────────────────────────────────────────────────────

/** Builds the addLiquidity2 instruction for minting JLP tokens. */
export async function createAddLiquidityInstruction(
  params: AddLiquidityInstructionParams,
): Promise<IInstruction> {
  const {
    owner,
    fundingAccount,
    lpTokenAccount,
    custody,
    custodyTokenAccount,
    custodyDovesPriceAccount,
    custodyPythnetPriceAccount,
    tokenAmountIn,
    minLpAmountOut,
    tokenAmountPreSwap,
    pool = JLP_POOL_ADDRESS,
  } = params;

  const data = new Uint8Array([
    ...INSTRUCTION_DISCRIMINATORS['addLiquidity2'],
    ...addLiquidityParamsEncoder.encode({
      tokenAmountIn,
      minLpAmountOut,
      tokenAmountPreSwap: tokenAmountPreSwap ?? null,
    }),
  ]);

  return {
    programAddress: JUPITER_PERPETUALS_PROGRAM_ID,
    accounts: [
      { address: owner,                       role: AccountRole.READONLY_SIGNER },
      { address: fundingAccount,              role: AccountRole.WRITABLE },
      { address: lpTokenAccount,              role: AccountRole.WRITABLE },
      { address: TRANSFER_AUTHORITY_ADDRESS,  role: AccountRole.READONLY },
      { address: PERPETUALS_ADDRESS,          role: AccountRole.READONLY },
      { address: pool,                        role: AccountRole.WRITABLE },
      { address: custody,                     role: AccountRole.WRITABLE },
      { address: custodyDovesPriceAccount,    role: AccountRole.READONLY },
      { address: custodyPythnetPriceAccount,  role: AccountRole.READONLY },
      { address: custodyTokenAccount,         role: AccountRole.WRITABLE },
      { address: JLP_MINT_ADDRESS,            role: AccountRole.WRITABLE },
      { address: TOKEN_PROGRAM_ID,            role: AccountRole.READONLY },
      { address: JUPITER_PERPETUALS_EVENT_AUTHORITY, role: AccountRole.READONLY },
      { address: JUPITER_PERPETUALS_PROGRAM_ID,      role: AccountRole.READONLY },
    ],
    data,
  } as IInstruction;
}

/** Builds the removeLiquidity2 instruction for redeeming JLP tokens. */
export async function createRemoveLiquidityInstruction(
  params: RemoveLiquidityInstructionParams,
): Promise<IInstruction> {
  const {
    owner,
    receivingAccount,
    lpTokenAccount,
    custody,
    custodyTokenAccount,
    custodyDovesPriceAccount,
    custodyPythnetPriceAccount,
    lpAmountIn,
    minAmountOut,
    pool = JLP_POOL_ADDRESS,
  } = params;

  const data = new Uint8Array([
    ...INSTRUCTION_DISCRIMINATORS['removeLiquidity2'],
    ...removeLiquidityParamsEncoder.encode({ lpAmountIn, minAmountOut }),
  ]);

  return {
    programAddress: JUPITER_PERPETUALS_PROGRAM_ID,
    accounts: [
      { address: owner,                       role: AccountRole.READONLY_SIGNER },
      { address: receivingAccount,            role: AccountRole.WRITABLE },
      { address: lpTokenAccount,              role: AccountRole.WRITABLE },
      { address: TRANSFER_AUTHORITY_ADDRESS,  role: AccountRole.READONLY },
      { address: PERPETUALS_ADDRESS,          role: AccountRole.READONLY },
      { address: pool,                        role: AccountRole.WRITABLE },
      { address: custody,                     role: AccountRole.WRITABLE },
      { address: custodyDovesPriceAccount,    role: AccountRole.READONLY },
      { address: custodyPythnetPriceAccount,  role: AccountRole.READONLY },
      { address: custodyTokenAccount,         role: AccountRole.WRITABLE },
      { address: JLP_MINT_ADDRESS,            role: AccountRole.WRITABLE },
      { address: TOKEN_PROGRAM_ID,            role: AccountRole.READONLY },
      { address: JUPITER_PERPETUALS_EVENT_AUTHORITY, role: AccountRole.READONLY },
      { address: JUPITER_PERPETUALS_PROGRAM_ID,      role: AccountRole.READONLY },
    ],
    data,
  } as IInstruction;
}

export async function createSwapInstruction(
  params: SwapInstructionParams,
): Promise<IInstruction> {
  const {
    owner,
    fundingAccount,
    receivingAccount,
    inputCustody,
    outputCustody,
    receivingCustodyTokenAccount,
    dispensingCustodyTokenAccount,
    receivingCustodyDovesPriceAccount,
    receivingCustodyPythnetPriceAccount,
    dispensingCustodyDovesPriceAccount,
    dispensingCustodyPythnetPriceAccount,
    amountIn,
    minAmountOut,
    pool = JLP_POOL_ADDRESS,
  } = params;

  const data = new Uint8Array([
    ...INSTRUCTION_DISCRIMINATORS['swap2'],
    ...swapParamsEncoder.encode({ amountIn, minAmountOut }),
  ]);

  return {
    programAddress: JUPITER_PERPETUALS_PROGRAM_ID,
    accounts: [
      { address: owner,                               role: AccountRole.READONLY_SIGNER },
      { address: fundingAccount,                      role: AccountRole.WRITABLE },
      { address: receivingAccount,                    role: AccountRole.WRITABLE },
      { address: TRANSFER_AUTHORITY_ADDRESS,          role: AccountRole.READONLY },
      { address: PERPETUALS_ADDRESS,                  role: AccountRole.READONLY },
      { address: pool,                                role: AccountRole.WRITABLE },
      { address: inputCustody,                        role: AccountRole.WRITABLE },
      { address: receivingCustodyDovesPriceAccount,   role: AccountRole.READONLY },
      { address: receivingCustodyPythnetPriceAccount, role: AccountRole.READONLY },
      { address: receivingCustodyTokenAccount,        role: AccountRole.WRITABLE },
      { address: outputCustody,                       role: AccountRole.WRITABLE },
      { address: dispensingCustodyDovesPriceAccount,  role: AccountRole.READONLY },
      { address: dispensingCustodyPythnetPriceAccount, role: AccountRole.READONLY },
      { address: dispensingCustodyTokenAccount,       role: AccountRole.WRITABLE },
      { address: TOKEN_PROGRAM_ID,                    role: AccountRole.READONLY },
      { address: JUPITER_PERPETUALS_EVENT_AUTHORITY,  role: AccountRole.READONLY },
      { address: JUPITER_PERPETUALS_PROGRAM_ID,       role: AccountRole.READONLY },
    ],
    data,
  } as IInstruction;
}

export async function createGetAddLiquidityQuoteInstruction(
  params: GetAddLiquidityQuoteParams,
): Promise<IInstruction> {
  const {
    custody,
    custodyDovesPriceAccount,
    custodyPythnetPriceAccount,
    tokenAmountIn,
    pool = JLP_POOL_ADDRESS,
  } = params;

  const data = new Uint8Array([
    ...INSTRUCTION_DISCRIMINATORS['getAddLiquidityAmountAndFee2'],
    ...getAddLiquidityParamsEncoder.encode({ tokenAmountIn }),
  ]);

  return {
    programAddress: JUPITER_PERPETUALS_PROGRAM_ID,
    accounts: [
      { address: PERPETUALS_ADDRESS,         role: AccountRole.READONLY },
      { address: pool,                       role: AccountRole.READONLY },
      { address: custody,                    role: AccountRole.READONLY },
      { address: custodyDovesPriceAccount,   role: AccountRole.READONLY },
      { address: custodyPythnetPriceAccount, role: AccountRole.READONLY },
      { address: JLP_MINT_ADDRESS,           role: AccountRole.READONLY },
    ],
    data,
  } as IInstruction;
}

export async function createGetRemoveLiquidityQuoteInstruction(
  params: GetRemoveLiquidityQuoteParams,
): Promise<IInstruction> {
  const {
    custody,
    custodyDovesPriceAccount,
    custodyPythnetPriceAccount,
    lpAmountIn,
    pool = JLP_POOL_ADDRESS,
  } = params;

  const data = new Uint8Array([
    ...INSTRUCTION_DISCRIMINATORS['getRemoveLiquidityAmountAndFee2'],
    ...getRemoveLiquidityParamsEncoder.encode({ lpAmountIn }),
  ]);

  return {
    programAddress: JUPITER_PERPETUALS_PROGRAM_ID,
    accounts: [
      { address: PERPETUALS_ADDRESS,         role: AccountRole.READONLY },
      { address: pool,                       role: AccountRole.READONLY },
      { address: custody,                    role: AccountRole.READONLY },
      { address: custodyDovesPriceAccount,   role: AccountRole.READONLY },
      { address: custodyPythnetPriceAccount, role: AccountRole.READONLY },
      { address: JLP_MINT_ADDRESS,           role: AccountRole.READONLY },
    ],
    data,
  } as IInstruction;
}

export async function createGetAumInstruction(
  pool: Address = JLP_POOL_ADDRESS,
): Promise<IInstruction> {
  const data = new Uint8Array([
    ...INSTRUCTION_DISCRIMINATORS['getAssetsUnderManagement2'],
  ]);

  return {
    programAddress: JUPITER_PERPETUALS_PROGRAM_ID,
    accounts: [
      { address: PERPETUALS_ADDRESS, role: AccountRole.READONLY },
      { address: pool,               role: AccountRole.READONLY },
    ],
    data,
  } as IInstruction;
}
