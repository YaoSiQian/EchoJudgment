# 《回响》技术文档 04 — 前端组件与 UI 架构

> 版本: v1.1 | 日期: 2026-05-02（重写更新）

---

## 1. 布局系统

### 1.1 响应式布局判断 + ErrorBoundary

```tsx
// src/app/App.tsx
// 宽度 >= 1024px → GameShell（三栏）；否则 → MobileShell（手机居中）

class ErrorBoundary extends Component<{children: ReactNode}, {error: Error|null}> {
  state = { error: null }
  static getDerivedStateFromError(e: Error) { return { error: e } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('[Echo]', error, info) }
  render() {
    if (this.state.error) return <FullScreenError onRetry={() => window.location.reload()} />
    return this.props.children
  }
}

export function App() {
  const [isWide, setIsWide] = useState(() => window.innerWidth >= 1024)
  const { isDebug } = useUIStore()

  useEffect(() => {
    const handler = () => setIsWide(window.innerWidth >= 1024)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return (
    <ErrorBoundary>
      <Providers>
        <GameInit />
        {isDebug && <DebugPanel />}
        {isWide ? <GameShell /> : <MobileShell />}
      </Providers>
    </ErrorBoundary>
  )
}
```

> `ErrorBoundary` 是防止 root div 为空的关键。任何组件 throw 都会被捕获并显示恢复 UI，而非白屏。

### 1.2 横屏三栏布局（GameShell）

```tsx
// src/components/layout/GameShell.tsx
export function GameShell() {
  return (
    <div style={{ background: 'linear-gradient(135deg, #0F0F1E, #1A1A2E, #16213E)' }}
         className="flex h-screen overflow-hidden w-full">
      {/* 背景网格纹理 */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,36,66,0.03) 1px, transparent 1px), ...',
        backgroundSize: '40px 40px',
      }} />

      {/* 左侧面板：w-56 xl:w-64 + glassmorphism */}
      <div className="hidden lg:flex w-56 xl:w-64 flex-shrink-0 flex-col"
           style={{ borderRight: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }}>
        <LeftPanel />
      </div>

      {/* 中央：手机帧 + 红色环境光晕 */}
      <div className="flex-1 flex items-center justify-center relative p-4">
        <div style={{ background: 'radial-gradient(ellipse, rgba(255,36,66,0.08), transparent)', filter: 'blur(40px)' }} />
        <PhoneFrame />
      </div>

      {/* 右侧面板：同左侧 */}
      <div className="hidden lg:flex w-56 xl:w-64 flex-shrink-0 flex-col"
           style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }}>
        <RightPanel />
      </div>
    </div>
  )
}
```

### 1.3 竖屏布局（MobileShell）

```tsx
// src/components/layout/MobileShell.tsx
// 竖屏/窄屏：仅显示手机帧，铺满黑色背景
export function MobileShell() {
  return (
    <div className="flex h-screen w-full items-center justify-center" style={{ background: '#1A1A2E' }}>
      <PhoneFrame />
    </div>
  )
}
```

---

## 2. 手机模拟器（PhoneFrame）

### 2.1 核心实现

PhoneFrame 是《回响》最关键的技术组件。它必须：
1. 保持竖屏比例（375×812），无论容器如何变化
2. 内部子组件完全隔离于游戏 UI 体系
3. 顶部状态栏模拟 iOS Dynamic Island 形态

```tsx
// src/components/phone/PhoneFrame.tsx
export function PhoneFrame() {
  const gameTime = useGameStore(s => s.gameTime)
  return (
    <div className={styles.phoneContainer}>
      <div className={styles.phoneBezel}>
        {/* 状态栏：白底，左时间，中 Dynamic Island，右信号/电量 */}
        <div className={styles.statusBar}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>{formatGameTime(gameTime)}</span>
          <div className={styles.dynamicIsland} />  {/* 黑色胶囊 */}
          <StatusIcons />  {/* Signal + WiFi + Battery SVG */}
        </div>
        {/* 应用视口 */}
        <div className={styles.appViewport}>
          <XHSApp />
        </div>
      </div>
    </div>
  )
}
```

```css
/* PhoneFrame.module.css */
.phoneContainer {
  width: 375px;
  height: min(812px, calc(100vh - 40px));
  max-height: 812px;
}

.phoneBezel {
  width: 100%; height: 100%;
  background: #1C1C1E;
  border-radius: 52px;
  /* 多层投影：外框 + 高光 + 景深 */
  box-shadow: 0 0 0 1px #000, 0 0 0 3px #3A3A3C, 0 24px 80px rgba(0,0,0,0.85);
  display: flex; flex-direction: column;
}

.statusBar {
  height: 50px; background: #fff;
  display: flex; align-items: flex-end; justify-content: space-between;
  padding: 0 20px 6px; position: relative;
}

.dynamicIsland {
  position: absolute; top: 8px; left: 50%; transform: translateX(-50%);
  width: 120px; height: 34px;
  background: #1C1C1E; border-radius: 20px; z-index: 10;
}

.appViewport {
  flex: 1; overflow: hidden;
  border-radius: 0 0 48px 48px;  /* 底部圆角跟随机身 */
}
```

