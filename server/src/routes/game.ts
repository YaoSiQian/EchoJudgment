import { Router } from 'express'
import { createSession, getSession, advanceScene, getCurrentScene, getPlayerStats } from '../services/gameLogic.js'
import { processEvaluation } from '../services/evaluation.js'
import { streamNarrative } from '../services/llm.js'
import { getAllCharacters, getCharacterById } from '../data/seed.js'
import type { EvaluationInput } from '../shared/types.ts'

const router = Router()

// Start new game
router.post('/start', (req, res) => {
  const session = createSession()
  const scene = getCurrentScene(session.id)
  res.json({ session, scene })
})

// Get session state
router.get('/session/:id', (req, res) => {
  const session = getSession(req.params.id)
  if (!session) {
    res.status(404).json({ error: 'Session not found' })
    return
  }
  const scene = getCurrentScene(session.id)
  res.json({ session, scene })
})

// Advance to next scene
router.post('/advance', (req, res) => {
  const { sessionId } = req.body
  if (!sessionId) {
    res.status(400).json({ error: 'sessionId required' })
    return
  }
  const result = advanceScene(sessionId)
  res.json(result)
})

// Stream narrative for current scene
router.post('/stream-narrative', async (req, res) => {
  const { sessionId, characterId, evaluationType, score } = req.body
  const session = getSession(sessionId)
  const scene = getCurrentScene(sessionId)
  const character = characterId ? getCharacterById(characterId) : null

  if (!session || !scene) {
    res.status(404).json({ error: 'Session or scene not found' })
    return
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Transfer-Encoding', 'chunked')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  try {
    const stream = streamNarrative({
      sceneTitle: scene.title,
      sceneDescription: scene.description,
      characterName: character?.name || '',
      characterState: character
        ? `心情: ${character.currentState.mood}, 职业进展: ${character.currentState.careerProgress}, 社交地位: ${character.currentState.socialStanding}`
        : '',
      evaluationType,
      score,
      tone: '神秘而压抑',
      actNumber: session.currentAct,
      turnNumber: scene.sequence,
    })

    for await (const chunk of stream) {
      res.write(chunk)
    }
    res.end()
  } catch (err) {
    console.error('Stream error:', err)
    res.write('\n[叙事生成中断，请重试]')
    res.end()
  }
})

// Submit evaluation
router.post('/evaluate', async (req, res) => {
  const input = req.body as EvaluationInput
  if (!input.sessionId || !input.sceneId || !input.targetId || input.value === undefined) {
    res.status(400).json({ error: 'Missing required fields' })
    return
  }

  try {
    const result = await processEvaluation(
      input.sessionId,
      input.sceneId,
      input.targetId,
      input.type,
      input.value
    )
    res.json(result)
  } catch (err) {
    console.error('Evaluation error:', err)
    res.status(500).json({ error: 'Evaluation processing failed' })
  }
})

// Get all characters
router.get('/characters', (req, res) => {
  const characters = getAllCharacters()
  res.json(characters)
})

// Get single character
router.get('/characters/:id', (req, res) => {
  const character = getCharacterById(req.params.id)
  if (!character) {
    res.status(404).json({ error: 'Character not found' })
    return
  }
  res.json(character)
})

// Get player stats
router.get('/player/stats', (req, res) => {
  const playerId = req.query.playerId as string || 'player_1'
  const stats = getPlayerStats(playerId)
  res.json(stats)
})

// Get player profile
router.get('/player/profile', (req, res) => {
  const playerId = req.query.playerId as string || 'player_1'
  const row = (req as any).app.locals.db
    .prepare('SELECT * FROM player_profiles WHERE player_id = ?')
    .get(playerId)
  res.json(row || null)
})

export default router
