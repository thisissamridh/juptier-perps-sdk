import idl from './jupiter-perpetuals.json' with { type: 'json' };
export { INSTRUCTION_DISCRIMINATORS, ACCOUNT_DISCRIMINATORS } from './discriminators.js';

export default idl;

export interface IdlInstruction {
  name: string;
  accounts: {
    name: string;
    isMut: boolean;
    isSigner: boolean;
  }[];
  args: {
    name: string;
    type: unknown;
  }[];
}

export interface IdlAccount {
  name: string;
  type: {
    kind: 'struct';
    fields: {
      name: string;
      type: unknown;
    }[];
  };
}

export interface IdlType {
  name: string;
  type: {
    kind: 'struct' | 'enum';
    fields?: {
      name: string;
      type: unknown;
    }[];
    variants?: {
      name: string;
      fields?: unknown[];
    }[];
  };
}

export interface JupiterPerpsIdl {
  version: string;
  name: string;
  instructions: IdlInstruction[];
  accounts: IdlAccount[];
  types: IdlType[];
  events?: {
    name: string;
    fields: {
      name: string;
      type: unknown;
      index: boolean;
    }[];
  }[];
  errors?: {
    code: number;
    name: string;
    msg?: string;
  }[];
}

export const IDL = idl as JupiterPerpsIdl;
