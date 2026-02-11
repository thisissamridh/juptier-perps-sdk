import {
  Address,
  IInstruction,
  AccountRole,
  getU64Encoder,
  getStructEncoder,
  getDataEnumEncoder,
  getUnitEncoder,
  getOptionEncoder,
  getBooleanEncoder,
} from '@solana/kit';
import {
  JUPITER_PERPETUALS_PROGRAM_ID,
  PERPETUALS_ADDRESS,
  JUPITER_PERPETUALS_EVENT_AUTHORITY,
  JLP_POOL_ADDRESS,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  SYSTEM_PROGRAM_ID,
} from '../constants.js';
import {
  findPositionPda,
  findPositionRequestPda,
  findAssociatedTokenAddress,
} from '../utils/pda.js';
import { INSTRUCTION_DISCRIMINATORS } from '../idl/discriminators.js';
import type { Side, RequestChange } from '../types/enums.js';

// ─── Arg encoders (order MUST match IDL param struct field order) ─────────────

const u64      = getU64Encoder();
const bool     = getBooleanEncoder();
const optionU64  = getOptionEncoder(u64);
const optionBool = getOptionEncoder(bool);

// IDL Side: { None=0, Long=1, Short=2 }
const sideEncoder = getDataEnumEncoder([
  ['none',  getUnitEncoder()],
  ['long',  getUnitEncoder()],
  ['short', getUnitEncoder()],
]);

// CreateIncreasePositionMarketRequestParams:
//   sizeUsdDelta, collateralTokenDelta, side, priceSlippage, jupiterMinimumOut?, counter
const increaseParamsEncoder = getStructEncoder([
  ['sizeUsdDelta',         u64],
  ['collateralTokenDelta', u64],
  ['side',                 sideEncoder],
  ['priceSlippage',        u64],
  ['jupiterMinimumOut',    optionU64],
  ['counter',              u64],
]);

// CreateDecreasePositionMarketRequestParams:
//   collateralUsdDelta, sizeUsdDelta, priceSlippage, jupiterMinimumOut?, entirePosition?, counter
const decreaseParamsEncoder = getStructEncoder([
  ['collateralUsdDelta', u64],
  ['sizeUsdDelta',       u64],
  ['priceSlippage',      u64],
  ['jupiterMinimumOut',  optionU64],
  ['entirePosition',     optionBool],
  ['counter',            u64],
]);

// ClosePositionRequestParams: {} (empty struct)
const closeRequestParamsEncoder = getStructEncoder([]);

// ─── Types ───────────────────────────────────────────────────────────────────

export interface OpenPositionParams {
  /** Transaction signer and position owner */
  owner: Address;
  /** Owner's token ATA for inputMint */
  fundingAccount: Address;
  custody: Address;
  collateralCustody: Address;
  /** Mint being deposited as collateral */
  inputMint: Address;
  side: Side;
  sizeUsdDelta: bigint;
  collateralTokenDelta: bigint;
  priceSlippage: bigint;
  jupiterMinimumOut?: bigint;
  /** Counter for position request PDA uniqueness. Defaults to 0. */
  counter?: bigint;
  referral?: Address;
  pool?: Address;
}

export interface ClosePositionParams {
  owner: Address;
  /** Owner's ATA for desiredMint (receives proceeds) */
  receivingAccount: Address;
  position: Address;
  custody: Address;
  collateralCustody: Address;
  desiredMint: Address;
  priceSlippage: bigint;
  sizeUsdDelta?: bigint;
  collateralUsdDelta?: bigint;
  entirePosition?: boolean;
  jupiterMinimumOut?: bigint;
  /** Counter for position request PDA uniqueness. Defaults to 0. */
  counter?: bigint;
  referral?: Address;
  pool?: Address;
}

export interface CancelPositionRequestParams {
  /** Must sign (can be owner acting as keeper) */
  keeper: Address;
  owner: Address;
  /** Owner's ATA for the position request token */
  ownerAta: Address;
  /** Mint of the token that was escrowed in the position request */
  inputMint: Address;
  position: Address;
  requestChange: RequestChange;
  pool?: Address;
}

// ─── Instruction builders ────────────────────────────────────────────────────

export async function createIncreasePositionMarketRequestInstruction(
  params: OpenPositionParams,
): Promise<IInstruction> {
  const {
    owner,
    fundingAccount,
    custody,
    collateralCustody,
    inputMint,
    side,
    sizeUsdDelta,
    collateralTokenDelta,
    priceSlippage,
    jupiterMinimumOut,
    counter = 0n,
    referral,
    pool = JLP_POOL_ADDRESS,
  } = params;

  const [position, positionRequest] = await Promise.all([
    findPositionPda(pool, custody, owner),
    findPositionPda(pool, custody, owner).then(pos =>
      findPositionRequestPda(pos, 'increase', counter)
    ),
  ]);

  // The ATA of the positionRequest PDA for the inputMint — where collateral is
  // escrowed while the keeper processes the request.
  const positionRequestAta = await findAssociatedTokenAddress(positionRequest, inputMint);

  const data = new Uint8Array([
    ...INSTRUCTION_DISCRIMINATORS['createIncreasePositionMarketRequest'],
    ...increaseParamsEncoder.encode({
      sizeUsdDelta,
      collateralTokenDelta,
      side: { __kind: side },
      priceSlippage,
      jupiterMinimumOut: jupiterMinimumOut ?? null,
      counter,
    }),
  ]);

  return {
    programAddress: JUPITER_PERPETUALS_PROGRAM_ID,
    accounts: [
      { address: owner,                       role: AccountRole.WRITABLE_SIGNER },
      { address: fundingAccount,              role: AccountRole.WRITABLE },
      { address: PERPETUALS_ADDRESS,          role: AccountRole.READONLY },
      { address: pool,                        role: AccountRole.READONLY },
      { address: position,                    role: AccountRole.WRITABLE },
      { address: positionRequest,             role: AccountRole.WRITABLE },
      { address: positionRequestAta,          role: AccountRole.WRITABLE },
      { address: custody,                     role: AccountRole.READONLY },
      { address: collateralCustody,           role: AccountRole.READONLY },
      { address: inputMint,                   role: AccountRole.READONLY },
      { address: referral ?? owner,           role: AccountRole.READONLY },
      { address: TOKEN_PROGRAM_ID,            role: AccountRole.READONLY },
      { address: ASSOCIATED_TOKEN_PROGRAM_ID, role: AccountRole.READONLY },
      { address: SYSTEM_PROGRAM_ID,           role: AccountRole.READONLY },
      { address: JUPITER_PERPETUALS_EVENT_AUTHORITY, role: AccountRole.READONLY },
      { address: JUPITER_PERPETUALS_PROGRAM_ID,      role: AccountRole.READONLY },
    ],
    data,
  } as IInstruction;
}

