import { GameState, PieceType, Placement, ScoringFunction } from '@/engine/types';
import { enumerateAllPlacements } from '@/engine/placement';
import { DEFAULT_SCORING_FN, evaluatePlacements, parseScoringFunction } from './executor';
import { InterventionState, createInterventionState, shouldIntervene } from './intervention';
import { serializeBoardState } from './prompt';

export interface AIPlayer {
  getNextPlacement: (gameState: GameState, pieceType: PieceType) => Promise<Placement | null>;
  getInterventionCount: () => number;
  reset: () => void;
}

export function createAIPlayer(modelId: string): AIPlayer {
  let scoringFn: ScoringFunction = DEFAULT_SCORING_FN;
  let iState: InterventionState = createInterventionState();
  let generating = false;

  async function requestNew(gameState: GameState) {
    if (generating) return;
    generating = true;
    try {
      const res = await fetch('/api/ai/generate-scoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId,
          boardState: serializeBoardState(gameState.board),
          currentScore: gameState.score,
          moveCount: gameState.moveCount,
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      const parsed = parseScoringFunction(data.code);
      if (parsed) {
        scoringFn = parsed;
        iState = { hasScoringFunction: true, lastInterventionMove: gameState.moveCount, lastInterventionScore: gameState.score, interventionCount: iState.interventionCount + 1 };
      }
    } catch { /* ignore */ } finally { generating = false; }
  }

  return {
    async getNextPlacement(gameState, pieceType) {
      if (shouldIntervene(gameState, iState)) await requestNew(gameState);
      const placements = enumerateAllPlacements(gameState.board, pieceType);
      if (!placements.length) return null;
      const ranked = evaluatePlacements(placements, scoringFn);
      return ranked[0]?.placement ?? null;
    },
    getInterventionCount: () => iState.interventionCount,
    reset() { scoringFn = DEFAULT_SCORING_FN; iState = createInterventionState(); generating = false; },
  };
}
