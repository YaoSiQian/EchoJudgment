# 《回响》技术文档 02 — 技术架构与项目结构

> 版本: v1.0 | 日期: 2026-05-02

---

## 1. 技术栈选型

### 1.1 最终选型表

| 层级 | 选择 | 版本 | 选型理由 |
|------|------|------|---------|
| **前端框架** | React | 19 | Concurrent 特性支持流式AI输出渲染；生态成熟 |
| **类型系统** | TypeScript | 5.x | 游戏状态的复杂类型定义必须有类型安全保障 |
| **构建工具** | Vite | 6.x | HMR极快；原生ESM；零配置 TypeScript |
| **样式方案** | Tailwind CSS v4 | 4.x | 快速实现App-like UI；v4支持CSS变量���动 |
| **手机内样式** | CSS Modules | — | PhoneFrame内部隔离，防止游戏UI样式污染 |
| **动画** | Framer Motion | 12.x | 滑入/切换动效；回响文字抖动效果 |
| **全局状态** | Zustand | 5.x | 轻量；原生TypeScript；中间件支持（persist, immer） |
| **AI调用管理** | TanStack Query | 5.x | AI请求的loading/error/retry状态管理 |
| **AI SDK** | @anthropic-ai/sdk | latest | 原生流式支持；Prompt Caching；TypeScript优先 |
| **本地持久化** | Dexie.js | 4.x | IndexedDB封装；存档系统 |
| **数据验证** | Zod | 3.x | 验证所有AI输出JSON；运行时类型安全 |

### 1.2 后端（Phase 2+）

| 层级 | 选择 | 选型理由 |
|------|------|---------|
| **运行时** | Cloudflare Workers | 边缘部署；免费套餐足够；V8隔离安全 |
| **后端框架** | Hono.js | 极轻量；Workers原生支持；TypeScript优先 |
| **数据库** | Cloudflare D1 | SQLite兼容；Workers原生绑定；无需独立服务器 |
| **前端托管** | Cloudflare Pages | 与Workers同平台；自动CI/CD |

### 1.3 Phase 0 简化策略

Phase 0（原型验证，2周）使用纯前端：
- API Key 通过 `import.meta.env.VITE_ANTHROPIC_API_KEY` 注入，`.env.local` 管理
- **安全警告**：此配置仅用于本地开发，不得部署到公网
- 存档使用 `localStorage`（Phase 1 迁移到 IndexedDB）

---

## 2. 项目目录结构

