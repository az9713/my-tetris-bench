'use client';

import { PieceType } from '@/engine/types';
import { PIECE_SHAPES, PIECE_COLORS } from '@/engine/constants';

interface NextPiecePreviewProps {
  pieces: PieceType[];
  cellSize?: number;
}

export default function NextPiecePreview({ pieces, cellSize = 16 }: NextPiecePreviewProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs text-gray-500 uppercase tracking-wider text-center font-pixel">Next</div>
      {pieces.slice(0, 3).map((piece, i) => (
        <PieceMini key={i} type={piece} cellSize={cellSize} />
      ))}
    </div>
  );
}

function PieceMini({ type, cellSize }: { type: PieceType; cellSize: number }) {
  const shape = PIECE_SHAPES[type][0]; // rotation 0
  const color = PIECE_COLORS[type];
  const rows = shape.length;
  const cols = shape[0].length;

  return (
    <div className="flex items-center justify-center" style={{ width: 4 * cellSize + 4, height: 3 * cellSize + 4 }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`, gap: '1px' }}>
        {shape.flat().map((filled, i) => (
          <div
            key={i}
            style={{
              width: cellSize,
              height: cellSize,
              backgroundColor: filled ? color : 'transparent',
              borderRadius: 2,
              opacity: filled ? 1 : 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
