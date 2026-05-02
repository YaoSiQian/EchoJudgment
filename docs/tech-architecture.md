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
| **AI SDK（前端）** | Vercel AI SDK (`ai`) | 4.x | `useChat` 管理流式对话历史和消息列表；`generateObject` 直出 Zod 验证对象；提供商无关 |
| **AI SDK（Workers）** | @anthropic-ai/sdk + @ai-sdk/anthropic | latest | Workers 端调用 Anthropic；原生流式；Prompt Caching |
| **本地持久化** | Dexie.js | 4.x | IndexedDB封装；存档系统 |
| **数据验证** | Zod | 3.x | 验证所有AI输出JSON；运行时类型安全 |

### 1.2 后端

| 层级 | 选择 | 选型理由 |
|------|------|---------|
| **运行时** | Cloudflare Workers | 边缘部署；免费套餐足够；V8 隔离安全 |
| **对话状态** | Cloudflare Durable Objects | 每个游戏会话持有一个 DO 实例；持久化多轮对话历史；解决 AI 跨请求失忆 |
| **后端框架** | Hono.js | 极轻量；Workers 原生支持；TypeScript 优先 |
| **数据库** | Cloudflare D1 | 持久化 DO 状态快照；游戏进程备份；跨设备同步 |
| **前端托管** | Cloudflare Pages | 与 Workers 同平台；自动 CI/CD |

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
│   │   │   ├── XHSApp.tsx             # 单 App 架构根组件（含 XHSBottomNav）
│   │   │   ├── XHSBottomNav.tsx       # 底部 5-Tab 导航（替代原 AppSwitcher）
│   │   │   │
│   │   │   ├── home/                  # 首页（推荐 + 关注 双 Tab）
│   │   │   │   ├── HomeScreen.tsx     # 顶栏 + 推荐/关注 Tab 切换
│   │   │   │   ├── DiscoverFeed.tsx   # 推荐 Tab：瀑布流信息流
│   │   │   │   ├── FollowingFeed.tsx  # 关注 Tab：锡陵晚报 + NPC 帖子
│   │   │   │   ├── PostCard.tsx       # NPC 社媒帖子卡片
│   │   │   │   ├── PostDetail.tsx     # 帖子详情页
│   │   │   │   └── NewsPost.tsx       # 锡陵晚报帖子卡片（后果呈现）
│   │   │   │
│   │   │   └── message/               # 消息板块（原"微信模式"）
│   │   │       ├── ChatList.tsx       # 消息 Tab：会话列表
│   │   │       ├── ChatRoom.tsx       # 聊天室（/chatSub/room/single）
│   │   │       ├── MessageBubble.tsx  # 消息气泡（含回响注入点）
│   │   │       ├── EvaluationBar.tsx  # 评价按钮区（契机时滑入）
│   │   │       └── DecisionOverlay.tsx  # 抉择全屏覆盖层
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

type XHSTab = 'home' | 'note' | 'publish' | 'message' | 'profile'
type HomeTab = 'discover' | 'following'   // 推荐 | 关注（锡陵晚报）
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
VITE_API_BASE_URL=             # Cloudflare Workers 代理地址
VITE_GAME_DEBUG=false          # 开启后显示调试面板（失衡值/回响等级可视化）
```

```typescript
// vite.config.ts 关键配置
export default defineConfig({
  plugins: [react()],
})
```
