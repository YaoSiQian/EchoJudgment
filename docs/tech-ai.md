# 《回响》技术文档 03 — AI 驱动架构与 Prompt 工程

> 版本: v1.0 | 日期: 2026-05-02

---

## 1. AI 系统总览

《回响》的 AI 层由四个职责明确的模块组成，共享同一个 Anthropic SDK 客户端实例和统一的上下文管理器。

```
┌──────────────────────────────────────────────────────┐
│              AI Orchestrator（编排层）                │
│  职责：调度模块、管理 Token 预算、处理错误降级        │
└──────────────────────────────────────────────────────┘
         │              │              │              │
    ┌────▼────┐    ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
    │叙事生成器│    │角色AI   │    │回响生成器│    │后果推理 │
    │Narrative│    │Character│    │Echo     │    │Consqnce │
    └─────────┘    └─────────┘    └─────────┘    └─────────┘
         │              │              │              │
    ───────────────────────────────────────────���────────
                   ContextManager（共享）
                   PlayerModel（只读输入）
```

---

## 2. 客户端实现

```typescript
// src/ai/client.ts
import Anthropic from '@anthropic-ai/sdk'

let _client: Anthropic | null = null

export function getAIClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({
      apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
      dangerouslyAllowBrowser: true,  // Phase 0，Phase 2 移除
    })
  }
  return _client
}

// 模型配置：任务分级
export const AI_MODELS = {
  narrative: 'claude-sonnet-4-6',   // 主叙事/对话：高质量
  echo: 'claude-haiku-4-5-20251001', // 回响注入：低延迟
  batch: 'claude-haiku-4-5-20251001', // 批量社媒：成本敏感
  consequence: 'claude-sonnet-4-6',  // 后果推理：需理解复杂状态
} as const
```

---

## 3. 上下文窗口管理

所有 AI 调用共享同一个上下文构建策略，控制 Token 总量在 ~3500 以内：

```typescript
// src/ai/ContextManager.ts

interface ContextBudget {
  systemInstruction: number  // ~500 tokens，固定
  playerModel: number        // ~300 tokens，动态压缩
  gameState: number          // ~200 tokens
  npcInfo: number            // ~400 tokens（只包含相关NPC）
  recentEvents: number       // ~800 tokens，滑动窗口最近10条
  currentContent: number     // ~1000 tokens，当前对话/内容
  generationInstruction: number  // ~300 tokens
  // 合计: ~3500，预留 ~2000 生成空间
}

export class ContextManager {
  // 压缩旧事件：超过10条时，将早期事件替换为AI生成的摘要
  compressOldEvents(events: GameEvent[]): string {
    if (events.length <= 10) return JSON.stringify(events)
    const recent = events.slice(-8)
    const oldSummary = `[早期事件摘要：${events.length - 8}条，已压缩]`
    return JSON.stringify([oldSummary, ...recent])
  }

  // 构建玩家模型的紧凑表示（控制在300 tokens以内）
  buildPlayerModelContext(model: PlayerModel): string {
    return JSON.stringify({
      tendency: model.evaluationTendency,
      style: model.socialStyle,
      stress: model.stressTolerance.toFixed(2),
      suspicion: model.suspicionIndex.toFixed(2),
      imbalance: useEchoStore.getState().imbalanceValue,
      echoLevel: useEchoStore.getState().echoLevel,
      recentEvals: model.evaluationHistory.slice(-5),
    })
  }
}
```

---

## 4. Prompt 工程：叙事生成器

### 4.1 System Prompt 模板（叙事生成）

```typescript
// src/ai/prompts/narrative.ts

export function buildNarrativeSystemPrompt(ctx: NarrativeContext): string {
  return `你是《回响》的叙事引擎，负责生成这款心理惊悚叙事游戏的剧情内容。

## 游戏核心规则
- 游戏世界与现代中国城市现实完全一致，存在不可见的"评价之网"
- 玩家角色拥有对他人进行评价的超自然能力，评价改变被评价者的命运
- 玩家不知道自己是否也在被评价

## 当前游戏状态
- 幕次：第${ctx.currentAct}幕（${ACT_NAMES[ctx.currentAct]}）
- 游戏内时间：第${ctx.gameDay}天 ${ctx.gameTime}
- 失衡值：${ctx.imbalanceValue}/200
- 回响等级：Lv.${ctx.echoLevel}

## 玩家心理画像
${ctx.playerModelSummary}

## 当前活跃NPC
${ctx.activeNPCSummary}

## 最近事件（时间线）
${ctx.recentEventsSummary}

