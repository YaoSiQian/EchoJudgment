import { db } from '../db.js'
import { generateFateNarrative, generateEchoNarrative } from './llm.js'
import type { Evaluation, EvaluationType, FateDelta, EchoType } from '../shared/types.ts'
import { getCharacterById, updateCharacterState } from '../data/seed.js'

export function normalizeScore(type: EvaluationType, value: number | number[]): number {
  if (Array.isArray(value)) {
    // Ranking: convert position to equivalent score
    const n = value.length
    const position = value.indexOf(1) // Assuming 1-based indexing in array
    // Map: 1st -> 0.95, 2nd -> 0.80, 3rd -> 0.60, etc.
    return Math.max(0.1, 1.0 - (position / (n - 1)) * 0.85)
  }
  switch (type) {
    case 'binary':
      return value === 1 ? 1.0 : 0.0
    case 'star5':
      return value / 5
    case 'point10':
      return value / 10
    default:
      return 0.5
  }
}

export async function processEvaluation(
  sessionId: string,
  sceneId: string,
  targetId: string,
  type: EvaluationType,
  rawValue: number | number[]
): Promise<{ evaluation: Evaluation; fateDelta: FateDelta; echoTriggered: boolean; echoNarrative?: string }> {
  const normalizedScore = normalizeScore(type, rawValue)
  const evaluationId = crypto.randomUUID()
  const playerId = getPlayerIdFromSession(sessionId)

  // Get character info for LLM prompt
  const character = getCharacterById(targetId)
  const characterState = character
    ? `心情: ${character.currentState.mood}, 职业进展: ${character.currentState.careerProgress}, 社交地位: ${character.currentState.socialStanding}`
    : '未知状态'

  // Get or create player profile
  const profile = getOrCreatePlayerProfile(playerId)

  // Use LLM to generate fate delta
  const fateResult = await generateFateNarrative(
    character?.name || '未知角色',
    characterState,
    type,
    normalizedScore,
    profile.currentArchetype
  )

  // Calculate state changes deterministically
  const moodDelta = calculateMoodDelta(normalizedScore, character)
  const careerDelta = calculateCareerDelta(normalizedScore, character)
  const socialDelta = calculateSocialDelta(normalizedScore, character)

  // Apply state changes
  updateCharacterState(targetId, moodDelta, careerDelta, socialDelta)

  // Determine if echo triggers
  const echoTriggered = Math.random() < fateResult.echoProbability
  let echoNarrative: string | undefined

  if (echoTriggered && fateResult.echoType) {
    echoNarrative = await generateEchoNarrative(
      fateResult.echoType,
      fateResult.echoProbability,
      character?.name || '某人',
      profile.currentArchetype
    )

    // Store echo event
    db.prepare(`
      INSERT INTO echo_events (id, type, intensity, source_evaluation_id, narrative)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      crypto.randomUUID(),
      fateResult.echoType,
      fateResult.echoProbability,
      evaluationId,
      echoNarrative
    )
  }

  // Store evaluation
  const evaluation: Evaluation = {
    id: evaluationId,
    playerId,
    sessionId,
    sceneId,
    targetId,
    type,
    rawValue,
    normalizedScore,
    timestamp: new Date().toISOString(),
    actNumber: 1,
    fateDelta: {
      shortTermEffect: fateResult.shortTermEffect,
      longTermTag: fateResult.longTermTag,
    },
    echoTriggered,
    echoType: fateResult.echoType as EchoType | undefined,
    echoResolved: false,
  }

  db.prepare(`
    INSERT INTO evaluations (
      id, player_id, session_id, scene_id, target_id, type, raw_value,
      normalized_score, timestamp, act_number, short_term_effect, long_term_tag,
      echo_triggered, echo_type, echo_resolved
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    evaluation.id,
    evaluation.playerId,
    evaluation.sessionId,
    evaluation.sceneId,
    evaluation.targetId,
    evaluation.type,
    JSON.stringify(evaluation.rawValue),
    evaluation.normalizedScore,
    evaluation.timestamp,
    evaluation.actNumber,
    evaluation.fateDelta?.shortTermEffect ?? null,
    evaluation.fateDelta?.longTermTag ?? null,
    evaluation.echoTriggered ? 1 : 0,
    evaluation.echoType ?? null,
    evaluation.echoResolved ? 1 : 0
  )

  // Update player profile
  updatePlayerProfile(playerId, normalizedScore, targetId)

  return {
    evaluation,
    fateDelta: {
      shortTermEffect: fateResult.shortTermEffect,
      longTermTag: fateResult.longTermTag,
      echoProbability: fateResult.echoProbability,
      echoType: fateResult.echoType as EchoType | undefined,
    },
    echoTriggered,
    echoNarrative,
  }
}

function calculateMoodDelta(normalizedScore: number, character: ReturnType<typeof getCharacterById>): number {
  if (!character) return 0
  const baseDelta = (normalizedScore - 0.5) * 4
  const sensitivity = normalizedScore >= 0.5
    ? character.sensitivity.positiveFactor
    : character.sensitivity.negativeFactor
  return parseFloat((baseDelta * sensitivity).toFixed(2))
}

function calculateCareerDelta(normalizedScore: number, character: ReturnType<typeof getCharacterById>): number {
  if (!character) return 0
  const baseDelta = (normalizedScore - 0.5) * 10
  return parseFloat((baseDelta * character.sensitivity.positiveFactor).toFixed(2))
}

function calculateSocialDelta(normalizedScore: number, character: ReturnType<typeof getCharacterById>): number {
  if (!character) return 0
  const baseDelta = (normalizedScore - 0.5) * 8
  return parseFloat((baseDelta * (normalizedScore >= 0.5 ? 1.0 : character.sensitivity.negativeFactor)).toFixed(2))
}

function getPlayerIdFromSession(sessionId: string): string {
  const row = db.prepare('SELECT player_id FROM sessions WHERE id = ?').get(sessionId) as { player_id: string } | undefined
  return row?.player_id || 'anonymous'
}

function getOrCreatePlayerProfile(playerId: string) {
  let row = db.prepare('SELECT * FROM player_profiles WHERE player_id = ?').get(playerId) as Record<string, unknown> | undefined
  if (!row) {
    db.prepare(`
      INSERT INTO player_profiles (id, player_id, tendency, extremity, social_proximity_bias, consistency, ranking_preference, current_archetype, compressed_history)
      VALUES (?, ?, 0, 0, 0, 0.5, 'mixed', '未定义', '')
    `).run(crypto.randomUUID(), playerId)
    row = db.prepare('SELECT * FROM player_profiles WHERE player_id = ?').get(playerId) as Record<string, unknown>
  }
  return {
    id: row.id as string,
    playerId: row.player_id as string,
    tendency: row.tendency as number,
    extremity: row.extremity as number,
    socialProximityBias: row.social_proximity_bias as number,
    consistency: row.consistency as number,
    rankingPreference: row.ranking_preference as string,
    currentArchetype: row.current_archetype as string,
    compressedHistory: row.compressed_history as string,
  }
}

function updatePlayerProfile(playerId: string, normalizedScore: number, targetId: string) {
  const evaluations = db.prepare(`
    SELECT normalized_score FROM evaluations WHERE player_id = ? ORDER BY timestamp DESC LIMIT 20
  `).all(playerId) as { normalized_score: number }[]

  const scores = evaluations.map(e => e.normalized_score)
  scores.push(normalizedScore)

  const tendency = scores.reduce((a, b) => a + b, 0) / scores.length - 0.5
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length
  const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length
  const extremity = Math.sqrt(variance) * 10

  let archetype = '平衡型'
  if (tendency > 0.3) archetype = '讨好型'
  else if (tendency < -0.3) archetype = '严格评判者'
  else if (extremity > 2.5) archetype = '随性型'
  else if (scores.every(s => s > 0.4 && s < 0.6)) archetype = '回避型'

  db.prepare(`
    UPDATE player_profiles
    SET tendency = ?, extremity = ?, current_archetype = ?
    WHERE player_id = ?
  `).run(tendency, extremity, archetype, playerId)
}
