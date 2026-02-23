import { GameState } from '@/engine/types';
import { countHoles, getMaxHeight } from '@/engine/board';

export interface InterventionState {
  lastInterventionMove: number;
  lastInterventionScore: number;
  interventionCount: number;
  hasScoringFunction: boolean;
}

export function createInterventionState(): InterventionState {
  return { lastInterventionMove: 0, lastInterventionScore: 0, interventionCount: 0, hasScoringFunction: false };
}

export function shouldIntervene(gameState: GameState, iState: InterventionState): boolean {
  if (!iState.hasScoringFunction) return true;
  const since = gameState.moveCount - iState.lastInterventionMove;
  if (since >= 20) return true;
  if (countHoles(gameState.board) > 4) return true;
  if (getMaxHeight(gameState.board) > 15) return true;
  if (since >= 15 && gameState.score <= iState.lastInterventionScore) return true;
  return false;
}
