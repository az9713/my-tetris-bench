import { GameState, MoveAction, PieceType, ActivePiece } from './types';
import { LOCK_DELAY_FRAMES } from './constants';
import { createBoard, lockPiece, clearLines, checkCollision } from './board';
import { spawnPiece, tryMove, tryRotate, hardDrop as hardDropPiece } from './pieces';
import { calculateLineClearScore, calculateHardDropScore, calculateSoftDropScore, calculateLevel, getGravity } from './scoring';
import { createBagRandomizer } from './rng';

const QUEUE_SIZE = 5;

export interface GameInstance {
  state: GameState;
  nextPiece: () => PieceType;
}

export function createGame(seed: number): GameInstance {
  const nextPiece = createBagRandomizer(seed);
  const queue: PieceType[] = [];
  for (let i = 0; i < QUEUE_SIZE + 1; i++) queue.push(nextPiece());

  const first = queue.shift()!;
  const state: GameState = {
    board: createBoard(),
    activePiece: spawnPiece(first),
    heldPiece: null,
    canHold: true,
    nextPieces: queue,
    score: 0,
    lines: 0,
    level: 0,
    combo: -1,
    moveCount: 0,
    isGameOver: false,
    isPaused: false,
    tickCount: 0,
    gravityCounter: 0,
    lockDelay: 0,
  };

  return { state, nextPiece };
}

function spawnNext(state: GameState, nextFn: () => PieceType): GameState {
  const type = state.nextPieces[0];
  const newQueue = [...state.nextPieces.slice(1), nextFn()];
  const piece = spawnPiece(type);
  if (checkCollision(state.board, piece)) {
    return { ...state, isGameOver: true, activePiece: null };
  }
  return { ...state, activePiece: piece, nextPieces: newQueue, lockDelay: 0 };
}

function lockAndClear(state: GameState, nextFn: () => PieceType): GameState {
  if (!state.activePiece) return state;
  const locked = lockPiece(state.board, state.activePiece);
  const { board, linesCleared } = clearLines(locked);
  const combo = linesCleared > 0 ? state.combo + 1 : -1;
  const scoreGain = linesCleared > 0 ? calculateLineClearScore(linesCleared, state.level, combo) : 0;
  const totalLines = state.lines + linesCleared;
  const next: GameState = {
    ...state,
    board,
    score: state.score + scoreGain,
    lines: totalLines,
    level: calculateLevel(totalLines),
    combo,
    moveCount: state.moveCount + 1,
    activePiece: null,
    canHold: true,
  };
  return spawnNext(next, nextFn);
}

export function tick(instance: GameInstance): GameState {
  const { state, nextPiece } = instance;
  if (state.isGameOver || state.isPaused || !state.activePiece) return state;

  const tc = state.tickCount + 1;
  const gc = state.gravityCounter + 1;
  const gravity = getGravity(state.level);

  // Check if piece is grounded (can't move down)
  const grounded = !tryMove(state.board, state.activePiece, 0, 1);

  if (grounded) {
    // Tick lock delay every frame while grounded
    const ld = state.lockDelay + 1;
    if (ld >= LOCK_DELAY_FRAMES) {
      return lockAndClear({ ...state, tickCount: tc }, nextPiece);
    }
    return { ...state, tickCount: tc, gravityCounter: 0, lockDelay: ld };
  }

  if (gc >= gravity) {
    const moved = tryMove(state.board, state.activePiece, 0, 1);
    if (moved) {
      return { ...state, activePiece: moved, tickCount: tc, gravityCounter: 0, lockDelay: 0 };
    }
    return { ...state, tickCount: tc, gravityCounter: 0 };
  }
  return { ...state, tickCount: tc, gravityCounter: gc };
}

export function applyAction(instance: GameInstance, action: MoveAction): GameState {
  const { state, nextPiece } = instance;
  if (state.isGameOver || state.isPaused || !state.activePiece) return state;

  switch (action) {
    case 'left': {
      const m = tryMove(state.board, state.activePiece, -1, 0);
      return m ? { ...state, activePiece: m, lockDelay: 0 } : state;
    }
    case 'right': {
      const m = tryMove(state.board, state.activePiece, 1, 0);
      return m ? { ...state, activePiece: m, lockDelay: 0 } : state;
    }
    case 'soft_drop': {
      const m = tryMove(state.board, state.activePiece, 0, 1);
      return m ? { ...state, activePiece: m, score: state.score + calculateSoftDropScore(1), gravityCounter: 0, lockDelay: 0 } : state;
    }
    case 'hard_drop': {
      const { piece, distance } = hardDropPiece(state.board, state.activePiece);
      return lockAndClear({ ...state, activePiece: piece, score: state.score + calculateHardDropScore(distance) }, nextPiece);
    }
    case 'rotate_cw': {
      const r = tryRotate(state.board, state.activePiece, 'cw');
      return r ? { ...state, activePiece: r, lockDelay: 0 } : state;
    }
    case 'rotate_ccw': {
      const r = tryRotate(state.board, state.activePiece, 'ccw');
      return r ? { ...state, activePiece: r, lockDelay: 0 } : state;
    }
    case 'hold': {
      if (!state.canHold) return state;
      const cur = state.activePiece.type;
      if (state.heldPiece) {
        const p = spawnPiece(state.heldPiece);
        if (checkCollision(state.board, p)) return state;
        return { ...state, activePiece: p, heldPiece: cur, canHold: false, lockDelay: 0 };
      }
      return spawnNext({ ...state, heldPiece: cur, canHold: false, activePiece: null }, nextPiece);
    }
    default: return state;
  }
}

export function togglePause(state: GameState): GameState {
  return { ...state, isPaused: !state.isPaused };
}
