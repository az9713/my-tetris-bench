# TetrisBench User Guide

Welcome to TetrisBench! This guide will walk you through everything you can do in the app, starting with the simplest tasks and building up to advanced features. No technical knowledge required.

---

## Table of Contents

1. [What is TetrisBench?](#1-what-is-tetrisbench)
2. [Getting Started](#2-getting-started)
3. [Use Case 1: Play Your First Game](#use-case-1-play-your-first-game)
4. [Use Case 2: Learn the Controls](#use-case-2-learn-the-controls)
5. [Use Case 3: Watch the AI Play](#use-case-3-watch-the-ai-play)
6. [Use Case 4: Beat the AI](#use-case-4-beat-the-ai)
7. [Use Case 5: Try Different AI Models](#use-case-5-try-different-ai-models)
8. [Use Case 6: Watch Model vs Model](#use-case-6-watch-model-vs-model)
9. [Use Case 7: Compare AI Models](#use-case-7-compare-ai-models)
10. [Use Case 8: Check the Leaderboard](#use-case-8-check-the-leaderboard)
11. [Use Case 9: Use the Hold Feature](#use-case-9-use-the-hold-feature)
12. [Use Case 10: Master T-Spins and Combos](#use-case-10-master-t-spins-and-combos)
13. [Use Case 11: Run Headless Benchmarks](#use-case-11-run-headless-benchmarks)
14. [Understanding the Scoring System](#understanding-the-scoring-system)
15. [Keyboard Reference](#keyboard-reference)
16. [FAQ](#faq)

---

## 1. What is TetrisBench?

TetrisBench is a Tetris game where you compete against AI. But this isn't a normal Tetris AI -- instead of hardcoded rules, a large language model (like ChatGPT or Claude) writes a custom strategy in real-time during the game.

You and the AI get the **exact same piece sequence** (same random seed), so the only difference is skill.

### The Three Game Modes

```
+------------------+    +------------------+    +------------------+
|  HUMAN vs AI     |    |  MODEL vs MODEL  |    |  LEADERBOARD     |
|                  |    |                  |    |                  |
|  You play Tetris |    |  Watch two AIs   |    |  See who's       |
|  against an AI   |    |  compete against |    |  winning: models |
|  model           |    |  each other      |    |  or humans       |
+------------------+    +------------------+    +------------------+
```

---

## 2. Getting Started

### Step 1: Open the App

If someone has set up TetrisBench for you, just open your web browser and go to:

```
http://localhost:3000
```

### Step 2: If You Need to Start It Yourself

Open a terminal (Command Prompt on Windows, Terminal on Mac) and type:

```bash
cd tetrisbench
npm run dev
```

Wait for it to say "Ready" then open http://localhost:3000 in your browser.

---

## Use Case 1: Play Your First Game

**Goal:** Start a battle against the AI and play a few pieces.

### Steps:

1. Open http://localhost:3000 in your browser
2. You'll see the **Human vs AI Tetris** screen with two empty boards
3. The left board is yours (cyan/blue border). The right board is the AI's (pink border).
4. Click the green **START BATTLE** button at the bottom
5. A piece appears at the top of both boards
6. Press the **Space bar** to hard-drop your first piece (it falls instantly to the bottom)
7. A new piece appears. Press **Left/Right arrows** to position it, then **Space** to drop
8. Keep playing! The timer counts down from 2:00

### What You'll See:

```
+-------------------------------+     +-------------------------------+
| YOUR BOARD (cyan border)      |     | AI BOARD (pink border)        |
|                               |     |                               |
|     [piece falling]           |     |     [AI placing pieces        |
|                               |     |      automatically]           |
|                               |     |                               |
|  [ghost piece at bottom]      |     |                               |
+-------------------------------+     +-------------------------------+
```

The **ghost piece** (faint outline at the bottom) shows where your piece will land if you drop it now.

---

## Use Case 2: Learn the Controls

**Goal:** Get comfortable with all the keyboard controls.

### Control Reference:

```
+--------------------+-------------------------------------------+
|  Key               |  Action                                   |
+--------------------+-------------------------------------------+
|  Left Arrow  (<-)  |  Move piece left                          |
|  Right Arrow (->)  |  Move piece right                         |
|  Down Arrow  (v)   |  Soft drop (falls faster, +1 point/row)   |
|  Up Arrow    (^)   |  Rotate piece clockwise                   |
|  Z                 |  Rotate piece counter-clockwise            |
|  X                 |  Rotate piece clockwise (same as Up)       |
|  Space Bar         |  Hard drop (instant, +2 points/row)        |
|  C or Shift        |  Hold piece (swap with hold slot)          |
|  P                 |  Pause game                                |
+--------------------+-------------------------------------------+
```

### Practice Drill:

1. Start a battle
2. When a piece appears, try this sequence:
   - Press **Left** 3 times (moves piece left)
   - Press **Up** once (rotates the piece)
   - Press **Space** (drops it)
3. For the next piece, try:
   - Press **Right** 2 times
   - Press **Z** (rotate counter-clockwise)
   - Press **Down** to soft-drop it slowly (watch it fall faster)
4. Hold a key (Left or Right) -- notice it auto-repeats after a short delay

### Tip: Auto-Repeat (DAS)

If you hold the Left or Right arrow, the piece pauses for a moment (170ms), then starts moving rapidly (every 50ms). This is called **DAS** (Delayed Auto Shift) and is standard in competitive Tetris. Use it to quickly slide pieces to the edges.

---

## Use Case 3: Watch the AI Play

**Goal:** Observe how the AI places pieces and understand its strategy.

### Steps:

1. Go to http://localhost:3000
2. Click **START BATTLE**
3. Don't press any keys -- just watch both boards
4. Focus on the AI board (right side, pink border)

### What to Observe:

- **The AI places a piece every 0.5 seconds** (it's not rushing)
- **It fills rows completely** -- watch for line clears (rows disappear with a flash)
- **It keeps the surface flat** -- the AI avoids creating holes and bumpy surfaces
- **Its score climbs steadily** -- check the score counter on the right panel

### The AI's Strategy:

The AI evaluates every possible position for each piece and picks the best one based on:

```
Best placement = highest score from:
  + Lines cleared (very good)
  - Holes created (very bad)
  - Bumpy surface (bad)
  - Stack height (somewhat bad)
  + Well depth (good -- sets up Tetris clears)
```

---

## Use Case 4: Beat the AI

**Goal:** Score higher than the AI in a 2-minute battle.

### Strategy Tips:

1. **Keep the surface flat.** The #1 rule of competitive Tetris. Avoid creating holes.

2. **Build for Tetrises.** Leave column 0 or 9 open and stack everything flat. When you get an I-piece, drop it in the well for a 4-line clear (800 points!).

```
   Good (flat with well):      Bad (holes and bumps):
   .........|                  .#........
   .........|                  ##.#.#.#..
   #########|                  ####.#####
   #########|                  ###.######
```

3. **Use hard drop (Space) for speed.** Every hard-drop row gives you 2 bonus points, and you waste less time.

4. **Use soft drop (Down) for precision.** When you need to see where a piece fits, soft drop gives you more control.

5. **Use Hold (C) strategically.** If you get a piece you can't use right now, hold it for later. You can swap once per piece.

6. **Watch the Next queue.** The upcoming pieces are shown on the left panel. Plan ahead!

### Scoring Reference:

| Action | Points |
|--------|--------|
| Single (1 line) | 100 x (level + 1) |
| Double (2 lines) | 300 x (level + 1) |
| Triple (3 lines) | 500 x (level + 1) |
| Tetris (4 lines) | 800 x (level + 1) |
| Soft drop | 1 per row |
| Hard drop | 2 per row |
| Combo bonus | 50 x combo x (level + 1) |

**Combo:** Clear lines on consecutive pieces for combo bonuses. If you clear a line with piece 1, then another with piece 2, that's a 1-combo (+50 bonus).

---

## Use Case 5: Try Different AI Models

**Goal:** Play against different AI models and see which one is hardest.

### Steps:

1. Go to http://localhost:3000
2. On the right panel (AI side), click the **model dropdown** (shows "Gemini" by default)
3. Choose a different model:
   - **Claude Opus 4.5** -- Anthropic's most capable model
   - **Claude Sonnet 4** -- Fast and smart
   - **GPT 5.2** -- OpenAI's model
   - **Gemini 3 Flash** -- Google's fast model (default)
   - **Gemini 3 Pro** -- Google's advanced model
   - **Grok 4.1** -- xAI's model
4. Click **START BATTLE** and play!

### Note:

Without API keys configured, all models use the same built-in heuristic scoring function. To see differences between models, you need API keys set up in `.env.local` (ask your developer).

---

## Use Case 6: Watch Model vs Model

**Goal:** Watch two AI models compete against each other.

### Steps:

1. Click **Model vs Model** in the top navigation bar
2. Choose a model for the left side (default: Claude Opus 4.5)
3. Choose a model for the right side (default: Gemini 3 Flash)
4. Click **START BATTLE**
5. Watch both AIs play simultaneously!

### What Happens:

- Both AIs get the **exact same pieces** (same random seed)
- Each AI makes a move every 0.5 seconds
- The timer counts down from 2:00
- When time runs out, the AI with the higher score wins
- A victory screen appears showing the winner

### Fun Experiment:

Pick the same model for both sides. Since they use the same scoring function and get the same pieces, they should make identical moves and end with the same score. This proves the seeded random number generator works correctly!

---

## Use Case 7: Compare AI Models

**Goal:** Determine which AI model is actually better at Tetris by running multiple games.

### In the Browser:

1. Go to Model vs Model
2. Run several games with different model pairs
3. Note the scores for each

### With Headless Benchmarking (Advanced):

If you have terminal access, you can run many games without a browser:

```bash
npx tsx src/scripts/headless-battle.ts --model1 gemini-3-flash --model2 claude-sonnet-4 --games 100
```

This runs 100 games and outputs:
```
TetrisBench: gemini-3-flash vs claude-sonnet-4 (100 games)

Game 100/100 | gemini-3-flash: 52 | claude-sonnet-4: 45 | Ties: 3

gemini-3-flash: 52 wins (52.0%)
claude-sonnet-4: 45 wins (45.0%)
Avg scores: 4200 vs 3800

Exported to battle-results-gemini-3-flash-vs-claude-sonnet-4-1708700000000.json
```

The JSON file contains detailed per-game results.

---

## Use Case 8: Check the Leaderboard

**Goal:** See who's winning -- humans or AI models.

### Steps:

1. Click **Leaderboard** in the top navigation bar
2. You'll see three tabs:

**MODELS tab:**
| Model | Games | Win Rate | Avg Score | Best Score |
|-------|-------|----------|-----------|------------|
| Gemini 3 Flash | 42 | 71.4% | 3,200 | 8,400 |
| Claude Opus 4.5 | 35 | 65.7% | 2,900 | 7,200 |

**HUMANS tab:**
| Player | Games | Win Rate | Avg Score | Best Score |
|--------|-------|----------|-----------|------------|
| ProTetris99 | 28 | 42.9% | 2,100 | 5,600 |

**RECENT tab:**
Shows the last 20 games with dates, scores, and winners.

### Note:

The leaderboard only shows data after games are saved. In guest mode, games aren't saved to the database. Sign in with GitHub (if enabled) to track your stats.

---

## Use Case 9: Use the Hold Feature

**Goal:** Master the hold mechanic to save pieces for later.

### How Hold Works:

1. Press **C** or **Shift** to hold the current piece
2. The piece goes to the "hold slot" and a new piece spawns from the queue
3. Press **C** again to swap the held piece back
4. You can only hold once per piece (can't swap back and forth)

### Strategy:

```
Situation: You have a T-piece but need an I-piece for a Tetris

  Current: T       Hold: (empty)       Next: S, Z, I, L, O

  Press C to hold the T:

  Current: S       Hold: T             Next: Z, I, L, O

  ... play S and Z ...

  Current: I       Hold: T             Next: L, O, ...

  Drop the I-piece in the well for a Tetris!
  Then press C to get the T back when you need it.
```

### When to Hold:

- **Hold I-pieces** for Tetris opportunities (save them for when you have a well)
- **Hold T-pieces** for T-spin setups
- **Hold when you get a bad piece** that doesn't fit your current surface

---

## Use Case 10: Master T-Spins and Combos

**Goal:** Use advanced techniques for maximum points.

### Combos

A combo happens when you clear lines on consecutive pieces:

```
Piece 1: Clear 1 line     -> 100 points (no combo)
Piece 2: Clear 1 line     -> 100 + 50 (1-combo bonus)
Piece 3: Clear 2 lines    -> 300 + 100 (2-combo bonus)
Piece 4: No lines cleared -> combo breaks, resets to 0
```

### Building Combos:

1. Create a mostly-flat surface with several almost-complete rows
2. Each piece you drop should complete at least one row
3. The combo bonus multiplies with each consecutive clear

### Speed Tips:

- Use **hard drop (Space)** for speed -- don't wait for pieces to fall
- Plan 2-3 pieces ahead using the **Next queue**
- Keep the surface flat so any piece can clear a line
- Build a well on one side for I-piece Tetrises

---

## Use Case 11: Run Headless Benchmarks

**Goal:** Run many AI vs AI games from the command line without a browser.

### Prerequisites:

- Terminal/command line access
- Node.js installed

### Steps:

1. Open a terminal
2. Navigate to the project: `cd tetrisbench`
3. Run the benchmark:

```bash
npx tsx src/scripts/headless-battle.ts --model1 model1-name --model2 model2-name --games 50
```

### Options:

| Flag | Description | Default |
|------|------------|---------|
| `--model1` | Name for player 1 | "model1" |
| `--model2` | Name for player 2 | "model2" |
| `--games` | Number of games to play | 10 |

### Example Output:

```
TetrisBench: flash vs opus (10 games)

Game 10/10 | flash: 5 | opus: 4 | Ties: 1

flash: 5 wins (50.0%)
opus: 4 wins (40.0%)
Avg scores: 3842 vs 3621

Exported to battle-results-flash-vs-opus-1708700000000.json
```

### Understanding the Results:

The JSON output file contains:
```json
{
  "model1": "flash",
  "model2": "opus",
  "numGames": 10,
  "w1": 5,
  "w2": 4,
  "ties": 1,
  "results": [
    { "seed": 12345, "s1": 4200, "s2": 3800, "winner": "model1" },
    ...
  ]
}
```

Each game uses a different random seed, but both players get the same seed per game.

---

## Understanding the Scoring System

### Points Breakdown:

```
+-------------------+--------+----------------------------+
| Action            | Base   | With Level Multiplier      |
+-------------------+--------+----------------------------+
| Single (1 line)   | 100    | 100 x (level + 1)         |
| Double (2 lines)  | 300    | 300 x (level + 1)         |
| Triple (3 lines)  | 500    | 500 x (level + 1)         |
| Tetris (4 lines)  | 800    | 800 x (level + 1)         |
| Soft drop         | 1/row  | (not multiplied)           |
| Hard drop         | 2/row  | (not multiplied)           |
| Combo bonus       | 50     | 50 x combo x (level + 1)  |
+-------------------+--------+----------------------------+
```

### Level Progression:

- Every 10 lines cleared = 1 level up
- Higher levels = faster gravity (pieces fall faster)
- Higher levels = more points per line clear

```
Level 0:  Piece drops every 0.8 seconds  (48 frames)
Level 5:  Piece drops every 0.47 seconds (28 frames)
Level 10: Piece drops every 0.1 seconds  (6 frames)
Level 20: Piece drops every frame        (instant!)
```

---

## Keyboard Reference

```
+--------------------------------------------------+
|                KEYBOARD CONTROLS                  |
|                                                   |
|   Movement:                                       |
|     Left Arrow  = Move piece left                 |
|     Right Arrow = Move piece right                |
|     Down Arrow  = Soft drop (faster fall)         |
|     Space Bar   = Hard drop (instant)             |
|                                                   |
|   Rotation:                                       |
|     Up Arrow = Rotate clockwise                   |
|     X        = Rotate clockwise                   |
|     Z        = Rotate counter-clockwise           |
|                                                   |
|   Special:                                        |
|     C or Shift = Hold piece                       |
|     P          = Pause/Unpause                    |
|                                                   |
|   Auto-repeat:                                    |
|     Hold Left/Right/Down for 170ms to start       |
|     auto-repeating at 50ms intervals              |
+--------------------------------------------------+
```

---

## FAQ

### Q: Why do both players get the same pieces?

To make the competition fair. Both boards use the same random seed, so the piece sequence is identical. The only difference is how you (or the AI) choose to place them.

### Q: What does the AI actually do?

The AI has a "scoring function" -- a piece of code that looks at each possible placement and gives it a score. It picks the placement with the highest score. The LLM (like Claude or GPT) writes this scoring function, and it can be rewritten during the game if the AI is struggling.

### Q: Can I play without API keys?

Yes! Without API keys, the AI uses a built-in heuristic scoring function. It's still a strong player. API keys are only needed if you want the AI to dynamically generate new scoring strategies via an LLM.

### Q: How do I win?

Score more points than the AI before the 2-minute timer runs out. Focus on:
1. Clearing lines (especially Tetrises for 800 points)
2. Building combos (consecutive line clears)
3. Using hard drops for speed and bonus points
4. Keeping your board clean (no holes!)

### Q: What's the ghost piece?

The semi-transparent outline at the bottom of your board shows where the current piece will land if you hard-drop it right now. Use it to plan your placements.

### Q: Why is the AI's score so much higher?

The AI evaluates every possible placement mathematically and picks the optimal one. It never makes mistakes, never misdrops, and never panics. To compete, focus on speed (hard drops) and clean stacking.

### Q: What's the "Hold" feature?

Press C or Shift to store the current piece in the hold slot. You can swap it back later. Use it to save important pieces (like the I-piece for Tetrises) or to avoid placing a piece that would create holes.

### Q: Can I change the game speed?

The gravity speed is determined by your level (lines cleared / 10). At level 0, pieces fall slowly. At level 10+, they fall very fast. You can't manually change the speed, but you can always use hard drop (Space) to place pieces instantly.

### Q: What happens when time runs out?

The game ends, and the player with the higher score wins. If both players have the same score, it's a tie. A victory screen shows the results with options to play again or rematch.

### Q: How does Model vs Model work?

Both AIs use the same built-in scoring heuristic and get the same pieces. They should play similarly, but small differences in placement order can lead to different outcomes. With LLM integration enabled, each AI generates its own scoring function, leading to more varied gameplay.
