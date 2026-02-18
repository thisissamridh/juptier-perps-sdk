import {
  Rpc,
  SolanaRpcApi,
  IInstruction,
  Address,
  AccountRole,
} from '@solana/kit';
import {
  COMPUTE_BUDGET_PROGRAM_ADDRESS,
  getSetComputeUnitLimitInstruction,
  getSetComputeUnitPriceInstruction,
} from '@solana-program/compute-budget';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  SYSTEM_PROGRAM_ID,
} from '../constants.js';

export interface PriorityFeeLevel {
  min: bigint;
  low: bigint;
  medium: bigint;
  high: bigint;
  veryHigh: bigint;
  default: bigint;
}

export interface PriorityFeeEstimate {
  recommended: bigint;
  levels: PriorityFeeLevel;
  computeUnits: number;
}

export interface EstimatePriorityFeesOptions {
  instructions: IInstruction[];
  feePayer: Address;
  basePriorityFee?: bigint;
}

const BASE_COMPUTE_UNITS = 200_000;

// Programs that never hold user state and are irrelevant to priority fee routing.
const SKIP_PROGRAMS = new Set<string>([
  SYSTEM_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  COMPUTE_BUDGET_PROGRAM_ADDRESS,
  'Sysvar1nstructions1111111111111111111111111',
  'SysvarRent111111111111111111111111111111111',
  'SysvarC1ock11111111111111111111111111111111',
]);

/**
 * Collect unique writable accounts from an instruction set, skipping
 * system programs.  The Solana RPC uses these to return fee data that
 * is specific to the accounts your transaction touches.
 */
function extractWritableAccounts(instructions: IInstruction[], feePayer: Address): Address[] {
  const seen = new Set<string>();
  seen.add(feePayer); // fee payer is always writable
  const result: Address[] = [feePayer];

  for (const ix of instructions) {
    for (const account of ix.accounts ?? []) {
      const isWritable =
        account.role === AccountRole.WRITABLE ||
        account.role === AccountRole.WRITABLE_SIGNER;
      if (isWritable && !seen.has(account.address) && !SKIP_PROGRAMS.has(account.address)) {
        seen.add(account.address);
        result.push(account.address);
      }
    }
  }

  // RPC accepts at most 128 addresses
  return result.slice(0, 128);
}

/** Estimates priority fees using recent prioritization fee data from the RPC. */
export async function estimatePriorityFees(
  rpc: Rpc<SolanaRpcApi>,
  options: EstimatePriorityFeesOptions,
): Promise<PriorityFeeEstimate> {
  const { basePriorityFee = 1000n } = options;

  const accounts = extractWritableAccounts(options.instructions, options.feePayer);
  const recentPriorityFees = await rpc.getRecentPrioritizationFees(accounts).send();

  const fees = recentPriorityFees.map((f) => f.prioritizationFee);

  const levels: PriorityFeeLevel = {
    min:      basePriorityFee,
    low:      percentile(fees, 25)  ?? basePriorityFee,
    medium:   percentile(fees, 50)  ?? basePriorityFee,
    high:     percentile(fees, 75)  ?? basePriorityFee,
    veryHigh: percentile(fees, 95)  ?? basePriorityFee,
    default:  percentile(fees, 50)  ?? basePriorityFee,
  };

  const recommended = levels.medium > basePriorityFee ? levels.medium : basePriorityFee;

  return { recommended, levels, computeUnits: BASE_COMPUTE_UNITS };
}

function percentile(values: bigint[], p: number): bigint | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => Number(a - b));
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

/** Builds SetComputeUnitPrice and SetComputeUnitLimit instructions. */
export function createComputeBudgetInstructions(
  computeUnits: number,
  priorityFee: bigint,
): IInstruction[] {
  return [
    getSetComputeUnitPriceInstruction({ microLamports: priorityFee }),
    getSetComputeUnitLimitInstruction({ units: computeUnits }),
  ];
}
