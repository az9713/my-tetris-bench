import { PlacementResult, ScoringFunction } from '@/engine/types';

export const DEFAULT_SCORING_FN: ScoringFunction = (p: PlacementResult) => {
  return (
    p.linesCleared * 760 +
    p.holes * -500 +
    p.bumpiness * -180 +
    p.maxHeight * -50 +
    p.wellDepth * 100 +
    p.totalHeight * -10
  );
};

export function parseScoringFunction(code: string): ScoringFunction | null {
  try {
    let cleaned = code.replace(/```(?:javascript|js|typescript|ts)?\n?/gi, '').replace(/```\n?/g, '').trim();

    const fnMatch = cleaned.match(/function\s*\w*\s*\([^)]*\)\s*\{([\s\S]*)\}/);
    if (fnMatch) cleaned = fnMatch[1].trim();

    const arrowMatch = cleaned.match(/(?:const|let|var)\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{?([\s\S]*)\}?;?$/);
    if (arrowMatch) cleaned = arrowMatch[1].trim();

    const fn = new Function('placement', cleaned) as ScoringFunction;

    const test = fn({
      placement: { piece: 'I', rotation: 0, col: 0, row: 0 },
      board: [],
      linesCleared: 0, holes: 0, bumpiness: 0, maxHeight: 0, avgHeight: 0, wellDepth: 0, totalHeight: 0,
    });

    if (typeof test !== 'number' || isNaN(test)) return null;
    return fn;
  } catch {
    return null;
  }
}

export function evaluatePlacements(placements: PlacementResult[], scoringFn: ScoringFunction): PlacementResult[] {
  return [...placements]
    .map(p => ({ p, score: (() => { try { const s = scoringFn(p); return typeof s === 'number' ? s : -Infinity; } catch { return -Infinity; } })() }))
    .sort((a, b) => b.score - a.score)
    .map(x => x.p);
}
