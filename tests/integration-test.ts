/**
 * Integration test — run with:
 *   npx tsx tests/integration-test.ts
 *
 * Tests three things:
 *   1. Discriminators — computed from IDL, no hardcoding
 *   2. On-chain account fetching — if discriminators are wrong, decode throws
 *   3. Instruction building — correct discriminator in the first 8 bytes
 */

import { createHash } from 'node:crypto';
import {
  createJupiterPerpsClient,
  CUSTODY_ADDRESSES,
  INSTRUCTION_DISCRIMINATORS,
  ACCOUNT_DISCRIMINATORS,
  bigintToUsd,
  JLP_POOL_ADDRESS,
} from '../src/index.js';
import { address } from '@solana/kit';

const RPC_URL = 'https://api.mainnet-beta.solana.com';
const DUMMY_OWNER = address('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM');
const DUMMY_ATA   = address('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // USDC mint as placeholder

let passed = 0;
let failed = 0;

function ok(label: string, value?: unknown) {
  console.log(`  ✓ ${label}`, value !== undefined ? value : '');
  passed++;
}

function fail(label: string, err: unknown) {
  console.error(`  ✗ ${label}:`, (err as Error).message ?? err);
  failed++;
}

// ─── 1. Discriminator sanity check ──────────────────────────────────────────

console.log('\n1. Discriminator correctness (sha256 from IDL)\n');

function disc(prefix: string, name: string) {
  return new Uint8Array(createHash('sha256').update(`${prefix}:${name}`).digest()).slice(0, 8);
}

const ixChecks = [
  'createIncreasePositionMarketRequest',
  'createDecreasePositionMarketRequest',
  'closePositionRequest',
  'addLiquidity2',
  'removeLiquidity2',
  'swap2',
  'borrowFromCustody',
  'repayToCustody',
] as const;

for (const name of ixChecks) {
  const expected = disc('global', name);
  const actual = INSTRUCTION_DISCRIMINATORS[name];
  const match = expected.every((b, i) => b === actual[i]);
  match
    ? ok(`${name}: [${[...actual].map(b => '0x' + b.toString(16).padStart(2,'0')).join(', ')}]`)
    : fail(`${name} discriminator mismatch`, new Error(`expected ${[...expected]} got ${[...actual]}`));
}

const accChecks = ['Perpetuals', 'Pool', 'Custody', 'Position', 'PositionRequest', 'BorrowPosition'] as const;
console.log('');
for (const name of accChecks) {
  const expected = disc('account', name);
  const actual = ACCOUNT_DISCRIMINATORS[name];
  const match = expected.every((b, i) => b === actual[i]);
  match
    ? ok(`${name}: [${[...actual].map(b => '0x' + b.toString(16).padStart(2,'0')).join(', ')}]`)
    : fail(`${name} account discriminator mismatch`, new Error(`expected ${[...expected]} got ${[...actual]}`));
}

async function runTests() {
  // ─── 2. On-chain account fetching ───────────────────────────────────────────

  console.log('\n2. On-chain account decoding (proves discriminators match program)\n');

  const client = createJupiterPerpsClient({ rpcUrl: RPC_URL });

  try {
    const pool = await client.accounts.pool.getPool();
    ok(`Pool decoded  — name: "${pool.name}"  AUM: $${bigintToUsd(pool.aumUsd)}  custodies: ${pool.custodies.length}`);
  } catch (e) { fail('Fetch pool', e); }

  try {
    const sol = await client.accounts.pool.getCustody('SOL');
    ok(`SOL custody  — decimals: ${sol.decimals}  isStable: ${sol.isStable}  targetRatioBps: ${sol.targetRatioBps}`);
    ok(`  dovesOracle: ${sol.dovesOracle}`);
    ok(`  oracle account: ${sol.oracle.oracleAccount}`);
  } catch (e) { fail('Fetch SOL custody', e); }

  try {
    const usdc = await client.accounts.pool.getCustody('USDC');
    ok(`USDC custody — decimals: ${usdc.decimals}  isStable: ${usdc.isStable}  targetRatioBps: ${usdc.targetRatioBps}`);
  } catch (e) { fail('Fetch USDC custody', e); }

  try {
    const all = await client.accounts.pool.getAllCustodies();
    ok(`All custodies fetched — count: ${all.size}`);
    for (const [, c] of all) {
      ok(`  mint=${c.mint}  targetRatioBps=${c.targetRatioBps}`);
    }
  } catch (e) { fail('Fetch all custodies', e); }

  // ─── 3. Instruction building ─────────────────────────────────────────────────

  console.log('\n3. Instruction building (discriminator in first 8 bytes)\n');

  function checkDisc(ixData: Uint8Array | undefined, name: string, label: string) {
    if (!ixData) { fail(label, new Error('no data')); return; }
    const expected = INSTRUCTION_DISCRIMINATORS[name];
    const actual = ixData.slice(0, 8);
    const match = expected.every((b, i) => b === actual[i]);
    match
      ? ok(`${label} — discriminator correct [${[...actual].map(b => '0x' + b.toString(16).padStart(2,'0')).join(', ')}]`)
      : fail(`${label} discriminator wrong (got ${[...actual]}, want ${[...expected]})`, new Error('mismatch'));
  }

  try {
    const ix = await client.position.open({
      owner: DUMMY_OWNER,
      fundingAccount: DUMMY_ATA,
      custody: CUSTODY_ADDRESSES.SOL,
      collateralCustody: CUSTODY_ADDRESSES.USDC,
      inputMint: DUMMY_ATA,
      side: 'long',
      sizeUsdDelta: 1_000_000_000n,
      collateralTokenDelta: 200_000_000n,
      priceSlippage: 100_000_000n,
    });
    checkDisc(ix.data as Uint8Array, 'createIncreasePositionMarketRequest', 'open position');
    ok(`open position — accounts: ${ix.accounts?.length}  data: ${ix.data?.length} bytes`);
  } catch (e) { fail('Build open position', e); }

  try {
    const positionAddr = await client.position.findByOwner(DUMMY_OWNER, CUSTODY_ADDRESSES.SOL);
    const ix = await client.position.close({
      owner: DUMMY_OWNER,
      receivingAccount: DUMMY_ATA,
      position: positionAddr,
      custody: CUSTODY_ADDRESSES.SOL,
      collateralCustody: CUSTODY_ADDRESSES.USDC,
      desiredMint: DUMMY_ATA,
      priceSlippage: 100_000_000n,
      entirePosition: true,
    });
    checkDisc(ix.data as Uint8Array, 'createDecreasePositionMarketRequest', 'close position');
    ok(`close position — accounts: ${ix.accounts?.length}  data: ${ix.data?.length} bytes`);
  } catch (e) { fail('Build close position', e); }

  try {
    const sol = await client.accounts.pool.getCustody('SOL');
    const ix = await client.jlp.addLiquidity({
      owner: DUMMY_OWNER,
      fundingAccount: DUMMY_ATA,
      lpTokenAccount: DUMMY_ATA,
      custody: CUSTODY_ADDRESSES.SOL,
      custodyTokenAccount: sol.tokenAccount,
      custodyDovesPriceAccount: sol.dovesOracle,
      custodyPythnetPriceAccount: sol.oracle.oracleAccount,
      tokenAmountIn: 1_000_000_000n,
      minLpAmountOut: 0n,
    });
    checkDisc(ix.data as Uint8Array, 'addLiquidity2', 'add liquidity');
    ok(`add liquidity — accounts: ${ix.accounts?.length}  data: ${ix.data?.length} bytes`);
  } catch (e) { fail('Build add liquidity', e); }

  try {
    const usdc = await client.accounts.pool.getCustody('USDC');
    const ix = await client.borrow.borrow({
      owner: DUMMY_OWNER,
      custody: CUSTODY_ADDRESSES.USDC,
      custodyTokenAccount: usdc.tokenAccount,
      userTokenAccount: DUMMY_ATA,
      amount: 100_000_000n,
    });
    checkDisc(ix.data as Uint8Array, 'borrowFromCustody', 'borrow');
    ok(`borrow — accounts: ${ix.accounts?.length}  data: ${ix.data?.length} bytes`);
  } catch (e) { fail('Build borrow', e); }

  // ─── Summary ─────────────────────────────────────────────────────────────────

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`  Passed: ${passed}   Failed: ${failed}`);
  console.log(`${'─'.repeat(50)}\n`);
  if (failed > 0) process.exit(1);
}

runTests();
