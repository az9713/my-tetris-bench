import { LINE_CLEAR_SCORES, GRAVITY_TABLE } from './constants';

export function calculateLineClearScore(linesCleared: number, level: number, combo: number): number {
  const base = LINE_CLEAR_SCORES[linesCleared] || 0;
  const mult = level + 1;
  const comboBonus = combo > 0 ? 50 * combo * mult : 0;
  return base * mult + comboBonus;
}

export function calculateSoftDropScore(distance: number): number {
  return distance;
}

export function calculateHardDropScore(distance: number): number {
  return distance * 2;
}

export function calculateLevel(totalLines: number): number {
  return Math.floor(totalLines / 10);
}

export function getGravity(level: number): number {
  if (level >= GRAVITY_TABLE.length) return 1;
  return GRAVITY_TABLE[level];
}
