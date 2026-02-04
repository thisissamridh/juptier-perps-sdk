// IDL: Side { None = 0, Long = 1, Short = 2 }
export type Side = 'none' | 'long' | 'short';

export const Side = {
  None: 'none' as Side,
  Long: 'long' as Side,
  Short: 'short' as Side,
};

// IDL: RequestChange { None = 0, Increase = 1, Decrease = 2 }
export type RequestChange = 'none' | 'increase' | 'decrease';

export const RequestChange = {
  None: 'none' as RequestChange,
  Increase: 'increase' as RequestChange,
  Decrease: 'decrease' as RequestChange,
};

// IDL: RequestType { Market = 0, Trigger = 1 }
export type RequestType = 'market' | 'trigger';

export const RequestType = {
  Market: 'market' as RequestType,
  Trigger: 'trigger' as RequestType,
};

// IDL: OracleType { None = 0, Test = 1, Pyth = 2 }
export type OracleType = 'none' | 'test' | 'pyth';

export const OracleType = {
  None: 'none' as OracleType,
  Test: 'test' as OracleType,
  Pyth: 'pyth' as OracleType,
};

// IDL: PriceCalcMode { Min = 0, Max = 1, Ignore = 2 }
export type PriceCalcMode = 'min' | 'max' | 'ignore';

export const PriceCalcMode = {
  Min: 'min' as PriceCalcMode,
  Max: 'max' as PriceCalcMode,
  Ignore: 'ignore' as PriceCalcMode,
};

// IDL: TradePoolType { Increase = 0, Decrease = 1 }
export type TradePoolType = 'increase' | 'decrease';

export const TradePoolType = {
  Increase: 'increase' as TradePoolType,
  Decrease: 'decrease' as TradePoolType,
};
