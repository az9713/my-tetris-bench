/**
 * Headless battle: npx tsx src/scripts/headless-battle.ts --model1 X --model2 Y --games 100
 */
import { createGame, GameInstance } from '../engine/game';
import { generateSeed } from '../engine/rng';
import { enumerateAllPlacements } from '../engine/placement';
import { DEFAULT_SCORING_FN, evaluatePlacements } from '../ai/executor';
import { spawnPiece } from '../engine/pieces';
import { lockPiece, clearLines, checkCollision } from '../engine/board';
import { calculateLevel } from '../engine/scoring';
import { GameState } from '../engine/types';

function runGame(inst: GameInstance, maxMoves = 500): GameState {
  let state = inst.state;
  for (let i = 0; i < maxMoves && !state.isGameOver && state.activePiece; i++) {
    const placements = enumerateAllPlacements(state.board, state.activePiece.type);
    const best = evaluatePlacements(placements, DEFAULT_SCORING_FN)[0];
    if (!best) break;

    const landed = { type: state.activePiece.type, rotation: best.placement.rotation, pos: { row: best.placement.row, col: best.placement.col } };
    const locked = lockPiece(state.board, landed);
    const { board, linesCleared } = clearLines(locked);
    const scoreGain = linesCleared > 0 ? [0, 100, 300, 500, 800][linesCleared] * (state.level + 1) : 0;
    const nextType = state.nextPieces[0];
    const newQueue = [...state.nextPieces.slice(1), inst.nextPiece()];
    const np = spawnPiece(nextType);
    const go = checkCollision(board, np);
    const tl = state.lines + linesCleared;
    state = { ...state, board, activePiece: go ? null : np, nextPieces: newQueue, score: state.score + scoreGain, lines: tl, level: calculateLevel(tl), moveCount: state.moveCount + 1, canHold: true, isGameOver: go, lockDelay: 0 };
    inst.state = state;
  }
  return state;
}

const args = process.argv.slice(2);
const getArg = (n: string) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };
const model1 = getArg('model1') || 'model1';
const model2 = getArg('model2') || 'model2';
const numGames = parseInt(getArg('games') || '10', 10);

console.log(`\nTetrisBench: ${model1} vs ${model2} (${numGames} games)\n`);

let w1 = 0, w2 = 0, ties = 0;
const results: { seed: number; s1: number; s2: number; winner: string }[] = [];

for (let i = 0; i < numGames; i++) {
  const seed = generateSeed();
  const g1 = runGame(createGame(seed));
  const g2 = runGame(createGame(seed));
  const winner = g1.score > g2.score ? 'model1' : g2.score > g1.score ? 'model2' : 'tie';
  if (winner === 'model1') w1++; else if (winner === 'model2') w2++; else ties++;
  results.push({ seed, s1: g1.score, s2: g2.score, winner });
  process.stdout.write(`\rGame ${i + 1}/${numGames} | ${model1}: ${w1} | ${model2}: ${w2} | Ties: ${ties}`);
}

console.log(`\n\n${model1}: ${w1} wins (${(w1/numGames*100).toFixed(1)}%)`);
console.log(`${model2}: ${w2} wins (${(w2/numGames*100).toFixed(1)}%)`);
console.log(`Avg scores: ${Math.round(results.reduce((a,b)=>a+b.s1,0)/numGames)} vs ${Math.round(results.reduce((a,b)=>a+b.s2,0)/numGames)}`);

const fs = require('fs');
const out = `battle-results-${model1}-vs-${model2}-${Date.now()}.json`;
fs.writeFileSync(out, JSON.stringify({ model1, model2, numGames, w1, w2, ties, results }, null, 2));
console.log(`\nExported to ${out}`);
