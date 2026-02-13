import {
  Rpc,
  SolanaRpcApi,
  IInstruction,
  Address,
  pipe,
  createTransactionMessage,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  appendTransactionMessageInstructions,
} from '@solana/kit';
import { estimatePriorityFees, createComputeBudgetInstructions } from './priority-fees.js';

export interface BuildTransactionOptions {
  feePayer: Address;
  instructions: IInstruction[];
  /**
   * Override the priority fee (micro-lamports per compute unit).
   * When omitted the fee is estimated from `getRecentPrioritizationFees`
   * using the writable accounts in `instructions`.
   */
  priorityFee?: bigint;
  /**
   * Compute unit limit to request.
   * When omitted the value from the priority fee estimate is used (200 000 default).
   */
  computeUnits?: number;
}

/**
 * Assembles a v0 `TransactionMessage` ready for signing:
 *   1. Fetches a fresh blockhash.
 *   2. Estimates priority fees from the instruction's writable accounts (unless `priorityFee` is given).
 *   3. Prepends SetComputeUnitPrice + SetComputeUnitLimit instructions.
 *   4. Appends all caller instructions.
 *
 * @returns `{ message, blockhash, lastValidBlockHeight }`
 *
 * @example
 * const { message } = await buildTransactionMessage(client.rpc, {
 *   feePayer: myWalletAddress,
 *   instructions: [openIx],
 * });
 * const signed = await signTransactionMessageWithSigners(message);
 */
export async function buildTransactionMessage(
  rpc: Rpc<SolanaRpcApi>,
  options: BuildTransactionOptions,
) {
  const { instructions, feePayer } = options;

  // 1. Blockhash
  const { value: { blockhash, lastValidBlockHeight } } =
    await rpc.getLatestBlockhash().send();

  // 2. Priority fees
  let priorityFee = options.priorityFee;
  let computeUnits = options.computeUnits ?? 200_000;

  if (priorityFee === undefined) {
    const estimate = await estimatePriorityFees(rpc, { instructions, feePayer });
    priorityFee = estimate.recommended;
    if (options.computeUnits === undefined) computeUnits = estimate.computeUnits;
  }

  // 3. Compute budget + user instructions
  const computeBudgetIxs = createComputeBudgetInstructions(computeUnits, priorityFee);

  // 4. Assemble message
  const message = pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageFeePayer(feePayer, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash({ blockhash, lastValidBlockHeight }, tx),
    (tx) => appendTransactionMessageInstructions([...computeBudgetIxs, ...instructions], tx),
  );

  return { message, blockhash, lastValidBlockHeight };
}
