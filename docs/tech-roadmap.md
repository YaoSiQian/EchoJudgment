# 《回响》技术文档 06 — 开发路线图与 MVP 定义

> 版本: v1.0 | 日期: 2026-05-02

---

## 1. MVP 定义（最小可玩版本）

**MVP 标准**：玩家能够体验完整的「评价→后果→回响」核心循环至少3次，历时约20分钟。

### MVP 必须包含

- [ ] 横屏三栏布局（左面板 + 手机框 + 右面板）
- [ ] 微信模式：1对1聊天，支持打字机动效
- [ ] 评价按钮区（二分评价 + 五星评价）
- [ ] 失衡值追踪 + Lv.1 回响注入（文字涟漪）
- [ ] 至少2个NPC，关系值影响对话基调
- [ ] AI对话生成（流式）+ fallback降级
- [ ] 第一幕完整流程（觉醒）

### MVP 可推迟

- 社媒模式（小红书）
- 资讯模式（今日头条）
- Lv.2+ 回响效果
- 竖屏自适应
- 存档系统（IndexedDB）
- 右侧信息面板

---

## 2. 开发 Phase 规划

### Phase 0：原型验证（2周）

**目标**：验证AI调用链路可行性，不涉及游戏UI

| 任务 | 说明 | 优先级 |
|------|------|--------|
| Vite + React + TypeScript 项目初始化 | 配置 Tailwind、路径别名、环境变量 | P0 |
| Anthropic SDK 接入 + 流式输出测试 | 验证中文对话质量、JSON输出稳定性 | P0 |
| Prompt Engineering 验证 | 测试叙事生成、角色对话、回响注入三类Prompt效果 | P0 |
| Zod Schema 验证覆盖率 | 确认AI输出可被可靠解析 | P1 |
| Fallback 内容库建立（第一幕） | 编写20条备用对话，3条备用动态，5条备用新闻 | P1 |

**验收标准**：在控制台能稳定生成10轮对话，JSON解析失败率 < 5%

---

### Phase 1：核心骨架（4周）

**目标**：可运行的游戏框架，但内容简单

| 任务 | 说明 | 预估天数 |
|------|------|---------|
| GameShell（三栏布局） | 响应式判断、左右面板骨架 | 2天 |
| PhoneFrame 容器 | 竖屏比例、CSS Module隔离 | 2天 |
| Zustand Store 全部搭建 | gameStore/playerStore/npcStore/uiStore/echoStore | 3天 |
| EvaluationEngine 实现 | 后果计算、失衡值更新 | 2天 |
| EchoEngine 实现 | 等级计算、动态阈值 | 1天 |
| NarrativeEngine 状态机 | 幕推进条件判断 | 2天 |
| 基础存档（localStorage，Phase 0版） | 用于开发调试 | 1天 |
| 调试面板（VITE_GAME_DEBUG） | 显示失衡值/回响等级/玩家模型 | 1天 |

---

### Phase 2：主板块 — 消息板块（4周）

**目标**：完整的聊天体验，含评价和回响

| 任务 | 说明 | 预估天数 |
|------|------|---------|
| XHSBottomNav + XHSApp 架构 | 单 App 5-Tab 底部导航，替代原 AppSwitcher | 2天 |
| ChatList（会话列表） | 消息 Tab 首屏，NPC 列表 + 未读角标 | 1天 |
| ChatRoom（/chatSub/room/single） | 消息滚动区、时间戳、进入/退出动画 | 2天 |
| MessageBubble（含EchoText） | XHS 私聊气泡风格（浅粉 #FFE8EC），回响文字注入 | 3天 |
| EvaluationBar（滑入/滑出动效） | 三种评价类型，过程时间追踪 | 3天 |
| DecisionOverlay（抉择覆盖层） | 全屏覆盖、选项按钮 | 2天 |
| useNarrativeStream Hook | AI流式对话生成的React接入层 | 3天 |
| 第一幕内容脚本（AI辅助） | 设计20个对话节点，含评价契机 | 4天 |
| 回响CSS动效（Lv.1-2） | echo-lv1（字距）、echo-lv2（词语加深） | 2天 |

---

### Phase 3：主板块 — 首页信息流（3周）

**目标**：首页推荐（DiscoverFeed）+ 关注/锡陵晚报（FollowingFeed）可用

| 任务 | 说明 | 预估天数 |
|------|------|---------|
| HomeScreen + 推荐/关注 Tab 切换 | 顶栏设计，子 Tab 动画 | 1天 |
| DiscoverFeed（瀑布流） | CSS columns 实现、PostCard 渐变占位图 | 3天 |
| 社媒AI生成 + 批量调用 | 一次生成4-6条 NPC 动态 | 2天 |
| FollowingFeed + NewsPost（锡陵晚报卡片） | 替代今日头条；深色新闻配图风格 | 2天 |
| 锡陵晚报AI生成 | 后果相关新闻以 XHS 帖子形式生成 | 2天 |
| 跨板块回响联动（Lv.2-3） | 聊天室 + 信息流 + 锡陵晚报回响内容同步触发 | 3天 |

---

### Phase 4：信息面板（2周）

**目标**：左右两侧面板完整可用

