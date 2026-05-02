# 《回响》技术文档 04 — 前端组件与 UI 架构

> 版本: v1.0 | 日期: 2026-05-02

---

## 1. 布局系统

### 1.1 响应式布局判断

```tsx
// src/app/App.tsx
export default function App() {
  const isWide = useMediaQuery('(min-width: 768px)')
  return isWide ? <GameShell /> : <MobileShell />
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])
  return matches
}
```

### 1.2 横屏三栏布局（GameShell）

```tsx
// src/components/layout/GameShell.tsx
export function GameShell() {
  return (
    <div className="flex h-screen w-screen bg-zinc-950 overflow-hidden">
      {/* 左侧信息面板：固定宽度 */}
      <aside className="w-56 flex-shrink-0 border-r border-zinc-800 flex flex-col overflow-y-auto">
        <LeftPanel />
      </aside>

      {/* 主板块：手机模拟器，居中 */}
      <main className="flex-1 flex items-center justify-center bg-zinc-900">
        <PhoneFrame />
      </main>

      {/* 右侧信息面板：固定宽度 */}
      <aside className="w-56 flex-shrink-0 border-l border-zinc-800 flex flex-col overflow-y-auto">
        <RightPanel />
      </aside>
    </div>
  )
}
```

### 1.3 竖屏布局（MobileShell）

```tsx
// src/components/layout/MobileShell.tsx
export function MobileShell() {
  const [activeTab, setActiveTab] = useState<'phone' | 'status' | 'log'>('phone')

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950">
      {/* 折叠状态栏 */}
      {activeTab !== 'phone' && (
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'status' ? <LeftPanel /> : <RightPanel />}
        </div>
      )}

      {/* 手机模拟器占满剩余空间 */}
      {activeTab === 'phone' && (
        <div className="flex-1 flex items-center justify-center bg-zinc-900">
          <PhoneFrame />
        </div>
      )}

      {/* 底部Tab导航 */}
      <nav className="h-12 flex border-t border-zinc-800">
        {(['phone', 'status', 'log'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 text-xs ${activeTab === tab ? 'text-white' : 'text-zinc-500'}`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </nav>
    </div>
  )
}

const TAB_LABELS = { phone: '📱 手机', status: '📊 状态', log: '📋 日志' }
```

---

## 2. 手机模拟器（PhoneFrame）

### 2.1 核心实现原则

PhoneFrame 是《回响》最关键的技术组件。它必须：
1. 保持竖屏比例（9:16或更高），无论容器如何变化
2. 内部子组件**完全隔离于游戏 UI 体系**——只有 App 风格的界面元素
3. 处理 App 模式切换的过渡动画

```tsx
// src/components/phone/PhoneFrame.tsx
import styles from './PhoneFrame.module.css'

export function PhoneFrame() {
  const { currentApp } = useUIStore()

  return (
    {/* 外部容器：维持比例 */}
    <div className={styles.phoneContainer}>
      {/* 手机外框（可选：带圆角和边框的装饰层） */}
      <div className={styles.phoneBezel}>
        {/* 状态栏（模拟手机状态栏） */}
        <div className={styles.statusBar}>
          <span className={styles.time}>{useGameTime()}</span>
          <span className={styles.icons}>▲ WiFi 电池</span>
        </div>

        {/* App 内容区 */}
        <div className={styles.appViewport}>
          <AppSwitcher />
        </div>
      </div>
    </div>
  )
}
```

```css
/* PhoneFrame.module.css */
.phoneContainer {
  /* 关键：宽度由父容器决定，高度按比例计算 */
  width: min(360px, 90vw);
  aspect-ratio: 9 / 19.5;
  position: relative;
}

.phoneBezel {
  width: 100%;
  height: 100%;
  border-radius: 2.5rem;
  background: #111;
  border: 2px solid #333;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.statusBar {
  /* 模拟手机状态栏：深色，10-14px字体 */
  height: 2.5rem;
  background: #000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
  font-size: 0.75rem;
  color: #fff;
  flex-shrink: 0;
}

.appViewport {
  flex: 1;
  overflow: hidden;
  position: relative;
}
```

### 2.2 App 模式切换

```tsx
// src/components/phone/AppSwitcher.tsx
// 注意：切换Tab使用 App 风格设计（如微信底部导航、小红书顶部搜索栏的外观）