## 输出格式要求
你的输出必须是合法的 JSON，格式如下：
{
  "type": "dialogue" | "social_post" | "news" | "system_event",
  "content": {
    // 见各类型规范
  },
  "game_state_updates": {
    "npc_relationship_deltas": {},  // NPC ID → 关系值变化
    "new_events": [],               // 新事件列表
    "echo_trigger": null | { level: number, target: "chat" | "feed" | "news" }
  },
  "player_options": []   // 2-4个选项，类型见下
}

## 重要约束
- 不要在对话内容中直接揭示谁是"评价者"
- 回响内容（echoLevel > 0时）必须"可被忽略但不可被忽视"
- 玩家选项措辞必须有鲜明的情感/态度差异，不能只是语气微调
- 在第${ctx.currentAct}幕，叙事基调应为：${ACT_TONES[ctx.currentAct]}`
}

const ACT_NAMES = { 1: '觉醒', 2: '诱惑', 3: '猜疑', 4: '回响' }
const ACT_TONES = {
  1: '轻松好奇，偶尔有一丝神秘感',
  2: '权力感与不安并存，开始有道德模糊地带',
  3: '偏执恐惧，选项越来越难以取舍',
  4: '压迫感极强，每个选项都有重量',
}
```

### 4.2 对话生成的玩家选项格式

```typescript
interface PlayerOption {
  id: string
  text: string               // 显示给玩家的选项文字
  tone: 'warm' | 'cold' | 'aggressive' | 'passive' | 'curious' | 'avoidant'
  hidden_effect: {
    moral_sensitivity_delta: number   // -1 ~ +1
    social_style_signal: string       // 对玩家社交风格的推断
  }
}
```

---

## 5. Prompt 工程：角色 AI 引擎

### 5.1 NPC 对话 Prompt 结构

```typescript
// src/ai/prompts/character.ts

export function buildCharacterPrompt(npc: NPCState, ctx: DialogContext): string {
  return `你正在扮演《回响》中的角色"${npc.name}"。

## 角色设定
- 原型：${ARCHETYPE_DESC[npc.archetype]}
- 当前情绪：${npc.currentMood}
- 与主角关系值：${npc.relationshipValue}（-100到+100，越高越亲密）
- 对主角能力的察觉度：${(npc.awarenessOfPlayerAbility * 100).toFixed(0)}%

## 是否是"评价者"
${npc.isEvaluator === null
  ? '这是未揭示信息。在对话中，你的言行可能令玩家产生怀疑，也可能令其放心。'
  : npc.isEvaluator
  ? '你知道主角的能力，也拥有类似的能力。但不要在此刻明说。'
  : '你不是评价者，不知道主角的秘密。'}

## 当前对话情境
${ctx.situation}

## 输出格式
{
  "message": "角色说的话（中文，自然对话风格）",
  "subtext": "这段话背后隐藏的真实意图（供叙事引擎理解，不显示给玩家）",
  "mood_change": "happy" | "worried" | "suspicious" | "angry" | "neutral",
  "triggers_evaluation": boolean,  // 是否触发评价契机
  "evaluation_prompt": null | "推荐的评价契机描述"
}

## 语言风格要求
- 使用自然中文口语，避免书面腔
- 关系值越低，对话越疏离/敌意；越高，越亲密/直接
- 当 echoLevel >= 2 时，可以在对话中加入1-2个微妙的重复词语
- 不要解释角色的内心，让对话本身承载情感`
}
```

---

## 6. Prompt 工程：回响生成器

```typescript
// src/ai/prompts/echo.ts

export function buildEchoInjectionPrompt(
  originalContent: string,
  echoLevel: EchoLevel,
  playerBehaviorSummary: string
): string {
  const instructions = ECHO_LEVEL_INSTRUCTIONS[echoLevel]

  return `你是《回响》的回响注入引擎。

## 任务
对以下原始内容进行"回响注入"，在正常文案中植入心理不适感，使玩家产生被注视/被评价的感觉。

## 原始内容
${originalContent}

## 玩家当前行为特征
${playerBehaviorSummary}

## 回响等级：Lv.${echoLevel}
${instructions}

## 核心原则
- 表面内容必须保持正常，不能让玩家"确定"有异常
- 异常必须"可被忽略但不可被忽视"——注意力集中时能察觉，分心时会忽略
- 不要使用恐怖/血腥意象，用日常词语制造不适

## 输出格式
{
  "modified_content": "注入回响后的内容",
  "anomaly_type": "repetition" | "subtext" | "coincidence" | "self_reference",
  "intensity": 1-10
}`
}

const ECHO_LEVEL_INSTRUCTIONS: Record<EchoLevel, string> = {
  0: '无需注入，直接返回原内容',
  1: `轻度注入：
- 在对话中植入1-2个轻微的词语重复（如同一段话中"还好"出现2次）
- 不改变任何语义，仅造成轻微的"读着怪怪的"感觉`,
  2: `中度注入：
