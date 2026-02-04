import { address, type Address } from '@solana/kit';

export const JUPITER_PERPETUALS_PROGRAM_ID: Address =
  address('PERPHjGBqRHArX4DySjwM6UJHiR3sWAatqfdBS2qQJu');

// PDA: seeds=['__event_authority'], program=JUPITER_PERPETUALS_PROGRAM_ID
export const JUPITER_PERPETUALS_EVENT_AUTHORITY: Address =
  address('37hJBDnntwqhGbK7L6M1bLyvccj4u55CCUiLPdYkiqBN');

// PDA: seeds=['perpetuals'], program=JUPITER_PERPETUALS_PROGRAM_ID
export const PERPETUALS_ADDRESS: Address =
  address('H4ND9aYttUVLFmNypZqLjZ52FYiGvdEB45GmwNoKEjTj');

export const JLP_POOL_ADDRESS: Address =
  address('5BUwFW4nRbftYTDMbgxykoFWqWHPzahFSNAaaaJtVKsq');

export const JLP_MINT_ADDRESS: Address =
  address('27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4');

// PDA: seeds=['transfer_authority'], program=JUPITER_PERPETUALS_PROGRAM_ID
export const TRANSFER_AUTHORITY_ADDRESS: Address =
  address('AVzP2GeRmqGphJsMxWoqjpUifPpCret7LqWhD8NWQK49');

export const CUSTODY_ADDRESSES = {
  SOL:  address('7xS2gz2bTp3fwCC7knJvUWTEU9Tycczu6VhJYKgi1wdz'),
  ETH:  address('AQCGyheWPLeo6Qp9WpYS9m3Qj479t7R636N9ey1rEjEn'),
  BTC:  address('5Pv3gM9JrFFH883SWAhvJC9RPYmo8UNxuFtv5bMMALkm'),
  USDC: address('G18jKKXQwBbrHeiK3C9MRXhkHsLHf7XgCSisykV46EZa'),
  USDT: address('4vkNeXiYEUizLdrpdPS1eC2mccyM4NUPRtERrk6ZETkk'),
} as const;

export type CustodyName = keyof typeof CUSTODY_ADDRESSES;

// Well-known Solana program addresses (sourced from @solana-program/* packages)
export { TOKEN_PROGRAM_ADDRESS as TOKEN_PROGRAM_ID } from '@solana-program/token';
export { SYSTEM_PROGRAM_ADDRESS as SYSTEM_PROGRAM_ID } from '@solana-program/system';

// ATA program — kept as local constant; @solana-program/token@0.5.1 exports a different address
export const ASSOCIATED_TOKEN_PROGRAM_ID: Address =
  address('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe8bv');

// Numeric constants
export const USDC_DECIMALS = 6;
export const JLP_DECIMALS = 6;
export const BPS_POWER = 10_000n;
export const DBPS_POWER = 100_000n;
export const RATE_POWER = 1_000_000_000n;
export const DEBT_POWER = RATE_POWER;
export const BORROW_SIZE_PRECISION = 1000n;
export const USD_DECIMALS = 6;

// PDA seeds
export const PERPETUALS_SEED = 'perpetuals';
export const TRANSFER_AUTHORITY_SEED = 'transfer_authority';
export const POOL_SEED = 'pool';
export const CUSTODY_SEED = 'custody';
export const POSITION_SEED = 'position';
export const POSITION_REQUEST_SEED = 'position_request';
export const BORROW_POSITION_SEED = 'borrow_position';
export const TOKEN_LEDGER_SEED = 'token_ledger';
export const EVENT_AUTHORITY_SEED = '__event_authority';
