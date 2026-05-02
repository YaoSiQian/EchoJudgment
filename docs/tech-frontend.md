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

### 2.2 底部导航栏（XHSBottomNav）

参考设计规范：[ui-design-guide.md](./ui-design-guide.md) §2

```tsx
// src/components/phone/XHSBottomNav.tsx
// 单 App 架构：小红书式底部 5-Tab 导航，替代原三 App 切换器

type XHSTab = 'home' | 'note' | 'publish' | 'message' | 'profile'

export function XHSApp() {
  const { currentTab, chatRoomNpcId } = useUIStore()
  // 进入聊天室时隐藏底部导航
  const showTabBar = !chatRoomNpcId

  return (
    <div className="flex flex-col h-full bg-[#F5F5F5]">
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0"
          >
            {currentTab === 'home'    && <HomeScreen />}
            {currentTab === 'note'    && <NoteScreen />}
            {currentTab === 'message' && (chatRoomNpcId ? <ChatRoom /> : <ChatList />)}
            {currentTab === 'profile' && <ProfileScreen />}
          </motion.div>
        </AnimatePresence>
      </div>
      {showTabBar && <XHSBottomNav />}
    </div>
  )
}

export function XHSBottomNav() {
  const { currentTab, setCurrentTab } = useUIStore()

  return (
    <div
      className="flex bg-white border-t"
      style={{ borderColor: '#EBEBEB', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* 首页 */}
      <TabItem id="home" label="首页" active={currentTab === 'home'} onPress={setCurrentTab} />
      {/* 笔记 */}
      <TabItem id="note" label="笔记" active={currentTab === 'note'} onPress={setCurrentTab} />
      {/* 发布（圆形红色按钮） */}
      <div className="flex-1 flex items-center justify-center">
        <button
          className="w-12 h-8 rounded-2xl flex items-center justify-center text-white text-xl"
          style={{ background: 'linear-gradient(90deg, #FF2442, #FF5065)' }}
        >＋</button>
      </div>
      {/* 消息 */}
      <TabItem id="message" label="消息" active={currentTab === 'message'} onPress={setCurrentTab} />
      {/* 我 */}
      <TabItem id="profile" label="我" active={currentTab === 'profile'} onPress={setCurrentTab} />
    </div>
  )
}
```

---

## 3. 消息板块实现（原"微信模式"）

> 路由：`/chatSub/room/single`  
> 组件路径：`src/components/phone/message/`

### 3.1 会话列表（ChatList）

```tsx
// src/components/phone/message/ChatList.tsx
// 消息 Tab 首屏：显示所有 NPC 会话

export function ChatList() {
  const npcs = useNPCStore(s => s.activeNpcs)
  const { setChatRoomNpcId } = useUIStore()

  return (
    <div className="h-full bg-white overflow-y-auto">
      {/* NavBar */}
      <div className="xhs-navbar sticky top-0 z-10 bg-white">
        <span className="xhs-navbar__title">消息</span>
        <div className="xhs-navbar__actions">🔍</div>
      </div>

      {/* 会话列表 */}
      {npcs.map(npc => (
        <div
          key={npc.id}
          className="conv-item"
          onClick={() => setChatRoomNpcId(npc.id)}
        >
          <img className="conv-avatar" src={npc.avatarUrl} />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline">
              <span className="conv-name">{npc.name}</span>
              <span className="conv-time">{npc.lastMessageTime}</span>
            </div>
            <div className="flex justify-between items-center">
              <p className="conv-txt truncate">{npc.lastMessagePreview}</p>
              {npc.unreadCount > 0 && (
                <span className="conv-tip">{npc.unreadCount}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

### 3.2 消息气泡（含回响注入点）

```tsx
// src/components/phone/message/MessageBubble.tsx
// 参考 xhs-h5 msg_box / msg_body / msg_content / msg_txt 层级

interface MessageBubbleProps {
  message: ChatMessage
  echoLevel: EchoLevel
}

