import { createJupiterPerpsClient, usdToBigint, CUSTODY_ADDRESSES } from '../src/index.js';
import { address } from '@solana/kit';

async function main() {
  const client = createJupiterPerpsClient({
    rpcUrl: 'https://api.mainnet-beta.solana.com',
  });

  const owner = address('YOUR_WALLET_ADDRESS');
  const solCustody = CUSTODY_ADDRESSES.SOL;

  console.log('Adding liquidity to JLP pool...');

  const tokenAmount = 1_000_000_000n; // 1 SOL

  const addLiquidityIx = await client.jlp.addLiquidity({
    owner,
    custody: solCustody,
    tokenAmount,
    minimumLpTokenOut: 0n,
  });

  console.log('Add liquidity instruction created');

  const transaction = await client.buildTransaction({
    instructions: [addLiquidityIx],
    feePayer: owner,
  });

  const simulation = await client.simulateTransaction(transaction);
  console.log('Simulation compute units:', simulation.unitsConsumed);

  console.log('\n--- Remove Liquidity Example ---');

  const lpTokenAmount = 100_000_000n; // 100 JLP tokens

  const pool = await client.accounts.pool.getPool();
  const minimumTokenOuts = pool.custodies.map(() => 0n);

  const removeLiquidityIx = await client.jlp.removeLiquidity({
    owner,
    lpTokenAmount,
    minimumTokenOuts,
  });

  console.log('Remove liquidity instruction created');
}

main().catch(console.error);
