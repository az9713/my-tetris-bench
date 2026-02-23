'use client';

import { useEffect, useRef } from 'react';
import { MoveAction } from '@/engine/types';
import { DAS_DELAY, DAS_REPEAT } from '@/engine/constants';

interface UseKeyboardOptions {
  dispatch: (action: MoveAction) => void;
  pause: () => void;
  enabled?: boolean;
}

export function useKeyboard({ dispatch, pause, enabled = true }: UseKeyboardOptions) {
  const dasTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const repeatTimers = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  useEffect(() => {
    if (!enabled) return;

    const keyMap: Record<string, MoveAction> = {
      ArrowLeft: 'left', ArrowRight: 'right', ArrowDown: 'soft_drop',
      ArrowUp: 'rotate_cw', z: 'rotate_ccw', x: 'rotate_cw',
      ' ': 'hard_drop', c: 'hold', Shift: 'hold',
    };

    const clearDAS = (key: string) => {
      const d = dasTimers.current.get(key);
      if (d) { clearTimeout(d); dasTimers.current.delete(key); }
      const r = repeatTimers.current.get(key);
      if (r) { clearInterval(r); repeatTimers.current.delete(key); }
    };

    const onDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === 'p' || e.key === 'P') { e.preventDefault(); pause(); return; }
      const action = keyMap[e.key];
      if (!action) return;
      e.preventDefault();
      dispatch(action);
      if (action === 'left' || action === 'right' || action === 'soft_drop') {
        clearDAS(e.key);
        dasTimers.current.set(e.key, setTimeout(() => {
          repeatTimers.current.set(e.key, setInterval(() => dispatch(action), DAS_REPEAT));
        }, DAS_DELAY));
      }
    };

    const onUp = (e: KeyboardEvent) => clearDAS(e.key);

    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      dasTimers.current.forEach((_, k) => clearDAS(k));
    };
  }, [dispatch, pause, enabled]);
}