- 在对话/动态中植入对玩家近期行为的"巧合"呼应
- 例如玩家刚给某人差评，某条社媒动态说"今天遇到了一个很奇怪的人"
- 可以有轻微的自我指涉感，但保持可解释性（"只是巧合"）`,
  3: `强度注入：
- 三个板块联动：聊天、社媒、资讯内容出现相互呼应的主题
- 资讯中的新闻标题与玩家评价后果有明显（但仍可说是巧合的）关联
- 对话中NPC的措辞开始显得"意味深长"`,
  4: `极度注入：
- 所有内容都像是在直接评价玩家
- 选项措辞极度犀利（如"毁掉TA的前途"vs"毁掉自己的底线"）
- 叙事节奏加快，连续事件，不给喘息`,
}
```

---

## 7. 流式输出处理

```typescript
// src/ai/StreamHandler.ts

export async function streamNarrativeResponse(
  prompt: string,
  systemPrompt: string,
  onChunk: (partial: string) => void,
  onComplete: (full: AIResponseSchema) => void,
  onError: (err: Error) => void
) {
  const client = getAIClient()
  let accumulated = ''

  try {
    const stream = await client.messages.stream({
      model: AI_MODELS.narrative,
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    })

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        accumulated += chunk.delta.text
        onChunk(accumulated)
      }
    }

    // 流结束后验证完整JSON
    const parsed = parseAndValidateAIResponse(accumulated)
    if (parsed.success) {
      onComplete(parsed.data)
    } else {
      // 降级：使用 fallback 内容
      onComplete(getFallbackContent())
    }
  } catch (err) {
    onError(err instanceof Error ? err : new Error(String(err)))
  }
}
```

---

## 8. AI 输出验证（Zod Schema）

```typescript
// src/ai/OutputValidator.ts
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
    z.object({
      level: z.number().min(1).max(4),
      target: z.enum(['chat', 'feed', 'news']),
    }),
  ]),
})

export const NarrativeResponseSchema = z.object({
  type: z.enum(['dialogue', 'social_post', 'news', 'system_event']),
  content: z.record(z.any()),
  game_state_updates: GameStateUpdatesSchema,
  player_options: z.array(PlayerOptionSchema).min(2).max(4),
})

export function parseAndValidateAIResponse(raw: string) {
  try {
    // 提取JSON（AI有时会在JSON前后加prose）
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found in response')
    const parsed = JSON.parse(jsonMatch[0])
    return NarrativeResponseSchema.safeParse(parsed)
  } catch {
    return { success: false as const, error: new Error('Parse failed') }
  }
}
```

---

## 9. Prompt Caching 策略

利用 Anthropic Prompt Caching 减少 40-60% Token 成本：

```typescript
// 系统Prompt使用 cache_control: { type: "ephemeral" }
// 使缓存TTL为5分钟

const cachedSystemMessage = {
  role: 'user' as const,
  content: [
    {
      type: 'text' as const,
      text: buildStaticSystemPrompt(),  // 固定部分
      cache_control: { type: 'ephemeral' as const },
    },
    {
      type: 'text' as const,
      text: buildDynamicContext(),      // 动态部分（不缓存）
    },
  ],
}
```

**缓存策略分层：**
| 内容 | 缓存 | TTL | 理由 |
|------|------|-----|------|
| 游戏规则/世界观系统Prompt | ✅ | 5分钟 | 固定内容，高复用 |
| 角色性格设定 | ✅ | 5分钟 | 每局游戏相对固定 |
| 玩家模型 | ❌ | — | 每次交互后更新 |
| 最近事件 | ❌ | — | 高频变化 |

---

## 10. 错误处理与降级策略

```
AI 调用链路的五层防护（来自 GDD 10.2）：

L1: Prompt Engineering 约束（JSON格式强制要求）
L2: Zod Schema 输出验证
L3: 内容安全过滤（关键词检测）
L4: 叙事一致性检查（与当前游戏状态对比）
L5: 降级策略（src/data/fallback/ 中的预置内容库）
```

**降级触发条件：**
- AI 响应超时（>8秒）→ 使用缓存的上一条同类型内容
- Zod 验证失败 → 使用 `fallback/` 目录中对应幕的预置内容
- API 限流 →指数退避重试（最多3次），第3次失败后降级

```typescript
// src/data/fallback/chatMessages.ts 示例
export const FALLBACK_CHAT_MESSAGES: Record<ActNumber, FallbackMessage[]> = {
  1: [
    { npc: 'close_friend', text: '最近怎么样，好久没联系了', mood: 'neutral' },
    // ...
  ],
  // ...
}
```
