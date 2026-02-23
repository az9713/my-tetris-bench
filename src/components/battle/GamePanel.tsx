'use client';

import { GameState } from '@/engine/types';
import NextPiecePreview from '@/components/game/NextPiecePreview';

interface GamePanelProps {
  name: string;
  icon: string;
  gameState: GameState | null;
  isAI?: boolean;
  borderColor: string;
  modelSelector?: React.ReactNode;
  readyButton?: React.ReactNode;
}

export default function GamePanel({
  name,
  icon,
  gameState,
  isAI = false,
  borderColor,
  modelSelector,
  readyButton,
}: GamePanelProps) {
  return (
    <div className="flex flex-col items-center gap-3 w-[120px]">
      {/* Avatar */}
      <div className="text-3xl">{icon}</div>

      {/* Name */}
      <div
        className="font-pixel text-sm uppercase tracking-wider text-center"
        style={{ color: borderColor }}
      >
        {name}
      </div>

      {/* Model selector (AI only) */}
      {modelSelector && <div className="w-full">{modelSelector}</div>}

      {/* Ready button */}
      {readyButton && <div>{readyButton}</div>}

      {/* Score */}
      <div className="text-center">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider font-pixel">
          Score
        </div>
        <div className="text-lg font-pixel" style={{ color: borderColor }}>
          {gameState?.score ?? 0}
        </div>
      </div>

      {/* Lines */}
      <div className="text-center">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider font-pixel">
          Lines
        </div>
        <div className="text-lg font-pixel" style={{ color: borderColor }}>
          {gameState?.lines ?? 0}
        </div>
      </div>

      {/* Level */}
      <div className="text-center">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider font-pixel">
          Level
        </div>
        <div className="text-lg font-pixel text-white">
          {gameState?.level ?? 1}
        </div>
      </div>

      {/* Next pieces */}
      {gameState && (
        <NextPiecePreview pieces={gameState.nextPieces} cellSize={14} />
      )}
    </div>
  );
}
