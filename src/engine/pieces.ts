import type { ActivePiece, Board, PieceType, Rotation } from './types';
import { BOARD_COLS } from './types';
import { PIECE_SHAPES, getWallKicks } from './constants';
import { checkCollision } from './board';

export function getShape(type: PieceType, rotation: Rotation): boolean[][] {
  return PIECE_SHAPES[type][rotation];
}

export function spawnPiece(type: PieceType): ActivePiece {
  const w = PIECE_SHAPES[type][0][0].length;
  return { type, rotation: 0, pos: { row: 0, col: Math.floor((BOARD_COLS - w) / 2) } };
}

export function tryRotate(board: Board, piece: ActivePiece, direction: 'cw' | 'ccw'): ActivePiece | null {
  if (piece.type === 'O') return null;
  const from = piece.rotation;
  const to: Rotation = direction === 'cw'
    ? ((from + 1) % 4) as Rotation
    : ((from + 3) % 4) as Rotation;
  const kicks = getWallKicks(piece.type, from, to);
  for (const [dc, dr] of kicks) {
    const candidate: ActivePiece = {
      ...piece,
      rotation: to,
      pos: { row: piece.pos.row + dr, col: piece.pos.col + dc },
    };
    if (!checkCollision(board, candidate)) return candidate;
  }
  return null;
}

export function tryMove(board: Board, piece: ActivePiece, dc: number, dr: number): ActivePiece | null {
  const candidate: ActivePiece = {
    ...piece,
    pos: { row: piece.pos.row + dr, col: piece.pos.col + dc },
  };
  return checkCollision(board, candidate) ? null : candidate;
}

export function hardDrop(board: Board, piece: ActivePiece): { piece: ActivePiece; distance: number } {
  let current = piece;
  let distance = 0;
  while (true) {
    const next = tryMove(board, current, 0, 1);
    if (!next) break;
    current = next;
    distance++;
  }
  return { piece: current, distance };
}