export function AppSwitcher() {
  const { currentApp, setCurrentApp } = useUIStore()

  const apps = [
    { id: 'wechat', label: '消息', icon: '💬' },
    { id: 'xiaohongshu', label: '发现', icon: '🔍' },
    { id: 'toutiao', label: '头条', icon: '📰' },
  ] as const

  return (
    <div className="flex flex-col h-full">
      {/* App 顶部导航（看起来像真实App的顶栏，不像游戏菜单） */}
      <div className="flex border-b border-gray-200 bg-white">
        {apps.map(app => (
          <button
            key={app.id}
            onClick={() => setCurrentApp(app.id)}
            className={`flex-1 py-2 text-xs flex flex-col items-center gap-0.5
              ${currentApp === app.id ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
          >
            <span>{app.icon}</span>
            <span>{app.label}</span>
          </button>
        ))}
      </div>

      {/* App 内容区：动画切换 */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentApp}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            {currentApp === 'wechat' && <ConversationView />}
            {currentApp === 'xiaohongshu' && <FeedScreen />}
            {currentApp === 'toutiao' && <NewsScreen />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
```

---

## 3. 微信模式实现

### 3.1 消息气泡（含回响注入点）

```tsx
// src/components/phone/wechat/MessageBubble.tsx

interface MessageBubbleProps {
  message: ChatMessage
  echoLevel: EchoLevel
}

export function MessageBubble({ message, echoLevel }: MessageBubbleProps) {
  const isMe = message.sender === 'player'

  return (
    <div className={`flex gap-2 mb-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* 头像 */}
      {!isMe && (
        <div className="w-9 h-9 rounded-md bg-gray-300 flex-shrink-0 overflow-hidden">
          <img src={message.avatarUrl} alt="" />
        </div>
      )}

      {/* 气泡 */}
      <div
        className={`
          max-w-[70%] px-3 py-2 rounded-xl text-sm leading-relaxed
          ${isMe
            ? 'bg-[#95ec69] text-black rounded-tr-sm'  // 微信绿色
            : 'bg-white text-black rounded-tl-sm shadow-sm'}
        `}
      >
        {/* EchoText 组件负责回响异常渲染 */}
        <EchoText content={message.content} echoLevel={echoLevel} />
      </div>
    </div>
  )
}
```

### 3.2 回响文字渲染（EchoText）

```tsx
// src/components/shared/EchoText.tsx
// 核心技术：在正常文字中注入视觉微妙异常

interface EchoTextProps {
  content: string
  echoLevel: EchoLevel
}

export function EchoText({ content, echoLevel }: EchoTextProps) {
  if (echoLevel === 0) {
    return <span>{content}</span>
  }

  // echoLevel 1：微微抖动某些词
  if (echoLevel === 1) {
    return <span className="echo-lv1">{content}</span>
  }

  // echoLevel 2：关键词高亮为稍深色（不明显但存在）
  if (echoLevel === 2) {
    const highlighted = highlightEchoWords(content)
    return <span className="echo-lv2" dangerouslySetInnerHTML={{ __html: highlighted }} />
  }

  // echoLevel 3-4：CSS glitch 效果
  return (
    <span
      className={`echo-lv${echoLevel}`}
      data-content={content}
    >
      {content}
    </span>
  )
}

// CSS（tailwind plugin 或 global.css）：
// .echo-lv1 { letter-spacing: 0.01em; }  /* 极微妙的字距变化 */
// .echo-lv2 em { color: #555; }           /* 轻微加深 */
// .echo-lv3 { animation: echo-flicker 4s infinite; }
// .echo-lv4 { animation: echo-glitch 2s infinite; }
```

### 3.3 评价按钮区（EvaluationBar）

```tsx
// src/components/phone/wechat/EvaluationBar.tsx
// 评价按钮仅在「契机」出现时从底部滑入，平时完全隐藏

interface EvaluationBarProps {
  opportunity: EvaluationOpportunity | null
  onEvaluate: (result: EvaluationResult) => void
}

export function EvaluationBar({ opportunity, onEvaluate }: EvaluationBarProps) {
  const { startTracking, stopTracking } = useInteractionTracking()

  return (
    <AnimatePresence>
      {opportunity && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="border-t border-gray-200 bg-white px-4 py-3"
          onMouseEnter={startTracking}
          onMouseLeave={stopTracking}
        >
          <p className="text-xs text-gray-400 mb-2 text-center">
            {opportunity.prompt}
          </p>

          {opportunity.type === 'binary' && (
            <BinaryEvalButtons onSelect={onEvaluate} />
          )}
          {opportunity.type === 'star5' && (
            <StarRating onSelect={onEvaluate} />
          )}
          {opportunity.type === 'score10' && (
            <ScoreSlider onSelect={onEvaluate} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

### 3.4 抉择覆盖层（DecisionOverlay）

```tsx
// src/components/phone/wechat/DecisionOverlay.tsx
// 抉择以覆盖整个手机屏幕的方式呈现，区别于日常评价

export function DecisionOverlay({ decision, onChoose }: DecisionOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 z-50"
    >
      <p className="text-white text-center mb-2 text-sm opacity-60">
        {decision.context}
      </p>
      <h3 className="text-white text-center font-medium mb-8 leading-relaxed">
        {decision.question}
      </h3>

      <div className="flex flex-col gap-3 w-full">
        {decision.options.map(option => (
          <button
            key={option.id}
            onClick={() => onChoose(option.id)}
            className="w-full py-3 px-4 bg-zinc-800 text-white rounded-lg text-sm
                       hover:bg-zinc-700 active:scale-98 transition-all text-left"
          >
            {option.text}
          </button>
        ))}
      </div>
    </motion.div>
  )
}
```

---

## 4. 小红书模式实现

```tsx
// src/components/phone/xiaohongshu/FeedScreen.tsx

export function FeedScreen() {
  const posts = useXHSFeed()  // 从 npcStore + echoStore 派生

  return (
    <div className="h-full bg-white overflow-y-auto">
      {/* 小红书顶部导航 */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-2 flex items-center gap-2">
        <span className="text-red-500 font-bold text-lg">小红书</span>
        <div className="flex-1" />
        <span className="text-gray-400 text-sm">🔍</span>
        <span className="text-gray-400 text-sm">🔔</span>
      </div>

      {/* 瀑布流（CSS columns 实现） */}
      <div className="p-2 columns-2 gap-2">
        {posts.map(post => (
          <PostCard key={post.id} post={post} className="mb-2 break-inside-avoid" />
        ))}
      </div>
    </div>
  )
}

// src/components/phone/xiaohongshu/PostCard.tsx
export function PostCard({ post }: { post: XHSPost }) {
  return (
    <div className="rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100">
      {/* 图片区（AI生成描述的占位） */}
      <div
        className="w-full aspect-square bg-gradient-to-br from-rose-100 to-orange-100
                   flex items-center justify-center text-gray-400 text-xs p-3 text-center"
      >
        {post.imageDescription}
      </div>

      {/* 文字区 */}
      <div className="p-2">
        <p className="text-xs text-gray-800 leading-relaxed line-clamp-3">
          <EchoText content={post.content} echoLevel={post.echoLevel} />
        </p>

        <div className="flex items-center gap-1 mt-2">
          <span className="text-xs text-gray-400">{post.authorName}</span>
          <div className="flex-1" />
          <span className="text-xs text-gray-400">❤️ {post.likes}</span>
        </div>
      </div>
    </div>
  )
}
```

---

## 5. 今日头条模式实现

```tsx
// src/components/phone/toutiao/NewsScreen.tsx

export function NewsScreen() {
  const news = useToutiaoFeed()  // 包含：正常新闻 + AI生成的后果相关新闻

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      {/* 头条顶部 */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-red-600 font-bold">今日头条</span>
          <div className="flex-1" />
          <span className="text-gray-400 text-sm">🔍</span>
        </div>
        {/* 频道Tab（推荐/社会/教育/娱乐） */}
        <div className="flex gap-4 mt-2 overflow-x-auto">
          {['推荐', '社会', '教育', '娱乐'].map(ch => (
            <button key={ch} className="text-sm text-gray-600 flex-shrink-0 whitespace-nowrap">
              {ch}
            </button>
          ))}
        </div>
      </div>

      {/* 新闻列表 */}
      <div className="divide-y divide-gray-100">
        {news.map(article => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  )
}

// NewsCard：真实感新闻卡片
export function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <div className="bg-white px-4 py-3 flex gap-3">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900 leading-snug mb-1">
          <EchoText content={article.headline} echoLevel={article.echoLevel} />
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>{article.source}</span>
          <span>·</span>
          <span>{article.relativeTime}</span>
          <span>·</span>
          <span>{article.commentCount}评论</span>
        </div>
      </div>
      {/* 新闻缩略图区 */}
      <div className="w-20 h-16 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center text-gray-400 text-xs">
        图
      </div>
    </div>
  )
}
```

---

## 6. 信息面板组件

### 6.1 左侧面板（状态/关系/统计）

```tsx
// src/components/layout/LeftPanel/StatusBar.tsx
export function StatusBar() {
  const { imbalanceValue, echoLevel } = useEchoStore()
  const playerModel = usePlayerStore()

  return (
    <div className="p-3 space-y-3">
      <PanelSection title="🧑 角色状态">
        <StatusMetric
          label="自我认知"
          value={playerModel.selfAwareness}
          max={100}
          colorClass="bg-blue-500"
        />
        <StatusMetric
          label="失衡值"
          value={imbalanceValue}
          max={200}
          colorClass={imbalanceValue > 90 ? 'bg-red-500' : 'bg-yellow-500'}
          showWarning={imbalanceValue > 90}
        />
      </PanelSection>

      <PanelSection title="👥 关系概览">
        {Object.entries(playerModel.relationships).map(([npcId, value]) => (
          <RelationshipBar key={npcId} npcId={npcId} value={value} />
        ))}
      </PanelSection>

      <PanelSection title="📊 评价统计">
        <EvalStats />
      </PanelSection>
    </div>
  )
}
```

### 6.2 右侧面板（日志/回响/世界动态）

```tsx
// src/components/layout/RightPanel/EchoMonitor.tsx
export function EchoMonitor() {
  const { echoLevel, imbalanceValue } = useEchoStore()

  const LEVEL_LABELS = ['正常', '涟漪', '波纹', '浪潮', '风暴']
  const LEVEL_COLORS = ['text-gray-400', 'text-blue-400', 'text-yellow-400', 'text-orange-400', 'text-red-400']

  return (
    <div className="p-3">
      <h4 className="text-xs font-medium text-gray-500 mb-2">🌊 回响监测</h4>
      <div className={`text-sm font-medium ${LEVEL_COLORS[echoLevel]}`}>
        Lv.{echoLevel} — {LEVEL_LABELS[echoLevel]}
      </div>
      <div className="mt-1 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-red-500 transition-all duration-500"
          style={{ width: `${(imbalanceValue / 200) * 100}%` }}
        />
      </div>
      {import.meta.env.VITE_GAME_DEBUG === 'true' && (
        <p className="text-xs text-zinc-600 mt-1">失衡值: {imbalanceValue}/200</p>
      )}
    </div>
  )
}
```

---

## 7. 过程数据追踪 Hook

```tsx
// src/hooks/useInteractionTracking.ts
// 实现 Life is Strange 式的"过程追踪"

export function useInteractionTracking() {
  const updatePlayerModel = usePlayerStore(s => s.updateInteractionMetrics)
  const hoverStartRef = useRef<number | null>(null)

  const startTracking = useCallback(() => {
    hoverStartRef.current = Date.now()
  }, [])

  const stopTracking = useCallback(() => {
    if (hoverStartRef.current !== null) {
      const duration = Date.now() - hoverStartRef.current
      hoverStartRef.current = null
      // 不选择直接离开 = 一次"取消"
      updatePlayerModel({ type: 'cancel', duration })
    }
  }, [updatePlayerModel])

  const recordDecision = useCallback((duration: number) => {
    hoverStartRef.current = null
    if (duration < 500) updatePlayerModel({ type: 'fast', duration })
    else if (duration > 5000) updatePlayerModel({ type: 'slow', duration })
    else updatePlayerModel({ type: 'normal', duration })
  }, [updatePlayerModel])

  return { startTracking, stopTracking, recordDecision }
}
```
