# TetrisBench Developer Guide

A step-by-step, hand-holding guide for developers who are new to web development and want to understand, modify, and extend TetrisBench. No prior web development experience required.

---

## Table of Contents

1. [Concepts You Need to Know](#1-concepts-you-need-to-know)
2. [Setting Up Your Development Environment](#2-setting-up-your-development-environment)
3. [Project Structure Explained](#3-project-structure-explained)
4. [Understanding the Tech Stack](#4-understanding-the-tech-stack)
5. [How the Code is Organized](#5-how-the-code-is-organized)
6. [The Engine: Pure Game Logic](#6-the-engine-pure-game-logic)
7. [The AI System: LLM Integration](#7-the-ai-system-llm-integration)
8. [React Components: The UI](#8-react-components-the-ui)
9. [Hooks: Bridging Engine and UI](#9-hooks-bridging-engine-and-ui)
10. [API Routes: Server-Side Logic](#10-api-routes-server-side-logic)
11. [Database and Authentication](#11-database-and-authentication)
12. [Testing](#12-testing)
13. [Common Development Tasks](#13-common-development-tasks)
14. [Troubleshooting](#14-troubleshooting)
15. [Glossary](#15-glossary)

---

## 1. Concepts You Need to Know

If you come from C/C++/Java, here are the key differences in web development:

### TypeScript vs C/C++/Java

TypeScript is like Java with type inference. You write types, but the compiler can often figure them out.

```typescript
// C++: int add(int a, int b) { return a + b; }
// Java: public int add(int a, int b) { return a + b; }
// TypeScript:
function add(a: number, b: number): number {
  return a + b;
}
```

Key differences:
- **No compilation to machine code.** TypeScript compiles to JavaScript, which runs in Node.js or a browser.
- **No manual memory management.** JavaScript has garbage collection (like Java).
- **Functions are first-class.** You can pass functions as arguments, return them, store them in variables.
- **`null` and `undefined` both exist.** `null` means "intentionally empty." `undefined` means "not set."

### What is React?

React is a UI library. Instead of directly manipulating the screen (like `printf` or `System.out.println`), you describe *what* the screen should look like, and React figures out *how* to update it.

```typescript
// This is a React component. It's just a function that returns JSX (HTML-like syntax).
function ScoreDisplay({ score }: { score: number }) {
  return <div>Score: {score}</div>;
}

// When `score` changes, React automatically re-renders this component.
```

Think of React components as functions that take data (props) and return HTML.

### What is Next.js?

Next.js is a framework built on React. It adds:
- **File-based routing:** Files in `src/app/` become URL paths. `src/app/leaderboard/page.tsx` becomes `/leaderboard`.
- **Server-side API routes:** Files in `src/app/api/` handle HTTP requests (like a REST API in Java/Spring).
- **Build optimization:** Bundles, minifies, and optimizes your code for production.

### What is Tailwind CSS?

Instead of writing CSS in separate files, you add utility classes directly to HTML elements:

```html
<!-- Traditional CSS: write .button { background: blue; padding: 8px; } -->
<!-- Tailwind: add classes directly -->
<button class="bg-blue-500 p-2 text-white rounded">Click me</button>
```

### What is Canvas?

HTML5 Canvas is like a drawing surface in the browser. You draw pixels directly, similar to graphics programming in C/SDL or Java/AWT:

```typescript
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#ff0000';           // Set color to red
ctx.fillRect(10, 20, 50, 50);       // Draw a 50x50 square at (10, 20)
```

---

## 2. Setting Up Your Development Environment

### Step 1: Install Node.js

Node.js is the runtime that executes JavaScript/TypeScript outside the browser.

1. Go to https://nodejs.org/
2. Download the **LTS** (Long Term Support) version (18.x or newer)
3. Run the installer. Accept all defaults.
4. Verify installation by opening a terminal:

```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher
```

`npm` (Node Package Manager) comes with Node.js. It installs libraries (like `pip` for Python or `maven` for Java).

### Step 2: Install a Code Editor

We recommend **Visual Studio Code** (VS Code):
1. Download from https://code.visualstudio.com/
2. Install these extensions (optional but helpful):
   - **ESLint** -- shows code errors in real-time
   - **Tailwind CSS IntelliSense** -- autocompletes CSS classes
   - **TypeScript Hero** -- auto-imports

### Step 3: Clone and Install the Project

```bash
# Navigate to where you want the project
cd ~/projects

# If you have the project as a zip, extract it. Otherwise:
# git clone <repository-url>

# Enter the project directory
cd tetrisbench

# Install all dependencies (this downloads ~200MB of libraries into node_modules/)
npm install
```

**What `npm install` does:** It reads `package.json`, downloads all listed dependencies into a `node_modules/` folder, and creates a `package-lock.json` lockfile. This is similar to `mvn install` in Java or `pip install -r requirements.txt` in Python.

### Step 4: Set Up Environment Variables

```bash
# Copy the template
cp .env.example .env.local
```

Open `.env.local` in your editor. For basic development, you can leave all API keys empty -- the AI will use a built-in heuristic instead of calling LLMs.

To test LLM integration, add at least one key:
```bash
GOOGLE_GENERATIVE_AI_API_KEY=your-google-ai-key
```

You can get a free API key from https://aistudio.google.com/apikey

### Step 5: Start the Development Server

```bash
npm run dev
```

This starts a local web server. Open http://localhost:3000 in your browser.

**What happens behind the scenes:**
1. Next.js compiles all TypeScript files to JavaScript
2. It starts a web server on port 3000
3. It watches for file changes and auto-reloads (hot reload)

### Step 6: Run Tests

```bash
npm test
```

This runs all tests in `src/engine/__tests__/`. You should see "29 passed."

---

## 3. Project Structure Explained

```
tetrisbench/
  |
  +-- package.json          # Project manifest (like pom.xml in Java)
  |                         # Lists dependencies and scripts
  |
  +-- tsconfig.json         # TypeScript compiler configuration
  |                         # Sets strict mode, target version, path aliases
  |
  +-- next.config.ts        # Next.js framework configuration
  |
  +-- vitest.config.ts      # Test runner configuration
  |
  +-- .env.example          # Template for environment variables (API keys)
  +-- .env.local            # YOUR actual API keys (git-ignored, never commit this)
  |
  +-- src/                  # ALL source code lives here
  |    |
  |    +-- engine/          # Game logic (no UI code)
  |    +-- ai/              # AI/LLM integration
  |    +-- components/      # React UI components
  |    +-- hooks/           # React state management bridges
  |    +-- app/             # Pages and API routes
  |    +-- lib/             # Database and authentication
  |    +-- scripts/         # Command-line tools
  |
  +-- docs/                 # Documentation (you're reading this)
  +-- node_modules/         # Downloaded dependencies (git-ignored, ~200MB)
  +-- .next/                # Build output (git-ignored)
  +-- data/                 # SQLite database file (created at runtime)
```

### Key Configuration Files

**package.json** -- This is the most important file. It defines:
- `dependencies`: Libraries needed at runtime (React, Next.js, AI SDK, etc.)
- `devDependencies`: Libraries needed only for development (TypeScript, Vitest, etc.)
- `scripts`: Commands you can run with `npm run <name>`:
  - `dev`: Start development server
  - `build`: Create production build
  - `test`: Run tests
  - `headless-battle`: Run CLI benchmarking

**tsconfig.json** -- TypeScript configuration:
- `strict: true`: Enables all type-checking options (catches more bugs)
- `paths: { "@/*": ["./src/*"] }`: Lets you import `@/engine/types` instead of `../../engine/types`

---

## 4. Understanding the Tech Stack

Here's how each technology maps to concepts you already know:

| Web Technology | Traditional Equivalent |
|---------------|----------------------|
| TypeScript | Java/C++ with type inference |
| React | Swing/Qt (UI framework) but declarative |
| Next.js | Spring Boot (web framework with routing) |
| Tailwind CSS | Inline styles, but with a utility class system |
| HTML5 Canvas | SDL/AWT Graphics2D (low-level drawing) |
| Vercel AI SDK | HTTP client library specialized for LLM APIs |
| SQLite | Same as in C/Java -- embedded SQL database |
| Vitest | JUnit / Google Test (unit testing framework) |
| npm | Maven / pip (package manager) |

### How a Web Request Works

When you open http://localhost:3000 in your browser:

```
Browser                          Next.js Server
  |                                    |
  |  GET http://localhost:3000         |
  |----------------------------------->|
  |                                    |  1. Finds src/app/page.tsx
  |                                    |  2. Renders React components to HTML
  |                                    |  3. Bundles JavaScript
  |  HTML + JavaScript                 |
  |<-----------------------------------|
  |                                    |
  |  (Browser executes JavaScript)     |
  |  (React takes over, runs game)     |
  |                                    |
  |  POST /api/ai/generate-scoring     |  <-- when AI needs new scoring function
  |----------------------------------->|
  |                                    |  4. Server calls LLM API
  |  { code: "return ..." }           |
  |<-----------------------------------|
```

---

## 5. How the Code is Organized

The codebase follows a **layered architecture**. Each layer only depends on layers below it:

```
  Layer 4: Pages (src/app/)
     |  Uses components and hooks
     v
  Layer 3: Components (src/components/) + Hooks (src/hooks/)
     |  Uses engine and AI modules
     v
  Layer 2: AI System (src/ai/)
     |  Uses engine types and functions
     v
  Layer 1: Engine (src/engine/)
     |  Pure TypeScript, no dependencies on React or AI
     v
  Layer 0: TypeScript standard library only
```

**Rule:** Engine code NEVER imports from `ai/`, `components/`, `hooks/`, or `app/`. This makes it testable and portable.

### Import Path Conventions

All imports use the `@/` alias which points to `src/`:

```typescript
// Instead of relative paths:
import { GameState } from '../../engine/types';

// We use alias paths:
import { GameState } from '@/engine/types';
```

Within the engine module, files use relative imports:
```typescript
// src/engine/board.ts
import { Board, ActivePiece } from './types';
import { PIECE_SHAPES } from './constants';
```

---

## 6. The Engine: Pure Game Logic

The engine is the foundation. It implements standard Tetris rules in pure TypeScript. If you've written game logic in C/C++, this will feel familiar.

### 6.1 Types (src/engine/types.ts)

This file defines all data structures. Think of it as a header file in C:

```typescript
// The board is a 20x10 grid. Each cell is either null (empty) or a color string.
export type Board = (string | null)[][];

// A piece currently falling on the board
export interface ActivePiece {
  type: PieceType;        // 'I', 'O', 'T', 'S', 'Z', 'J', 'L'
  rotation: Rotation;     // 0, 1, 2, or 3
  pos: { row: number; col: number };  // position on the board
}

// The complete game state -- everything needed to render one frame
export interface GameState {
  board: Board;              // 20x10 grid of locked pieces
  activePiece: ActivePiece | null;  // currently falling piece
  heldPiece: PieceType | null;      // piece in hold slot
  canHold: boolean;          // can player swap hold? (false after first hold per piece)
  nextPieces: PieceType[];   // upcoming pieces (5 in queue)
  score: number;
  lines: number;             // total lines cleared
  level: number;             // current level (determines gravity speed)
  combo: number;             // consecutive line clears (-1 = no combo)
  moveCount: number;         // pieces placed
  isGameOver: boolean;
  isPaused: boolean;
  tickCount: number;         // total frames elapsed
  gravityCounter: number;    // frames since last gravity drop
  lockDelay: number;         // frames piece has been grounded
}
```

### 6.2 Board Operations (src/engine/board.ts)

Key functions (like a board utility library):

```typescript
// Create an empty 20x10 board (all null)
createBoard(): Board

// Get the absolute [row, col] coordinates of a piece's filled cells
getPieceCells(piece: ActivePiece): [number, number][]

// Check if a piece overlaps walls, floor, or locked pieces
checkCollision(board: Board, piece: ActivePiece): boolean

// Lock a piece onto the board (returns new board -- no mutation)
lockPiece(board: Board, piece: ActivePiece): Board

// Remove completed rows, return new board + count
clearLines(board: Board): { board: Board; linesCleared: number }

// Compute where the ghost piece would land
getGhostPosition(board: Board, piece: ActivePiece): ActivePiece

// Board quality metrics (used by AI scoring):
countHoles(board): number         // empty cells below filled cells
calculateBumpiness(board): number // height difference between adjacent columns
getMaxHeight(board): number       // tallest column height
getWellDepth(board): number       // deepest well (for Tetris setups)
```

**Important:** All functions are **pure** -- they never modify their inputs. They return new objects. This is different from typical C/C++ where you'd modify arrays in-place.

### 6.3 Game State Machine (src/engine/game.ts)

The game is driven by two functions:

```typescript
// Called every frame (~60fps). Handles gravity and lock delay.
tick(instance: GameInstance): GameState

// Called when the player presses a key. Handles movement, rotation, drops.
applyAction(instance: GameInstance, action: MoveAction): GameState
```

**GameInstance** wraps a GameState and a piece generator:
```typescript
interface GameInstance {
  state: GameState;
  nextPiece: () => PieceType;  // closure over the seeded RNG
}
```

### 6.4 How to Modify the Engine

Example: Change the scoring for a Tetris (4-line clear) from 800 to 1200.

1. Open `src/engine/constants.ts`
2. Find: `export const LINE_CLEAR_SCORES = { 1: 100, 2: 300, 3: 500, 4: 800 };`
3. Change `4: 800` to `4: 1200`
4. Run `npm test` to make sure the scoring test updates (it will fail -- update the test too)
5. Open `src/engine/__tests__/engine.test.ts`
6. Find the test: `it('Tetris', () => { expect(calculateLineClearScore(4, 0, 0)).toBe(800); });`
7. Change `800` to `1200`
8. Run `npm test` again -- should pass

---

## 7. The AI System: LLM Integration

### 7.1 How AI Moves Work

The AI does NOT call an LLM for every move. Instead:

1. On startup, the AI uses a hardcoded `DEFAULT_SCORING_FN`
2. Every ~20 moves, or when the board gets bad, it calls the LLM
3. The LLM writes a new scoring function in JavaScript
4. That function replaces the old one
5. The new function is used for the next ~20 moves

### 7.2 The Scoring Function

A scoring function takes a `PlacementResult` and returns a number (higher = better):

```typescript
// The default built-in scoring function (src/ai/executor.ts)
const DEFAULT_SCORING_FN = (p: PlacementResult) => {
  return (
    p.linesCleared * 760 +    // Reward clearing lines
    p.holes * -500 +          // Heavily penalize holes
    p.bumpiness * -180 +      // Penalize uneven surface
    p.maxHeight * -50 +       // Penalize tall stacks
    p.wellDepth * 100 +       // Reward wells (for Tetris setup)
    p.totalHeight * -10       // Penalize overall height
  );
};
```

The LLM generates similar code but with different weights based on the current board state.

### 7.3 Adding a New AI Model

To add a new LLM model:

1. Open `src/ai/providers.ts`
2. Add to the `AVAILABLE_MODELS` array:
```typescript
{
  id: 'my-new-model',           // unique ID used in code
  displayName: 'My New Model',  // shown in UI dropdown
  provider: 'openai',           // which SDK to use
  modelId: 'gpt-4-turbo',      // actual API model ID
  icon: '🆕',                  // emoji shown in UI
},
```
3. Make sure the provider SDK is installed (`@ai-sdk/openai` in this case)
4. Add the API key to `.env.local`: `OPENAI_API_KEY=your-key`
5. The model will now appear in the model selector dropdown

### 7.4 The System Prompt (src/ai/prompt.ts)

The prompt tells the LLM what to write. It explains:
- What a `PlacementResult` is and its properties
- That the LLM should write a function body (not a full function declaration)
- Example scoring strategies
- The current board state (serialized as text)

---

## 8. React Components: The UI

### 8.1 Component Basics

A React component is a function that returns JSX (HTML-like syntax):

```typescript
// src/components/battle/ScoreHeader.tsx
export default function ScoreHeader({ humanName, humanScore, aiScore, timerFormatted }) {
  return (
    <div className="flex justify-between">
      <span>{humanName}: {humanScore}</span>
      <span>{timerFormatted}</span>
      <span>AI: {aiScore}</span>
    </div>
  );
}
```

Components receive data through **props** (like function parameters).

### 8.2 The Canvas Renderer (src/components/game/TetrisCanvas.tsx)

This is the most performance-critical component. It draws the Tetris board using the HTML5 Canvas API:

```typescript
// Simplified version of what TetrisCanvas does every frame:
function draw(ctx, gameState) {
  // 1. Clear canvas
  ctx.fillStyle = '#0d0d1a';
  ctx.fillRect(0, 0, width, height);

  // 2. Draw grid lines
  for (let x = 0; x <= 10; x++) { /* draw vertical line */ }
  for (let y = 0; y <= 20; y++) { /* draw horizontal line */ }

  // 3. Draw locked pieces (from board array)
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      if (board[row][col]) drawCell(ctx, col, row, board[row][col]);
    }
  }

  // 4. Draw ghost piece (semi-transparent)
  // 5. Draw active piece (full opacity)
}
```

### 8.3 Adding a New Component

Example: Add a "Hold Piece" display to the GamePanel.

1. The `GameState` already has `heldPiece: PieceType | null`
2. Open `src/components/battle/GamePanel.tsx`
3. Import the piece shape helper: `import { PIECE_SHAPES, PIECE_COLORS } from '@/engine/constants';`
4. Add a section after "LEVEL" that renders the held piece
5. The dev server auto-reloads -- check the browser

---

## 9. Hooks: Bridging Engine and UI

React hooks are functions that manage state and side effects. They start with `use`.

### 9.1 useBattle (src/hooks/useBattle.ts)

This is the main orchestrator. It:
1. Creates two game instances with the same seed
2. Runs the human game loop (60fps via requestAnimationFrame)
3. Runs the AI game loop (every 500ms via setInterval)
4. Manages the battle timer
5. Detects when the battle ends

```typescript
// Simplified usage:
const battle = useBattle(120); // 120-second battle

// battle.phase: 'setup' | 'playing' | 'finished'
// battle.humanState: GameState for human board
// battle.aiState: GameState for AI board
// battle.startBattle(): begins the game
// battle.humanDispatch(action): sends keyboard action to human game
```

### 9.2 useKeyboard (src/hooks/useKeyboard.ts)

Listens for keyboard events and translates them to game actions:

```
ArrowLeft  -> 'left'
ArrowRight -> 'right'
ArrowDown  -> 'soft_drop'
ArrowUp    -> 'rotate_cw'
Space      -> 'hard_drop'
c / Shift  -> 'hold'
```

It implements **DAS (Delayed Auto Shift)**: when you hold a key, there's a 170ms delay before it starts repeating at 50ms intervals. This is standard in modern Tetris games.

### 9.3 When to Use useState vs useRef

- **`useState`**: When the value needs to trigger a re-render (update the screen). Example: `score`, `gameState`.
- **`useRef`**: When the value should persist across renders but NOT trigger re-renders. Example: `GameInstance`, `interval IDs`.

```typescript
// useState: changing this updates the screen
const [score, setScore] = useState(0);

// useRef: changing this does NOT update the screen
const instanceRef = useRef<GameInstance | null>(null);
```

---

## 10. API Routes: Server-Side Logic

### 10.1 How API Routes Work

Files in `src/app/api/` handle HTTP requests. They run on the server (Node.js), not in the browser.

```
Browser                     Server
  |                           |
  |  POST /api/games          |
  |  { score: 1200 }         |
  |-------------------------->|  src/app/api/games/route.ts
  |                           |  export async function POST(request) {
  |                           |    const data = await request.json();
  |                           |    saveGame(data);
  |                           |    return NextResponse.json({ ok: true });
  |  { ok: true }            |  }
  |<--------------------------|
```

### 10.2 The AI Generation Route (src/app/api/ai/generate-scoring/route.ts)

This is where LLM API keys are used. The browser never sees the keys.

```typescript
export async function POST(request: NextRequest) {
  const { modelId, boardState, currentScore, moveCount } = await request.json();

  // Look up model configuration
  const model = getModelById(modelId);
  const providerModel = getProvider(model.provider, model.modelId);

  // Call the LLM
  const { text } = await generateText({
    model: providerModel,
    system: SYSTEM_PROMPT,
    prompt: buildInterventionPrompt(boardState, currentScore, moveCount),
    maxOutputTokens: 1024,
    temperature: 0.3,
  });

  return NextResponse.json({ code: text });
}
```

---

## 11. Database and Authentication

### 11.1 SQLite Database (src/lib/db.ts)

The database is a single file (`data/tetrisbench.db`). It's created automatically on first use.

Tables:
- `users` -- Players who sign in with GitHub
- `games` -- Battle results (human score, AI score, winner, model)
- `ai_game_details` -- Extended stats (interventions, timing)
- `model_vs_model_games` -- Model vs model results

To inspect the database manually:
```bash
# Install sqlite3 CLI if needed, then:
sqlite3 data/tetrisbench.db
.tables              # List all tables
.schema games        # Show table structure
SELECT * FROM games; # Query data
.quit
```

### 11.2 Authentication (src/lib/auth.ts)

Uses GitHub OAuth via Auth.js v5. To enable:

1. Create a GitHub OAuth App at https://github.com/settings/developers
2. Set the callback URL to `http://localhost:3000/api/auth/callback/github`
3. Add to `.env.local`:
```bash
AUTH_SECRET=any-random-string-here
AUTH_GITHUB_ID=your-github-app-id
AUTH_GITHUB_SECRET=your-github-app-secret
```

Currently the app works in "Guest Mode" -- you can play without signing in, but game results aren't persisted to the leaderboard.

---

## 12. Testing

### 12.1 Running Tests

```bash
npm test              # Run all tests once
npm run test:watch    # Watch mode -- re-runs on file changes
```

### 12.2 Test Structure (src/engine/__tests__/engine.test.ts)

Tests use Vitest (similar to Jest or JUnit):

```typescript
import { describe, it, expect } from 'vitest';
import { createBoard, checkCollision } from '../board';

describe('Board', () => {
  it('creates a 20x10 empty board', () => {
    const board = createBoard();
    expect(board.length).toBe(20);        // 20 rows
    expect(board[0].length).toBe(10);     // 10 columns
  });

  it('detects collision with left wall', () => {
    const board = createBoard();
    const piece = { type: 'I', rotation: 0, pos: { row: 1, col: -2 } };
    expect(checkCollision(board, piece)).toBe(true);  // out of bounds
  });
});
```

### 12.3 Writing New Tests

1. Open `src/engine/__tests__/engine.test.ts`
2. Add a new test inside an existing `describe` block or create a new one:

```typescript
describe('My New Feature', () => {
  it('does something correctly', () => {
    // Arrange
    const board = createBoard();

    // Act
    const result = myNewFunction(board);

    // Assert
    expect(result).toBe(expectedValue);
  });
});
```

3. Run `npm test` to verify

---

## 13. Common Development Tasks

### Task 1: Add a New Piece Metric

Say you want to add a "covered holes" metric (holes with pieces above them).

1. **Define the function** in `src/engine/board.ts`:
```typescript
export function countCoveredHoles(board: Board): number {
  // ... your implementation
}
```

2. **Add to PlacementResult** in `src/engine/types.ts`:
```typescript
export interface PlacementResult {
  // ... existing fields
  coveredHoles: number;  // ADD THIS
}
```

3. **Compute it in placement enumeration** in `src/engine/placement.ts`:
```typescript
results.push({
  // ... existing fields
  coveredHoles: countCoveredHoles(cleared),  // ADD THIS
});
```

4. **Update the default scoring function** in `src/ai/executor.ts`:
```typescript
export const DEFAULT_SCORING_FN = (p: PlacementResult) => {
  return (
    // ... existing terms
    p.coveredHoles * -300 +  // ADD THIS
  );
};
```

5. **Update the system prompt** in `src/ai/prompt.ts` to tell the LLM about the new field.

6. **Add a test** in `src/engine/__tests__/engine.test.ts`.

7. **Run tests:** `npm test`

### Task 2: Change the Battle Duration

Open `src/hooks/useBattle.ts` and change the default parameter:
```typescript
export function useBattle(durationSeconds: number = 120) {
//                                                    ^^^ change this
```

Or change it in `src/components/BattlePage.tsx`:
```typescript
const battle = useBattle(180);  // 3-minute battles
```

### Task 3: Add a New Page

1. Create `src/app/my-page/page.tsx`:
```typescript
export default function MyPage() {
  return <div>Hello from my page!</div>;
}
```

2. Add a nav link in `src/app/layout.tsx`
3. Visit http://localhost:3000/my-page

### Task 4: Modify the AI Prompt

Open `src/ai/prompt.ts`. The `SYSTEM_PROMPT` constant is what the LLM receives. You can:
- Change the instructions
- Add more context about scoring strategies
- Include example functions

### Task 5: Run Headless Benchmarks

```bash
npx tsx src/scripts/headless-battle.ts --model1 modelA --model2 modelB --games 50
```

This runs 50 games between two AIs without a browser, using the `DEFAULT_SCORING_FN` for both. Results are saved as JSON.

---

## 14. Troubleshooting

### "Module not found" Errors

```
Error: Cannot find module '@/engine/types'
```
- Make sure you're in the `tetrisbench/` directory
- Run `npm install` to ensure all dependencies are installed
- Check that `tsconfig.json` has the `@/*` path alias

### "Port 3000 already in use"

```bash
# Find what's using the port:
lsof -i :3000   # Mac/Linux
netstat -ano | grep 3000  # Windows

# Or use a different port:
npm run dev -- --port 3456
```

### Tests Failing After Engine Changes

If you changed engine code and tests fail:
1. Read the test that failed -- it tells you what was expected vs actual
2. If your change was intentional, update the test
3. If your change was accidental, revert it

### "API key not working"

1. Make sure the key is in `.env.local` (not `.env.example`)
2. Restart the dev server after changing `.env.local`
3. Check the browser console (F12) and server terminal for error messages

### Build Errors

```bash
npm run build
```

If this fails with TypeScript errors, the error message shows the exact file and line:
```
./src/ai/ai-player.ts:1:43
Type error: Module '"@/engine/types"' has no exported member 'Foo'.
```
This means `Foo` doesn't exist in `types.ts`. Check the spelling and make sure it's exported.

---

## 15. Glossary

| Term | Definition |
|------|-----------|
| **API Route** | Server-side HTTP endpoint in Next.js. Files in `src/app/api/`. |
| **Canvas** | HTML5 drawing surface. Used to render the Tetris board. |
| **Component** | A React function that returns JSX (HTML-like syntax). |
| **DAS** | Delayed Auto Shift. Key repeat behavior in Tetris. |
| **Ghost Piece** | Semi-transparent preview showing where a piece will land. |
| **Hook** | A React function that manages state or side effects (starts with `use`). |
| **Intervention** | When the AI requests a new scoring function from the LLM. |
| **JSX** | JavaScript XML. HTML-like syntax used in React components. |
| **Lock Delay** | Time a piece waits on the ground before locking (15 frames = ~250ms). |
| **LLM** | Large Language Model (Claude, GPT, Gemini, Grok). |
| **Placement** | A specific final position for a piece (rotation + column + row). |
| **Props** | Data passed to a React component (like function parameters). |
| **PRNG** | Pseudo-Random Number Generator. Seeded for deterministic sequences. |
| **RAF** | requestAnimationFrame. Browser API for 60fps rendering loops. |
| **Scoring Function** | JavaScript function that evaluates a piece placement (higher = better). |
| **SRS** | Super Rotation System. Standard Tetris piece rotation with wall kicks. |
| **SSR** | Server-Side Rendering. Next.js renders pages on the server first. |
| **State** | Data that React tracks and re-renders when changed (`useState`). |
| **Tailwind** | Utility-first CSS framework. Classes like `bg-blue-500 text-white`. |
| **Vitest** | Test runner for TypeScript/JavaScript. Like JUnit for web. |
| **Wall Kick** | Alternative position tried when rotation causes a collision. |
| **7-Bag** | Tetris randomizer: shuffles all 7 pieces, deals them, repeat. |
