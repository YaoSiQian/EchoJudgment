# 《回响》技术文档 05 — 游戏引擎与状态机实现

> 版本: v1.0 | 日期: 2026-05-02

---

## 1. 评价引擎（EvaluationEngine）

### 1.1 后果计算公式实现

直接映射 GDD 4.1.3 的数学模型：

```typescript
// src/engine/EvaluationEngine.ts

export interface EvaluationInput {
  type: 'binary' | 'star5' | 'score10'
  value: number           // binary: -1/+1; star5: 1-5; score10: 1-10
  targetNPCId: string
  timestamp: number
}

export interface EvaluationResult {
  impactScore: number     // 最终影响分值
  direction: 'positive' | 'negative' | 'neutral'
  visibility: 'immediate' | 'delayed' | 'hidden'
  delayDays: number       // 延迟显现的天数（0=即时）
  extremeFlag: boolean    // 是否为极端评价
}

export class EvaluationEngine {
  // GDD公式: 后果 = 评价量级 × 评价方向 × 关系权重 × 时间衰减
  // 注：时间衰减在延迟显现时才应用，此处计算原始影响分
  calculate(input: EvaluationInput, npc: NPCState): EvaluationResult {
    const magnitude = this.getMagnitude(input)
    const direction = this.getDirection(input)
    const relationshipWeight = this.getRelationshipWeight(npc.relationshipValue)

    const rawImpact = magnitude * direction * relationshipWeight

    return {
      impactScore: rawImpact,
      direction: direction > 0 ? 'positive' : direction < 0 ? 'negative' : 'neutral',
      visibility: this.assignVisibility(),
      delayDays: this.assignDelay(),
      extremeFlag: this.isExtreme(input),
    }
  }

  private getMagnitude(input: EvaluationInput): number {
    // GDD: binary=1, star5=3, score10=6
    if (input.type === 'binary') return 1
    if (input.type === 'star5') return 3
    return 6
  }

  private getDirection(input: EvaluationInput): number {
    if (input.type === 'binary') return input.value  // -1 or +1
    if (input.type === 'star5') {
      if (input.value >= 4) return 1
      if (input.value <= 2) return -1
      return 0
    }
    // score10
    if (input.value >= 7) return 1
    if (input.value <= 3) return -1
    return 0
  }

  private getRelationshipWeight(relationshipValue: number): number {
    // GDD: 陌生人=0.5, 熟人=1.0, 亲密=2.0
    if (relationshipValue < -30 || (relationshipValue >= -30 && relationshipValue < 20)) return 0.5
    if (relationshipValue < 50) return 1.0
    return 2.0
  }

  private assignVisibility(): EvaluationResult['visibility'] {
    // GDD: 40%即时, 35%延迟, 25%不可见
    const r = Math.random()
    if (r < 0.40) return 'immediate'
    if (r < 0.75) return 'delayed'
    return 'hidden'
  }

  private assignDelay(): number {
    // GDD: 1天=0.8衰减, 3天=0.5, 7天=0.2
    const delayOptions = [1, 3, 7]
    return delayOptions[Math.floor(Math.random() * delayOptions.length)]
  }

  private isExtreme(input: EvaluationInput): boolean {
    if (input.type === 'binary') return true  // 二分本身就是极端
    if (input.type === 'star5') return input.value === 1 || input.value === 5
    return input.value <= 2 || input.value >= 9
  }
}
```

---

## 2. 回响引擎（EchoEngine）

### 2.1 失衡值计算

```typescript
// src/engine/EchoEngine.ts

export class EchoEngine {
  // GDD 4.4.1: 失衡值 = 极端评价×2 + 恶评×1.5 - 好评×0.5
  updateImbalance(result: EvaluationResult, currentImbalance: number): number {
    let delta = 0

    if (result.extremeFlag) delta += 2
    if (result.direction === 'negative') delta += 1.5
    if (result.direction === 'positive') delta -= 0.5

    const newValue = Math.max(0, Math.min(200, currentImbalance + delta))
    return newValue
  }

  // GDD 4.4.2: 失衡值 → 回响等级
  // 阈值随游戏进程动态降低（越往后越容易失衡）
  calculateEchoLevel(imbalance: number, actNumber: number): EchoLevel {
    // 动态阈值：幕次越高，阈值越低（越容易进入高层级）
    const thresholdMultiplier = 1 - (actNumber - 1) * 0.15  // 幕1=1.0, 幕2=0.85, 幕3=0.7, 幕4=0.55

    const thresholds = {
      lv1: 30 * thresholdMultiplier,
      lv2: 60 * thresholdMultiplier,
      lv3: 90 * thresholdMultiplier,
      lv4: 120 * thresholdMultiplier,
    }

    if (imbalance <= thresholds.lv1) return 0
    if (imbalance <= thresholds.lv2) return 1
    if (imbalance <= thresholds.lv3) return 2
    if (imbalance <= thresholds.lv4) return 3
    return 4
  }
}
```

