'use client';

import TetrisCanvas from '@/components/game/TetrisCanvas';
import GamePanel from './GamePanel';
import ScoreHeader from './ScoreHeader';
import ModelSelector from './ModelSelector';
import { GameState } from '@/engine/types';
import { getModelById } from '@/ai/providers';

interface BattleArenaProps {
  humanState: GameState | null;
  aiState: GameState | null;
  humanName: string;
  aiModelId: string;
  onAiModelChange: (id: string) => void;
  timerFormatted: string;
  phase: string;
  onStart: () => void;
  onReady: () => void;
  humanReady: boolean;
}

export default function BattleArena({
  humanState,
  aiState,
  humanName,
  aiModelId,
  onAiModelChange,
  timerFormatted,
  phase,
  onStart,
  onReady,
  humanReady,
}: BattleArenaProps) {
  const aiModel = getModelById(aiModelId);
  const aiName = aiModel?.displayName ?? 'AI';
  const aiIcon = aiModel?.icon ?? '🤖';

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Score header bar */}
      <ScoreHeader
        humanName={humanName}
        humanScore={humanState?.score ?? 0}
        aiName={aiName}
        aiScore={aiState?.score ?? 0}
        timerFormatted={timerFormatted}
        aiIcon={aiIcon}
      />

      {/* Battle area */}
      <div className="flex items-start justify-center gap-4">
        {/* Human side */}
        <GamePanel
          name={humanName}
          icon="👤"
          gameState={humanState}
          borderColor="#00e5ff"
          readyButton={
            phase === 'setup' ? (
              <button
                onClick={onReady}
                className={`font-pixel text-xs px-4 py-2 rounded border transition-all ${
                  humanReady
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400'
                    : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-cyan-400'
                }`}
              >
                {humanReady ? 'READY ✓' : 'READY'}
              </button>
            ) : null
          }
        />

        {/* Human board */}
        {humanState && (
          <TetrisCanvas
            gameState={humanState}
            cellSize={28}
            borderColor="#00e5ff"
          />
        )}

        {/* VS divider */}
        <div className="flex items-center justify-center self-center">
          <div className="text-3xl font-pixel text-gray-600">VS</div>
        </div>

        {/* AI board */}
        {aiState && (
          <TetrisCanvas
            gameState={aiState}
            cellSize={28}
            borderColor="#e879f9"
            showGhost={false}
          />
        )}

        {/* AI side */}
        <GamePanel
          name={aiName}
          icon={aiIcon}
          gameState={aiState}
          isAI
          borderColor="#e879f9"
          modelSelector={
            <ModelSelector
              value={aiModelId}
              onChange={onAiModelChange}
              disabled={phase !== 'setup'}
              borderColor="#e879f9"
            />
          }
          readyButton={
            phase === 'setup' ? (
              <div className="font-pixel text-xs px-4 py-2 rounded border bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-400">
                READY ✓
              </div>
            ) : null
          }
        />
      </div>

      {/* Start button */}
      {phase === 'setup' && (
        <button
          onClick={onStart}
          className="font-pixel text-lg px-12 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-wider transition-all hover:scale-105 shadow-lg shadow-emerald-500/30 flex items-center gap-3"
        >
          <span>▶</span> Start Battle
        </button>
      )}

      {/* Controls hint */}
      <div className="flex gap-6 text-xs text-gray-600 font-pixel">
        <span>← → Move</span>
        <span>↑ Rotate</span>
        <span>↓ Soft Drop</span>
        <span>SPACE Hard Drop</span>
        <span>P Pause</span>
      </div>
    </div>
  );
}
