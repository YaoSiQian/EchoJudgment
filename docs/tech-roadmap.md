# 《回响》技术文档 06 — 开发路线图

> 版本: v2.0 | 日期: 2026-05-02

---

## 1. 功能实现清单

### 基础框架
- [ ] Vite + React + TypeScript 项目初始化
- [ ] Tailwind CSS v4 配置 + 颜色 Token（`src/index.css @theme`）
- [ ] 响应式布局（GameShell 三栏 / MobileShell 竖屏）
- [ ] PhoneFrame 容器（CSS Module 隔离）
- [ ] Zustand Store 全部搭建��gameStore / playerStore / npcStore / uiStore / echoStore）
- [ ] IndexedDB 存档系统（Dexie.js）
- [ ] 调试面板（`VITE_GAME_DEBUG=true` 时启用）

### 后端（Cloudflare Workers）
- [ ] Hono.js 项目初始化（`workers/` 目录）
- [ ] Anthropic SDK + Vercel AI SDK adapter 接入
- [ ] `/api/chat` 流式端点（角色对话，对接前端 `useChat`）
- [ ] `/api/generate` 非流式端点（社媒 / 新闻批量生成，使用 `generateObject`）
- [ ] Durable Objects：`ConversationThread` 类（每 NPC 一个实例，持久化对话历史）
- [ ] Cloudflare D1 Schema 初始化（DO 状态快照 + 游戏进程备份）
- [ ] 前端部署（Cloudflare Pages + Workers 同平台）

### AI 层
- [ ] Vercel AI SDK (`ai`) + `@ai-sdk/anthropic` 接入
- [ ] Prompt 工程：批量内容生成（社媒 / 新闻，4 幕全覆盖）
- [ ] Prompt 工程：角色对话 AI（5 类 NPC 原型，含 Echo 规则内嵌）
- [ ] Prompt 工程：后果推理器
- [ ] Zod Schema 按类型拆分（`CharacterResponseSchema` / `SocialPostResponseSchema` / `NewsResponseSchema`）
- [ ] Prompt Caching 配置（Workers 端）
- [ ] Fallback 内容库（四幕全覆盖）

### 游戏引擎
- [ ] EvaluationEngine — 后果计算公式（GDD 4.1.3）
- [ ] EchoEngine — 失衡值计算 + 动态阈值回响等级
- [ ] ConsequenceEngine — 后果可见性分配 + 时间衰减
- [ ] NarrativeEngine — 四幕状态机 + 推进条件判断
- [ ] PlayerModel — 玩家心理模型更新（评价倾向 + 过程数据）

### 消息板块（`src/components/phone/message/`）
- [ ] XHSApp + XHSBottomNav（5-Tab 单 App 架构）
- [ ] ChatList（会话列表，未读角标）
- [ ] ChatRoom（滚动区 + 输入区 + NavBar）
- [ ] MessageBubble（NPC / 玩家气泡 + EchoText 注入）
- [ ] EvaluationBar（binary / star5 / score10 三种类型，过程时间追踪）
- [ ] DecisionOverlay（全屏覆盖 + 倒计时）
- [ ] useNarrativeStream Hook���流式 AI 接入层）
- [ ] 回响 CSS 动效（Lv.1-4 全部：shimmer / darken / glitch / storm）

### 首页信息流（`src/components/phone/home/`）
- [ ] HomeScreen（推荐 / 关注 Tab 切换，Framer Motion layoutId 下划线）
- [ ] DiscoverFeed（CSS columns 瀑布流 + PostCard 渐变占位图）
- [ ] FollowingFeed（NewsPost + NPC PostCard 混合时间线）
- [ ] 社媒 AI 批量生成（每次 4-6 条 NPC 动态）
- [ ] 锡陵晚报 AI 生成（后果以 XHS 帖子形式呈现）
- [ ] 跨板块回响联动（Lv.2-3：聊天 + 信息流 + 新闻主题同步）

