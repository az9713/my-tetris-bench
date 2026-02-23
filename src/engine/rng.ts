import type { PieceType } from './types';
import { ALL_PIECE_TYPES } from './constants';

/** Generate a random seed using crypto or Math.random */
export function generateSeed(): number {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    return crypto.getRandomValues(new Uint32Array(1))[0];
  }
  return Math.floor(Math.random() * 0xFFFFFFFF);
}

/** Mulberry32 seeded PRNG — returns a closure that yields values in [0, 1) */
export function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates shuffle */
function shuffle<T>(arr: T[], random: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 7-bag randomizer as a closure.
 * Both players sharing the same seed get the same piece sequence.
 */
export function createBagRandomizer(seed: number): () => PieceType {
  const random = mulberry32(seed);
  let bag: PieceType[] = [];

  return () => {
    if (bag.length === 0) {
      bag = shuffle(ALL_PIECE_TYPES, random);
    }
    return bag.pop()!;
  };
}
