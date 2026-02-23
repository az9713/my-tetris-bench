'use client';

interface ScoreHeaderProps {
  humanName: string;
  humanScore: number;
  aiName: string;
  aiScore: number;
  timerFormatted: string;
  humanIcon?: string;
  aiIcon?: string;
}

export default function ScoreHeader({
  humanName,
  humanScore,
  aiName,
  aiScore,
  timerFormatted,
  humanIcon = '👤',
  aiIcon = '🤖',
}: ScoreHeaderProps) {
  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-900/80 backdrop-blur rounded-lg px-6 py-3 flex items-center justify-between">
      {/* Human */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">{humanIcon}</span>
        <span className="font-pixel text-sm text-cyan-400 uppercase">{humanName}</span>
        <span className="font-pixel text-xl text-cyan-300">{humanScore}</span>
      </div>

      {/* Timer */}
      <div className="flex flex-col items-center">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider font-pixel">
          Time Left
        </div>
        <div className="font-pixel text-2xl text-yellow-400">{timerFormatted}</div>
      </div>

      {/* AI */}
      <div className="flex items-center gap-3">
        <span className="font-pixel text-xl text-fuchsia-300">{aiScore}</span>
        <span className="font-pixel text-sm text-fuchsia-400 uppercase">{aiName}</span>
        <span className="text-2xl">{aiIcon}</span>
      </div>
    </div>
  );
}
