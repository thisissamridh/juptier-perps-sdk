import { createHash } from 'node:crypto';
import idl from './jupiter-perpetuals.json' with { type: 'json' };

function ixDisc(name: string): Uint8Array {
  return new Uint8Array(createHash('sha256').update(`global:${name}`).digest()).slice(0, 8);
}

function accDisc(name: string): Uint8Array {
  return new Uint8Array(createHash('sha256').update(`account:${name}`).digest()).slice(0, 8);
}

export const INSTRUCTION_DISCRIMINATORS: Record<string, Uint8Array> = Object.fromEntries(
  (idl as { instructions: { name: string }[] }).instructions.map((ix) => [ix.name, ixDisc(ix.name)])
);

export const ACCOUNT_DISCRIMINATORS: Record<string, Uint8Array> = Object.fromEntries(
  (idl as { accounts: { name: string }[] }).accounts.map((acc) => [acc.name, accDisc(acc.name)])
);
