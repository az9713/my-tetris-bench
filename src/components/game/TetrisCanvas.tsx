'use client';

import { useRef, useEffect } from 'react';
import { GameState, BOARD_ROWS, BOARD_COLS } from '@/engine/types';
import { PIECE_COLORS } from '@/engine/constants';
import { getPieceCells, getGhostPosition } from '@/engine/board';

interface TetrisCanvasProps {
  gameState: GameState;
  cellSize?: number;
  borderColor?: string;
  showGhost?: boolean;
}

const GRID_COLOR = 'rgba(255,255,255,0.05)';
const BG_COLOR = '#0d0d1a';

export default function TetrisCanvas({
  gameState,
  cellSize = 28,
  borderColor = '#00e5ff',
  showGhost = true,
}: TetrisCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const w = BOARD_COLS * cellSize;
  const h = BOARD_ROWS * cellSize;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= BOARD_COLS; x++) {
      ctx.beginPath(); ctx.moveTo(x * cellSize, 0); ctx.lineTo(x * cellSize, h); ctx.stroke();
    }
    for (let y = 0; y <= BOARD_ROWS; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * cellSize); ctx.lineTo(w, y * cellSize); ctx.stroke();
    }

    // Locked pieces
    for (let row = 0; row < BOARD_ROWS; row++) {
      for (let col = 0; col < BOARD_COLS; col++) {
        const cell = gameState.board[row][col];
        if (cell) drawCell(ctx, col, row, cell, cellSize, 1);
      }
    }

    // Ghost
    if (showGhost && gameState.activePiece) {
      const ghost = getGhostPosition(gameState.board, gameState.activePiece);
      const color = PIECE_COLORS[gameState.activePiece.type];
      for (const [r, c] of getPieceCells(ghost)) {
        if (r >= 0 && r < BOARD_ROWS) drawCell(ctx, c, r, color, cellSize, 0.2);
      }
    }

    // Active piece
    if (gameState.activePiece) {
      const color = PIECE_COLORS[gameState.activePiece.type];
      for (const [r, c] of getPieceCells(gameState.activePiece)) {
        if (r >= 0 && r < BOARD_ROWS) drawCell(ctx, c, r, color, cellSize, 1);
      }
    }
  }, [gameState, cellSize, w, h, showGhost]);

  return (
    <div style={{
      border: `2px solid ${borderColor}`,
      borderRadius: 4,
      boxShadow: `0 0 15px ${borderColor}40, inset 0 0 15px ${borderColor}10`,
    }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: w, height: h }} />
    </div>
  );
}

function drawCell(ctx: CanvasRenderingContext2D, col: number, row: number, color: string, size: number, alpha: number) {
  const x = col * size, y = row * size, p = 1;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(x + p, y + p, size - p * 2, size - p * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillRect(x + p, y + p, size - p * 2, 2);
  ctx.fillRect(x + p, y + p, 2, size - p * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(x + p, y + size - p - 2, size - p * 2, 2);
  ctx.fillRect(x + size - p - 2, y + p, 2, size - p * 2);
  ctx.globalAlpha = 1;
}
