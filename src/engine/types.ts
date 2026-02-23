export const BOARD_ROWS = 20;
export const BOARD_COLS = 10;

export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
export type Rotation = 0 | 1 | 2 | 3;

/** null = empty, string = color */
export type Board = (string | null)[][];

export interface ActivePiece {
  type: PieceType;
  rotation: Rotation;
  pos: { row: number; col: number };
}

export type MoveAction = 'left' | 'right' | 'rotate_cw' | 'rotate_ccw' | 'soft_drop' | 'hard_drop' | 'hold';

export interface Placement {
  piece: PieceType;
  rotation: Rotation;
  col: number;
  row: number;
}

export interface LineClearResult {
  board: Board;
  linesCleared: number;
}

export interface PlacementResult {
  placement: Placement;
  board: Board;
  linesCleared: number;
  holes: number;
  bumpiness: number;
  maxHeight: number;
  avgHeight: number;
  wellDepth: number;
  totalHeight: number;
}

export type ScoringFunction = (placement: PlacementResult) => number;

export interface GameState {
  board: Board;
  activePiece: ActivePiece | null;
  heldPiece: PieceType | null;
  canHold: boolean;
  nextPieces: PieceType[];
  score: number;
  lines: number;
  level: number;
  combo: number;
  moveCount: number;
  isGameOver: boolean;
  isPaused: boolean;
  tickCount: number;
  gravityCounter: number;
  lockDelay: number;
}
