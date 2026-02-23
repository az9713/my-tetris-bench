'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import TetrisCanvas from '@/components/game/TetrisCanvas';
import GamePanel from '@/components/battle/GamePanel';
import ScoreHeader from '@/components/battle/ScoreHeader';
import ModelSelector from '@/components/battle/ModelSelector';
import WinScreen from '@/components/results/WinScreen';
import { GameState } from '@/engine/types';
import { createGame, GameInstance } from '@/engine/game';
import { generateSeed } from '@/engine/rng';
import { enumerateAllPlacements } from '@/engine/placement';
import { DEFAULT_SCORING_FN, evaluatePlacements } from '@/ai/executor';
import { spawnPiece } from '@/engine/pieces';
import { lockPiece, clearLines, checkCollision } from '@/engine/board';
import { calculateLevel } from '@/engine/scoring';
import { getModelById } from '@/ai/providers';
import { useTimer } from '@/hooks/useTimer';

type Phase = 'setup' | 'playing' | 'finished';

function makeAIMove(inst: GameInstance, setFn: (s: GameState) => void) {
  const state = inst.state;
  if (state.isGameOver || !state.activePiece) return;
  const placements = enumerateAllPlacements(state.board, state.activePiece.type);
  if (!placements.length) return;
  const best = evaluatePlacements(placements, DEFAULT_SCORING_FN)[0];
  if (!best) return;

  const landed = { type: state.activePiece.type, rotation: best.placement.rotation, pos: { row: best.placement.row, col: best.placement.col } };
  const locked = lockPiece(state.board, landed);
  const { board, linesCleared } = clearLines(locked);
  const scoreGain = linesCleared > 0 ? [0, 100, 300, 500, 800][linesCleared] * (state.level + 1) : 0;
  const nextType = state.nextPieces[0];
  const newQueue = [...state.nextPieces.slice(1), inst.nextPiece()];
  const nextPiece = spawnPiece(nextType);
  const gameOver = checkCollision(board, nextPiece);
  const totalLines = state.lines + linesCleared;

  const updated: GameState = {
    ...state, board, activePiece: gameOver ? null : nextPiece, nextPieces: newQueue,
    score: state.score + scoreGain, lines: totalLines, level: calculateLevel(totalLines),
    moveCount: state.moveCount + 1, canHold: true, isGameOver: gameOver, lockDelay: 0,
  };
  inst.state = updated;
  setFn(updated);
}

export default function ModelVsModelPage() {
  const [m1Id, setM1Id] = useState('claude-opus-4-5');
  const [m2Id, setM2Id] = useState('gemini-3-flash');
  const [phase, setPhase] = useState<Phase>('setup');

  const m1Ref = useRef<GameInstance | null>(null);
  const m2Ref = useRef<GameInstance | null>(null);
  const [m1State, setM1State] = useState<GameState | null>(null);
  const [m2State, setM2State] = useState<GameState | null>(null);
  const loopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timer = useTimer(120);

  const init = useCallback(() => {
    const seed = generateSeed();
    m1Ref.current = createGame(seed);
    m2Ref.current = createGame(seed);
    setM1State(m1Ref.current.state);
    setM2State(m2Ref.current.state);
  }, []);

  const start = useCallback(() => {
    init();
    setPhase('playing');
    timer.reset(); timer.start();
    loopRef.current = setInterval(() => {
      if (m1Ref.current) makeAIMove(m1Ref.current, setM1State);
      if (m2Ref.current) makeAIMove(m2Ref.current, setM2State);
    }, 500);
  }, [init, timer]);

  const end = useCallback(() => {
    if (loopRef.current) clearInterval(loopRef.current);
    timer.stop();
    setPhase('finished');
  }, [timer]);

  useEffect(() => { if (timer.isExpired && phase === 'playing') end(); }, [timer.isExpired, phase, end]);
  useEffect(() => { if (phase === 'playing' && m1State?.isGameOver && m2State?.isGameOver) end(); }, [phase, m1State?.isGameOver, m2State?.isGameOver, end]);

  const reset = useCallback(() => {
    if (loopRef.current) clearInterval(loopRef.current);
    timer.reset(); setPhase('setup'); init();
  }, [timer, init]);

  const m1 = getModelById(m1Id);
  const m2 = getModelById(m2Id);
  const s1 = m1State?.score ?? 0;
  const s2 = m2State?.score ?? 0;
  const result = phase === 'finished' ? {
    humanScore: s1, aiScore: s2,
    winner: (s1 > s2 ? 'human' : s2 > s1 ? 'ai' : 'tie') as 'human' | 'ai' | 'tie',
    aiModel: m2Id, duration: 120, aiInterventions: 0,
  } : null;

  return (
    <div className="flex flex-col items-center gap-8 py-4">
      <div className="text-center">
        <h1 className="text-3xl font-pixel tracking-wider">
          <span className="text-cyan-400 neon-cyan">Model</span>
          <span className="text-gray-500"> vs </span>
          <span className="text-fuchsia-400 neon-magenta">Model</span>
          <span className="text-yellow-400 neon-yellow"> Tetris</span>
        </h1>
        <p className="text-xs text-gray-600 font-pixel mt-2 tracking-widest">Watch two AIs compete</p>
      </div>

      <ScoreHeader humanName={m1?.displayName ?? 'Model 1'} humanScore={s1} aiName={m2?.displayName ?? 'Model 2'} aiScore={s2} timerFormatted={timer.formatted} humanIcon={m1?.icon ?? '🤖'} aiIcon={m2?.icon ?? '🤖'} />

      <div className="flex items-start justify-center gap-4">
        <GamePanel name={m1?.displayName ?? 'Model 1'} icon={m1?.icon ?? '🤖'} gameState={m1State} borderColor="#00e5ff"
          modelSelector={<ModelSelector value={m1Id} onChange={setM1Id} disabled={phase !== 'setup'} borderColor="#00e5ff" />} />
        {m1State && <TetrisCanvas gameState={m1State} cellSize={28} borderColor="#00e5ff" showGhost={false} />}
        <div className="flex items-center justify-center self-center"><div className="text-3xl font-pixel text-gray-600">VS</div></div>
        {m2State && <TetrisCanvas gameState={m2State} cellSize={28} borderColor="#e879f9" showGhost={false} />}
        <GamePanel name={m2?.displayName ?? 'Model 2'} icon={m2?.icon ?? '🤖'} gameState={m2State} isAI borderColor="#e879f9"
          modelSelector={<ModelSelector value={m2Id} onChange={setM2Id} disabled={phase !== 'setup'} borderColor="#e879f9" />} />
      </div>

      {phase === 'setup' && (
        <button onClick={start} className="font-pixel text-lg px-12 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-wider transition-all hover:scale-105 shadow-lg shadow-emerald-500/30 flex items-center gap-3">
          <span>▶</span> Start Battle
        </button>
      )}

      {phase === 'finished' && result && (
        <WinScreen result={result} humanName={m1?.displayName ?? 'Model 1'} onPlayAgain={reset} onRematch={reset} />
      )}
    </div>
  );
}
