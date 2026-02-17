import { createJupiterPerpsClient } from '../src/index.js';
import { address, createSolanaRpc } from '@solana/kit';

async function main() {
  const client = createJupiterPerpsClient({
    rpcUrl: 'https://api.mainnet-beta.solana.com',
  });

  console.log('Fetching JLP Pool data...');
  const pool = await client.accounts.pool.getPool();
  console.log('Pool name:', pool.name);
  console.log('Pool AUM (USD):', pool.aumUsdLast.toString());

  console.log('\nFetching all custodies...');
  const custodies = await client.accounts.pool.getAllCustodies();
  
  for (const [address, custody] of custodies) {
    console.log(`\nCustody: ${custody.mint}`);
    console.log(`  Decimals: ${custody.decimals}`);
    console.log(`  Long USD: ${custody.longUsd.toString()}`);
    console.log(`  Short USD: ${custody.shortUsd.toString()}`);
    console.log(`  Long Positions: ${custody.longPositionsCount.toString()}`);
    console.log(`  Short Positions: ${custody.shortPositionsCount.toString()}`);
  }
}

main().catch(console.error);
