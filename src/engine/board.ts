import { Board, ActivePiece, LineClearResult, BOARD_ROWS, BOARD_COLS } from './types';
import { PIECE_SHAPES, PIECE_COLORS } from './constants';

export function createBoard(): Board {
  return Array.from({ length: BOARD_ROWS }, () => Array(BOARD_COLS).fill(null));
}

/** Get filled cells in absolute board coordinates */
export function getPieceCells(piece: ActivePiece): [number, number][] {
  const shape = PIECE_SHAPES[piece.type][piece.rotation];
  const cells: [number, number][] = [];
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        cells.push([piece.pos.row + r, piece.pos.col + c]);
      }
    }
  }
  return cells;
}

export function checkCollision(board: Board, piece: ActivePiece): boolean {
  const cells = getPieceCells(piece);
  for (const [row, col] of cells) {
    if (row < 0 || row >= BOARD_ROWS || col < 0 || col >= BOARD_COLS) return true;
    if (board[row][col] !== null) return true;
  }
  return false;
}

export function lockPiece(board: Board, piece: ActivePiece): Board {
  const newBoard = board.map(row => [...row]);
  const color = PIECE_COLORS[piece.type];
  const cells = getPieceCells(piece);
  for (const [row, col] of cells) {
    if (row >= 0 && row < BOARD_ROWS && col >= 0 && col < BOARD_COLS) {
      newBoard[row][col] = color;
    }
  }
  return newBoard;
}

export function clearLines(board: Board): LineClearResult {
  const remaining = board.filter(row => row.some(cell => cell === null));
  const linesCleared = BOARD_ROWS - remaining.length;
  const emptyRows = Array.from({ length: linesCleared }, () => Array(BOARD_COLS).fill(null));
  return { board: [...emptyRows, ...remaining], linesCleared };
}

export function getGhostPosition(board: Board, piece: ActivePiece): ActivePiece {
  let ghost = { ...piece, pos: { ...piece.pos } };
  while (!checkCollision(board, { ...ghost, pos: { ...ghost.pos, row: ghost.pos.row + 1 } })) {
    ghost.pos.row++;
  }
  return ghost;
}

/** Count holes (empty cells below a filled cell in same column) */
export function countHoles(board: Board): number {
  let holes = 0;
  for (let col = 0; col < BOARD_COLS; col++) {
    let found = false;
    for (let row = 0; row < BOARD_ROWS; row++) {
      if (board[row][col] !== null) found = true;
      else if (found) holes++;
    }
  }
  return holes;
}

/** Column heights */
export function getColumnHeights(board: Board): number[] {
  const heights: number[] = [];
  for (let col = 0; col < BOARD_COLS; col++) {
    let h = 0;
    for (let row = 0; row < BOARD_ROWS; row++) {
      if (board[row][col] !== null) { h = BOARD_ROWS - row; break; }
    }
    heights.push(h);
  }
  return heights;
}

export function getMaxHeight(board: Board): number {
  return Math.max(0, ...getColumnHeights(board));
}

export function getAvgHeight(board: Board): number {
  const h = getColumnHeights(board);
  return h.reduce((a, b) => a + b, 0) / h.length;
}

export function getTotalHeight(board: Board): number {
  return getColumnHeights(board).reduce((a, b) => a + b, 0);
}

export function calculateBumpiness(board: Board): number {
  const h = getColumnHeights(board);
  let bump = 0;
  for (let i = 0; i < h.length - 1; i++) bump += Math.abs(h[i] - h[i + 1]);
  return bump;
}

export function getWellDepth(board: Board): number {
  const h = getColumnHeights(board);
  let max = 0;
  for (let i = 0; i < BOARD_COLS; i++) {
    const left = i > 0 ? h[i - 1] : BOARD_ROWS;
    const right = i < BOARD_COLS - 1 ? h[i + 1] : BOARD_ROWS;
    const well = Math.min(left, right) - h[i];
    if (well > max) max = well;
  }
  return max;
}
