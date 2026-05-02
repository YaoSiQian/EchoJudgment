# 《回响》技术文档 03 — AI 驱动架构与 Prompt 工程

> 版本: v2.0 | 日期: 2026-05-02

---

## 1. AI 系统总览

AI 层分为两条独立流水线，按请求模式不同选择不同工具：

```
┌──────────────────────────────────────────────────────┐
│              AI Orchestrator（编排层）                │
│  职责：调度流水线、维护对话 Thread、处理错误降级      │
└──────────────────────────────────────────────────────┘
              │                          │
    ┌─────────▼──────────┐    ┌──────────▼─────────┐
    │  角色对话流水线      │    │  批量内容流水线      │
    │  Character Pipeline │    │  Batch Pipeline     │
    │  · 流式 useChat     │    │  · generateObject   │
    │  · Durable Objects  │    │  · 社媒帖子/新闻     │
    │    持有对话历史      │    │  · 无需历史上下文    │
    └────────────────────┘    └────────────────────┘
```

**核心设计原则：**
- 角色对话使用**多轮对话历史**，由 Durable Objects 在服务端持久化，AI 永远记得自己上一轮说了什么
- 回响注入**内嵌于角色 prompt** 中，不发起第二次 AI 调用
- 过程数据（悬停时长、取消次数等）**只用于本地 PlayerModel 更新，不注入 AI context**——防止玩家通过 AI 响应的变化察觉自己被监控，破坏「不确定感」核心体验

---

## 2. 前端 AI 接入（Vercel AI SDK）

```typescript
// src/ai/client.ts
// 前端使用 Vercel AI SDK。Workers 端持有 API Key 和对话历史。
// useChat 内部自动管理：流式传输 / 消息列表展示 / loading & error 状态
export { useChat, useCompletion } from 'ai/react'

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8787'
export const WORKERS_CHAT_API     = `${BASE}/api/chat`      // 角色对话（流式）
export const WORKERS_GENERATE_API = `${BASE}/api/generate`  // 批量内容（非流式）

// 模型配置（Workers 端使用，此处仅作文档参考）
export const AI_MODELS = {
  narrative:   'claude-sonnet-4-6',
  batch:       'claude-haiku-4-5-20251001',
  consequence: 'claude-sonnet-4-6',
} as const
// echo 已合并进 character prompt，不再独立调用
```

---

## 3. 上下文与对话历史管理

对话历史由 **Cloudflare Durable Objects** 在服务端持有，前端的 `useChat` 消息列表仅用于渲染。`ContextManager` 只负责构建 prompt 和控制发往 Anthropic 的消息窗口大小。

```typescript
// src/ai/ContextManager.ts

export class ContextManager {
  // 固定部分：可被 Prompt Cache 缓存（角色设定、世界规则）
  buildStaticSystemPrompt(npc: NPCState, echoLevel: EchoLevel): string {
    return `你正在扮演《回响》中的角色"${npc.name}"。

## 角色设定
- 原型：${ARCHETYPE_DESC[npc.archetype]}
- 你不会忘记这段对话中说过的任何话。

## 是否是"评价者"
${npc.isEvaluator === null
  ? '这是未揭示信息。你的言行可能令玩家产生怀疑，也可能令其放心。'
  : npc.isEvaluator
  ? '你知道主角的能力，也拥有类似的能力。但不要在此刻明说。'
  : '你不是评价者，不知道主角的秘密。'}

${echoLevel > 0 ? ECHO_LEVEL_INSTRUCTIONS[echoLevel] : ''}`
  }

  // 动态部分：每次请求附加，不缓存
  buildDynamicContext(ctx: DynamicContext): string {
    return JSON.stringify({
      act: ctx.currentAct,
      gameDay: ctx.gameDay,
      npcMood: ctx.npcCurrentMood,
      relationship: ctx.relationshipValue,
      awarenessOfPlayerAbility: ctx.awarenessOfPlayerAbility,
      imbalanceValue: ctx.imbalanceValue,
      echoLevel: ctx.echoLevel,
      // ⚠️ 过程数据（悬停时长等）不在此处——只用于本地 PlayerModel，不注入 AI
    })
  }

  // Durable Objects 持有完整对话历史；
  // 向 Anthropic 发请求时取最近 20 轮，更早的用一条摘要替代
  buildMessageWindow(thread: ConversationMessage[], maxMessages = 20): ConversationMessage[] {
    if (thread.length <= maxMessages) return thread
    const recent = thread.slice(-maxMessages)
    return [
      { role: 'user', content: `[早期对话摘要：${thread.length - maxMessages} 轮，已压缩]` },
      ...recent,
    ]
  }
}
```

