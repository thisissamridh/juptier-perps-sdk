import { createJupiterPerpsClient, CUSTODY_ADDRESSES, usdToBigint } from '../src/index.js';
import { createJupiterSwapClient } from '../src/swap/index.js';
import { address } from '@solana/kit';

const USDC_MINT = address('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
const SOL_MINT = address('So11111111111111111111111111111111111111112');

async function main() {
  const perpsClient = createJupiterPerpsClient({
    rpcUrl: 'https://api.mainnet-beta.solana.com',
  });
  
  const swapClient = createJupiterSwapClient();

  const owner = address('YOUR_WALLET_ADDRESS');

  console.log('Getting swap quote from Jupiter...');
  
  const solAmount = 10_000_000_000n; // 10 SOL
  const slippageBps = 50; // 0.5%

  const quote = await swapClient.getQuote({
    inputMint: SOL_MINT,
    outputMint: USDC_MINT,
    amount: solAmount,
    slippageBps,
  });

  console.log('Quote received:');
  console.log('  Input: 10 SOL');
  console.log('  Output:', quote.outAmount.toString(), 'USDC');
  console.log('  Price impact:', quote.priceImpactPct, '%');
  console.log('  Min output:', quote.otherAmountThreshold.toString(), 'USDC');

  const jupiterMinimumOut = quote.otherAmountThreshold;

  console.log('\nCreating position with swap...');

  const positionCustody = CUSTODY_ADDRESSES.SOL;
  const collateralCustody = CUSTODY_ADDRESSES.USDC;
  const sizeUsdDelta = usdToBigint(5000); // $5000 position
  const collateralTokenDelta = solAmount; // Using swapped SOL as collateral

  const openInstruction = await perpsClient.position.open({
    owner,
    custody: positionCustody,
    collateralCustody,
    side: 'long',
    sizeUsdDelta,
    collateralTokenDelta: 0n, // Swap handles this
    priceSlippage: usdToBigint(100),
    inputMint: SOL_MINT, // Input is SOL
    jupiterMinimumOut, // Minimum USDC from swap
  });

  console.log('Open position instruction with swap created');

  const swap = await swapClient.getSwap({
    quoteResponse: quote,
    userPublicKey: owner,
    wrapAndUnwrapSol: true,
  });

  console.log('\nSwap transaction received');
  console.log('Last valid block height:', swap.lastValidBlockHeight);
}

main().catch(console.error);
