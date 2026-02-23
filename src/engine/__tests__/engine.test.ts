import { describe, it, expect } from 'vitest';
import { createBoard, checkCollision, lockPiece, clearLines, countHoles, getMaxHeight, calculateBumpiness } from '../board';
import { getShape, tryRotate, spawnPiece, tryMove, hardDrop } from '../pieces';
import { mulberry32, createBagRandomizer } from '../rng';
import { calculateLineClearScore, calculateLevel, getGravity } from '../scoring';
import { createGame, applyAction, tick } from '../game';
import { enumerateAllPlacements } from '../placement';
import { BOARD_ROWS, BOARD_COLS } from '../types';
import type { ActivePiece } from '../types';

describe('Board', () => {
  it('creates a 20x10 empty board', () => {
    const board = createBoard();
    expect(board.length).toBe(BOARD_ROWS);
    expect(board[0].length).toBe(BOARD_COLS);
    expect(board.every(row => row.every(cell => cell === null))).toBe(true);
  });

  it('detects collision with left wall', () => {
    const board = createBoard();
    const piece: ActivePiece = { type: 'I', rotation: 0, pos: { row: 1, col: -2 } };
    expect(checkCollision(board, piece)).toBe(true);
  });

  it('detects collision with floor', () => {
    const board = createBoard();
    const piece: ActivePiece = { type: 'O', rotation: 0, pos: { row: 19, col: 4 } };
    expect(checkCollision(board, piece)).toBe(true);
  });

  it('no collision for valid position', () => {
    const board = createBoard();
    const piece: ActivePiece = { type: 'T', rotation: 0, pos: { row: 0, col: 3 } };
    expect(checkCollision(board, piece)).toBe(false);
  });

  it('locks a piece onto the board', () => {
    const board = createBoard();
    const piece: ActivePiece = { type: 'O', rotation: 0, pos: { row: 18, col: 4 } };
    const b = lockPiece(board, piece);
    expect(b[18][4]).not.toBeNull();
    expect(b[18][5]).not.toBeNull();
    expect(b[19][4]).not.toBeNull();
    expect(b[19][5]).not.toBeNull();
  });

  it('clears completed lines', () => {
    const board = createBoard();
    for (let c = 0; c < BOARD_COLS; c++) board[19][c] = '#fff';
    const { board: b, linesCleared } = clearLines(board);
    expect(linesCleared).toBe(1);
    expect(b[0].every(c => c === null)).toBe(true);
  });

  it('counts holes', () => {
    const board = createBoard();
    board[15][0] = '#f00';
    expect(countHoles(board)).toBe(4);
  });

  it('gets max height', () => {
    const board = createBoard();
    expect(getMaxHeight(board)).toBe(0);
    board[18][5] = '#f00';
    expect(getMaxHeight(board)).toBe(2);
  });

  it('calculates bumpiness', () => {
    const board = createBoard();
    expect(calculateBumpiness(board)).toBe(0);
  });
});

describe('Pieces', () => {
  it('returns shapes for all types', () => {
    const types = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'] as const;
    for (const t of types) {
      expect(getShape(t, 0).length).toBeGreaterThan(0);
    }
  });

  it('rotates T piece CW', () => {
    const board = createBoard();
    const piece: ActivePiece = { type: 'T', rotation: 0, pos: { row: 5, col: 4 } };
    const r = tryRotate(board, piece, 'cw');
    expect(r).not.toBeNull();
    expect(r!.rotation).toBe(1);
  });

  it('O piece does not rotate', () => {
    const board = createBoard();
    const piece: ActivePiece = { type: 'O', rotation: 0, pos: { row: 5, col: 4 } };
    expect(tryRotate(board, piece, 'cw')).toBeNull();
  });

  it('hard drop returns distance', () => {
    const board = createBoard();
    const piece: ActivePiece = { type: 'T', rotation: 0, pos: { row: 0, col: 3 } };
    const { piece: dropped, distance } = hardDrop(board, piece);
    expect(distance).toBeGreaterThan(0);
    expect(dropped.pos.row).toBeGreaterThan(0);
  });
});

