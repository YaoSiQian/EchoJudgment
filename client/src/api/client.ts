import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export async function startGame() {
  const res = await api.post('/game/start')
  return res.data
}

export async function getSession(sessionId: string) {
  const res = await api.get(`/game/session/${sessionId}`)
  return res.data
}

export async function advanceScene(sessionId: string) {
  const res = await api.post('/game/advance', { sessionId })
  return res.data
}

export async function submitEvaluation(input: {
  sessionId: string
  sceneId: string
  targetId: string
  type: string
  value: number | number[]
}) {
  const res = await api.post('/game/evaluate', input)
  return res.data
}

export async function getCharacters() {
  const res = await api.get('/game/characters')
  return res.data
}

export async function getPlayerStats(playerId?: string) {
  const res = await api.get('/game/player/stats', { params: { playerId } })
  return res.data
}

export function streamNarrative(params: {
  sessionId: string
  characterId?: string
  evaluationType?: string
  score?: number
}): EventSource {
  const url = new URL('/api/game/stream-narrative', window.location.origin)
  url.searchParams.append('sessionId', params.sessionId)
  if (params.characterId) url.searchParams.append('characterId', params.characterId)
  if (params.evaluationType) url.searchParams.append('evaluationType', params.evaluationType)
  if (params.score !== undefined) url.searchParams.append('score', String(params.score))

  // Actually the backend uses POST with body, not query params.
  // For SSE with POST, we need fetch + ReadableStream.
  // Let's return a helper function instead.
  throw new Error('Use fetchStreamNarrative instead')
}

export async function fetchStreamNarrative(
  params: {
    sessionId: string
    characterId?: string
    evaluationType?: string
    score?: number
  },
  onChunk: (chunk: string) => void
): Promise<void> {
  const res = await fetch('/api/game/stream-narrative', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })

  if (!res.body) throw new Error('No response body')

  const reader = res.body.getReader()
  const decoder = new TextDecoder('utf-8')

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    onChunk(decoder.decode(value, { stream: true }))
  }
}

export default api
