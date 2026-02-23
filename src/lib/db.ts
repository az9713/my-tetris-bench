import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'tetrisbench.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  // Ensure data directory exists
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Initialize tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      human_player_id TEXT,
      human_score INTEGER NOT NULL,
      ai_model TEXT NOT NULL,
      ai_score INTEGER NOT NULL,
      winner TEXT NOT NULL CHECK(winner IN ('human', 'ai', 'tie')),
      duration_seconds INTEGER NOT NULL,
      seed INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (human_player_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS ai_game_details (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER NOT NULL,
      interventions INTEGER DEFAULT 0,
      avg_move_time_ms REAL,
      max_height_reached INTEGER,
      total_lines INTEGER DEFAULT 0,
      scoring_functions_generated INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id)
    );

    CREATE TABLE IF NOT EXISTS model_vs_model_games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      model1 TEXT NOT NULL,
      model1_score INTEGER NOT NULL,
      model2 TEXT NOT NULL,
      model2_score INTEGER NOT NULL,
      winner TEXT NOT NULL,
      seed INTEGER NOT NULL,
      duration_seconds INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
}

// Game operations
export function saveGame(data: {
  humanPlayerId?: string;
  humanScore: number;
  aiModel: string;
  aiScore: number;
  winner: 'human' | 'ai' | 'tie';
  durationSeconds: number;
  seed: number;
  aiInterventions?: number;
}) {
  const db = getDb();

  const result = db.prepare(`
    INSERT INTO games (human_player_id, human_score, ai_model, ai_score, winner, duration_seconds, seed)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.humanPlayerId || null,
    data.humanScore,
    data.aiModel,
    data.aiScore,
    data.winner,
    data.durationSeconds,
    data.seed
  );

  if (data.aiInterventions !== undefined) {
    db.prepare(`
      INSERT INTO ai_game_details (game_id, interventions)
      VALUES (?, ?)
    `).run(result.lastInsertRowid, data.aiInterventions);
  }

  return result.lastInsertRowid;
}

export function getLeaderboard() {
  const db = getDb();

  const modelStats = db.prepare(`
    SELECT
      ai_model,
      COUNT(*) as total_games,
      SUM(CASE WHEN winner = 'ai' THEN 1 ELSE 0 END) as ai_wins,
      ROUND(AVG(ai_score), 0) as avg_ai_score,
      ROUND(AVG(human_score), 0) as avg_human_score,
      MAX(ai_score) as max_ai_score,
      ROUND(
        CAST(SUM(CASE WHEN winner = 'ai' THEN 1 ELSE 0 END) AS REAL) / COUNT(*) * 100,
        1
      ) as win_rate
    FROM games
    GROUP BY ai_model
    ORDER BY win_rate DESC
  `).all();

  const humanStats = db.prepare(`
    SELECT
      COALESCE(u.name, 'Guest') as player_name,
      COUNT(*) as total_games,
      SUM(CASE WHEN g.winner = 'human' THEN 1 ELSE 0 END) as wins,
      ROUND(AVG(g.human_score), 0) as avg_score,
      MAX(g.human_score) as max_score,
      ROUND(
        CAST(SUM(CASE WHEN g.winner = 'human' THEN 1 ELSE 0 END) AS REAL) / COUNT(*) * 100,
        1
      ) as win_rate
    FROM games g
    LEFT JOIN users u ON g.human_player_id = u.id
    GROUP BY COALESCE(g.human_player_id, 'guest')
    ORDER BY win_rate DESC
    LIMIT 50
  `).all();

  const recentGames = db.prepare(`
    SELECT
      g.*,
      COALESCE(u.name, 'Guest') as player_name
    FROM games g
    LEFT JOIN users u ON g.human_player_id = u.id
    ORDER BY g.created_at DESC
    LIMIT 20
  `).all();

  return { modelStats, humanStats, recentGames };
}