| 任务 | 说明 | 预估天数 |
|------|------|---------|
| StatusBar（失衡值/自我认知进度条） | 动画更新 | 2天 |
| RelationGraph（关系值展示） | mini进度条 + NPC头像 | 2天 |
| EvalStats（评价统计） | 好评/差评/极端计数 | 1天 |
| EventLog（事件时间线） | 滚动列表，最近20条 | 2天 |
| EchoMonitor（回响等级） | 等级标签 + 失衡值进度条 | 1天 |
| MobileShell竖屏自适应 | 底部Tab导航 | 2天 |

---

### Phase 5：后幕内容与打磨（4周）

**目标**：第二、三、四幕内容，品质打磨

| 任务 | 说明 | 预估天数 |
|------|------|---------|
| 第二幕内容脚本 | 含"强制负面后果"节点 | 5天 |
| 第三幕内容脚本 | 猜疑节点、高压选项 | 5天 |
| 第四幕内容脚本 | 道德清算、个性化结局页 | 4天 |
| 回响CSS动效（Lv.3-4） | glitch动效、风暴效果 | 3天 |
| IndexedDB存档系统 | 替换localStorage | 2天 |
| 性能优化 | AI预生成、React memo优化 | 3天 |
| 多设备测试 | Chrome/Safari/Firefox/移动端 | 2天 |

**总计预估：约 19 周**

---

## 3. 第一周冲刺任务（Phase 0 启动）

```
Day 1:
  ✅ git init + Vite + React + TypeScript 项目搭建
  ✅ Tailwind CSS v4 配置
  ✅ @anthropic-ai/sdk 安装，基础调用测试

Day 2:
  ✅ 叙事生成 Prompt 第一版（第一幕对话场景）
  ✅ 流式输出测试（观察打字机效果延迟）

Day 3:
  ✅ JSON Schema 设计 + Zod 验证
  ✅ 测试20次调用，统计解析失败率

Day 4:
  ✅ 角色对话 Prompt 设计（密友型NPC）
  ✅ Fallback内容库建立（10条对话）

Day 5:
  ✅ 回响注入 Prompt 测试（Lv.1-2效果评估）
  ✅ Phase 0 验收：控制台稳定输出10轮对话
```

---

## 4. 性能目标

| 指标 | 目标 | 说明 |
|------|------|------|
| AI对话首字节延迟 | < 1.5秒 | 流式输出，用户感知开始输出的时间 |
| AI对话完整生成时长 | < 4秒 | 500-1500 token，claude-sonnet-4-6 |
| 页面初始加载 | < 2秒 | Vite代码分割，懒加载各App模式 |
| App切换动画 | 200ms | Framer Motion exit/enter |
| 评价按钮滑入动画 | 300ms | spring动效 |
| IndexedDB存档写入 | < 100ms | 不阻塞主线程 |

---

## 5. 测试策略

### 5.1 单元测试（Vitest）

优先覆盖游戏引擎的纯函数逻辑：

```typescript
// 重点测试：
// - EvaluationEngine.calculate() 的所有输入组合
// - EchoEngine.updateImbalance() 边界条件（0和200）
// - EchoEngine.calculateEchoLevel() 各幕动态阈值
// - ConsequenceEngine.applyTimeDecay() 时间衰减
// - NarrativeEngine.shouldAdvanceAct() 各幕推进条件
```

### 5.2 AI输出测试（手动）

每次修改Prompt后，运行10次调用验收：
- [ ] JSON解析成功率 100%
- [ ] 中文自然度（3人主观评分 ≥ 7/10）
- [ ] 回响内容"可被忽略但不可被忽视"（3人评测）
- [ ] 选项措辞有明确的情感差异

### 5.3 体验测试（用户测试）

Phase 2 结束后进行首轮用户测试（5人）：
- 完整体验第一幕（约20分钟）
- 观察指标：是否注意到回响、评价决策时长、情感反应点
- 收集：第一次评价前的心理预期、评价后的感受

---

## 6. 安全与合规

| 风险 | 措施 |
|------|------|
| API Key 泄露 | Phase 0 仅本地使用；Phase 2+ 移至 Cloudflare Workers |
| AI生成内容涉及违规信息 | 输出内容安全过滤（关键词检测）+ Anthropic Constitutional AI |
| 游戏内心理压力过大 | 提供"退出游戏"随时可访问的按钮（不在手机框内，在外层布局） |
| 玩家数据隐私 | Phase 0-1 仅本地存储（IndexedDB），无服务端收集 |

---

## 7. 文档索引

| 文档 | 内容 |
|------|------|
| [tech-research.md](./tech-research.md) | 参考游戏研究综述与核心设计决策 |
| [tech-architecture.md](./tech-architecture.md) | 技术栈选型与项目结构 |
| [tech-ai.md](./tech-ai.md) | AI驱动架构与Prompt工程 |
| [tech-frontend.md](./tech-frontend.md) | 前端组件与UI架构 |
| [tech-engine.md](./tech-engine.md) | 游戏引擎与状态机实现 |
| [tech-roadmap.md](./tech-roadmap.md) | 本文档：开发路线图与MVP定义 |
| [ui-design-guide.md](./ui-design-guide.md) | XHS H5参考实现的设计规范（颜色/组件/路由） |
| [GDD.md](./GDD.md) | 游戏设计文档（需求来源） |
