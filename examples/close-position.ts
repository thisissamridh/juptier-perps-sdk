import { createJupiterPerpsClient, usdToBigint } from '../src/index.js';
import { address } from '@solana/kit';

async function main() {
  const client = createJupiterPerpsClient({
    rpcUrl: 'https://api.mainnet-beta.solana.com',
  });

  const owner = address('YOUR_WALLET_ADDRESS');
  const positionAddress = address('YOUR_POSITION_ADDRESS');
  const desiredMint = address('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // USDC

  const position = await client.accounts.position.getPosition(positionAddress);
  console.log('Position owner:', position.owner);
  console.log('Position size USD:', position.sizeUsd.toString());
  console.log('Position collateral USD:', position.collateralUsd.toString());
  console.log('Position side:', position.side);

  const closeInstruction = await client.position.close({
    owner,
    position: positionAddress,
    custody: position.custody,
    collateralCustody: position.collateralCustody,
    desiredMint,
    priceSlippage: usdToBigint(200),
    entirePosition: true,
  });

  console.log('\nClose instruction created successfully');

  const transaction = await client.buildTransaction({
    instructions: [closeInstruction],
    feePayer: owner,
  });

  const simulation = await client.simulateTransaction(transaction);
  console.log('Simulation compute units:', simulation.unitsConsumed);
}

main().catch(console.error);