```
echo-judgment/
├── src/
│   ├── app/
│   │   ├── App.tsx                    # 根组件：布局判断（横屏/竖屏）
│   │   └── providers.tsx              # QueryClient, Zustand devtools
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── GameShell.tsx          # 横屏三栏布局容器
│   │   │   ├── MobileShell.tsx        # 竖屏自适应布局
│   │   │   ├── LeftPanel/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── StatusBar.tsx      # 自我认知/失衡值/评价信用
│   │   │   │   ├── RelationGraph.tsx  # 关系值概览
│   │   │   │   └── EvalStats.tsx      # 好评/差评统计
│   │   │   └── RightPanel/
│   │   │       ├── index.tsx
│   │   │       ├── EventLog.tsx       # 事件日志（时间线）
│   │   │       ├── EchoMonitor.tsx    # 回响层级 + 失衡值
│   │   │       └── WorldNews.tsx      # 世界动态摘要
│   │   │
│   │   ├── phone/
│   │   │   ├── PhoneFrame.tsx         # 手机外框容器（竖屏比例锁定）
│   │   │   ├── AppSwitcher.tsx        # 三App顶部Tab切换
│   │   │   │
│   │   │   ├── wechat/
│   │   │   │   ├── ChatScreen.tsx     # 会话列表
│   │   │   │   ├── ConversationView.tsx  # 单人/群聊对话
│   │   │   │   ├── MessageBubble.tsx  # 消息气泡（含回响注入点）
│   │   │   │   ├── EvaluationBar.tsx  # 评价按钮区（契机时滑入）
│   │   │   │   └── DecisionOverlay.tsx  # 抉择全屏覆盖层
│   │   │   │
│   │   │   ├── xiaohongshu/
│   │   │   │   ├── FeedScreen.tsx     # 信息流（瀑布流）
│   │   │   │   ├── PostCard.tsx       # 帖子卡片
│   │   │   │   └── PostDetail.tsx     # 帖子详情页
│   │   │   │
│   │   │   └── toutiao/
│   │   │       ├── NewsScreen.tsx     # 新闻列表
│   │   │       ├── NewsCard.tsx       # 新闻卡片
│   │   │       └── NewsDetail.tsx     # 新闻详情页
│   │   │
│   │   └── shared/
│   │       ├── StarRating.tsx         # 五星评价组件
│   │       ├── ScoreSlider.tsx        # 十分制评价组件
│   │       ├── Typewriter.tsx         # 打字机文字动效
│   │       └── EchoText.tsx           # 回响文字异常渲染组件
│   │
│   ├── engine/                        # 纯逻辑，无UI依赖
│   │   ├── EvaluationEngine.ts        # 评价后果计算
│   │   ├── EchoEngine.ts              # 失衡值管理 + 回响等级
│   │   ├── ConsequenceEngine.ts       # 后果可见性分配
│   │   ├── NarrativeEngine.ts         # 叙事推进 + 幕节点控制
│   │   └── PlayerModel.ts             # 玩家心理模型更新
│   │
│   ├── ai/
│   │   ├── client.ts                  # Anthropic SDK 单例
│   │   ├── PromptBuilder.ts           # 各场景Prompt构建
│   │   ├── StreamHandler.ts           # SSE流式响应解析
│   │   ├── ContextManager.ts          # 上下文窗口压缩管理
│   │   ├── OutputValidator.ts         # Zod schema验证AI输出
│   │   └── prompts/
│   │       ├── narrative.ts           # 叙事生成Prompt模板
│   │       ├── character.ts           # 角色对话Prompt模板
│   │       ├── echo.ts                # 回响注入Prompt模板
│   │       └── consequence.ts         # 后果计算Prompt模板
│   │
│   ├── store/
│   │   ├── gameStore.ts               # 游戏进程状态（幕/场景/时间）
│   │   ├── playerStore.ts             # 玩家模型（评价历史/倾向）
│   │   ├── npcStore.ts                # 所有NPC状态
│   │   ├── uiStore.ts                 # UI状态（当前App/动画锁等）
│   │   └── echoStore.ts               # 失衡值/回响等级
│   │
│   ├── data/
│   │   ├── characterTemplates.ts      # 5类NPC模板
│   │   ├── echoPatterns.ts            # 回响文本变异模式库
│   │   └── fallback/                  # AI降级时的预置内容
│   │       ├── chatMessages.ts
│   │       ├── feedPosts.ts
│   │       └── newsArticles.ts
│   │
│   ├── hooks/
│   │   ├── useEvaluation.ts           # 评价操作 Hook
│   │   ├── useEchoLevel.ts            # 回响等级订阅
│   │   ├── useNarrativeStream.ts      # AI叙事流式 Hook
│   │   └── useInteractionTracking.ts  # 过程数据追踪 Hook
│   │
│   ├── utils/
│   │   ├── timeUtils.ts               # 游戏内时间系统
│   │   └── textUtils.ts               # 文本处理（回响注入辅助）
│   │
│   └── types/
│       └── index.ts                   # 所有共享TypeScript类型
│
├── public/
│   └── assets/
│       └── phone-bezel.svg            # 手机外框SVG（可选）
│
├── .env.local                         # VITE_ANTHROPIC_API_KEY（不提交）
├── .env.example                       # 环境变量模板
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 3. 数据流架构

```
用户交互（点击评价/选择抉择）
    │
    ▼