export async function createDecreasePositionMarketRequestInstruction(
  params: ClosePositionParams,
): Promise<IInstruction> {
  const {
    owner,
    receivingAccount,
    position,
    custody,
    collateralCustody,
    desiredMint,
    priceSlippage,
    sizeUsdDelta = 0n,
    collateralUsdDelta = 0n,
    entirePosition,
    jupiterMinimumOut,
    counter = 0n,
    referral,
    pool = JLP_POOL_ADDRESS,
  } = params;

  const positionRequest = await findPositionRequestPda(position, 'decrease', counter);

  // The ATA of the positionRequest PDA for the desiredMint — receives proceeds
  // from the keeper before forwarding to the user's receivingAccount.
  const positionRequestAta = await findAssociatedTokenAddress(positionRequest, desiredMint);

  const isEntirePosition =
    entirePosition !== undefined ? entirePosition : sizeUsdDelta === 0n;

  const data = new Uint8Array([
    ...INSTRUCTION_DISCRIMINATORS['createDecreasePositionMarketRequest'],
    ...decreaseParamsEncoder.encode({
      collateralUsdDelta,
      sizeUsdDelta,
      priceSlippage,
      jupiterMinimumOut: jupiterMinimumOut ?? null,
      entirePosition: isEntirePosition ?? null,
      counter,
    }),
  ]);

  return {
    programAddress: JUPITER_PERPETUALS_PROGRAM_ID,
    accounts: [
      { address: owner,             role: AccountRole.WRITABLE_SIGNER },
      { address: receivingAccount,  role: AccountRole.WRITABLE },
      { address: PERPETUALS_ADDRESS, role: AccountRole.READONLY },
      { address: pool,              role: AccountRole.READONLY },
      { address: position,          role: AccountRole.READONLY },
      { address: positionRequest,   role: AccountRole.WRITABLE },
      { address: positionRequestAta, role: AccountRole.WRITABLE },
      { address: custody,           role: AccountRole.READONLY },
      { address: collateralCustody, role: AccountRole.READONLY },
      { address: desiredMint,       role: AccountRole.READONLY },
      { address: referral ?? owner, role: AccountRole.READONLY },
      { address: TOKEN_PROGRAM_ID,  role: AccountRole.READONLY },
      { address: ASSOCIATED_TOKEN_PROGRAM_ID, role: AccountRole.READONLY },
      { address: SYSTEM_PROGRAM_ID, role: AccountRole.READONLY },
      { address: JUPITER_PERPETUALS_EVENT_AUTHORITY, role: AccountRole.READONLY },
      { address: JUPITER_PERPETUALS_PROGRAM_ID,      role: AccountRole.READONLY },
    ],
    data,
  } as IInstruction;
}

/**
 * Cancel/close a pending position request (e.g. if a keeper hasn't processed it yet).
 * The signer acts as the `keeper` account in the instruction.
 */
export async function createClosePositionRequestInstruction(
  params: CancelPositionRequestParams,
): Promise<IInstruction> {
  const {
    keeper,
    owner,
    ownerAta,
    inputMint,
    position,
    requestChange,
    pool = JLP_POOL_ADDRESS,
  } = params;

  const positionRequest = await findPositionRequestPda(position, requestChange, 0n);
  const positionRequestAta = await findAssociatedTokenAddress(positionRequest, inputMint);

  const data = new Uint8Array([
    ...INSTRUCTION_DISCRIMINATORS['closePositionRequest'],
    ...closeRequestParamsEncoder.encode({}),
  ]);

  return {
    programAddress: JUPITER_PERPETUALS_PROGRAM_ID,
    accounts: [
      { address: keeper,           role: AccountRole.READONLY_SIGNER },
      { address: owner,            role: AccountRole.WRITABLE },
      { address: ownerAta,         role: AccountRole.WRITABLE },
      { address: pool,             role: AccountRole.WRITABLE },
      { address: positionRequest,  role: AccountRole.WRITABLE },
      { address: positionRequestAta, role: AccountRole.WRITABLE },
      { address: position,         role: AccountRole.READONLY },
      { address: TOKEN_PROGRAM_ID, role: AccountRole.READONLY },
      { address: JUPITER_PERPETUALS_EVENT_AUTHORITY, role: AccountRole.READONLY },
      { address: JUPITER_PERPETUALS_PROGRAM_ID,      role: AccountRole.READONLY },
    ],
    data,
  } as IInstruction;
}