export function MessageBubble({ message, echoLevel }: MessageBubbleProps) {
  const isMe = message.sender === 'player'

  return (
    <div className={`flex gap-2 mb-3 ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end`}>
      {/* 对方头像（左侧，仅 NPC 消息显示） */}
      {!isMe && (
        <img
          src={message.avatarUrl}
          className="w-9 h-9 rounded-full flex-shrink-0"
        />
      )}

      {/* 气泡 */}
      <div
        className="max-w-[70%] px-3 py-2 text-sm leading-relaxed"
        style={{
          background: isMe ? '#FFE8EC' : '#FFFFFF',
          color: '#333333',
          borderRadius: isMe ? '12px 0 12px 12px' : '0 12px 12px 12px',
          boxShadow: isMe ? 'none' : '0 1px 4px rgba(0,0,0,0.08)',
        }}
      >
        <EchoText content={message.content} echoLevel={isMe ? 0 : echoLevel} />
      </div>
    </div>
  )
}
```

### 3.3 聊天室主体（ChatRoom）

```tsx
// src/components/phone/message/ChatRoom.tsx
// 对应 /chatSub/room/single

export function ChatRoom() {
  const { chatRoomNpcId, setChatRoomNpcId, pendingEvaluation } = useUIStore()
  const npc = useNPCStore(s => s.getNpc(chatRoomNpcId!))
  const { echoLevel } = useEchoStore()
  const messages = useChatMessages(chatRoomNpcId!)
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <div className="h-full flex flex-col bg-[#F5F5F5]">
      {/* NavBar */}
      <div className="xhs-navbar bg-white flex-shrink-0">
        <button className="xhs-navbar__back" onClick={() => setChatRoomNpcId(null)}>‹</button>
        <span className="xhs-navbar__title">{npc?.name}</span>
        <button className="xhs-navbar__actions">···</button>
      </div>

      {/* 消息滚动区 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} echoLevel={echoLevel} />
        ))}
      </div>

      {/* 评价按钮区（契机时滑入，覆盖输入区上方） */}
      <EvaluationBar opportunity={pendingEvaluation} onEvaluate={handleEvaluate} />

      {/* 输入区（参考 xhs-h5 input-area） */}
      <div className="chat-input-area flex-shrink-0">
        <button className="text-[#999] text-xl">🎤</button>
        <div className="chat-input flex-1 bg-white rounded-full border px-4 py-2 text-sm text-[#CCC]">
          {/* 游戏中无真实输入，选项通过 DecisionOverlay 呈现 */}
          请输入消息...
        </div>
        <button className="text-[#999] text-xl">😊</button>
        <button className="text-[#999] text-xl">＋</button>
      </div>

      {/* 抉择覆盖层 */}
      <DecisionOverlay />
    </div>
  )
}
```

### 3.4 回响文字渲染（EchoText）

```tsx
// src/components/shared/EchoText.tsx

interface EchoTextProps {
  content: string
  echoLevel: EchoLevel
}

export function EchoText({ content, echoLevel }: EchoTextProps) {
  if (echoLevel === 0) return <span>{content}</span>
  if (echoLevel === 1) return <span className="echo-lv1">{content}</span>
  if (echoLevel === 2) {
    const highlighted = highlightEchoWords(content)
    return <span className="echo-lv2" dangerouslySetInnerHTML={{ __html: highlighted }} />
  }
  return (
    <span className={`echo-lv${echoLevel}`} data-content={content}>{content}</span>
  )
}

// global.css
// .echo-lv1 { letter-spacing: 0.01em; }
// .echo-lv2 em { color: #555; }
// .echo-lv3 { animation: echo-flicker 4s infinite; }
// .echo-lv4 { animation: echo-glitch 2s infinite; }
```

### 3.5 评价按钮区（EvaluationBar）

```tsx
// src/components/phone/message/EvaluationBar.tsx
// 评价按钮在「契机」时从底部滑入，位于输入区上方

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
          className="bg-white px-4 py-3"
          style={{ borderTop: '0.5px solid #EBEBEB', borderRadius: '12px 12px 0 0' }}
          onMouseEnter={startTracking}
          onMouseLeave={stopTracking}
        >
          <p className="text-xs text-[#999] mb-2 text-center">{opportunity.prompt}</p>
          {opportunity.type === 'binary'  && <BinaryEvalButtons onSelect={onEvaluate} />}
          {opportunity.type === 'star5'   && <StarRating onSelect={onEvaluate} />}
          {opportunity.type === 'score10' && <ScoreSlider onSelect={onEvaluate} />}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