---

## 4. Prompt 工程：批量内容生成（社媒 / 新闻）

批量内容流水线用于生成社媒帖子和锡陵晚报新闻，**不含对话历史**，单次调用，使用 `generateObject`。

```typescript
// src/ai/prompts/narrative.ts

export function buildBatchContentSystemPrompt(ctx: NarrativeContext): string {
  return `你是《回响》的内容生成引擎，负责生成游戏世界中的社交媒体帖子和新闻内容。

## 游戏背景
- 游戏世界与现代中国城市现实完全一致，存在不可见的"评价之网"
- 玩家角色拥有对他人进行评价的超自然能力，评价改变被评价者的命运
- 玩家不知道自己是否也在被评价

## 当前游戏状态
- 幕次：第${ctx.currentAct}幕（${ACT_NAMES[ctx.currentAct]}）
- 游戏内时间：第${ctx.gameDay}天 ${ctx.gameTime}
- 失衡值：${ctx.imbalanceValue}/200
- 回响等级：Lv.${ctx.echoLevel}

## 活跃 NPC
${ctx.activeNPCSummary}

## 近期后果事件（作为内容生成的背景）
${ctx.recentConsequencesSummary}

## 叙事基调（第${ctx.currentAct}幕）
${ACT_TONES[ctx.currentAct]}`
}

const ACT_NAMES = { 1: '觉醒', 2: '诱惑', 3: '猜疑', 4: '回响' }
const ACT_TONES = {
  1: '轻松好奇，偶尔有一丝神秘感',
  2: '权力感与不安并存，开始有道德模糊地带',
  3: '偏执恐惧，内容越来越令人不安',
  4: '压迫感极强，每条内容都有重量',
}
```

---

## 5. Prompt 工程：角色对话 AI

角色对话是核心交互路径，使用**流式多轮对话**。Echo 注入规则内嵌于 system prompt，由同一次调用生成，不需要第二次 API 请求。

```typescript
// src/ai/prompts/character.ts

export function buildCharacterSystemPrompt(npc: NPCState, ctx: CharacterContext): string {
  return `你正在扮演《回响》中的角色"${npc.name}"。

## 角色设定
- 原型：${ARCHETYPE_DESC[npc.archetype]}
- 当前情绪：${npc.currentMood}
- 与主角关系值：${npc.relationshipValue}（-100 到 +100，越高越亲密）
- 对主角能力的察觉度：${(npc.awarenessOfPlayerAbility * 100).toFixed(0)}%

## 是否是"评价者"
${npc.isEvaluator === null
  ? '这是未揭示信息。你的言行可能令玩家产生怀疑，也可能令其放心。'
  : npc.isEvaluator
  ? '你知道主角的能力，也拥有类似的能力。但不要在此刻明说。'
  : '你不是评价者，不知道主角的秘密。'}

${ctx.echoLevel > 0 ? ECHO_LEVEL_INSTRUCTIONS[ctx.echoLevel] : ''}

## 输出格式（严格 JSON）
{
  "message": "你说的话（中文，自然口语）",
  "subtext": "这话背后隐藏的真实意图（供叙事引擎理解，不展示给玩家）",
  "mood_change": "happy" | "worried" | "suspicious" | "angry" | "neutral",
  "triggers_evaluation": boolean,
  "evaluation_prompt": null | "评价契机的描述文字",
  "player_options": []  // 仅当 triggers_evaluation=true 时填充，2-4 个选项
}

## 语言风格
- 使用自然中文口语，避免书面腔
- 关系值越低，对话越疏离/敌意；越高，越亲密/直接
- 不要解释角色的内心，让对话本身承载情感`
}
```

