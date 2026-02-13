import { Address } from '@solana/kit';

export interface JupiterQuoteRequest {
  inputMint: Address;
  outputMint: Address;
  amount: bigint;
  slippageBps: number;
  onlyDirectRoutes?: boolean;
}

export interface JupiterQuote {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  priceImpactPct: string;
}

export interface JupiterSwapResult {
  swapTransaction: string;
  lastValidBlockHeight: number;
  prioritizationFeeLamports: number;
  minContextSlot: number;
}

const JUPITER_QUOTE_API = 'https://quote-api.jup.ag/v6';

export class JupiterSwapClient {
  private readonly quoteApiUrl: string;

  constructor(quoteApiUrl?: string) {
    this.quoteApiUrl = quoteApiUrl ?? JUPITER_QUOTE_API;
  }

  async getQuote(params: JupiterQuoteRequest): Promise<JupiterQuote> {
    const queryParams = new URLSearchParams({
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      amount: params.amount.toString(),
      slippageBps: params.slippageBps.toString(),
      onlyDirectRoutes: (params.onlyDirectRoutes ?? false).toString(),
    });

    const response = await fetch(`${this.quoteApiUrl}/quote?${queryParams}`);
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get Jupiter quote: ${error}`);
    }

    return response.json() as Promise<JupiterQuote>;
  }

  async getMinimumOut(
    inputMint: Address,
    outputMint: Address,
    inputAmount: bigint,
    slippageBps: number
  ): Promise<bigint> {
    const quote = await this.getQuote({
      inputMint,
      outputMint,
      amount: inputAmount,
      slippageBps,
    });
    
    return BigInt(quote.otherAmountThreshold);
  }

  async getPriceImpact(
    inputMint: Address,
    outputMint: Address,
    inputAmount: bigint
  ): Promise<number> {
    const quote = await this.getQuote({
      inputMint,
      outputMint,
      amount: inputAmount,
      slippageBps: 50,
    });
    
    return parseFloat(quote.priceImpactPct);
  }
}

export function createJupiterSwapClient(quoteApiUrl?: string): JupiterSwapClient {
  return new JupiterSwapClient(quoteApiUrl);
}