### 2.2 底部导航栏（XHSBottomNav）

参考设计规范：[ui-design-guide.md](./ui-design-guide.md) §2

> **图标实现**：使用 SVG path 内联图标，替代 emoji，保证清晰度与品牌一致性。

```tsx
// src/components/phone/XHSBottomNav.tsx

// 5 个 Tab 图标均为 SVG outline 风格（active 时描边加粗 + 背景填充）
function IconHome({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V10.5Z"
        stroke={active ? '#FF2442' : '#999'}
        strokeWidth={active ? 2 : 1.5}
        fill={active ? 'rgba(255,36,66,0.08)' : 'none'} />
    </svg>
  )
}
// 类似：IconNote, IconMessage, IconProfile

// 中间发布按钮：48×30 px 红色渐变胶囊
<button style={{ width: 48, height: 30, background: 'linear-gradient(90deg, #FF2442, #FF5065)', borderRadius: 15 }}>+</button>
```

---

## 3. 消息板块实现（原"微信模式"）

> 路由：消息 Tab → 会话列表 → 聊天室  
> 组件路径：`src/components/phone/message/`

### 3.1 会话列表（ChatList）

头像用角色名首字母 + 品牌色背景（无需图片资源），未读角标 `#FF2442`。

### 3.2 消息气泡（MessageBubble）

| 方向 | 背景 | 圆角 |
|------|------|------|
| NPC（左） | `#FFFFFF` + `box-shadow: 0 1px 4px rgba(0,0,0,0.08)` | `0 12px 12px 12px` |
| 玩家（右） | `#FFE8EC` | `12px 0 12px 12px` |

含 `EchoText` 渲染回响异常内容；NPC 消息可点击触发 `EvaluationBar`。

### 3.3 聊天室主体（ChatRoom）

```tsx
// src/components/phone/message/ChatRoom.tsx
export function ChatRoom() {
  const { generateNextMessage, isStreaming, addPlayerContext } = useNarrativeStream(npcId)
  const [inputText, setInputText] = useState('')

  // 玩家发送消息 → 加入 AI 上下文 → 触发 NPC 回复
  function handleSend() {
    const text = inputText.trim()
    if (!text || isStreaming) return
    addPlayerContext(text)
    addMessage(npcId, { id: generateId(), npcId, role: 'player', content: text, timestamp: Date.now() })
    setInputText('')
    setTimeout(() => generateNextMessage(), 400)
  }

  return (
    <div className="flex flex-col h-full">
      {/* NavBar：SVG 返回箭头 + NPC 名 + "正在输入…" 状态 + SVG 三点 */}
      <NavBar npc={npc} isStreaming={isStreaming} onBack={() => setChatRoomNpcId(null)} />

      {/* 消息滚动区 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.map(msg => <MessageBubble ... />)}
        {isStreaming && <TypingIndicator />}
      </div>

      {/* 评价栏（契机时显示，覆盖输入区） */}
      {showEvalBar && <EvaluationBar />}

      {/* 输入区（评价栏出现时隐藏） */}
      {!showEvalBar && (
        <div className="chat-input-area" style={{ padding: '8px 12px', borderTop: '0.5px solid #EBEBEB', background: '#FAFAFA' }}>
          <IconEmoji />
          <input
            value={inputText} onChange={e => setInputText(e.target.value)}
            placeholder={isStreaming ? '对方正在输入…' : '说点什么…'}
            style={{ flex: 1, height: 36, borderRadius: 18, border: '1px solid #EBEBEB' }}
          />
          {inputText ? <IconSend onClick={handleSend} /> : <IconPlus />}
        </div>
      )}
    </div>
  )
}
```

> 输入区功能：玩家消息通过 `addPlayerContext` 注入 AI 上下文，再调用 `generateNextMessage()` 触发 NPC 动态回应。

### 3.4 回响文字渲染（EchoText）

`EchoText` 接收 `text + level + variant`，根据等级注入不同 CSS 动画类：
- Lv1: `.echo-lv1`（字间距微颤）
- Lv2: `.echo-lv2`（文字变红）
- Lv3: `.echo-lv3`（glitch 动画）
- Lv4: `.echo-lv4`（storm 动画）

### 3.5 评价按钮区（EvaluationBar）

位置：聊天室 `position: absolute; bottom: 0`，从 `y: 100%` 滑入。支持 `binary / star5 / score10` 三种评价类型，由 AI 输出中的 `evalOpportunity.types` 字段决定。

### 3.6 抉择覆盖层（DecisionOverlay）

`position: absolute; inset: 0; background: rgba(0,0,0,0.85)`，含倒计时红色进度条 + 选项按钮列表。倒计时归零自动选择第一项。

---

## 4. 首页/发现实现（原"小红书模式"）

