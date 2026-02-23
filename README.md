# TetrisBench

A Human vs AI Tetris benchmark where LLMs compete by writing scoring functions — not by picking moves directly. Based on the [a16z article](https://www.a16z.news/p/i-built-tetrisbench-where-llms-compete) by [Yoko Li](https://x.com/stuffyokodraws/status/2014025296807338412).

<video src="docs/tetrisbench_demo.mp4" controls width="100%"></video>

## What Makes This Different

Traditional Tetris AIs hard-code placement logic. TetrisBench asks LLMs to **write JavaScript scoring functions** that evaluate every possible piece placement. The AI examines the board state (holes, bumpiness, height) and generates optimized code that scores each placement. The engine picks the highest-scored placement. When the board degrades, the AI rewrites its scoring function to adapt.

## Features

- **Human vs AI** -- Play Tetris against an LLM with keyboard controls. 2-minute timed battles.
- **Model vs Model** -- Watch two AIs compete head-to-head with identical piece sequences.
- **Multiple LLMs** -- Claude Opus 4.5, Claude Sonnet 4, GPT-4o, Gemini 2.0 Flash/Pro, Grok 3.
- **Intervention System** -- AI monitors board health and rewrites its scoring function when things go wrong.
- **Leaderboard** -- Track model win rates, human scores, and recent games (SQLite).
- **Headless Benchmarking** -- CLI script for batch model-vs-model runs (no browser needed).
- **Fair Comparison** -- Seeded PRNG ensures both players get identical piece sequences.

## Quick Start

### Prerequisites

- **Node.js 18+** -- [Download here](https://nodejs.org/)
- **npm** -- Comes with Node.js

### Install and Run

```bash
cd tetrisbench
npm install
cp .env.example .env.local
npm run dev
```

Open **http://localhost:3000** in your browser.

### Add API Keys (Optional)

Edit `.env.local` to enable LLM-powered AI. Without keys, the AI uses a built-in heuristic.

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your-key   # Gemini models
ANTHROPIC_API_KEY=your-key               # Claude models
OPENAI_API_KEY=your-key                  # GPT models
XAI_API_KEY=your-key                     # Grok models
```

### Run Tests

```bash
npm test
```

### Headless Benchmarking

```bash
npx tsx src/scripts/headless-battle.ts --model1 gemini-3-flash --model2 claude-sonnet-4 --games 100
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict mode) |
| UI | React 19 + Tailwind CSS 4 |
| Rendering | HTML5 Canvas |
| AI | Vercel AI SDK 6 |
| LLM Providers | Anthropic, OpenAI, Google, xAI |
| Auth | Auth.js v5 (GitHub OAuth) |
| Database | SQLite via better-sqlite3 |
| Testing | Vitest 4 |

## Project Structure

```
tetrisbench/
  src/
    engine/          # Pure TypeScript Tetris engine (zero DOM deps)
    ai/              # AI system (LLM integration, scoring, intervention)
    components/      # React UI components
    hooks/           # Custom React hooks (battle, keyboard, timer)
    app/             # Next.js pages and API routes
    lib/             # Auth + Database
    scripts/         # CLI benchmarking tools
  docs/              # Documentation
```

## Documentation

- **[Architecture Guide](docs/ARCHITECTURE.md)** -- System design, ASCII diagrams, communication flows
- **[Developer Guide](docs/DEVELOPER_GUIDE.md)** -- Step-by-step setup and development guide for newcomers
- **[User Guide](docs/USER_GUIDE.md)** -- Quick start with 10+ use cases and tutorials

## How the AI Works

1. Engine enumerates **all legal placements** for the current piece
2. Each placement is simulated: piece locked, lines cleared, board metrics computed
3. A **scoring function** evaluates each placement (holes, bumpiness, height, lines cleared)
4. The placement with the **highest score** is executed
5. Every ~20 moves (or when board degrades), the AI asks an LLM to **write a new scoring function**
6. The LLM sees the board state and writes optimized JavaScript code
7. The new function replaces the old one, and the cycle continues

## License

MIT
