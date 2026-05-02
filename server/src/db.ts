import Database, { Database as DatabaseType } from 'better-sqlite3'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = join(__dirname, '../../data/game.db')

export const db: DatabaseType = new Database(dbPath)
db.pragma('journal_mode = WAL')

export function initDb() {
  // Characters table
  db.exec(`
    CREATE TABLE IF NOT EXISTS characters (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER,
      occupation TEXT,
      social_role TEXT,
      extraversion REAL DEFAULT 0,
      neuroticism REAL DEFAULT 0,
      openness REAL DEFAULT 0,
      agreeableness REAL DEFAULT 0,
      conscientiousness REAL DEFAULT 0,
      mood REAL DEFAULT 0,
      career_progress REAL DEFAULT 50,
      social_standing REAL DEFAULT 50,
      hidden_secret_revealed INTEGER DEFAULT 0,
      familiarity REAL DEFAULT 0,
      trust REAL DEFAULT 0.5,
      hidden_attitude REAL DEFAULT 0,
      positive_factor REAL DEFAULT 1.0,
      negative_factor REAL DEFAULT 1.0,
      recovery_speed REAL DEFAULT 0.5,
      hidden_vulnerability TEXT,
      unlockable_subplots TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Evaluations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS evaluations (
      id TEXT PRIMARY KEY,
      player_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      scene_id TEXT NOT NULL,
      target_id TEXT NOT NULL,
      type TEXT NOT NULL,
      raw_value TEXT NOT NULL,
      normalized_score REAL NOT NULL,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      act_number INTEGER DEFAULT 1,
      short_term_effect TEXT,
      long_term_tag TEXT,
      echo_triggered INTEGER DEFAULT 0,
      echo_type TEXT,
      echo_resolved INTEGER DEFAULT 0
    )
  `)

  // Player profiles table
  db.exec(`
    CREATE TABLE IF NOT EXISTS player_profiles (
      id TEXT PRIMARY KEY,
      player_id TEXT NOT NULL UNIQUE,
      tendency REAL DEFAULT 0,
      extremity REAL DEFAULT 0,
      social_proximity_bias REAL DEFAULT 0,
      consistency REAL DEFAULT 0.5,
      ranking_preference TEXT DEFAULT 'mixed',
      current_archetype TEXT DEFAULT '未定义',
      compressed_history TEXT DEFAULT ''
    )
  `)

  // Scenes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS scenes (
      id TEXT PRIMARY KEY,
      scene_id TEXT NOT NULL UNIQUE,
      act_number INTEGER NOT NULL,
      sequence INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      trigger_condition TEXT,
      available_actions TEXT NOT NULL,
      next_scenes TEXT NOT NULL
    )
  `)

  // Sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      player_id TEXT NOT NULL,
      current_act INTEGER DEFAULT 1,
      current_scene_id TEXT,
      started_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Echo events table
  db.exec(`
    CREATE TABLE IF NOT EXISTS echo_events (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      intensity REAL NOT NULL,
      source_evaluation_id TEXT NOT NULL,
      narrative TEXT NOT NULL,
      triggered_at TEXT DEFAULT CURRENT_TIMESTAMP,
      resolved INTEGER DEFAULT 0
    )
  `)

  // Narrative cache for LLM responses
  db.exec(`
    CREATE TABLE IF NOT EXISTS narrative_cache (
      id TEXT PRIMARY KEY,
      cache_key TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)
}
