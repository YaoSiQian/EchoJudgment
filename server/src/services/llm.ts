import OpenAI from 'openai'
import { config } from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { db } from '../db.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '../../../.env') })

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.openai-next.com/v1',
})

const MODEL = 'claude-sonnet-4-6'

export interface NarrativePrompt {
  sceneTitle: string
  sceneDescription: string
  characterName: string
  characterState: string
  evaluationType?: string
  score?: number
  tone: string
  actNumber: number
  turnNumber: number
}

export async function* streamNarrative(prompt: NarrativePrompt): AsyncGenerator<string> {
  const systemPrompt = `你是一位精通心理惊悚叙事的作家，正在为互动小说《回响之评》撰写剧情。

【系统规则】
- 你只能描述当前场景下发生的事件和角色的情绪反应。
- 你不允许直接修改任何角色的状态数值。
- 当前时间点：第 ${prompt.actNumber} 幕，回合 ${prompt.turnNumber}。你只能引用该时间点之前已发生的事件。
- 叙事长度控制在 150-300 字。
- 必须包含：角色对事件的即时反应、环境细节暗示、一句内心独白。
- 不要剧透未来的剧情节点。
- 保持中文输出。`

  const userPrompt = `【场景】${prompt.sceneTitle}
${prompt.sceneDescription}

【角色状态】
${prompt.characterState}

${prompt.evaluationType && prompt.score !== undefined
    ? `【玩家刚刚做出的评价】\n评价类型：${prompt.evaluationType}\n分数：${prompt.score}\n`
    : ''}

【叙事要求】
基调：${prompt.tone}

请生成叙事文本：`

  const stream = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    stream: true,
    temperature: 0.85,
    top_p: 0.9,
  }) as AsyncIterable<any>

  for await (const chunk of stream) {
    const content = chunk.choices?.[0]?.delta?.content
    if (content) {
      yield content
    }
  }
}

export async function generateFateNarrative(
  characterName: string,
  characterState: string,
  evaluationType: string,
  normalizedScore: number,
  playerArchetype: string
): Promise<{ shortTermEffect: string; longTermTag: string; echoProbability: number; echoType?: string }> {
  const tools = [
    {
      type: 'function' as const,
      function: {
        name: 'apply_evaluation',
        description: '计算评价对被评价者命运的影响',
        parameters: {
          type: 'object',
          properties: {
            shortTermEffect: {
              type: 'string',
              description: '50字以内的即时事件描述',
            },
            longTermTag: {
              type: 'string',
              description: '后续剧情检索标签，如 career_boost, social_isolation',
            },
            echoProbability: {
              type: 'number',
              description: '0-1 的回荡触发概率',
            },
            echoType: {
              type: 'string',
              enum: ['mirror', 'chain', 'cognitive', 'good-person'],
              description: '如有回荡，指定类型',
            },
          },
          required: ['shortTermEffect', 'longTermTag', 'echoProbability'],
        },
      },
    },
  ]

  const userPrompt = `你是一位社会动力学模拟专家。请根据以下输入，计算一次评价对被评价者命运的短期和长期影响。

【输入】
- 被评价者：${characterName}，当前状态 ${characterState}
- 评价分数（标准化 0-1）：${normalizedScore.toFixed(2)}
- 评价量级：${evaluationType}
- 玩家评价人格画像：${playerArchetype}

请严格使用 apply_evaluation 函数输出结果。`

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: '你只负责调用函数计算结果，不要输出额外解释。' },
      { role: 'user', content: userPrompt },
    ],
    tools,
    tool_choice: { type: 'function' as const, function: { name: 'apply_evaluation' } },
    temperature: 0.7,
  } as any)

  const toolCall = (response as any).choices?.[0]?.message?.tool_calls?.[0]
  if (toolCall && toolCall.function.name === 'apply_evaluation') {
    const args = JSON.parse(toolCall.function.arguments)
    return {
      shortTermEffect: args.shortTermEffect || '未产生明显变化',
      longTermTag: args.longTermTag || 'neutral',
      echoProbability: Math.max(0, Math.min(1, args.echoProbability || 0)),
      echoType: args.echoType,
    }
  }

  // Fallback
  return {
    shortTermEffect: '未产生明显变化',
    longTermTag: 'neutral',
    echoProbability: normalizedScore < 0.3 || normalizedScore > 0.8 ? 0.3 : 0.1,
  }
}

export async function generateEchoNarrative(
  echoType: string,
  intensity: number,
  sourceCharacter: string,
  playerArchetype: string
): Promise<string> {
  const userPrompt = `生成一段"回荡"叙事文本。在《回响之评》的世界观中，玩家对他人做出的评价会以某种方式反弹回玩家自身。

【回荡类型】${echoType === 'mirror' ? '镜像回荡' : echoType === 'chain' ? '连锁回荡' : echoType === 'cognitive' ? '认知回荡' : '好人困境'}
【强度】${intensity.toFixed(2)}（0-1）
【来源评价对象】${sourceCharacter}
【玩家画像】${playerArchetype}

要求：
- 100-200字
- 以第二人称"你"叙述
- 带有神秘感和不安感
- 不要直接说明"这是回荡"，而是让玩家从事件中感受到因果联系`

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: '你是一位擅长心理惊悚氛围的叙事作家。' },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.9,
  } as any)

  return (response as any).choices?.[0]?.message?.content || '一种奇怪的感觉涌上心头。'
}

export function getNarrativeFromCache(cacheKey: string): string | null {
  const row = db.prepare('SELECT content FROM narrative_cache WHERE cache_key = ?').get(cacheKey) as { content: string } | undefined
  return row?.content ?? null
}

export function setNarrativeCache(cacheKey: string, content: string) {
  db.prepare('INSERT OR REPLACE INTO narrative_cache (id, cache_key, content) VALUES (?, ?, ?)').run(
    crypto.randomUUID(),
    cacheKey,
    content
  )
}