useEvaluation Hook（记录过程时间戳）
    │
    ├──► EvaluationEngine.ts（计算后果权重）
    │         │
    │         ▼
    │    ConsequenceEngine.ts（分配可见性）
    │         │
    │         ▼
    │    EchoEngine.ts（更新失衡值）
    │
    ├──► playerStore（更新玩家模型）
    │
    └──► ai/client.ts（触发后续叙事生成）
              │
              ▼（流式响应）
         StreamHandler.ts（解析JSON chunks）
              │
              ├──► OutputValidator.ts（Zod验证）
              │         │ 验证失败
              │         ▼
              │    fallback/（降级内容）
              │
              ▼（验证通过）
         gameStore + npcStore 更新
              │
              ▼
         React 重新渲���（含回响注入）
```

---

## 4. 状态管理策略

### 4.1 Store 分工原则

| Store | 持久化 | 说明 |
|-------|--------|------|
| `gameStore` | ✅ IndexedDB | 游戏进程，跨会话保存 |
| `playerStore` | ✅ IndexedDB | 玩家模型，跨会话保存 |
| `npcStore` | ✅ IndexedDB | NPC状态，跨会话保存 |
| `echoStore` | ✅ IndexedDB | 失衡值/回响等级 |
| `uiStore` | ❌ 内存 | 纯UI状态（当前App模式、动画锁） |

### 4.2 关键状态接口预览

```typescript
// types/index.ts 的核心类型

type AppMode = 'wechat' | 'xiaohongshu' | 'toutiao'
type ActNumber = 1 | 2 | 3 | 4
type EchoLevel = 0 | 1 | 2 | 3 | 4
type EvalType = 'binary' | 'star5' | 'score10'
type EvalDirection = 'positive' | 'negative'

interface GameState {
  currentAct: ActNumber
  currentScene: string
  gameTime: GameTime           // 游戏内时间（天数+时间）
  imbalanceValue: number       // 0-200
  echoLevel: EchoLevel
  isEchoActive: boolean
}

interface PlayerModel {
  evaluationTendency: {
    positiveRatio: number      // 0-1
    negativeRatio: number
    neutralRatio: number
    extremeRatio: number       // 二分评价中的极端比例
  }
  moralSensitivity: number     // 0-1，由抉择行为推断
  socialStyle: 'active' | 'passive' | 'defensive' | 'aggressive'
  stressTolerance: number      // 0-1，由悬停时长等过程数据推断
  suspicionIndex: number       // 0-1，第三幕猜疑程度
  evaluationHistory: EvaluationRecord[]
  decisionHistory: DecisionRecord[]
  interactionMetrics: InteractionMetrics  // 过程数据
}

interface InteractionMetrics {
  avgHoverDuration: number     // 平均在选项上悬停时长（ms）
  cancelCount: number          // 打开评价面板后取消的次数
  fastDecisionCount: number    // <500ms 快速决策次数
  slowDecisionCount: number    // >5000ms 犹豫决策次数
}

interface NPCState {
  id: string
  name: string
  archetype: 'close_friend' | 'competitor' | 'authority' | 'stranger' | 'romantic'
  relationshipValue: number    // -100 ~ +100
  isEvaluator: boolean | null  // null=未揭示
  currentMood: string
  awarenessOfPlayerAbility: number  // 0-1，对主角能力的了解程度
  recentEvents: GameEvent[]
}
```

---

## 5. 环境配置

```bash
# .env.example
VITE_ANTHROPIC_API_KEY=        # Phase 0: 直接配置（仅本地开发）
VITE_API_BASE_URL=             # Phase 2+: Workers代理地址
VITE_GAME_DEBUG=false          # 开启后显示调试面板（失衡值/回响等级可视化）
```

```typescript
// vite.config.ts 关键配置
export default defineConfig({
  plugins: [react()],
  define: {
    // 防止 API Key 意外泄露到生产构建
    'import.meta.env.VITE_ANTHROPIC_API_KEY': JSON.stringify(
      process.env.VITE_ANTHROPIC_API_KEY
    )
  }
})
```
