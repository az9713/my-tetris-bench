'use client';

import { BattleResult } from '@/hooks/useBattle';
import { getModelById } from '@/ai/providers';

interface WinScreenProps {
  result: BattleResult;
  humanName: string;
  onPlayAgain: () => void;
  onRematch: () => void;
}

export default function WinScreen({
  result,
  humanName,
  onPlayAgain,
  onRematch,
}: WinScreenProps) {
  const aiModel = getModelById(result.aiModel);
  const aiName = aiModel?.displayName ?? 'AI';
  const winnerName = result.winner === 'human' ? humanName : result.winner === 'ai' ? aiName : 'TIE';
  const winnerColor = result.winner === 'human' ? '#00e5ff' : result.winner === 'ai' ? '#e879f9' : '#facc15';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 max-w-lg">
        {/* Crown */}
        <div className="text-7xl">👑</div>

        {/* Winner text */}
        <h1
          className="font-pixel text-4xl uppercase tracking-wider text-center"
          style={{ color: winnerColor }}
        >
          {winnerName} {result.winner === 'tie' ? '' : 'WINS!'}
        </h1>

        <p className="text-gray-400 font-pixel text-sm">
          {result.winner === 'tie'
            ? "It's a tie!"
            : "Time's up! Highest score wins!"}
        </p>

        {/* Score cards */}
        <div className="flex gap-4">
          <ScoreCard
            label={`${humanName} Score`}
            value={result.humanScore}
            color="#00e5ff"
          />
          <ScoreCard
            label="Time Limit"
            value="2:00"
            color="#facc15"
            isText
          />
          <ScoreCard
            label={`${aiName} Score`}
            value={result.aiScore}
            color="#e879f9"
          />
        </div>

        {/* Buttons */}
        <button
          onClick={onPlayAgain}
          className="font-pixel text-lg px-12 py-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold uppercase tracking-wider transition-all hover:scale-105 shadow-lg shadow-yellow-400/30"
        >
          Play Again
        </button>

        <button
          onClick={onRematch}
          className="font-pixel text-sm px-8 py-3 rounded-xl border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 uppercase tracking-wider transition-all"
        >
          ↻ Rematch
        </button>
      </div>
    </div>
  );
}

function ScoreCard({
  label,
  value,
  color,
  isText = false,
}: {
  label: string;
  value: number | string;
  color: string;
  isText?: boolean;
}) {
  return (
    <div className="bg-gray-900/90 rounded-xl px-6 py-4 text-center border border-gray-800 min-w-[140px]">
      <div className="text-[10px] text-gray-500 uppercase tracking-wider font-pixel mb-2">
        {label}
      </div>
      <div
        className="font-pixel text-2xl"
        style={{ color }}
      >
        {isText ? value : (value as number).toLocaleString()}
      </div>
    </div>
  );
}