> 路由：首页 → 推荐 Tab  
> 组件路径：`src/components/phone/home/`

### 4.1 首页顶栏 + 推荐/关注 Tab 切换（HomeScreen）

```tsx
// src/components/phone/home/HomeScreen.tsx
// 顶部：左 SVG 搜索图标 | 中 推荐/关注 Tab（framer-motion layoutId 下划线）| 右 SVG 铃铛

// Tab 激活样式
{isActive && (
  <motion.span
    layoutId="home-tab-bar"
    style={{ bottom: 6, width: 20, height: 3, background: '#FF2442' }}
    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
  />
)}
```

### 4.2 瀑布流（DiscoverFeed）

```css
/* src/index.css */
.waterfall-grid { column-count: 2; column-gap: 8px; }
.waterfall-item  { break-inside: avoid; margin-bottom: 8px; }
```

PostCard 用渐变色板替代真实图片，图片高度基于 `post.id` 字符码值确定性派生（120–200px）。

### 4.3 占位图渐变色板

```typescript
const GRADIENTS = [
  'from-[#FFD1DC] to-[#FFAEC9]',  // 浅粉
  'from-[#B5EAEA] to-[#88D8D8]',  // 青蓝
  'from-[#DDD6F3] to-[#FAACA8]',  // 紫粉
  'from-[#C6FFDD] to-[#F7797D]',  // 绿红
  'from-[#FEE140] to-[#FA709A]',  // 黄粉
  'from-[#A1C4FD] to-[#C2E9FB]',  // 天蓝
]
```

---

## 5. 首页/关注实现（原"今日头条模式"）

> 路由：首页 → 关注 Tab（关注账号：`锡陵晚报`）  
> 组件路径：`src/components/phone/home/`

**锡陵晚报**：游戏世界内的本地虚构媒体账号，玩家游戏开始时已自动关注。评价后果以锡陵晚报 XHS 帖子形式呈现，关注 Tab 内也穿插少量 NPC 动态。

### 5.1 关注信息流（FollowingFeed）

新闻帖子（NewsPost）+ NPC 帖子（PostCard）按时间戳倒序混合排列，垂直单列。

### 5.2 锡陵晚报帖子卡片（NewsPost）

- 图片区：`16:9` 深色渐变（`#2A2A2A → #1A1A2E`），左下角分类标签（`#FF2442` 红底）
- 正文区：大标题（`EchoText` 注入）+ 摘要（2行截断）+ 来源行（头像 + 锡陵晚报 + 时间 + 互动数）

---

## 6. 信息面板组件

### 6.1 左侧面板（LeftPanel）

深色半透明背景，三个子区块：
- **状态指标**（StatusBar）：失衡值 / 自我认知 / 评价倾向 — 带动态颜色插值进度条
- **评价统计**（EvalStats）：好评 / 差评 / 极端 数量 + 回响等级徽章
- **人物关系**（RelationGraph）：每个 NPC 名字 + 关系值进度条（正绿负红）

### 6.2 右侧面板（RightPanel）

- **回响监测**（EchoMonitor）：大号回响等级数字 + 脉冲指示器 + 失衡进度条（绿→黄→红→紫渐变）
- **事件日志**（EventLog）：游戏内事件时间线，滚动列表

---

## 7. 过程数据追踪 Hook

```tsx
// src/hooks/useInteractionTracking.ts
export function useInteractionTracking() {
  const hoverStartRef = useRef<number | null>(null)

  const startTracking = useCallback(() => { hoverStartRef.current = Date.now() }, [])
  const stopTracking  = useCallback(() => { /* 记录悬停时长 → playerStore */ }, [])

  return { startTracking, stopTracking }
}
```

---

## 8. 全局样式约定

### 8.1 颜色 Token（src/index.css `@theme`）

| 变量 | 值 | 用途 |
|-----|-----|------|
| `--color-xhs-primary` | `#FF2442` | active 状态、点赞、角标 |
| `--color-xhs-primary-bg` | `#FFE8EC` | 玩家消息气泡背景 |
| `--color-xhs-text-primary` | `#333333` | 正文 |
| `--color-xhs-text-secondary` | `#999999` | 副文本 |
| `--color-xhs-bg-primary` | `#F5F5F5` | 页面背景 |
| `--color-xhs-border` | `#EBEBEB` | 分割线 |

### 8.2 关键全局类

```css
.xhs-scroll::-webkit-scrollbar { display: none; }       /* 隐藏滚动条 */
.waterfall-grid { column-count: 2; column-gap: 8px; }   /* 2列瀑布流 */
.waterfall-item { break-inside: avoid; margin-bottom: 8px; }
.echo-lv1 { animation: echo-lv1-shimmer 3s infinite; } /* 回响动画 */
.echo-lv2 { animation: echo-lv2-darken 0.5s forwards; }
.echo-lv3 { animation: echo-lv3-glitch 2s infinite; }
.echo-lv4 { animation: echo-lv4-storm 0.8s infinite; }
```
