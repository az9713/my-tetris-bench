# CLAUDE.md - Instructions for Claude Code

## Project Overview

TetrisBench is a Human vs AI Tetris benchmark. LLMs write JavaScript scoring functions to evaluate piece placements. Next.js 16 + React 19 + TypeScript + Tailwind + Canvas.

## Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm test             # Run engine tests (vitest)
npm run test:watch   # Watch mode tests
npx tsx src/scripts/headless-battle.ts --model1 X --model2 Y --games N
```

## Project Structure

- `src/engine/` -- Pure TS game engine. Zero DOM dependencies. All game logic lives here.
- `src/ai/` -- LLM integration. Providers, prompts, scoring function sandbox, intervention logic.
- `src/components/` -- React components. Canvas renderer, battle UI, results screen.
- `src/hooks/` -- Custom hooks. Battle orchestrator, keyboard input, timer.
- `src/app/` -- Next.js App Router. Pages and API routes.
- `src/lib/` -- Auth (NextAuth GitHub OAuth) and database (SQLite via better-sqlite3).
- `src/scripts/` -- CLI tools for headless benchmarking.

## Key Type Conventions

- Piece positions: `pos: { row, col }` (row = vertical, col = horizontal)
- Board: `(string | null)[][]` where string = hex color, null = empty
- Piece shapes: `boolean[][][]` (4 rotations, each a 2D grid)
- `BOARD_ROWS` (20) and `BOARD_COLS` (10) are in `types.ts`, NOT `constants.ts`
- `ScoringFunction`, `PlacementResult`, `LineClearResult` are in `types.ts`

## Architecture Rules

- Engine module is pure functions -- no React, no DOM, no side effects
- Engine tests must always pass: `npm test`
- AI uses `new Function()` sandbox to execute LLM-generated code -- always wrap in try/catch
- Vercel AI SDK uses `maxOutputTokens` (not `maxTokens`)
- Both players in a battle share the same seed for identical piece sequences
- Components use 'use client' directive (client-side rendering for game logic)
- API routes keep LLM API keys server-side

## File Dependencies

```
types.ts <-- constants.ts <-- board.ts, pieces.ts
                           <-- rng.ts
                           <-- scoring.ts
board.ts + pieces.ts + scoring.ts + rng.ts <-- game.ts
board.ts + types.ts <-- placement.ts
placement.ts + executor.ts <-- ai-player.ts
game.ts <-- useBattle.ts, useGameLoop.ts
useBattle.ts + useKeyboard.ts <-- BattlePage.tsx
```

## Common Pitfalls

- Don't import `BOARD_ROWS`/`BOARD_COLS` from constants -- they're in `types.ts`
- `getGravity(0)` returns 48 frames per drop (slow at level 0) -- this is intentional
- Lock delay is 15 frames (~250ms) -- grounded pieces tick lock delay every frame
- `createBagRandomizer` returns a closure, not an array
- `checkCollision` returns true when there IS a collision (piece can't be placed)
- `tryMove`/`tryRotate` return null on failure, new piece on success
- The AI `makeAIMove` in ModelVsModelPage uses DEFAULT_SCORING_FN directly (no LLM calls)
- `useBattle` AI loop uses `setInterval(500ms)` -- AI moves every half second

## Testing

Tests are in `src/engine/__tests__/engine.test.ts`. They cover:
- Board creation, collision detection, line clearing
- Piece rotation with SRS wall kicks
- Seeded RNG determinism
- Scoring calculations
- Game state management
- Placement enumeration

When modifying engine code, always run `npm test` to verify.

## Environment Variables

```
ANTHROPIC_API_KEY       -- Claude models
OPENAI_API_KEY          -- GPT models
GOOGLE_GENERATIVE_AI_API_KEY -- Gemini models
XAI_API_KEY             -- Grok models
AUTH_SECRET             -- NextAuth session encryption
AUTH_GITHUB_ID          -- GitHub OAuth app ID
AUTH_GITHUB_SECRET      -- GitHub OAuth app secret
DATABASE_URL            -- SQLite path (default: file:./data/tetrisbench.db)
```