**玩家选项格式：**

```typescript
interface PlayerOption {
  id: string
  text: string
  tone: 'warm' | 'cold' | 'aggressive' | 'passive' | 'curious' | 'avoidant'
  hidden_effect: {
    moral_sensitivity_delta: number   // -1 ~ +1
    social_style_signal: string
  }
}
```

---

## 6. 回响注入规则（内嵌于角色 prompt）

回响注入不是独立的 AI 调用，而是角色 AI system prompt 的一部分条件指令。当 `echoLevel > 0` 时，`buildCharacterSystemPrompt` 自动附加以下规则，由同一次流式调用完成。

```typescript
// src/ai/prompts/echo.ts
// 这些常量被 ContextManager 和 buildCharacterSystemPrompt 引用，不单独调用

export const ECHO_LEVEL_INSTRUCTIONS: Record<EchoLevel, string> = {
  0: '',
  1: `## 回响注入规则（Lv.1 — 轻微）
在你的话语中植入 1-2 个词语的轻微重复（如同一段话中"还好"出现 2 次）。
不改变任何语义，仅造成轻微的"读着怪怪的"感觉。`,

  2: `## 回响注入规则（Lv.2 — 呼应）
你的措辞中出现对玩家近期行为的"巧合"呼应——
例如玩家刚给某人差评，你说"今天遇到了一个很奇怪的人"。
保持可解释性（"只是巧合"），不能让玩家确认有异常。`,

  3: `## 回响注入规则（Lv.3 — 意味深长）
你的每句话都有隐约的意味深长，像是知道更多。
不同板块（聊天/社媒/新闻）的回响内容出现相互呼应的主题。`,

  4: `## 回响注入规则（Lv.4 — 极度）
你的言语直接指向玩家的本质——但依然是角色在说话，不是打破第四面墙。
选项措辞极度犀利（如"毁掉TA的前途" vs "毁掉自己的底线"）。
叙事节奏加快，不给喘息。`,
}
```

---

## 7. Workers 端实现（Hono.js + Vercel AI SDK）

Workers 是唯一持有 API Key 的位置。两个端点分别对应两条流水线。

```typescript
// workers/src/index.ts
import { Hono } from 'hono'
import { streamText, generateObject } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { RESPONSE_SCHEMAS } from './outputValidator'

const app = new Hono<{ Bindings: Env }>()
const anthropic = createAnthropic({ apiKey: env.ANTHROPIC_API_KEY })

// POST /api/chat — 角色对话（流式，前端 useChat 直接对接）
app.post('/api/chat', async (c) => {
  const { messages, npcId, gameContext } = await c.req.json()

  // Durable Objects：获取或创建该 NPC 的对话 thread
  const sessionId = `${gameContext.playerId}:${npcId}`
  const threadStub = c.env.CONVERSATION_THREAD.get(
    c.env.CONVERSATION_THREAD.idFromName(sessionId)
  )
  const thread = await threadStub.getMessages()

  const contextManager = new ContextManager()
  const npc = await getNPCState(npcId, c.env.DB)

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: [
      {
        type: 'text',
        text: contextManager.buildStaticSystemPrompt(npc, gameContext.echoLevel),
        experimental_providerMetadata: { anthropic: { cacheControl: { type: 'ephemeral' } } },
      },
      {
        type: 'text',
        text: contextManager.buildDynamicContext(gameContext),
      },
    ],
    messages: contextManager.buildMessageWindow(thread),
    onFinish: async ({ text }) => {
      await threadStub.appendMessage({ role: 'assistant', content: text })
    },
  })

  return result.toDataStreamResponse()
})

// POST /api/generate — 批量内容生成（社媒 / 新闻）
app.post('/api/generate', async (c) => {
  const { type, context } = await c.req.json()
  const schema = RESPONSE_SCHEMAS[type]
  if (!schema) return c.json({ error: 'Unknown type' }, 400)

  const { object } = await generateObject({
    model: anthropic('claude-haiku-4-5-20251001'),
    schema,
    prompt: buildBatchPrompt(type, context),
  })

  return c.json(object)
})

export default app
```

---

