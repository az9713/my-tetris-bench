'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { GameState, MoveAction } from '@/engine/types';
import { createGame, tick, applyAction, GameInstance } from '@/engine/game';
import { generateSeed } from '@/engine/rng';
import { spawnPiece } from '@/engine/pieces';
import { lockPiece, clearLines, checkCollision } from '@/engine/board';
import { enumerateAllPlacements } from '@/engine/placement';
import { createAIPlayer, AIPlayer } from '@/ai/ai-player';
import { DEFAULT_SCORING_FN, evaluatePlacements } from '@/ai/executor';
import { calculateLevel } from '@/engine/scoring';
import { useTimer } from './useTimer';

export type BattlePhase = 'setup' | 'playing' | 'finished';

export interface BattleResult {
  humanScore: number;
  aiScore: number;
  winner: 'human' | 'ai' | 'tie';
  aiModel: string;
  duration: number;
  aiInterventions: number;
}

export function useBattle(durationSeconds: number = 120) {
  const [phase, setPhase] = useState<BattlePhase>('setup');
  const [aiModelId, setAiModelId] = useState('gemini-3-flash');
  const [humanReady, setHumanReady] = useState(false);
  const [result, setResult] = useState<BattleResult | null>(null);

  const humanRef = useRef<GameInstance | null>(null);
  const aiRef = useRef<GameInstance | null>(null);
  const [humanState, setHumanState] = useState<GameState | null>(null);
  const [aiState, setAiState] = useState<GameState | null>(null);
  const aiPlayerRef = useRef<AIPlayer | null>(null);
  const aiLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const humanRafRef = useRef<number>(0);
  const humanRunning = useRef(false);

  const timer = useTimer(durationSeconds);
  const initialized = useRef(false);

  const initGames = useCallback(() => {
    const seed = generateSeed();
    const h = createGame(seed);
    humanRef.current = h;
    setHumanState(h.state);
    const a = createGame(seed);
    aiRef.current = a;
    setAiState(a.state);
    aiPlayerRef.current = createAIPlayer(aiModelId);
  }, [aiModelId]);

  // Initialize games on mount so boards are visible during setup
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initGames();
    }
  }, [initGames]);

  // Human game loop
  const humanLoop = useCallback(() => {
    if (!humanRef.current || !humanRunning.current) return;
    const s = tick(humanRef.current);
    humanRef.current.state = s;
    setHumanState(s);
    if (!s.isGameOver) humanRafRef.current = requestAnimationFrame(humanLoop);
  }, []);

  // AI move helper
  const doAIMove = useCallback(() => {
    const inst = aiRef.current;
    if (!inst || inst.state.isGameOver || !inst.state.activePiece) return;
    const state = inst.state;
    // Capture activePiece after the null guard so TypeScript knows it is non-null
    const activePiece = inst.state.activePiece;
    const placements = enumerateAllPlacements(state.board, activePiece.type);
    if (!placements.length) return;

    // Fire-and-forget LLM intervention
    aiPlayerRef.current?.getNextPlacement(state, activePiece.type).catch(() => null);

    const ranked = evaluatePlacements(placements, DEFAULT_SCORING_FN);
    const best = ranked[0];
    if (!best) return;

    const landed = { type: activePiece.type, rotation: best.placement.rotation, pos: { row: best.placement.row, col: best.placement.col } };
    const locked = lockPiece(state.board, landed);
    const { board, linesCleared } = clearLines(locked);
    const scoreGain = linesCleared > 0 ? [0, 100, 300, 500, 800][linesCleared] * (state.level + 1) : 0;

    const nextType = state.nextPieces[0];
    const newQueue = [...state.nextPieces.slice(1), inst.nextPiece()];
    const nextPiece = spawnPiece(nextType);
    const gameOver = checkCollision(board, nextPiece);
    const totalLines = state.lines + linesCleared;

    const updated: GameState = {
      ...state,
      board,
      activePiece: gameOver ? null : nextPiece,
      nextPieces: newQueue,
      score: state.score + scoreGain,
      lines: totalLines,
      level: calculateLevel(totalLines),
      moveCount: state.moveCount + 1,
      canHold: true,
      isGameOver: gameOver,
      lockDelay: 0,
    };
    inst.state = updated;
    setAiState(updated);
  }, []);

  const startBattle = useCallback(() => {
    initGames();
    setPhase('playing');
    timer.reset();
    timer.start();
    humanRunning.current = true;
    requestAnimationFrame(humanLoop);
    aiLoopRef.current = setInterval(doAIMove, 500);
  }, [initGames, timer, humanLoop, doAIMove]);

  const humanDispatch = useCallback((action: MoveAction) => {
    if (!humanRef.current || phase !== 'playing') return;
    const s = applyAction(humanRef.current, action);
    humanRef.current.state = s;
    setHumanState(s);
  }, [phase]);

  const endBattle = useCallback(() => {
    humanRunning.current = false;
    if (humanRafRef.current) cancelAnimationFrame(humanRafRef.current);
    if (aiLoopRef.current) clearInterval(aiLoopRef.current);
    timer.stop();
    const hs = humanRef.current?.state.score ?? 0;
    const as_ = aiRef.current?.state.score ?? 0;
    setResult({
      humanScore: hs, aiScore: as_,
      winner: hs > as_ ? 'human' : as_ > hs ? 'ai' : 'tie',
      aiModel: aiModelId,
      duration: durationSeconds - timer.timeLeft,
      aiInterventions: aiPlayerRef.current?.getInterventionCount() ?? 0,
    });
    setPhase('finished');
  }, [timer, aiModelId, durationSeconds]);

  useEffect(() => { if (timer.isExpired && phase === 'playing') endBattle(); }, [timer.isExpired, phase, endBattle]);
  useEffect(() => { if (phase === 'playing' && humanState?.isGameOver && aiState?.isGameOver) endBattle(); }, [phase, humanState?.isGameOver, aiState?.isGameOver, endBattle]);

  const resetBattle = useCallback(() => {
    humanRunning.current = false;
    if (humanRafRef.current) cancelAnimationFrame(humanRafRef.current);
    if (aiLoopRef.current) clearInterval(aiLoopRef.current);
    timer.reset();
    setPhase('setup');
    setResult(null);
    setHumanReady(false);
    initGames();
  }, [timer, initGames]);

  return { phase, humanState, aiState, timer, result, aiModelId, setAiModelId, humanReady, setHumanReady, aiReady: true, startBattle, endBattle, resetBattle, humanDispatch };
}