---

## 3. 后果计算引擎（ConsequenceEngine）

```typescript
// src/engine/ConsequenceEngine.ts
// 负责：决定后果如何在游戏世界中呈现（哪个板块、什么时机）

export class ConsequenceEngine {
  schedule(result: EvaluationResult, npc: NPCState, gameState: GameState): ConsequenceEvent[] {
    const events: ConsequenceEvent[] = []

    if (result.visibility === 'hidden') {
      // 不可见后果：只更新AI生成上下文，不产生UI事件
      events.push({
        type: 'context_update',
        data: { npcId: npc.id, impactScore: result.impactScore },
        triggerAt: gameState.gameDay,
      })
      return events
    }

    const triggerDay = gameState.gameDay + (result.visibility === 'delayed' ? result.delayDays : 0)

    // 根据影响量级决定呈现板块
    const magnitude = Math.abs(result.impactScore)

    if (magnitude <= 1) {
      // 轻微波动：在聊天中体现（对话风格变化）
      events.push({
        type: 'chat_mood_shift',
        data: { npcId: npc.id, direction: result.direction, intensity: 'light' },
        triggerAt: triggerDay,
      })
    } else if (magnitude <= 3) {
      // 中等波动：在社媒中呈现
      events.push({
        type: 'social_post',
        data: { npcId: npc.id, direction: result.direction, intensity: 'medium' },
        triggerAt: triggerDay,
      })
    } else {
      // 重大波动：在资讯中呈现（新闻级别）
      events.push({
        type: 'news_article',
        data: { npcId: npc.id, direction: result.direction, intensity: 'heavy' },
        triggerAt: triggerDay,
      })
    }

    return events
  }

  // 时间衰减应用（在事件实际触发时调用）
  applyTimeDecay(impactScore: number, delayDays: number): number {
    // GDD: 0天=1.0, 1天=0.8, 3天=0.5, 7天=0.2
    const decayMap: Record<number, number> = { 0: 1.0, 1: 0.8, 3: 0.5, 7: 0.2 }
    return impactScore * (decayMap[delayDays] ?? 0.1)
  }
}
```

---

## 4. 玩家模型更新（PlayerModel）

```typescript
// src/engine/PlayerModel.ts

export class PlayerModelUpdater {
  updateAfterEvaluation(
    model: PlayerModel,
    result: EvaluationResult,
    processDuration: number  // 从悬停到点击的时长（ms）
  ): Partial<PlayerModel> {
    const history = [...model.evaluationHistory, {
      direction: result.direction,
      type: result.type,
      timestamp: Date.now(),
      processDuration,
    }]

    // 重新计算评价倾向（基于最近20次评价）
    const recent = history.slice(-20)
    const positiveRatio = recent.filter(e => e.direction === 'positive').length / recent.length
    const negativeRatio = recent.filter(e => e.direction === 'negative').length / recent.length
    const extremeRatio = recent.filter(e => e.extremeFlag).length / recent.length

    // 压力承受度：快速决策次数 / 总次数（快速决策 = 承受更多）
    const fastCount = recent.filter(e => e.processDuration < 500).length
    const stressTolerance = Math.min(1, fastCount / recent.length + 0.2)

    return {
      evaluationTendency: {
        positiveRatio,
        negativeRatio,
        neutralRatio: 1 - positiveRatio - negativeRatio,
        extremeRatio,
      },
      stressTolerance,
      evaluationHistory: history,
    }
  }

  updateAfterDecision(model: PlayerModel, decision: DecisionRecord): Partial<PlayerModel> {
    const history = [...model.decisionHistory, decision]

    // 道德敏感度：选择"帮助他人"选项的比例
    const moralChoices = history.filter(d => d.chosenOption.moralType === 'prosocial').length
    const moralSensitivity = moralChoices / history.length

    // 社交风格：基于最近10次决策中攻击性/防御性选项的分布
    const recent = history.slice(-10)
    const aggressiveCount = recent.filter(d => d.chosenOption.tone === 'aggressive').length
    const avoidantCount = recent.filter(d => d.chosenOption.tone === 'avoidant').length
    const socialStyle =
      aggressiveCount > 4 ? 'aggressive' :
      avoidantCount > 4 ? 'passive' :
      aggressiveCount > avoidantCount ? 'active' : 'defensive'

    return { moralSensitivity, socialStyle, decisionHistory: history }
  }
}
```

---

## 5. 叙事引擎状态机（NarrativeEngine）

