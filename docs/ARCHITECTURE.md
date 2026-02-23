# TetrisBench Architecture Guide

This document describes the architecture of TetrisBench at multiple abstraction levels, with ASCII diagrams showing component relationships and communication flows.

---

## Table of Contents

1. [High-Level System Overview](#1-high-level-system-overview)
2. [Technology Stack Layers](#2-technology-stack-layers)
3. [Module Architecture](#3-module-architecture)
4. [Engine Module Deep Dive](#4-engine-module-deep-dive)
5. [AI System Deep Dive](#5-ai-system-deep-dive)
6. [UI Component Tree](#6-ui-component-tree)
7. [Communication Flows](#7-communication-flows)
8. [Data Flow Diagrams](#8-data-flow-diagrams)
9. [Database Schema](#9-database-schema)
10. [File Reference](#10-file-reference)

---

## 1. High-Level System Overview

TetrisBench is a web application where humans play Tetris against AI. The AI does not pick moves directly. Instead, it asks an LLM (like Claude or GPT) to write a JavaScript function that scores every possible piece placement. The engine evaluates all placements using that function and executes the highest-scored one.

```
+------------------------------------------------------------------+
|                         BROWSER (Client)                          |
|                                                                   |
|  +------------------+    +------------------+    +--------------+ |
|  |  Human Player    |    |  Tetris Engine   |    |  AI Player   | |
|  |  (Keyboard)      |--->|  (Pure TypeScript)|<---|  (Scoring)   | |
|  +------------------+    +------------------+    +--------------+ |
|                                |                       |          |
|                         [Canvas Render]          [HTTP POST]      |
|                                |                       |          |
+--------------------------------|-----------------------|----------+
                                 |                       |
                                 v                       v
                          +-------------+    +---------------------+
                          |  Browser    |    |  Next.js API Route  |
                          |  Screen     |    |  /api/ai/generate-  |
                          +-------------+    |   scoring           |
                                             +---------------------+
                                                      |
                                                      v
                                             +---------------------+
                                             |   LLM Provider      |
                                             |   (Anthropic /      |
                                             |    OpenAI / Google / |
                                             |    xAI)             |
                                             +---------------------+
```

### Key Insight

The LLM never sees the game board directly during gameplay. Instead:
1. The intervention system serializes the board state into a text representation
2. The LLM writes a JavaScript scoring function body
3. The function is compiled with `new Function()` and used to evaluate placements
4. This function persists across multiple moves until the next intervention

---

## 2. Technology Stack Layers

```
+================================================================+
|                        PRESENTATION LAYER                       |
|  React 19 Components + HTML5 Canvas + Tailwind CSS 4            |
|  (TetrisCanvas, BattleArena, GamePanel, WinScreen)              |
+================================================================+
|                        STATE MANAGEMENT                         |
|  React Hooks (useBattle, useKeyboard, useTimer, useGameLoop)    |
|  useRef for game instances, useState for render state           |
+================================================================+
|                        GAME ENGINE LAYER                        |
|  Pure TypeScript functions (zero dependencies on React/DOM)     |
|  (board.ts, pieces.ts, game.ts, placement.ts, scoring.ts)      |
+================================================================+
|                        AI LAYER                                 |
|  Scoring function management, intervention logic                |
|  (executor.ts, intervention.ts, ai-player.ts, prompt.ts)       |
+================================================================+
|                        API LAYER                                |
|  Next.js App Router API routes (server-side only)               |
|  /api/ai/generate-scoring, /api/games, /api/leaderboard        |
+================================================================+
|                        INFRASTRUCTURE                           |
|  Vercel AI SDK (LLM calls) + SQLite (persistence) + Auth.js    |
+================================================================+
```

### Why This Layering Matters

- **Engine layer** has zero browser dependencies. You can run it in Node.js, in tests, or in a headless CLI script without any DOM.
- **AI layer** is separated from the engine so the engine doesn't know about LLMs.
- **API layer** keeps secrets (API keys) server-side. The browser never sees them.
- **State layer** (hooks) bridges the engine with React's rendering cycle.

---

## 3. Module Architecture

```
src/
 |
 +-- engine/                    AI-INDEPENDENT GAME LOGIC
 |    |
 |    +-- types.ts              Type definitions, constants (BOARD_ROWS=20, BOARD_COLS=10)
 |    +-- constants.ts          Piece shapes, wall kicks, gravity table, colors
 |    +-- board.ts              Board operations: create, collision, lock, clear, metrics
 |    +-- pieces.ts             Piece spawn, move, rotate (SRS), hard drop
 |    +-- rng.ts                Seeded PRNG (mulberry32), 7-bag randomizer
 |    +-- scoring.ts            Score calculation, level progression, gravity lookup
 |    +-- game.ts               Game state machine: tick(), applyAction()
 |    +-- placement.ts          Enumerate all legal placements with board metrics
 |    +-- index.ts              Barrel re-export of everything
 |
 +-- ai/                        LLM-POWERED SCORING SYSTEM
 |    |
 |    +-- providers.ts          Model registry: 6 models across 4 providers
 |    +-- prompt.ts             System prompt + board serializer for LLM context
 |    +-- executor.ts           Parse LLM code, compile via new Function(), evaluate
 |    +-- intervention.ts       When to ask the LLM for a new scoring function
 |    +-- ai-player.ts          Orchestrator: ties intervention + API call + evaluation
 |
 +-- hooks/                     REACT STATE BRIDGES
 |    |
 |    +-- useBattle.ts          Battle orchestrator: 2 game instances, timer, phases
 |    +-- useKeyboard.ts        Keyboard input with DAS (Delayed Auto Shift)
 |    +-- useTimer.ts           Countdown timer (default 120 seconds)
 |    +-- useGameLoop.ts        Single-player game loop (RAF-driven)
 |
 +-- components/                VISUAL COMPONENTS
 |    |
 |    +-- game/
 |    |    +-- TetrisCanvas.tsx  Canvas renderer: grid, pieces, ghost, glow effects
 |    |    +-- NextPiecePreview  Mini piece previews for next queue
 |    |
 |    +-- battle/
 |    |    +-- BattleArena.tsx   Main layout: two boards + panels + timer
 |    |    +-- GamePanel.tsx     Score/lines/level display + next pieces
 |    |    +-- ScoreHeader.tsx   Top bar: names + scores + timer
 |    |    +-- ModelSelector.tsx Dropdown to pick AI model
 |    |
 |    +-- results/
 |    |    +-- WinScreen.tsx     Victory overlay: winner, scores, buttons
 |    |
 |    +-- BattlePage.tsx        Human vs AI page wiring
 |    +-- ModelVsModelPage.tsx   Model vs Model page wiring
 |
 +-- app/                       NEXT.JS APP ROUTER
 |    |
 |    +-- page.tsx              Home page (loads BattlePage)
 |    +-- layout.tsx            Root layout: font, nav, theme
 |    +-- globals.css           Neon glow styles, animations
 |    +-- model-vs-model/       Model vs Model page
 |    +-- leaderboard/          Leaderboard page
 |    +-- api/
 |         +-- ai/generate-scoring/route.ts   LLM scoring function generation
 |         +-- auth/[...nextauth]/route.ts    GitHub OAuth
 |         +-- games/route.ts                 Save/list game results
 |         +-- leaderboard/route.ts           Leaderboard statistics
 |
 +-- lib/                       SHARED INFRASTRUCTURE
 |    +-- auth.ts               NextAuth v5 config (GitHub provider)
 |    +-- db.ts                 SQLite setup, tables, queries
 |
 +-- scripts/
      +-- headless-battle.ts    CLI batch benchmarking tool
```

### Module Dependency Graph

```
                    types.ts
                   /    |    \
                  /     |     \
          constants.ts  |   scoring.ts
            /    \      |      |
           /      \     |      |
      board.ts  pieces.ts  rng.ts
         \       /      |
          \     /       |
          game.ts       |
            |           |
       placement.ts     |
            |           |
       executor.ts      |
            |           |
     intervention.ts    |
            |           |
       ai-player.ts     |
            |           |
     prompt.ts ---------+
            |
    +-------+--------+
    |                |
useBattle.ts    useGameLoop.ts
    |                |
BattlePage.tsx  (single player)
    |
BattleArena.tsx
    |
TetrisCanvas.tsx
```

---

## 4. Engine Module Deep Dive

The engine is the heart of the application. It is pure TypeScript with no external dependencies, making it testable, portable, and usable both in the browser and headless mode.

### 4.1 Board Representation

```
Board = (string | null)[][]

     Col: 0  1  2  3  4  5  6  7  8  9
Row 0:  .  .  .  .  .  .  .  .  .  .     <-- Top (pieces spawn here)
Row 1:  .  .  .  .  .  .  .  .  .  .
  ...
Row 17: .  .  .  .  .  .  .  .  .  .
Row 18: .  .  #  #  .  .  .  .  .  .     <-- '#' = color string (locked piece)
Row 19: #  #  #  #  .  #  #  #  #  #     <-- Almost full row (1 gap at col 4)
        ^                                <-- Bottom

null = empty cell
string = hex color of locked piece (e.g. '#00f0f0' for I-piece cyan)
```

### 4.2 Piece System (SRS)

Each piece type has 4 rotation states stored as boolean grids:

```
T-piece rotations:

  Rot 0      Rot 1      Rot 2      Rot 3
  .X.        .X.        ...        .X.
  XXX        .XX        XXX        XX.
  ...        .X.        .X.        .X.

Active piece tracks: type + rotation (0-3) + position (row, col)
```

**Wall Kicks (SRS):** When rotation would cause a collision, the system tries up to 5 alternative positions (wall kick offsets). Different tables for I-piece vs J/L/S/T/Z pieces.

```
Rotation attempt:
  1. Try basic rotation at same position
  2. If collision -> try kick offset #1
  3. If collision -> try kick offset #2
  4. If collision -> try kick offset #3
  5. If collision -> try kick offset #4
  6. If all fail -> rotation denied (return null)
```

See `src/engine/constants.ts:56-75` for the complete kick tables.

### 4.3 Game State Machine

```
                    createGame(seed)
                         |
                         v
                  +-------------+
                  |    SETUP    |
                  | (board empty|
                  |  piece at   |
                  |  top)       |
                  +------+------+
                         |
              tick() / applyAction()
                         |
                         v
                  +-------------+
          +------>|   PLAYING   |<-------+
          |       | tick():     |        |
          |       |  gravity    |        |
          |       |  lock delay |        |
          |       +------+------+        |
          |              |               |
     piece still    piece grounded   applyAction():
     falling        lock delay       hard_drop /
     (gravity       expires          soft_drop /
      counter++)                     move / rotate
          |              |               |
          |              v               |
          |       +-------------+        |
          |       | LOCK & CLEAR|--------+
          |       | lockPiece() |
          |       | clearLines()|
          |       | spawnNext() |
          |       +------+------+
          |              |
          +----+---------+
               |
          collision on
          spawn?
               |
          yes  |  no
               |   \
               v    +---> back to PLAYING
        +----------+
        | GAME OVER|
        +----------+

States tracked in GameState:
  tickCount       -- total frames elapsed
  gravityCounter  -- frames since last gravity drop (resets at gravity threshold)
  lockDelay       -- frames piece has been grounded (resets on move, locks at 15)
  isGameOver      -- true when new piece collides on spawn
  isPaused        -- freezes all updates
```

### 4.4 Gravity and Lock Delay

```
Level 0: gravity = 48 frames per drop (~0.8 sec at 60fps)
Level 5: gravity = 28 frames per drop (~0.47 sec)
Level 10: gravity = 6 frames per drop (~0.1 sec)
Level 20: gravity = 1 frame per drop (instant)

Lock delay = 15 frames (~250ms)
  - Ticks every frame while piece is grounded (can't move down)
  - Resets to 0 when piece moves/rotates successfully
  - At 15: piece locks, lines clear, next piece spawns
```

### 4.5 Seeded RNG (7-Bag Randomizer)

```
Seed: 42
       |
       v
  mulberry32(42) --> deterministic random() function
       |
       v
  7-bag randomizer:
    Bag 1: [T, I, S, Z, J, L, O]  (shuffled)
    Bag 2: [O, J, T, L, Z, S, I]  (shuffled)
    ...

  Both players with seed=42 get IDENTICAL piece sequences.
  This ensures fair competition.
```

### 4.6 Placement Enumeration

The `enumerateAllPlacements()` function generates every legal final position for a piece:

```
For each rotation (0, 1, 2, 3):
  For each column (-2 to BOARD_COLS+2):
    1. Place piece at top of column
    2. If collision at spawn -> skip
    3. Hard drop to lowest valid row
    4. Lock piece on board copy
    5. Clear lines on board copy
    6. Compute metrics:
       - linesCleared: rows eliminated
       - holes: empty cells below filled cells
       - bumpiness: sum of height differences between adjacent columns
       - maxHeight: tallest column
       - avgHeight: average column height
       - totalHeight: sum of all column heights
       - wellDepth: deepest gap for potential Tetris

Result: PlacementResult[] (typically 30-40 placements per piece)
```

---

## 5. AI System Deep Dive

### 5.1 AI Decision Pipeline

```
  +----------+     +--------------+     +------------------+
  | Current  |---->| Enumerate    |---->| Evaluate with    |
  | Board +  |     | All Legal    |     | Scoring Function |
  | Piece    |     | Placements   |     | (sort by score)  |
  +----------+     +--------------+     +--------+---------+
                                                 |
                                                 v
                                        +------------------+
                                        | Execute Best     |
                                        | Placement        |
                                        | (lock + clear)   |
                                        +------------------+

  Meanwhile (async, non-blocking):

  +----------+     +--------------+     +------------------+
  | Board    |---->| Should       |---->| POST /api/ai/    |
  | State    |     | Intervene?   |     | generate-scoring |
  +----------+     +--------------+     +--------+---------+
                                                 |
                                        (if yes) |
                                                 v
                                        +------------------+
                                        | LLM writes new   |
                                        | scoring function  |
                                        | code              |
                                        +--------+---------+
                                                 |
                                                 v
                                        +------------------+
                                        | Parse + Validate  |
                                        | + Replace old fn  |
                                        +------------------+
```

### 5.2 Scoring Function Lifecycle

```
  Game Start
       |
       v
  DEFAULT_SCORING_FN (hardcoded heuristic)
  = linesCleared*760 - holes*500 - bumpiness*180
    - maxHeight*50 + wellDepth*100 - totalHeight*10
       |
       | (after ~20 moves or when board degrades)
       v
  Intervention Triggered
       |
       v
  Board state serialized to text:
    "Row 19: ####.#####"
    "Holes: 3, Bumpiness: 12, Max Height: 8"
       |
       v
  POST /api/ai/generate-scoring
    { modelId, boardState, currentScore, moveCount }
       |
       v
  LLM generates JavaScript:
    "return placement.linesCleared * 1000
     - placement.holes * 600
     - placement.bumpiness * 200 ..."
       |
       v
  parseScoringFunction():
    1. Strip markdown code fences
    2. Extract function body
    3. new Function('placement', code)
    4. Test call with dummy data
    5. Verify returns a number
       |
       v
  New scoring function replaces old one
       |
       | (used for next ~20 moves)
       v
  Next intervention...
```

### 5.3 Intervention Triggers

```
shouldIntervene(gameState, interventionState) returns true when:

  +-------------------+------------------------------------------+
  | Condition         | Rationale                                |
  +-------------------+------------------------------------------+
  | No function yet   | Need initial scoring function            |
  | 20+ moves since   | Periodic refresh for changing board      |
  |   last intervene  |                                          |
  | holes > 4         | Board is degrading, need better strategy |
  | maxHeight > 15    | Board is dangerously full                |
  | 15+ moves AND     | AI is stuck, not improving               |
  |   score unchanged |                                          |
  +-------------------+------------------------------------------+
```

### 5.4 Model Provider Architecture

```
  ai-player.ts
       |
       | fetch('/api/ai/generate-scoring', { modelId: 'gemini-3-flash' })
       |
       v
  route.ts (server-side)
       |
       | getModelById('gemini-3-flash')
       |   -> { provider: 'google', modelId: 'gemini-2.0-flash' }
       |
       | getProvider('google', 'gemini-2.0-flash')
       |   -> google('gemini-2.0-flash')
       |
       v
  generateText({
    model: google('gemini-2.0-flash'),
    system: SYSTEM_PROMPT,
    prompt: buildInterventionPrompt(...),
    maxOutputTokens: 1024,
    temperature: 0.3
  })
       |
       v
  { text: "return placement.linesCleared * 900 ..." }

  Supported providers:
  +------------+---------------------------+
  | Provider   | SDK Import                |
  +------------+---------------------------+
  | anthropic  | @ai-sdk/anthropic         |
  | openai     | @ai-sdk/openai            |
  | google     | @ai-sdk/google            |
  | xai        | @ai-sdk/xai              |
  +------------+---------------------------+
```

---

## 6. UI Component Tree

### 6.1 Human vs AI Battle (Home Page)

```
page.tsx
  |
  +-- BattlePage.tsx (client component, ssr: false)
       |
       +-- useBattle(120) hook
       |    |-- humanRef (GameInstance)
       |    |-- aiRef (GameInstance)
       |    |-- timer (useTimer)
       |    |-- phase: setup | playing | finished
       |    +-- humanDispatch (keyboard -> applyAction)
       |
       +-- useKeyboard({ dispatch, pause, enabled })
       |
       +-- BattleArena
       |    |
       |    +-- ScoreHeader
       |    |    [Human Icon + Name + Score | Timer | Score + Name + AI Icon]
       |    |
       |    +-- <div class="flex">
       |    |    |
       |    |    +-- GamePanel (human side)
       |    |    |    [Avatar, Name, Ready Button, Score, Lines, Level, Next Pieces]
       |    |    |
       |    |    +-- TetrisCanvas (human board, cyan border)
       |    |    |    [20x10 grid, locked pieces, active piece, ghost piece]
       |    |    |
       |    |    +-- "VS" divider
       |    |    |
       |    |    +-- TetrisCanvas (AI board, magenta border)
       |    |    |
       |    |    +-- GamePanel (AI side)
       |    |         [Avatar, Name, Model Selector, Ready, Score, Lines, Level, Next]
       |    |
       |    +-- Start Battle button (setup phase only)
       |    +-- Controls hint bar
       |
       +-- WinScreen (finished phase only)
            [Crown, Winner Name, Score Cards, Play Again, Rematch]
```

### 6.2 Model vs Model Page

```
model-vs-model/page.tsx
  |
  +-- ModelVsModelPage.tsx (client component, ssr: false)
       |
       +-- m1Ref, m2Ref (GameInstance refs)
       +-- useTimer(120)
       +-- setInterval(makeAIMove, 500) for both sides
       |
       +-- ScoreHeader
       +-- <div class="flex">
       |    +-- GamePanel (model 1) + ModelSelector
       |    +-- TetrisCanvas (model 1 board, cyan)
       |    +-- "VS"
       |    +-- TetrisCanvas (model 2 board, magenta)
       |    +-- GamePanel (model 2) + ModelSelector
       +-- Start Battle / WinScreen
```

### 6.3 Leaderboard Page

```
leaderboard/page.tsx
  |
  +-- Tab bar: [MODELS] [HUMANS] [RECENT]
  |
  +-- Models tab:
  |    Table: Model | Games | Win Rate | Avg Score | Best Score
  |
  +-- Humans tab:
  |    Table: Player | Games | Win Rate | Avg Score | Best Score
  |
  +-- Recent tab:
       Table: Date | Human | Score | AI Model | Score | Winner
```

---

## 7. Communication Flows

### 7.1 Human vs AI Battle Flow

```
User clicks "Start Battle"
         |
         v
useBattle.startBattle()
  |-- initGames(): create 2 GameInstances with SAME seed
  |-- setPhase('playing')
  |-- timer.start()
  |-- requestAnimationFrame(humanLoop)   <-- human game ticks at 60fps
  |-- setInterval(doAIMove, 500)         <-- AI moves every 500ms
  v

HUMAN GAME LOOP (60fps):                AI GAME LOOP (every 500ms):
  tick(humanInstance)                      enumerateAllPlacements()
    |-- increment gravityCounter           evaluatePlacements(scoringFn)
    |-- if grounded: increment lockDelay   lock best placement
    |-- if lockDelay >= 15: lock piece     clear lines, spawn next
    |-- if gravity: drop piece             setAiState(updated)
  setHumanState(newState)
                                           async: shouldIntervene()?
KEYBOARD INPUT:                              |-- if yes: fetch /api/ai/generate-scoring
  keydown -> useKeyboard                     |-- parse response
    |-- applyAction(instance, 'left')        |-- update scoringFn
    |-- applyAction(instance, 'hard_drop')
    |-- etc.
  setHumanState(newState)

TIMER EXPIRES (or both game over):
  endBattle()
    |-- stop loops
    |-- compute result (who has higher score)
    |-- setPhase('finished')
    |-- show WinScreen
```

### 7.2 AI Scoring Function Generation Flow

```
Browser (ai-player.ts)                   Server (route.ts)               LLM Provider
       |                                        |                              |
       |  POST /api/ai/generate-scoring         |                              |
       |  { modelId: 'gemini-3-flash',          |                              |
       |    boardState: '...',                   |                              |
       |    currentScore: 1200,                  |                              |
       |    moveCount: 45 }                      |                              |
       |--------------------------------------->|                              |
       |                                        |                              |
       |                                        |  getModelById()              |
       |                                        |  -> provider: 'google'       |
       |                                        |  -> modelId: 'gemini-2.0-flash'
       |                                        |                              |
       |                                        |  generateText({              |
       |                                        |    model, system, prompt,    |
       |                                        |    maxOutputTokens: 1024,    |
       |                                        |    temperature: 0.3          |
       |                                        |  })                          |
       |                                        |----------------------------->|
       |                                        |                              |
       |                                        |     { text: "return          |
       |                                        |      placement.linesCl..." } |
       |                                        |<-----------------------------|
       |                                        |                              |
       |  { code: "return placement..." }       |                              |
       |<---------------------------------------|                              |
       |                                                                       |
       |  parseScoringFunction(code)                                           |
       |    -> strip markdown fences                                           |
       |    -> extract function body                                           |
       |    -> new Function('placement', body)                                 |
       |    -> test call with dummy data                                       |
       |    -> return validated function                                        |
       |                                                                       |
       |  Replace current scoringFn                                            |
       |  (used for next ~20 moves)                                            |
```

### 7.3 Game Save Flow

```
Battle ends (phase -> 'finished')
       |
       v
  POST /api/games
  { humanScore, aiScore, aiModel, winner, duration, seed }
       |
       v
  route.ts: saveGame()
       |
       v
  SQLite: INSERT INTO games (...)
       |
       v
  { gameId: 42 }

  Later: GET /api/leaderboard
       |
       v
  route.ts: getLeaderboard()
       |
       v
  SQLite queries:
    - Model stats: GROUP BY ai_model, aggregate win_rate/avg_score
    - Human stats: GROUP BY human_player_id, TOP 50
    - Recent: SELECT last 20 games with JOIN
       |
       v
  { modelStats, humanStats, recentGames }
```

### 7.4 Keyboard Input Flow

```
keydown event (e.g. ArrowLeft)
       |
       v
  useKeyboard handler
       |
       +-- First press:
       |    dispatch('left')          -> applyAction(instance, 'left')
       |    Start DAS timer (170ms)        -> tryMove(board, piece, -1, 0)
       |                                   -> if ok: new state with moved piece
       |
       +-- After 170ms (DAS delay):
       |    Start repeat interval (50ms)
       |    dispatch('left') every 50ms   -> continuous auto-shift
       |
       +-- keyup event:
            Clear DAS timer
            Clear repeat interval
```

---

## 8. Data Flow Diagrams

### 8.1 Single Tick (Human Game Loop)

```
  GameInstance
  { state, nextPiece() }
       |
       v
  tick(instance)
       |
       +-- state.isPaused? -> return state (no change)
       +-- state.isGameOver? -> return state (no change)
       +-- no activePiece? -> return state (no change)
       |
       +-- Is piece grounded? (can't move down)
       |    |
       |    yes: lockDelay++
       |    |    lockDelay >= 15? -> lockAndClear()
       |    |                         |-- lockPiece(board, piece)
       |    |                         |-- clearLines(board)
       |    |                         |-- calculate score + combo
       |    |                         |-- spawnNext()
       |    |                         |     |-- pop from nextPieces queue
       |    |                         |     |-- push nextPiece() to queue
       |    |                         |     |-- checkCollision? -> game over
       |    |                         +-- return new GameState
       |    |
       |    no: continue gravity
       |
       +-- gravityCounter++
       |    gravityCounter >= getGravity(level)?
       |    |
       |    yes: tryMove(board, piece, 0, +1)  -- drop 1 row
       |    |    reset gravityCounter to 0
       |    |
       |    no: just increment counters
       |
       v
  Updated GameState -> setHumanState() -> React re-render -> Canvas draw
```

### 8.2 AI Move (Every 500ms)

```
  aiRef.current.state
       |
       +-- isGameOver or no activePiece? -> skip
       |
       v
  enumerateAllPlacements(board, pieceType)
       |
       | For each rotation x column:
       |   - spawn at top
       |   - hard drop to bottom
       |   - lock on board copy
       |   - clear lines on copy
       |   - compute: holes, bumpiness, maxHeight, avgHeight, wellDepth, totalHeight
       |
       v
  PlacementResult[] (30-40 options)
       |
       v
  evaluatePlacements(placements, scoringFn)
       |
       | For each placement:
       |   score = scoringFn(placement)
       |     = linesCleared*760 - holes*500 - bumpiness*180 ...
       |
       | Sort by score descending
       |
       v
  best = placements[0]
       |
       v
  Lock best placement on real board
  Clear lines, update score
  Spawn next piece from queue
       |
       v
  setAiState(updated) -> React re-render -> Canvas draw
```

---

## 9. Database Schema

```
+------------------+       +------------------+       +----------------------+
|     users        |       |     games        |       |   ai_game_details    |
+------------------+       +------------------+       +----------------------+
| id TEXT PK       |<------| human_player_id  |       | id INTEGER PK        |
| name TEXT        |       | id INTEGER PK    |------>| game_id FK           |
| email TEXT       |       | human_score INT  |       | interventions INT    |
| image TEXT       |       | ai_model TEXT    |       | avg_move_time_ms REAL|
| created_at DT    |       | ai_score INT     |       | max_height_reached   |
+------------------+       | winner TEXT      |       | total_lines INT      |
                           |  ('human'|'ai'|  |       | scoring_fns_generated|
                           |   'tie')         |       | created_at DT        |
                           | duration_secs INT|       +----------------------+
                           | seed INTEGER     |
                           | created_at DT    |
                           +------------------+

+-------------------------+
| model_vs_model_games    |
+-------------------------+
| id INTEGER PK           |
| model1 TEXT             |
| model2 TEXT             |
| model1_score INT        |
| model2_score INT        |
| winner TEXT             |
| seed INTEGER            |
| duration_seconds INT    |
| created_at DT           |
+-------------------------+

Leaderboard Queries:
  Model stats: SELECT ai_model, COUNT(*), AVG(ai_score), MAX(ai_score),
               SUM(CASE WHEN winner='ai' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)
               FROM games GROUP BY ai_model

  Human stats: SELECT u.name, COUNT(*), AVG(g.human_score),
               SUM(CASE WHEN winner='human' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)
               FROM games g JOIN users u ON g.human_player_id = u.id
               GROUP BY g.human_player_id ORDER BY win_rate DESC LIMIT 50
```

---

## 10. File Reference

### Engine Files (src/engine/)

| File | Key Exports | Purpose |
|------|-------------|---------|
| `types.ts` | `BOARD_ROWS`, `BOARD_COLS`, `GameState`, `ActivePiece`, `Placement`, `PlacementResult`, `ScoringFunction` | All type definitions and board dimension constants |
| `constants.ts` | `PIECE_SHAPES`, `PIECE_COLORS`, `getWallKicks()`, `GRAVITY_TABLE`, `LOCK_DELAY_FRAMES`, `DAS_DELAY`, `DAS_REPEAT` | Game constants, SRS wall kick tables |
| `board.ts` | `createBoard()`, `checkCollision()`, `lockPiece()`, `clearLines()`, `getGhostPosition()`, `countHoles()`, `getColumnHeights()`, `getMaxHeight()`, `calculateBumpiness()`, `getWellDepth()` | Board operations and metrics |
| `pieces.ts` | `spawnPiece()`, `tryRotate()`, `tryMove()`, `hardDrop()` | Piece movement with collision detection |
| `rng.ts` | `generateSeed()`, `mulberry32()`, `createBagRandomizer()` | Seeded PRNG for deterministic piece sequences |
| `scoring.ts` | `calculateLineClearScore()`, `calculateLevel()`, `getGravity()` | Score/level/gravity calculations |
| `game.ts` | `GameInstance`, `createGame()`, `tick()`, `applyAction()`, `togglePause()` | Game state machine |
| `placement.ts` | `enumerateAllPlacements()` | AI placement evaluation |

### AI Files (src/ai/)

| File | Key Exports | Purpose |
|------|-------------|---------|
| `providers.ts` | `AVAILABLE_MODELS`, `getModelById()` | Model registry (6 models, 4 providers) |
| `prompt.ts` | `SYSTEM_PROMPT`, `buildInterventionPrompt()`, `serializeBoardState()` | LLM prompt engineering |
| `executor.ts` | `DEFAULT_SCORING_FN`, `parseScoringFunction()`, `evaluatePlacements()` | Scoring function compilation and execution |
| `intervention.ts` | `shouldIntervene()`, `createInterventionState()` | Intervention trigger logic |
| `ai-player.ts` | `createAIPlayer()`, `AIPlayer` | AI orchestrator |

### Hook Files (src/hooks/)

| File | Key Exports | Purpose |
|------|-------------|---------|
| `useBattle.ts` | `useBattle()` | Battle orchestrator: 2 games, timer, phases |
| `useKeyboard.ts` | `useKeyboard()` | Keyboard input with DAS auto-repeat |
| `useTimer.ts` | `useTimer()` | Countdown timer (MM:SS formatted) |
| `useGameLoop.ts` | `useGameLoop()` | Single-player RAF game loop |

### API Routes (src/app/api/)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/ai/generate-scoring` | POST | LLM scoring function generation |
| `/api/auth/[...nextauth]` | GET/POST | GitHub OAuth authentication |
| `/api/games` | GET/POST | Save and list game results |
| `/api/leaderboard` | GET | Aggregated statistics |
