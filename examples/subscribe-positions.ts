import { createJupiterPerpsClient } from '../src/index.js';
import { address, createSolanaRpcSubscriptions } from '@solana/kit';

async function main() {
  const rpcUrl = 'https://api.mainnet-beta.solana.com';
  const wsUrl = 'wss://api.mainnet-beta.solana.com';

  const client = createJupiterPerpsClient({
    rpcUrl,
    wsUrl,
  });

  const owner = address('YOUR_WALLET_ADDRESS');

  console.log('Subscribing to position updates for:', owner);
  console.log('Press Ctrl+C to exit\n');

  const abortController = new AbortController();

  process.on('SIGINT', () => {
    console.log('\nUnsubscribing...');
    abortController.abort();
    process.exit(0);
  });

  try {
    const subscription = await client.rpcSubscriptions!
      .accountNotifications(owner, { commitment: 'confirmed' })
      .subscribe({ abortSignal: abortController.signal });

    for await (const notification of subscription) {
      console.log('Account update received:');
      console.log('  Lamports:', notification.value.lamports.toString());
      console.log('  Owner:', notification.value.owner);
      console.log('');
    }
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      console.log('Subscription aborted');
    } else {
      throw error;
    }
  }
}

main().catch(console.error);
