import { db } from '../db.js'
import { getFirstScene, getNextScene, getSceneById } from '../data/seed.js'
import type { GameSession, Scene, SceneAction } from '../shared/types.ts'

export function createSession(playerId: string = 'player_1'): GameSession {
  const sessionId = crypto.randomUUID()
  const firstScene = getFirstScene()
  const session: GameSession = {
    id: sessionId,
    playerId,
    currentAct: 1,
    currentSceneId: firstScene?.sceneId || 'act1_opening',
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  db.prepare(`
    INSERT INTO sessions (id, player_id, current_act, current_scene_id, started_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    session.id,
    session.playerId,
    session.currentAct,
    session.currentSceneId,
    session.startedAt,
    session.updatedAt
  )

  return session
}

export function getSession(sessionId: string): GameSession | null {
  const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as Record<string, unknown> | undefined
  if (!row) return null
  return {
    id: row.id as string,
    playerId: row.player_id as string,
    currentAct: row.current_act as number,
    currentSceneId: row.current_scene_id as string,
    startedAt: row.started_at as string,
    updatedAt: row.updated_at as string,
  }
}

export function advanceScene(sessionId: string): { scene: Scene | null; session: GameSession | null } {
  const session = getSession(sessionId)
  if (!session) return { scene: null, session: null }

  const nextScene = getNextScene(session.currentSceneId)
  if (!nextScene) return { scene: null, session }

  db.prepare('UPDATE sessions SET current_scene_id = ?, updated_at = ? WHERE id = ?').run(
    nextScene.sceneId,
    new Date().toISOString(),
    sessionId
  )

  return {
    scene: nextScene,
    session: { ...session, currentSceneId: nextScene.sceneId, updatedAt: new Date().toISOString() },
  }
}

export function getCurrentScene(sessionId: string): Scene | null {
  const session = getSession(sessionId)
  if (!session) return null
  return getSceneById(session.currentSceneId)
}

export function getPlayerStats(playerId: string) {
  const totalEvals = db.prepare('SELECT COUNT(*) as count FROM evaluations WHERE player_id = ?').get(playerId) as { count: number }
  const positiveEvals = db.prepare('SELECT COUNT(*) as count FROM evaluations WHERE player_id = ? AND normalized_score >= 0.5').get(playerId) as { count: number }
  const negativeEvals = db.prepare('SELECT COUNT(*) as count FROM evaluations WHERE player_id = ? AND normalized_score < 0.5').get(playerId) as { count: number }
  const echoes = db.prepare('SELECT COUNT(*) as count FROM echo_events WHERE resolved = 0').get() as { count: number }
  const profile = db.prepare('SELECT * FROM player_profiles WHERE player_id = ?').get(playerId) as Record<string, unknown> | undefined

  return {
    totalEvaluations: totalEvals.count,
    positiveCount: positiveEvals.count,
    negativeCount: negativeEvals.count,
    pendingEchoes: echoes.count,
    archetype: profile?.current_archetype as string || '未定义',
    tendency: profile?.tendency as number || 0,
    extremity: profile?.extremity as number || 0,
  }
}