describe('RNG', () => {
  it('mulberry32 is deterministic', () => {
    const r1 = mulberry32(42);
    const r2 = mulberry32(42);
    expect(r1()).toBe(r2());
    expect(r1()).toBe(r2());
  });

  it('bag randomizer produces valid pieces', () => {
    const next = createBagRandomizer(12345);
    const pieces = Array.from({ length: 7 }, () => next());
    expect(new Set(pieces).size).toBe(7);
  });

  it('same seed = same sequence', () => {
    const a = createBagRandomizer(42);
    const b = createBagRandomizer(42);
    for (let i = 0; i < 20; i++) expect(a()).toBe(b());
  });
});

describe('Scoring', () => {
  it('single line clear', () => {
    // level 0 => multiplier = 0+1 = 1
    expect(calculateLineClearScore(1, 0, 0)).toBe(100);
  });

  it('Tetris', () => {
    expect(calculateLineClearScore(4, 0, 0)).toBe(800);
  });

  it('scales with level', () => {
    // level 4 => mult = 5
    expect(calculateLineClearScore(1, 4, 0)).toBe(500);
  });

  it('calculates level', () => {
    expect(calculateLevel(0)).toBe(0);
    expect(calculateLevel(10)).toBe(1);
    expect(calculateLevel(25)).toBe(2);
  });

  it('gravity table', () => {
    expect(getGravity(0)).toBe(48);
    expect(getGravity(10)).toBe(6);
    expect(getGravity(20)).toBe(1);
  });
});

describe('Game', () => {
  it('creates game with valid state', () => {
    const { state } = createGame(42);
    expect(state.board.length).toBe(BOARD_ROWS);
    expect(state.activePiece).not.toBeNull();
    expect(state.nextPieces.length).toBe(5);
    expect(state.score).toBe(0);
    expect(state.isGameOver).toBe(false);
  });

  it('same seed = same initial piece', () => {
    const a = createGame(42);
    const b = createGame(42);
    expect(a.state.activePiece!.type).toBe(b.state.activePiece!.type);
    expect(a.state.nextPieces).toEqual(b.state.nextPieces);
  });

  it('moves piece left', () => {
    const inst = createGame(42);
    const col = inst.state.activePiece!.pos.col;
    const s = applyAction(inst, 'left');
    expect(s.activePiece!.pos.col).toBe(col - 1);
  });

  it('moves piece right', () => {
    const inst = createGame(42);
    const col = inst.state.activePiece!.pos.col;
    const s = applyAction(inst, 'right');
    expect(s.activePiece!.pos.col).toBe(col + 1);
  });

  it('hard drop increments moveCount', () => {
    const inst = createGame(42);
    const s = applyAction(inst, 'hard_drop');
    expect(s.moveCount).toBe(1);
    expect(s.activePiece).not.toBeNull();
  });

  it('hold stores piece and spawns next', () => {
    const inst = createGame(42);
    const type = inst.state.activePiece!.type;
    const s = applyAction(inst, 'hold');
    expect(s.heldPiece).toBe(type);
    expect(s.activePiece).not.toBeNull();
    // After hold with no held piece, next piece from queue spawns
    expect(s.activePiece!.type).not.toBe(type);
  });

  it('prevents double hold in same turn', () => {
    const inst = createGame(42);
    const s1 = applyAction(inst, 'hold');
    // canHold should be false, so hold again is no-op
    inst.state = s1;
    const s2 = applyAction(inst, 'hold');
    // Should be same state (hold blocked)
    expect(s2.activePiece!.type).toBe(s1.activePiece!.type);
  });
});

describe('Placement', () => {
  it('enumerates placements for T on empty board', () => {
    const board = createBoard();
    const placements = enumerateAllPlacements(board, 'T');
    expect(placements.length).toBeGreaterThan(20);
  });
});
