import { createJupiterPerpsClient, CUSTODY_ADDRESSES, usdToBigint } from '../src/index.js';
import { address, createSolanaRpc } from '@solana/kit';

const USDC_MINT = address('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
const SOL_MINT = address('So11111111111111111111111111111111111111112');

async function main() {
  const client = createJupiterPerpsClient({
    rpcUrl: 'https://api.mainnet-beta.solana.com',
  });

  const owner = address('YOUR_WALLET_ADDRESS');
  const collateralCustody = CUSTODY_ADDRESSES.USDC;
  const positionCustody = CUSTODY_ADDRESSES.SOL;

  const sizeUsdDelta = usdToBigint(1000); // $1000 position size
  const collateralTokenDelta = usdToBigint(200); // $200 collateral
  const priceSlippage = usdToBigint(200); // $200 slippage tolerance

  console.log('Creating open position instruction...');
  
  const openInstruction = await client.position.open({
    owner,
    custody: positionCustody,
    collateralCustody,
    side: 'long',
    sizeUsdDelta,
    collateralTokenDelta,
    priceSlippage,
    inputMint: USDC_MINT,
  });

  console.log('Instruction created successfully');
  console.log('Program:', openInstruction.programAddress);

  const blockhash = await client.getLatestBlockhash();
  console.log('\nBlockhash:', blockhash.blockhash.slice(0, 20) + '...');

  const transaction = await client.buildTransaction({
    instructions: [openInstruction],
    feePayer: owner,
    blockhash,
  });

  console.log('\nTransaction built successfully');
  
  const simulation = await client.simulateTransaction(transaction);
  console.log('Simulation result:');
  console.log('  Compute units:', simulation.unitsConsumed);
  console.log('  Error:', simulation.err ?? 'None');
}

main().catch(console.error);
