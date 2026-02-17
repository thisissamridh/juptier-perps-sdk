/**
 * Run with: npx tsx tests/verify-decode.ts
 *
 * Prints decoded values you can cross-check on:
 *   - https://jup.ag/perps  (AUM, target allocations, custody addresses)
 *   - https://solscan.io    (token vault balance, oracle accounts)
 */

import { createJupiterPerpsClient, CUSTODY_ADDRESSES } from '../src/index.js';

const client = createJupiterPerpsClient({ rpcUrl: 'https://api.mainnet-beta.solana.com' });

async function main() {
  // ─── Pool ────────────────────────────────────────────────────────────────────

  const pool = await client.accounts.pool.getPool();

  console.log('\n══ POOL ══════════════════════════════════════════════════════');
  console.log(`name              : ${pool.name}`);
  // aumUsd is stored as a "raw" u128 with 6 decimal places of precision
  console.log(`aumUsd (raw u128) : ${pool.aumUsd}`);
  console.log(`aumUsd (human)    : $${(Number(pool.aumUsd) / 1e6).toFixed(2)}`);
  console.log(`  → check this matches the JLP Pool AUM on https://jup.ag/perps`);
  console.log(`custodies count   : ${pool.custodies.length}  (expect 5)`);
  pool.custodies.forEach((addr, i) => console.log(`  custody[${i}]: ${addr}`));
  console.log(`  → paste each address into solscan.io to confirm they are custody accounts`);
  console.log(`maxRequestExecutionSec: ${pool.maxRequestExecutionSec}`);
  console.log(`inceptionTime     : ${pool.inceptionTime}  (unix ts)`);
  console.log(`aumUsdUpdatedAt   : ${pool.aumUsdUpdatedAt}`);

  // ─── SOL Custody ────────────────────────────────────────────────────────────

  const sol = await client.accounts.pool.getCustody('SOL');

  console.log('\n══ SOL CUSTODY ═══════════════════════════════════════════════');
  console.log(`address           : ${CUSTODY_ADDRESSES.SOL}`);
  console.log(`mint              : ${sol.mint}`);
  console.log(`  → should be So11111111111111111111111111111111111111112 (native SOL mint)`);
  console.log(`tokenAccount      : ${sol.tokenAccount}`);
  console.log(`  → paste into solscan.io → check its SOL balance = assets.owned / 10^9`);
  console.log(`decimals          : ${sol.decimals}  (expect 9)`);
  console.log(`isStable          : ${sol.isStable}  (expect false)`);
  console.log(`targetRatioBps    : ${sol.targetRatioBps}  (= ${Number(sol.targetRatioBps)/100}%)`);
  console.log(`  → check target allocation % on https://jup.ag/perps (JLP tab)`);

  // Assets — cross-check against solscan token vault balance
  const ownedSol = Number(sol.assets.owned) / 1e9;
  const lockedSol = Number(sol.assets.locked) / 1e9;
  console.log(`assets.owned      : ${sol.assets.owned} raw  = ${ownedSol.toFixed(3)} SOL`);
  console.log(`  → should roughly match the SOL balance of tokenAccount on solscan`);
  console.log(`assets.locked     : ${sol.assets.locked} raw  = ${lockedSol.toFixed(3)} SOL`);
  console.log(`assets.guaranteedUsd : ${sol.assets.guaranteedUsd}  (long OI in USD, 6 decimals)`);
  console.log(`  → $${(Number(sol.assets.guaranteedUsd) / 1e6).toFixed(2)}`);
  console.log(`assets.globalShortSizes: ${sol.assets.globalShortSizes}`);
  console.log(`  → $${(Number(sol.assets.globalShortSizes) / 1e6).toFixed(2)}`);

  // Oracle
  console.log(`oracle.oracleAccount: ${sol.oracle.oracleAccount}`);
  console.log(`  → paste into solscan.io — should be a Pyth price account`);
  console.log(`oracle.oracleType : ${sol.oracle.oracleType}  (expect 'pyth')`);
  console.log(`dovesOracle       : ${sol.dovesOracle}`);
  console.log(`dovesAgOracle     : ${sol.dovesAgOracle}`);
  console.log(`  → both should be oracle/price feed accounts on solscan`);

  // Pricing
  console.log(`pricing.maxLeverage: ${sol.pricing.maxLeverage}  (in BPS units)`);
  console.log(`  = ${Number(sol.pricing.maxLeverage) / 100}x max leverage`);

  // ─── USDC Custody ────────────────────────────────────────────────────────────

  const usdc = await client.accounts.pool.getCustody('USDC');

  console.log('\n══ USDC CUSTODY ══════════════════════════════════════════════');
  console.log(`address           : ${CUSTODY_ADDRESSES.USDC}`);
  console.log(`mint              : ${usdc.mint}`);
  console.log(`  → should be EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v (USDC)`);
  console.log(`tokenAccount      : ${usdc.tokenAccount}`);
  console.log(`  → paste into solscan.io → check USDC balance = assets.owned / 10^6`);
  console.log(`decimals          : ${usdc.decimals}  (expect 6)`);
  console.log(`isStable          : ${usdc.isStable}  (expect true)`);
  console.log(`targetRatioBps    : ${usdc.targetRatioBps}  (= ${Number(usdc.targetRatioBps)/100}%)`);
  const ownedUsdc = Number(usdc.assets.owned) / 1e6;
  console.log(`assets.owned      : $${ownedUsdc.toFixed(2)} USDC`);
  console.log(`  → should roughly match USDC balance of tokenAccount on solscan`);

  // Funding rate state
  console.log(`fundingRateState.cumulativeInterestRate: ${sol.fundingRateState.cumulativeInterestRate}`);
  console.log(`fundingRateState.hourlyFundingDbps     : ${sol.fundingRateState.hourlyFundingDbps}`);
  console.log(`  = ${Number(sol.fundingRateState.hourlyFundingDbps) / 100}% per hour`);

  console.log('\n══ SUMMARY ═══════════════════════════════════════════════════');
  console.log('Cross-check steps:');
  console.log('  1. Go to https://jup.ag/perps  → check AUM and target %s match');
  console.log('  2. Go to solscan.io → paste SOL tokenAccount → check SOL balance ≈ assets.owned/1e9');
  console.log('  3. Go to solscan.io → paste USDC tokenAccount → check USDC balance ≈ assets.owned/1e6');
  console.log('  4. Go to solscan.io → paste oracle.oracleAccount → confirm it\'s a Pyth price feed');
  console.log('');
}

main().catch(console.error);
