// AI client — talks to /ai proxy (Vite dev) which forwards to AI_BASE_URL
// with Bearer AI_AUTH_TOKEN injected server-side.
//
// Uses OpenAI-compatible chat completions with claude-opus-4-6 via gateway.

const AI_MODEL = (import.meta.env.VITE_AI_MODEL as string) || 'claude-opus-4-6'
const AI_ENDPOINT = '/ai/v1/chat/completions'

export interface ChatTurn {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenAICompletionResponse {
  choices: Array<{ message: { content: string }; finish_reason: string }>
}

export async function callJSON<T = unknown>(messages: ChatTurn[], opts?: {
  model?: string
  temperature?: number
}): Promise<T> {
  const res = await fetch(AI_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: opts?.model ?? AI_MODEL,
      messages,
      temperature: opts?.temperature ?? 0.85,
      response_format: { type: 'json_object' },
    }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`AI request failed ${res.status}: ${text.slice(0, 200)}`)
  }
  const data = (await res.json()) as OpenAICompletionResponse
  const raw = data.choices?.[0]?.message?.content ?? ''
  return parseJSONLoose<T>(raw)
}

export async function* streamText(messages: ChatTurn[], opts?: { model?: string; temperature?: number }) {
  const res = await fetch(AI_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: opts?.model ?? AI_MODEL,
      messages,
      temperature: opts?.temperature ?? 0.85,
      stream: true,
    }),
  })
  if (!res.ok || !res.body) {
    throw new Error(`AI stream failed ${res.status}`)
  }
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buf = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    const lines = buf.split('\n')
    buf = lines.pop() ?? ''
    for (const line of lines) {
      const t = line.trim()
      if (!t.startsWith('data:')) continue
      const payload = t.slice(5).trim()
      if (payload === '[DONE]') return
      try {
        const parsed = JSON.parse(payload)
        const delta = parsed.choices?.[0]?.delta?.content
        if (typeof delta === 'string' && delta) yield delta as string
      } catch {
        // ignore malformed chunks
      }
    }
  }
}

function parseJSONLoose<T>(raw: string): T {
  const trimmed = raw.trim()
  // Strip markdown fences if present
  const stripped = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()
  try {
    return JSON.parse(stripped) as T
  } catch {
    // Try to extract outermost JSON object
    const start = stripped.indexOf('{')
    const end = stripped.lastIndexOf('}')
    if (start >= 0 && end > start) {
      return JSON.parse(stripped.slice(start, end + 1)) as T
    }
    throw new Error(`Cannot parse JSON: ${stripped.slice(0, 120)}`)
  }
}
