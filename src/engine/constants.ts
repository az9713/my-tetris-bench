import type { PieceType, Rotation } from './types';

export const ALL_PIECE_TYPES: PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

export const PIECE_SHAPES: Record<PieceType, boolean[][][]> = {
  I: [
    [[false,false,false,false],[true,true,true,true],[false,false,false,false],[false,false,false,false]],
    [[false,false,true,false],[false,false,true,false],[false,false,true,false],[false,false,true,false]],
    [[false,false,false,false],[false,false,false,false],[true,true,true,true],[false,false,false,false]],
    [[false,true,false,false],[false,true,false,false],[false,true,false,false],[false,true,false,false]],
  ],
  O: [
    [[true,true],[true,true]],[[true,true],[true,true]],
    [[true,true],[true,true]],[[true,true],[true,true]],
  ],
  T: [
    [[false,true,false],[true,true,true],[false,false,false]],
    [[false,true,false],[false,true,true],[false,true,false]],
    [[false,false,false],[true,true,true],[false,true,false]],
    [[false,true,false],[true,true,false],[false,true,false]],
  ],
  S: [
    [[false,true,true],[true,true,false],[false,false,false]],
    [[false,true,false],[false,true,true],[false,false,true]],
    [[false,false,false],[false,true,true],[true,true,false]],
    [[true,false,false],[true,true,false],[false,true,false]],
  ],
  Z: [
    [[true,true,false],[false,true,true],[false,false,false]],
    [[false,false,true],[false,true,true],[false,true,false]],
    [[false,false,false],[true,true,false],[false,true,true]],
    [[false,true,false],[true,true,false],[true,false,false]],
  ],
  J: [
    [[true,false,false],[true,true,true],[false,false,false]],
    [[false,true,true],[false,true,false],[false,true,false]],
    [[false,false,false],[true,true,true],[false,false,true]],
    [[false,true,false],[false,true,false],[true,true,false]],
  ],
  L: [
    [[false,false,true],[true,true,true],[false,false,false]],
    [[false,true,false],[false,true,false],[false,true,true]],
    [[false,false,false],[true,true,true],[true,false,false]],
    [[true,true,false],[false,true,false],[false,true,false]],
  ],
};

export const PIECE_COLORS: Record<PieceType, string> = {
  I: '#00f0f0', O: '#f0f000', T: '#a000f0',
  S: '#00f000', Z: '#f00000', J: '#0000f0', L: '#f0a000',
};

// SRS Wall Kicks
type KickTable = Record<string, [number, number][]>;

const KICKS_JLSTZ: KickTable = {
  '0>1': [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
  '1>0': [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
  '1>2': [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
  '2>1': [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
  '2>3': [[0,0],[1,0],[1,-1],[0,2],[1,2]],
  '3>2': [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
  '3>0': [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
  '0>3': [[0,0],[1,0],[1,-1],[0,2],[1,2]],
};
const KICKS_I: KickTable = {
  '0>1': [[0,0],[-2,0],[1,0],[-2,1],[1,-2]],
  '1>0': [[0,0],[2,0],[-1,0],[2,-1],[-1,2]],
  '1>2': [[0,0],[-1,0],[2,0],[-1,-2],[2,1]],
  '2>1': [[0,0],[1,0],[-2,0],[1,2],[-2,-1]],
  '2>3': [[0,0],[2,0],[-1,0],[2,-1],[-1,2]],
  '3>2': [[0,0],[-2,0],[1,0],[-2,1],[1,-2]],
  '3>0': [[0,0],[1,0],[-2,0],[1,2],[-2,-1]],
  '0>3': [[0,0],[-1,0],[2,0],[-1,-2],[2,1]],
};

export function getWallKicks(type: PieceType, from: Rotation, to: Rotation): [number, number][] {
  const key = `${from}>${to}`;
  return (type === 'I' ? KICKS_I : KICKS_JLSTZ)[key] ?? [[0, 0]];
}

export const LINE_CLEAR_SCORES: Record<number, number> = { 1: 100, 2: 300, 3: 500, 4: 800 };
export const COMBO_BONUS = 50;
export const SOFT_DROP_SCORE = 1;
export const HARD_DROP_SCORE = 2;
export const LINES_PER_LEVEL = 10;
export const LOCK_DELAY_FRAMES = 15;

// Gravity: frames per drop, indexed by level
export const GRAVITY_TABLE: number[] = [
  48, 48, 43, 38, 33, 28, 23, 18, 13, 8,  // 0-9
  6, 5, 5, 4, 4, 3, 3, 3, 2, 2, 1,         // 10-20
];

export const QUEUE_SIZE = 5;

// DAS (Delayed Auto Shift) timing in milliseconds
export const DAS_DELAY = 170;
export const DAS_REPEAT = 50;
