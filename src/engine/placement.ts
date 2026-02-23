import { Board, PieceType, Rotation, Placement, PlacementResult, ActivePiece, BOARD_COLS } from './types';
import { PIECE_SHAPES } from './constants';
import { checkCollision, lockPiece, clearLines, countHoles, getMaxHeight, getAvgHeight, getTotalHeight, calculateBumpiness, getWellDepth } from './board';

export function enumerateAllPlacements(board: Board, pieceType: PieceType): PlacementResult[] {
  const results: PlacementResult[] = [];
  const rotations: Rotation[] = pieceType === 'O' ? [0] : [0, 1, 2, 3];

  for (const rotation of rotations) {
    for (let col = -2; col < BOARD_COLS + 2; col++) {
      const piece: ActivePiece = { type: pieceType, rotation, pos: { row: 0, col } };
      if (checkCollision(board, piece)) continue;

      // Hard drop
      let row = 0;
      while (!checkCollision(board, { ...piece, pos: { row: row + 1, col } })) row++;

      // Deduplicate
      if (results.some(r => r.placement.rotation === rotation && r.placement.col === col && r.placement.row === row)) continue;

      const landed: ActivePiece = { ...piece, pos: { row, col } };
      const locked = lockPiece(board, landed);
      const { board: cleared, linesCleared } = clearLines(locked);

      results.push({
        placement: { piece: pieceType, rotation, col, row },
        board: cleared,
        linesCleared,
        holes: countHoles(cleared),
        bumpiness: calculateBumpiness(cleared),
        maxHeight: getMaxHeight(cleared),
        avgHeight: getAvgHeight(cleared),
        wellDepth: getWellDepth(cleared),
        totalHeight: getTotalHeight(cleared),
      });
    }
  }

  return results;
}
