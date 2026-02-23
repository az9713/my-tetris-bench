'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { GameState, MoveAction } from '@/engine/types';
import { createGame, tick, applyAction, togglePause, GameInstance } from '@/engine/game';

const TICK_RATE = 1000 / 60; // ~60fps

export function useGameLoop(seed: number, autoStart: boolean = false) {
  const instanceRef = useRef<GameInstance | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const rafRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);
  const runningRef = useRef(false);

  const init = useCallback(() => {
    const instance = createGame(seed);
    instanceRef.current = instance;
    setGameState(instance.state);
    return instance;
  }, [seed]);

  const gameLoop = useCallback((timestamp: number) => {
    if (!instanceRef.current || !runningRef.current) return;

    const elapsed = timestamp - lastTickRef.current;
    if (elapsed >= TICK_RATE) {
      const newState = tick(instanceRef.current);
      instanceRef.current.state = newState;
      setGameState(newState);
      lastTickRef.current = timestamp;

      if (newState.isGameOver) {
        runningRef.current = false;
        return;
      }
    }

    rafRef.current = requestAnimationFrame(gameLoop);
  }, []);

  const start = useCallback(() => {
    if (!instanceRef.current) init();
    runningRef.current = true;
    lastTickRef.current = performance.now();
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [init, gameLoop]);

  const stop = useCallback(() => {
    runningRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
  }, []);

  const reset = useCallback(() => {
    stop();
    const instance = init();
    return instance;
  }, [stop, init]);

  const dispatch = useCallback((action: MoveAction) => {
    if (!instanceRef.current) return;
    const newState = applyAction(instanceRef.current, action);
    instanceRef.current.state = newState;
    setGameState(newState);
  }, []);

  const pause = useCallback(() => {
    if (!instanceRef.current) return;
    const newState = togglePause(instanceRef.current.state);
    instanceRef.current.state = newState;
    setGameState(newState);
  }, []);

  useEffect(() => {
    init();
    if (autoStart) {
      start();
    }
    return () => stop();
  }, [seed]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    gameState,
    start,
    stop,
    reset,
    dispatch,
    pause,
    instance: instanceRef,
  };
}