## 8. AI 输出验证（按响应类型拆分 Zod Schema）

不同响应类型的字段结构完全不同，使用统一 schema 会导致 AI 为社媒帖子/新闻幻觉出无意义的 `player_options`，从而提高降级率。

```typescript
// src/ai/OutputValidator.ts（前端）
// workers/src/outputValidator.ts（Workers 端，相同定义）
import { z } from 'zod'

const PlayerOptionSchema = z.object({
  id: z.string(),
  text: z.string().min(2).max(50),
  tone: z.enum(['warm', 'cold', 'aggressive', 'passive', 'curious', 'avoidant']),
  hidden_effect: z.object({
    moral_sensitivity_delta: z.number().min(-1).max(1),
    social_style_signal: z.string(),
  }),
})

const GameStateUpdatesSchema = z.object({
  npc_relationship_deltas: z.record(z.string(), z.number()),
  new_events: z.array(z.any()),
  echo_trigger: z.union([
    z.null(),
    z.object({ level: z.number().min(1).max(4), target: z.enum(['chat', 'feed', 'news']) }),
  ]),
})

// 角色对话响应：包含玩家选项（当 triggers_evaluation=true 时）
export const CharacterResponseSchema = z.object({
  message: z.string().min(1),
  subtext: z.string(),
  mood_change: z.enum(['happy', 'worried', 'suspicious', 'angry', 'neutral']),
  triggers_evaluation: z.boolean(),
  evaluation_prompt: z.string().nullable(),
  player_options: z.array(PlayerOptionSchema).min(2).max(4).optional(),
  game_state_updates: GameStateUpdatesSchema,
})

// 社媒帖子：有回响内容字段，无选项
export const SocialPostResponseSchema = z.object({
  npc_id: z.string(),
  text: z.string().min(1).max(500),
  image_description: z.string().optional(),
  echo_content: z.string().optional(),       // echoLevel > 0 时的异常内容
  likes: z.number().min(0),
  comments_count: z.number().min(0),
  timestamp_offset_hours: z.number(),
  game_state_updates: GameStateUpdatesSchema,
})

// 新闻：无选项，仅叙事后果呈现
export const NewsResponseSchema = z.object({
  headline: z.string().min(1).max(100),
  body: z.string().min(1).max(800),
  category: z.enum(['社会', '教育', '职场', '娱乐', '本地']),
  echo_headline: z.string().optional(),      // echoLevel >= 3 时替换标题
  game_state_updates: GameStateUpdatesSchema,
})

export const RESPONSE_SCHEMAS = {
  social_post: SocialPostResponseSchema,
  news: NewsResponseSchema,
} as const
// CharacterResponseSchema 不在此表中——由 Workers 流式端点内联使用
```

---

## 9. Prompt Caching 策略

缓存在 Workers 端实现，`buildStaticSystemPrompt` 的输出（角色设定 + 世界规则）使用 `cacheControl: ephemeral`，TTL 5 分钟。

| 内容 | 缓存 | 理由 |
|------|------|------|
| 角色设定 + 世界规则 | ✅ | 每局游戏固定，高复用 |
| 动态 context（关系值、失衡值等）| ❌ | 每次交互后更新 |
| 对话历史消息 | ❌ | Durable Objects 管理，按需截取 |

---

## 10. 错误处理与降级策略

```
L1: Prompt 约束（JSON 格式强制）
L2: Zod Schema 按类型验证
L3: 内容安全过滤（关键词检测）
L4: 叙事一致性检查（与游戏状态对比）
L5: 降级到 src/data/fallback/ 预置内容库
```

**降级触发条件：**
- 响应超时（> 8 秒）→ 使用上一条同类型缓存内容
- Zod 验证失败 → 使用 `fallback/` 对应幕的预置内容
- API 限流 → 指数退避重试最多 3 次，第 3 次失败后降级

```typescript
// src/data/fallback/chatMessages.ts 示例
export const FALLBACK_CHAT_MESSAGES: Record<ActNumber, FallbackMessage[]> = {
  1: [
    { npc: 'close_friend', text: '最近怎么样，好久没联系了', mood: 'neutral' },
  ],
  // ...
}
```