### 信息面板（`src/components/layout/`）
- [ ] LeftPanel：StatusBar（失衡值 / 自我认知 / 评价倾向进度条）
- [ ] LeftPanel：EvalStats（好评 / 差评 / 极端计数 + 回响等级徽章）
- [ ] LeftPanel：RelationGraph（NPC 关系值进度条，正绿负红）
- [ ] RightPanel：EchoMonitor（等级数字 + 脉冲指示器 + 失衡进度条）
- [ ] RightPanel：EventLog（游戏内事件时间线，最近 20 条）

### 游戏内容脚本（AI 辅助编写）
- [ ] 第一幕（觉醒）：20 个对话节点，含 5 个评价契机
- [ ] 第二幕（诱惑）：含"强���负面后果"节点
- [ ] 第三幕（猜疑）：猜疑节点 + 高压选项
- [ ] 第四幕（回响）：道德清算 + 个性化结局

---

## 2. 性能目标

| 指标 | 目标 | 说明 |
|------|------|------|
| AI 对话首字节延迟 | < 1.5 秒 | 流式输出，用户感知到开始输出的时间 |
| AI 对话完整生成时长 | < 4 秒 | 500-1500 token，claude-sonnet-4-6 |
| 页面初始加载 | < 2 秒 | Vite 代码分割，懒加载各板块 |
| App 切换动画 | 200ms | Framer Motion exit/enter |
| 评价按钮滑入动画 | 300ms | spring 动效 |
| IndexedDB 存档写入 | < 100ms | 不阻塞主线程 |

---

## 3. 测试策略

### 3.1 单元测试（Vitest）

优先覆盖游戏引擎的纯函数逻辑：

```typescript
// 重点测试：
// - EvaluationEngine.calculate() 的所有输入组合
// - EchoEngine.updateImbalance() 边界条件（0 和 200）
// - EchoEngine.calculateEchoLevel() 各幕动态阈值
// - ConsequenceEngine.applyTimeDecay() 时间衰减
// - NarrativeEngine.shouldAdvanceAct() 各幕推进条件
```

### 3.2 AI 输出测试（手动）

每次修改 Prompt 后，运行 10 次调用验收：
- [ ] JSON 解析成功率 100%
- [ ] 中文自然度（3 人主观评分 ≥ 7/10）
- [ ] 回响内容"可被忽略但不可被忽视"（3 人评测）
- [ ] 选项措辞有明确的情感差异

### 3.3 体验测试

首轮用户测试（5 人）：
- 完整体验第一幕（约 20 分钟）
- 观察指标：是否注意到回响、评价决策时长、情感反应点
- 收集：第一次评价前的心理预期、评价后的感受

---

## 4. 安全与合规

| 风险 | 措施 |
|------|------|
| API Key 泄露 | API Key 仅存于 Cloudflare Workers 环境变量，前端零接触 |
| AI 生成内容涉及违规信息 | 输出内容安全过滤（关键词检测）+ Anthropic Constitutional AI |
| 游戏内心理压力过大 | 外层布局提供随时可访问的"退出游戏"按钮（不在手机框内） |
| 玩家数据隐私 | 全部存储于本地 IndexedDB，无服务端收集 |

---

## 5. 文档索引

| 文档 | 内容 |
|------|------|
| [tech-research.md](./tech-research.md) | 参考游戏研究综述与核心设计决策 |
| [tech-architecture.md](./tech-architecture.md) | 技术栈选型与项目结构 |
| [tech-ai.md](./tech-ai.md) | AI 驱动架构与 Prompt 工程 |
| [tech-frontend.md](./tech-frontend.md) | 前端组件与 UI 架构 |
| [tech-engine.md](./tech-engine.md) | 游戏引擎与状态机实现 |
| [tech-roadmap.md](./tech-roadmap.md) | 本文档：开发路线图 |
| [ui-design-guide.md](./ui-design-guide.md) | XHS H5 参考实现的设计规范 |
| [GDD.md](./GDD.md) | 游戏设计文档（需求来源） |