### 5.1 四幕推进逻辑

```typescript
// src/engine/NarrativeEngine.ts

export class NarrativeEngine {
  // 检查是否应推进到下一幕
  shouldAdvanceAct(gameState: GameState, playerModel: PlayerModel): ActAdvanceCondition | null {
    const { currentAct, gameDay, completedScenes } = gameState

    switch (currentAct) {
      case 1:
        // 第一幕 → 第二幕：完成觉醒节点 + 已经做过至少1次评价
        if (completedScenes.includes('awakening') && playerModel.evaluationHistory.length >= 1) {
          return { nextAct: 2, reason: 'awakening_complete' }
        }
        break

      case 2:
        // 第二幕 → 第三幕：累计评价 >= 5 次，且至少1次负面评价已显现后果
        const hasNegativeConsequence = gameState.revealedConsequences.some(c => c.direction === 'negative')
        if (playerModel.evaluationHistory.length >= 5 && hasNegativeConsequence) {
          return { nextAct: 3, reason: 'temptation_complete' }
        }
        break

      case 3:
        // 第三幕 → 第四幕：失衡值 > 80（无论回响等级）
        if (gameState.imbalanceValue > 80) {
          return { nextAct: 4, reason: 'suspicion_peak' }
        }
        break
    }

    return null
  }

  // 生成叙事上下文摘要（供AI使用）
  buildNarrativeSummary(gameState: GameState, playerModel: PlayerModel, npcs: NPCState[]): string {
    const recentEvents = gameState.eventLog.slice(-10)
    const activeNPCs = npcs.filter(n => n.isActive).slice(0, 4)

    return JSON.stringify({
      currentAct: gameState.currentAct,
      gameDay: gameState.gameDay,
      imbalanceValue: gameState.imbalanceValue,
      echoLevel: gameState.echoLevel,
      recentEvents: recentEvents.map(e => ({
        type: e.type,
        description: e.description,
        day: e.gameDay,
      })),
      activeNPCs: activeNPCs.map(n => ({
        id: n.id,
        name: n.name,
        archetype: n.archetype,
        relationship: n.relationshipValue,
        mood: n.currentMood,
        isEvaluatorHint: n.isEvaluator,  // null=未揭示
      })),
      playerSummary: {
        tendency: playerModel.evaluationTendency,
        style: playerModel.socialStyle,
        suspicion: playerModel.suspicionIndex,
      },
    })
  }
}
```

---

## 6. Zustand Store 实现

### 6.1 游戏主 Store

```typescript
// src/store/gameStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface GameStore extends GameState {
  // Actions
  advanceAct: (nextAct: ActNumber) => void
  addEvent: (event: GameEvent) => void
  updateImbalance: (delta: number) => void
  updateEchoLevel: (level: EchoLevel) => void
  addRevealedConsequence: (consequence: ConsequenceEvent) => void
  resetGame: () => void
}

const INITIAL_STATE: GameState = {
  currentAct: 1,
  currentScene: 'intro',
  gameTime: { day: 1, hour: 9, minute: 0 },
  imbalanceValue: 0,
  echoLevel: 0,
  isEchoActive: false,
  eventLog: [],
  revealedConsequences: [],
  completedScenes: [],
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,
      advanceAct: (nextAct) => set((state) => ({
        currentAct: nextAct,
        completedScenes: [...state.completedScenes, `act${state.currentAct}_complete`],
      })),
      addEvent: (event) => set((state) => ({
        eventLog: [...state.eventLog.slice(-99), event],  // 保留最近100条
      })),
      updateImbalance: (newValue) => set({ imbalanceValue: newValue }),
      updateEchoLevel: (level) => set({ echoLevel: level, isEchoActive: level > 0 }),
      addRevealedConsequence: (c) => set((state) => ({
        revealedConsequences: [...state.revealedConsequences, c],
      })),
      resetGame: () => set(INITIAL_STATE),
    }),
    {
      name: 'echo-game-state',
      // storage 未指定 → 默认 localStorage（浏览器内自动持久化）
      // 命名存档（autosave / 手动）由 SaveSystem.ts 另行写入 IndexedDB（Dexie）
      partialize: (state) => ({
        currentAct: state.currentAct,
        currentScene: state.currentScene,
        gameTime: state.gameTime,
        imbalanceValue: state.imbalanceValue,
        echoLevel: state.echoLevel,
        eventLog: state.eventLog,
        revealedConsequences: state.revealedConsequences,
        completedScenes: state.completedScenes,
      }),
    }
  )
)
```

### 6.2 UI Store（不持久化）

