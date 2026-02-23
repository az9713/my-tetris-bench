'use client';

import { useBattle } from '@/hooks/useBattle';
import { useKeyboard } from '@/hooks/useKeyboard';
import BattleArena from '@/components/battle/BattleArena';
import WinScreen from '@/components/results/WinScreen';

export default function BattlePage() {
  const battle = useBattle(120);

  useKeyboard({
    dispatch: battle.humanDispatch,
    pause: () => {},
    enabled: battle.phase === 'playing',
  });

  return (
    <div className="flex flex-col items-center gap-8 py-4">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-3xl font-pixel tracking-wider">
          <span className="text-cyan-400 neon-cyan">Human</span>
          <span className="text-gray-500"> vs </span>
          <span className="text-fuchsia-400 neon-magenta">AI</span>
          <span className="text-yellow-400 neon-yellow"> Tetris</span>
        </h1>
        <p className="text-xs text-gray-600 font-pixel mt-2 tracking-widest">
          built by @stuffyokodraws
        </p>
      </div>

      {/* Battle arena */}
      <BattleArena
        humanState={battle.humanState}
        aiState={battle.aiState}
        humanName="Player"
        aiModelId={battle.aiModelId}
        onAiModelChange={battle.setAiModelId}
        timerFormatted={battle.timer.formatted}
        phase={battle.phase}
        onStart={battle.startBattle}
        onReady={() => battle.setHumanReady(true)}
        humanReady={battle.humanReady}
      />

      {/* Win screen overlay */}
      {battle.phase === 'finished' && battle.result && (
        <WinScreen
          result={battle.result}
          humanName="Player"
          onPlayAgain={battle.resetBattle}
          onRematch={battle.resetBattle}
        />
      )}
    </div>
  );
}
