export class JupiterPerpsError extends Error {
  constructor(
    message: string,
    public readonly code?: string | number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'JupiterPerpsError';
  }
}

/** Thrown when a required on-chain account cannot be fetched. */
export class AccountNotFoundError extends JupiterPerpsError {
  constructor(
    public readonly address: string,
    public readonly accountType: string
  ) {
    super(`${accountType} account not found at address: ${address}`, 'ACCOUNT_NOT_FOUND');
    this.name = 'AccountNotFoundError';
  }
}

export class SimulationError extends JupiterPerpsError {
  constructor(
    message: string,
    public readonly logs?: string[]
  ) {
    super(message, 'SIMULATION_ERROR', { logs });
    this.name = 'SimulationError';
  }
}

/** Thrown when actual slippage exceeds the user-defined tolerance. */
export class SlippageExceededError extends JupiterPerpsError {
  constructor(
    public readonly expectedPrice: bigint,
    public readonly actualPrice: bigint
  ) {
    super(
      `Slippage exceeded: expected ${expectedPrice}, got ${actualPrice}`,
      'SLIPPAGE_EXCEEDED'
    );
    this.name = 'SlippageExceededError';
  }
}

export class InsufficientBalanceError extends JupiterPerpsError {
  constructor(
    public readonly required: bigint,
    public readonly available: bigint,
    public readonly token?: string
  ) {
    super(
      `Insufficient balance: required ${required}, available ${available}${token ? ` ${token}` : ''}`,
      'INSUFFICIENT_BALANCE'
    );
    this.name = 'InsufficientBalanceError';
  }
}

/** Thrown when a position PDA yields no on-chain account. */
export class PositionNotFoundError extends JupiterPerpsError {
  constructor(public readonly address: string) {
    super(`Position not found: ${address}`, 'POSITION_NOT_FOUND');
    this.name = 'PositionNotFoundError';
  }
}

export class InvalidPositionError extends JupiterPerpsError {
  constructor(message: string) {
    super(message, 'INVALID_POSITION');
    this.name = 'InvalidPositionError';
  }
}

export class OracleError extends JupiterPerpsError {
  constructor(message: string, public readonly custody?: string) {
    super(message, 'ORACLE_ERROR');
    this.name = 'OracleError';
  }
}
