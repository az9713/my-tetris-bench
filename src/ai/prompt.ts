import { Board, BOARD_ROWS, BOARD_COLS } from '@/engine/types';
import { countHoles, calculateBumpiness, getMaxHeight, getColumnHeights } from '@/engine/board';

export const SYSTEM_PROMPT = `You are playing Tetris by writing a JavaScript scoring function. Your function evaluates possible piece placements and returns a numeric score — the highest-scored placement will be executed.

Your function receives a "placement" object with these properties:
- placement.linesCleared (number): lines cleared by this placement (0-4)
- placement.holes (number): total holes in the resulting board
- placement.bumpiness (number): sum of absolute height differences between adjacent columns
- placement.maxHeight (number): height of the tallest column after placement
- placement.avgHeight (number): average column height after placement
- placement.wellDepth (number): depth of the deepest well (for Tetris setups)
- placement.totalHeight (number): sum of all column heights

Write ONLY a JavaScript function body that computes and returns a numeric score. Do not include function declaration, just the body. Example:

const score =
  placement.linesCleared * 760 +
  placement.holes * -500 +
  placement.bumpiness * -180 +
  placement.maxHeight * -50 +
  placement.wellDepth * 100;
return score;

Optimize for survival and high scores. Prioritize clearing lines, minimizing holes, and keeping the board flat.`;

export function buildInterventionPrompt(boardState: string, currentScore: number, moveCount: number): string {
  return `Current board state:\n${boardState}\n\nGame stats: Score=${currentScore}, Moves=${moveCount}\n\nAnalyze the board and write an updated scoring function. Write ONLY the function body, returning a numeric score.`;
}

export function serializeBoardState(board: Board): string {
  const heights = getColumnHeights(board);
  const holes = countHoles(board);
  const bumpiness = calculateBumpiness(board);
  const maxHeight = getMaxHeight(board);

  let visual = '';
  for (let row = 0; row < BOARD_ROWS; row++) {
    let line = '';
    for (let col = 0; col < BOARD_COLS; col++) {
      line += board[row][col] ? '█' : '·';
    }
    visual += line + '\n';
  }

  return `${visual}\nHeights: [${heights.join(', ')}]\nHoles: ${holes}\nBumpiness: ${bumpiness}\nMax height: ${maxHeight}`;
}