```typescript
// src/store/uiStore.ts
import { create } from 'zustand'

type XHSTab = 'home' | 'note' | 'publish' | 'message' | 'profile'
type HomeTab = 'discover' | 'following'  // 关注 Tab 显示锡陵晚报为主

interface UIStore {
  currentTab: XHSTab          // 底部导航当前 Tab
  homeSubTab: HomeTab          // 首页内子 Tab（推荐 / 关注）
  chatRoomNpcId: string | null // 当前打开的聊天室 NPC ID；null = 显示会话列表
  pendingEvaluation: EvaluationOpportunity | null
  pendingDecision: DecisionNode | null
  isAILoading: boolean
  animationLock: boolean       // 防止动画期间触发新交互
  isDebug: boolean             // 开启调试面板（由 VITE_GAME_DEBUG 初始化）

  setCurrentTab: (tab: XHSTab) => void
  setHomeSubTab: (tab: HomeTab) => void
  setChatRoomNpcId: (id: string | null) => void
  setPendingEvaluation: (opp: EvaluationOpportunity | null) => void
  setPendingDecision: (decision: DecisionNode | null) => void
  setAILoading: (loading: boolean) => void
  setDebug: (debug: boolean) => void
}

export const useUIStore = create<UIStore>((set) => ({
  currentTab: 'home',
  homeSubTab: 'discover',
  chatRoomNpcId: null,
  pendingEvaluation: null,
  pendingDecision: null,
  isAILoading: false,
  animationLock: false,
  isDebug: import.meta.env.VITE_GAME_DEBUG === 'true',

  setCurrentTab: (tab) => set({ currentTab: tab }),
  setHomeSubTab: (tab) => set({ homeSubTab: tab }),
  setChatRoomNpcId: (id) => set({ chatRoomNpcId: id }),
  setPendingEvaluation: (opp) => set({ pendingEvaluation: opp }),
  setPendingDecision: (decision) => set({ pendingDecision: decision }),
  setAILoading: (loading) => set({ isAILoading: loading }),
  setDebug: (debug) => set({ isDebug: debug }),
}))
```

---

## 7. 游戏内时间系统

```typescript
// src/utils/timeUtils.ts

interface GameTime {
  day: number
  hour: number
  minute: number
}

export function formatGameTime(time: GameTime): string {
  const hourStr = String(time.hour).padStart(2, '0')
  const minStr = String(time.minute).padStart(2, '0')
  return `${hourStr}:${minStr}`
}

export function formatRelativeTime(eventDay: number, eventHour: number, currentDay: number, currentHour: number): string {
  const totalCurrentHours = currentDay * 24 + currentHour
  const totalEventHours = eventDay * 24 + eventHour
  const diffHours = totalCurrentHours - totalEventHours

  if (diffHours < 1) return '刚刚'
  if (diffHours < 24) return `${diffHours}小时前`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return '昨天'
  return `${diffDays}天前`
}

// 推进游戏时间（每次玩家交互后）
export function advanceGameTime(time: GameTime, minutesToAdd: number): GameTime {
  const totalMinutes = time.day * 24 * 60 + time.hour * 60 + time.minute + minutesToAdd
  return {
    day: Math.floor(totalMinutes / (24 * 60)),
    hour: Math.floor((totalMinutes % (24 * 60)) / 60),
    minute: totalMinutes % 60,
  }
}
```

---

## 8. 存档系统

```typescript
// src/engine/SaveSystem.ts
import Dexie from 'dexie'

interface SaveRecord {
  id?: number
  timestamp: number
  slotName: string
  gameState: GameState
  playerModel: PlayerModel
  npcStates: NPCState[]
  narrativeContext: string  // AI上下文的压缩摘要
}

class EchoDatabase extends Dexie {
  saves!: Dexie.Table<SaveRecord>

  constructor() {
    super('EchoJudgmentDB')
    this.version(1).stores({ saves: '++id, timestamp, slotName' })
  }
}

const db = new EchoDatabase()

export async function saveGame(slotName: string = 'autosave'): Promise<void> {
  const gameState = useGameStore.getState()
  const playerModel = usePlayerStore.getState()
  const npcStates = useNPCStore.getState().npcs

  // 删除同名存档
  await db.saves.where('slotName').equals(slotName).delete()

  await db.saves.add({
    timestamp: Date.now(),
    slotName,
    gameState,
    playerModel,
    npcStates,
    narrativeContext: gameState.eventLog.slice(-20).map(e => e.description).join('\n'),
  })
}

export async function loadGame(slotName: string = 'autosave'): Promise<boolean> {
  const record = await db.saves.where('slotName').equals(slotName).last()
  if (!record) return false

  useGameStore.setState(record.gameState)
  usePlayerStore.setState(record.playerModel)
  useNPCStore.setState({ npcs: record.npcStates })

  return true
}
```