### 3.6 抉择覆��层（DecisionOverlay）

```tsx
// src/components/phone/message/DecisionOverlay.tsx

export function DecisionOverlay() {
  const { pendingDecision, clearDecision } = useUIStore()
  if (!pendingDecision) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,0.85)' }}
    >
      <p className="text-white text-center text-sm opacity-60 mb-2">
        {pendingDecision.context}
      </p>
      <h3 className="text-white text-center font-medium mb-8 leading-relaxed">
        {pendingDecision.question}
      </h3>
      <div className="flex flex-col gap-3 w-full">
        {pendingDecision.options.map(option => (
          <button
            key={option.id}
            onClick={() => handleChoose(option.id)}
            className="w-full py-3 px-4 text-white text-sm rounded-lg text-left"
            style={{ background: '#2A2A2A' }}
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

## 4. 首页/发现实现（原"小红书模式"）

> 路由：首页 → 推荐 Tab  
> 组件路径：`src/components/phone/home/`

### 4.1 首页顶栏 + 推荐/关注 Tab 切换

```tsx
// src/components/phone/home/HomeScreen.tsx

export function HomeScreen() {
  const { homeSubTab, setHomeSubTab } = useUIStore()

  return (
    <div className="h-full flex flex-col bg-[#F5F5F5]">
      {/* 顶部：Logo + 推荐|关注 + 搜索通知 */}
      <div
        className="flex items-center px-4 py-2 bg-white flex-shrink-0"
        style={{ borderBottom: '0.5px solid #F0F0F0' }}
      >
        <span className="text-base font-bold" style={{ color: '#FF2442' }}>小红书</span>
        <div className="flex gap-4 mx-4">
          {(['discover', 'following'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setHomeSubTab(tab)}
              className="relative text-base pb-1"
              style={{
                fontWeight: homeSubTab === tab ? 600 : 400,
                color: homeSubTab === tab ? '#333' : '#999',
              }}
            >
              {tab === 'discover' ? '推荐' : '关注'}
              {homeSubTab === tab && (
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full"
                  style={{ background: '#FF2442' }}
                />
              )}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-3 text-lg" style={{ color: '#666' }}>
          <span>🔍</span><span>🔔</span>
        </div>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-hidden">
        {homeSubTab === 'discover' ? <DiscoverFeed /> : <FollowingFeed />}
      </div>
    </div>
  )
}
```

### 4.2 瀑布流（DiscoverFeed）

```tsx
// src/components/phone/home/DiscoverFeed.tsx

export function DiscoverFeed() {
  const posts = useDiscoverPosts()  // 从 npcStore + echoStore 派生
  const { echoLevel } = useEchoStore()

  return (
    <div
      className="h-full overflow-y-auto p-2"
      style={{ columnCount: 2, columnGap: '8px' }}
    >
      {posts.map(post => (
        <PostCard key={post.id} post={post} echoLevel={echoLevel} />
      ))}
    </div>
  )
}

// src/components/phone/home/PostCard.tsx
const COLOR_PALETTE = [
  ['#FFD1DC', '#FFAEC9'], ['#D1E8FF', '#A8D1FF'],
  ['#D4F1D4', '#A8E6A8'], ['#FFF3CD', '#FFE59A'],
  ['#E8D5F5', '#D1A8E8'], ['#FFD9B3', '#FFBF7F'],
]

export function PostCard({ post, echoLevel }: { post: XHSPost, echoLevel: EchoLevel }) {
  const [c1, c2] = COLOR_PALETTE[post.colorIndex % COLOR_PALETTE.length]
  return (
    <div
      className="rounded-xl overflow-hidden mb-2"
      style={{ background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', breakInside: 'avoid' }}
    >
      {/* 图像区（渐变占位，无需真实图片 API） */}
      <div
        className="w-full flex items-center justify-center p-3 text-xs text-center"
        style={{
          background: `linear-gradient(135deg, ${c1}, ${c2})`,
          aspectRatio: post.aspectRatio,
          color: '#666',
        }}
      >
        {post.imageDescription}
      </div>
      {/* 文字区 */}
      <div className="p-2">
        <p className="text-xs leading-relaxed line-clamp-3" style={{ color: '#333' }}>
          <EchoText content={post.content} echoLevel={echoLevel} />
        </p>
        <div className="flex items-center gap-1 mt-2">
          <img src={post.authorAvatar} className="w-4 h-4 rounded-full" />
          <span className="text-xs flex-1" style={{ color: '#999' }}>{post.authorName}</span>
          <span className="text-xs" style={{ color: '#999' }}>♡ {post.likes}</span>
        </div>
      </div>
    </div>
  )
}
```

---

## 5. 首页/关注实现（原"今日头条模式"）

> 路由：首页 → 关注 Tab（关注账号：`锡陵晚报`）  
> 组件路径：`src/components/phone/home/`

**锡陵晚报**：游戏世界内的本地虚构媒体账号，玩家游戏开始时已自动关注。评价后果以锡陵晚报 XHS 帖子形式呈现，关注 Tab 内也穿插少量 NPC 动态。

### 5.1 关注信息流（FollowingFeed）

```tsx
// src/components/phone/home/FollowingFeed.tsx

export function FollowingFeed() {
  const posts = useFollowingPosts()  // 锡陵晚报帖子 + 少量 NPC 帖子，时间线排序

  return (
    <div className="h-full overflow-y-auto bg-[#F5F5F5]">
      {posts.map(post =>
        post.isNewsPost
          ? <NewsPost key={post.id} post={post as NewsPost} />
          : <PostCard key={post.id} post={post as XHSPost} echoLevel={post.echoLevel} />
      )}
    </div>
  )
}
```

### 5.2 锡陵晚报帖子卡片（NewsPost）

```tsx
// src/components/phone/home/NewsPost.tsx

export function NewsPost({ post }: { post: NewsPost }) {
  const { echoLevel } = useEchoStore()

  return (
    <div className="bg-white mb-2" style={{ borderRadius: '0' }}>
      {/* 新闻配图（深色渐变，新闻感） */}
      <div
        className="w-full flex items-end justify-start p-3"
        style={{
          background: 'linear-gradient(180deg, #2A2A2A 0%, #1A1A2E 100%)',
          aspectRatio: '16/9',
        }}
      >
        <span
          className="text-xs px-2 py-0.5 rounded"
          style={{ background: '#FF2442', color: '#fff' }}
        >
          {post.category}
        </span>
      </div>

      <div className="p-3">
        {/* 标题（含回响注入） */}
        <h3 className="text-sm font-medium leading-snug mb-1" style={{ color: '#333' }}>
          <EchoText content={post.headline} echoLevel={echoLevel} />
        </h3>
        {/* 摘要 */}
        <p className="text-xs line-clamp-2 mb-2" style={{ color: '#666' }}>
          {post.summary}
        </p>
        {/* 来源 + 时间 + 互动 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <img src="/assets/xiling-news-avatar.png" className="w-4 h-4 rounded-full" />
            <span className="text-xs" style={{ color: '#999' }}>锡陵晚报</span>
            <span className="text-xs" style={{ color: '#CCC' }}>·</span>
            <span className="text-xs" style={{ color: '#CCC' }}>{post.relativeTime}</span>
          </div>
          <div className="flex gap-2 text-xs" style={{ color: '#999' }}>
            <span>♡ {post.likes}</span>
            <span>💬 {post.comments}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 5.3 锡陵晚报帖子数据结构

```typescript
// 锡陵晚报帖子（后果呈现载体）
interface NewsPost {
  id: string
  isNewsPost: true
  headline: string        // 新闻标题（含回响注入点）
  summary: string         // 摘要（1-2句）
  category: '教育' | '社会' | '人物' | '评论'
  relativeTime: string    // 如 "2小时前"
  likes: number
  comments: number
  echoLevel: EchoLevel   // 回响注入等级
  sourceConsequenceId: string  // 触发此新闻的 ConsequenceEvent ID
}
```

### 5.4 回响等级与锡陵晚报内容关系

| echoLevel | 新闻表现 |
|-----------|---------|
| 0 | 正常地方民生新闻，与玩家无关 |
| 2 | 新闻事件与某次评价后果「巧合」吻合 |
| 3 | 新闻标题借用主角熟悉的措辞/场景 |
| 4 | 新闻评论区（展开后）出现直接呼应玩家的内容 |

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
