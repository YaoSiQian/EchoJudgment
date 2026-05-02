# 《回响》UI 设计指南 — 基于高仿小红书 H5 参考实现

> 版本: v1.0 | 日期: 2026-05-02  
> 参考源: `doc_for_ai/xhs-h5.fake/` (uni-app + uView 构建的宠友小红书高仿 H5)

---

## 1. 单应用架构概述

《回响》的手机模拟器不再切换三个不同 App，而是呈现**一个完整的小红书式应用**，通过底部导航栏在不同板块间切换。三种叙事功能映射如下：

| 游戏叙事功能 | XHS 页面 | 路由模式 |
|------------|---------|---------|
| **私聊（原"微信模式"）** | 消息 → 聊天室 | `/chatSub/room/single` |
| **社媒信息流（原"小红书模式"）** | 首页 → 推荐 Tab | `/pages/home/home` + `homeSubTab: 'discover'` |
| **资讯/后果呈现（原"今日头条模式"）** | 首页 → 关注 Tab（关注 `锡陵晚报`） | `/pages/home/home` + `homeSubTab: 'following'` |

---

## 2. 底部导航栏（XHSBottomNav）

参考源：`uni-tabbar` CSS + `CustomTabBar` 组件

### 2.1 结构规范

```
┌─────────────────────────────────────────┐
│  🏠首页   📝笔记   ➕   💬消息   👤我   │
│   10px              10px                │
│  [active: #FF2442]  [inactive: #999999] │
└─────────────────────────────────────────┘
```

| Tab | 图标 | 文字 | 游戏交互 |
|-----|-----|------|---------|
| `home` | 首页图标 | 首页 | 显示推荐/关注信息流 |
| `note` | 笔记图标 | 笔记 | 装饰性，不可交互（空列表） |
| `publish` | 圆形 `+` | — | 特定叙事节点触发发布事件 |
| `message` | 消息气泡 | 消息 | 进入会话列表 |
| `profile` | 人形 | 我 | 装饰性主角主页 |

### 2.2 样式 Token

```css
/* 参考 uni-tabbar CSS */
.xhs-tabbar {
  height: 50px;
  padding-bottom: env(safe-area-inset-bottom);
  background: #FFFFFF;
  border-top: 0.5px solid #EBEBEB;
  display: flex;
  align-items: center;
}

.xhs-tabbar__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.xhs-tabbar__icon { font-size: 24px; }
.xhs-tabbar__label { font-size: 10px; color: #999999; }
.xhs-tabbar__label--active { color: #FF2442; }

/* 中间发布按钮 */
.xhs-tabbar__publish {
  width: 46px;
  height: 30px;
  background: linear-gradient(90deg, #FF2442, #FF5065);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

/* 消息Tab未读角标（参考 uni-tabbar__reddot） */
.xhs-tabbar__badge {
  position: absolute;
  top: 2px;
  right: 0;
  min-width: 16px;
  height: 16px;
  border-radius: 16px;
  background: #FF2442;
  color: #fff;
  font-size: 10px;
  text-align: center;
  line-height: 16px;
  padding: 0 3px;
}
```

---

## 3. 顶部导航栏

参考源：`u-navbar` 组件

```css
.xhs-navbar {
  height: 44px;
  background: #FFFFFF;
  border-bottom: 0.5px solid #F0F0F0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  position: sticky;
  top: 0;
  z-index: 100;
}

/* 返回按钮（参考 u-navbar 的 nav-back 图标，颜色 #606266） */
.xhs-navbar__back {
  color: #606266;
  font-size: 20px;
  min-width: 40px;
}

/* 标题 */
.xhs-navbar__title {
  font-size: 16px;
  font-weight: 500;
  color: #333333;
}

/* 右侧操作按钮 */
.xhs-navbar__actions {
  color: #606266;
  font-size: 20px;
  display: flex;
  gap: 16px;
}
```

---

## 4. 消息板块：会话列表

参考源：`conv-name` / `conv-txt` / `conv-time` / `conv-tip` 类

### 4.1 会话列表页面结构

```
┌───────────────────────────────┐
│  ←  消息          搜索  +新建  │  ← NavBar
│  ─────────────────────────── │
│  ┌─────────────────────────┐ │
│  │ [头像40px] 林晨          │ │
│  │           最近发的消息…  │ │  ← conv-txt
│  │                   2h前  │ │  ← conv-time
│  └─────────────────────────┘ │
│  ┌─────────────────────────┐ │
│  │ [头像40px] 赵明远  [●2] │ │  ← 未读角标 conv-tip
│  │           你评价了TA... │ │
│  │                  刚刚  │ │
│  └─────────────────────────┘ │
└───────────────────────────────┘
```

```tsx
// 参考 xhs-h5 聊天列表结构
interface ConvItem {
  avatar: string;
  name: string;          // NPC名称
  lastMessage: string;   // 截断为1行
  time: string;          // 相对时间（参考 "刚刚"/"x小时前"）
  unreadCount: number;   // > 0 显示角标
}
```

### 4.2 CSS 参考

```css
.conv-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
  background: #fff;
  border-bottom: 0.5px solid #F5F5F5;
}

.conv-avatar { width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0; }
.conv-name { font-size: 15px; font-weight: 500; color: #333333; }
.conv-txt { font-size: 13px; color: #999999; margin-top: 4px; }
.conv-time { font-size: 11px; color: #CCCCCC; }
.conv-tip {
  background: #FF2442;
  color: #fff;
  border-radius: 50%;
  min-width: 16px;
  height: 16px;
  font-size: 11px;
  text-align: center;
  line-height: 16px;
}
```

---

## 5. 消息板块：聊天室（`/chatSub/room/single`）

参考源：`chatSub-room-single.b5123da3.js` + `msg_box` / `msg_body` / `msg_content` 类

### 5.1 页面整体结构

```
┌───────────────────────────────┐
│  ← [NPC名称]           ···   │  ← NavBar (sticky top)
│  ─────────────────────────── │
│  [消息滚动区，flex-col，      │
│   overflow-y: auto]          │
│                               │
│  ← 林晨的气泡（白底）        │
│         ← 含回响异常文字      │
│                 主角气泡 →   │
│                （浅红背景）  │
│  ← 林晨的气泡               │
│                               │
│  ─────────────────────────── │
│  [评价按钮区 - 契机时滑入]    │  ← EvaluationBar
│  ─────────────────────────── │
│  🎤  [请输入消息...]  😊  ➕  │  ← 输入区 (input-area)
└───────────────────────────────┘
```

### 5.2 消息气泡组件（参考 `msg_box` 层级）

```tsx
// msg_box → msg_avatar + msg_body → msg_head + msg_content + msg_state
// 参考源类名：msg_box / msg_body / msg_head / msg_content / msg_txt / msg_nick

// 对方消息（左侧）
<div className="msg_box msg_box--left">
  <img className="msg_avatar" src={avatarUrl} />
  <div className="msg_body">
    <div className="msg_head">
      <span className="msg_nick">{name}</span>
      <span className="msg_time">{time}</span>
    </div>
    <div className="msg_content">
      <div className="msg_txt msg_txt--left">
        <EchoText content={text} echoLevel={echoLevel} />
      </div>
    </div>
  </div>
</div>

// 主角消息（右侧）
<div className="msg_box msg_box--right">
  <div className="msg_body">
    <div className="msg_content">
      <div className="msg_txt msg_txt--right">{text}</div>
    </div>
  </div>
</div>
```

### 5.3 气泡颜色规范

| 方向 | 背景色 | 文字色 | 圆角 |
|------|-------|-------|------|
| 对方（左） | `#FFFFFF` + `box-shadow: 0 1px 4px rgba(0,0,0,0.08)` | `#333333` | `0 12px 12px 12px` |
| 主角（右） | `#FFE8EC` | `#333333` | `12px 0 12px 12px` |
| 回响异常 | 背景不变，内容由 `EchoText` 处理 | — | — |

> 选用浅粉 `#FFE8EC` 而非微信绿，与 XHS 品牌色系统一。

### 5.4 输入区

```css
.chat-input-area {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-top: 0.5px solid #EBEBEB;
  background: #FAFAFA;
  gap: 8px;
}

.chat-input {
  flex: 1;
  height: 36px;
  background: #FFFFFF;
  border: 1px solid #EBEBEB;
  border-radius: 18px;
  padding: 0 14px;
  font-size: 14px;
  color: #333;
}
```

---

## 6. 首页/推荐（DiscoverFeed）

### 6.1 顶部区域

```tsx
// XHS 首页顶部（参考宠友小红书首页）
<div className="xhs-home-header">
  {/* Logo */}
  <div className="xhs-logo">小红书</div>
  
  {/* Tab 切换：推荐 | 关注 */}
  <div className="xhs-home-tabs">
    <button className={subTab === 'discover' ? 'active' : ''}>推荐</button>
    <button className={subTab === 'following' ? 'active' : ''}>关注</button>
  </div>
  
  {/* 右侧：搜索 + 通知 */}
  <div className="xhs-home-actions">
    <span>🔍</span>
    <span>🔔</span>
  </div>
</div>
```

```css
.xhs-home-tabs button {
  font-size: 16px;
  font-weight: 400;
  color: #999999;
  padding: 0 12px;
  position: relative;
}
.xhs-home-tabs button.active {
  font-weight: 600;
  color: #333333;
}
.xhs-home-tabs button.active::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: #FF2442;
  border-radius: 1.5px;
}
```

### 6.2 瀑布流布局（参考 `waterfall` 类）

```css
/* 2列瀑布流 */
.discover-feed {
  column-count: 2;
  column-gap: 8px;
  padding: 8px;
}

.post-card {
  break-inside: avoid;
  margin-bottom: 8px;
  border-radius: 12px;
  overflow: hidden;
  background: #FFFFFF;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
```

### 6.3 PostCard 组件规范

```
┌────────────────────┐
│  [图像区]          │
│  aspect: variable  │
│  bg: gradient(XHS) │  ← 无真实图片，用 AI 描述文字 + 渐变背景
├────────────────────┤
│  标题/正文（2行截断）│
│  font-size: 13px   │
│  color: #333333    │
├────────────────────┤
│ [头像24px] 用户名  ♡│
│  font-size: 11px   │
│  color: #999999    │
└────────────────────┘
```

```tsx
// 图像区的 AI 内容占位（Phase 0-2 不使用真实图片生成）
<div
  className="post-card__image"
  style={{
    background: `linear-gradient(135deg, ${colorPalette[post.colorIndex][0]}, ${colorPalette[post.colorIndex][1]})`,
    aspectRatio: post.aspectRatio,  // 1:1 或 4:3 或 3:4，随机
  }}
>
  <span className="post-card__image-desc">{post.imageDescription}</span>
</div>
```

**占位图渐变色板**（避免纯灰色，增强真实感）：
```typescript
const colorPalette = [
  ['#FFD1DC', '#FFAEC9'],  // 浅粉
  ['#D1E8FF', '#A8D1FF'],  // 浅蓝
  ['#D4F1D4', '#A8E6A8'],  // 浅绿
  ['#FFF3CD', '#FFE59A'],  // 浅黄
  ['#E8D5F5', '#D1A8E8'],  // 浅紫
  ['#FFD9B3', '#FFBF7F'],  // 浅橙
]
```

### 6.4 回响注入点

| 回响等级 | DiscoverFeed 表现 |
|---------|-----------------|
| Lv.0 | 正常帖子 |
| Lv.1 | 某帖子标题有轻微词语重复 |
| Lv.2 | NPC 发帖内容与主角近期行为有「巧合」呼应 |
| Lv.3 | 多条帖子出现相互关联的主题 |
| Lv.4 | 某帖子内容直接像是在「评价主角」 |

---

## 7. 首页/关注（FollowingFeed — 锡陵晚报）

> **锡陵晚报**：游戏世界中的本地媒体账号（虚构，锡陵为游戏内城市）。  
> 玩家在游戏开始时已自动「关注」此账号。关注 Tab 内主要显示此账号的帖子，穿插少量 NPC 的帖子。

### 7.1 锡陵晚报帖子卡片规范

```
┌─────────────────────────────────────────┐
│  [大图 16:9]                             │
│  background: 深色渐变，叠加新闻感文字     │
├─────────────────────────────────────────┤
│  📰 新闻标题（最多2行，15px/500/333）    │
│  摘要文字，1-2句（13px/400/666，2行截断）│
│  ─────────────────────────────────────  │
│  [锡陵晚报头像16px] 锡陵晚报 · 2小时前   │
│                          ♡1.2k 💬 234   │
└─────────────────────────────────────────┘
```

```tsx
// 锡陵晚报帖子专属样式
function NewsPost({ post }: { post: NewsPost }) {
  return (
    <div className="news-post">
      {/* 新闻配图（深色调，新闻感） */}
      <div
        className="news-post__image"
        style={{
          background: `linear-gradient(180deg, #2A2A2A 0%, #1A1A2E 100%)`,
          aspectRatio: '16/9',
        }}
      >
        <div className="news-post__image-overlay">
          <span className="news-post__category">{post.category}</span>
        </div>
      </div>

      <div className="news-post__body">
        {/* 标题含 EchoText 注入 */}
        <h3 className="news-post__title">
          <EchoText content={post.headline} echoLevel={post.echoLevel} />
        </h3>
        <p className="news-post__summary">{post.summary}</p>

        <div className="news-post__footer">
          <div className="news-post__source">
            <img src="/assets/xiling-news-avatar.png" className="source-avatar" />
            <span>锡陵晚报</span>
            <span className="dot">·</span>
            <span>{post.relativeTime}</span>
          </div>
          <div className="news-post__stats">
            <span>♡ {post.likes}</span>
            <span>💬 {post.comments}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 7.2 锡陵晚报帖子分类

| 分类标签 | 触发条件 | 说明 |
|---------|---------|------|
| 教育 | 评价对象为学生/老师 | 如「某高校现象引关注」|
| 社会 | 评价影响幅度中等 | 如「本地一年轻人运气逆转」|
| 人物 | 评价对象直接关联 | 如「我市某市民获意外机遇」|
| 评论 | 回响 Lv.3+ | 带有哲学反思味道的社论 |

### 7.3 回响注入点

| 回响等级 | FollowingFeed 表现 |
|---------|-----------------|
| Lv.0 | 正常地方新闻 |
| Lv.2 | 新闻内容与主角某次评价结果「巧合」一致 |
| Lv.3 | 新闻标题使用主角熟悉的措辞 |
| Lv.4 | 新闻评论区出现「似乎针对主角」的内容 |

---

## 8. 颜色与字体系统

### 8.1 颜色 Token

```typescript
// src/styles/tokens.ts
export const XHS_COLORS = {
  // 品牌色
  primary:   '#FF2442',   // 小红书红，用于 active 状态、点赞、角标
  primaryBg: '#FFE8EC',   // 主角消息气泡背景

  // 文字
  textPrimary:   '#333333',
  textSecondary: '#666666',
  textTertiary:  '#999999',
  textDisabled:  '#CCCCCC',

  // 背景
  bgPage:   '#F5F5F5',
  bgCard:   '#FFFFFF',
  bgInput:  '#FAFAFA',

  // 边框/分割线
  border:   '#EBEBEB',
  divider:  '#F0F0F0',

  // 功能色
  success:  '#19be6b',
  warning:  '#f90',
  danger:   '#fa3534',
}
```

### 8.2 字体规范

| 用途 | font-size | font-weight | color |
|-----|-----------|-------------|-------|
| NavBar 标题 | 16px | 500 | `#333333` |
| Tab 激活 | 16px | 600 | `#333333` |
| Tab 未激活 | 16px | 400 | `#999999` |
| 帖子标题 | 14px | 500 | `#333333` |
| 帖子正文 | 13px | 400 | `#333333` |
| 用户名 | 11px | 400 | `#999999` |
| 时间戳 | 11px | 400 | `#CCCCCC` |
| Tab 标签 | 10px | 400 | `#999999` / `#FF2442` |
| 消息气泡 | 14px | 400 | `#333333` |
| 输入框 placeholder | 14px | 400 | `#CCCCCC` |

---

## 9. 评价与抉择 UI 位置规范

### 9.1 评价按钮区（聊天室内）

- 位置：紧贴聊天室输入区**上方**，从 `y: 100%` 滑入
- 覆盖输入区：评价按钮显示时，输入区向上推移或隐藏
- 样式：白色背景 + 顶部边框 `#EBEBEB`，圆角 `12px 12px 0 0`

### 9.2 抉择覆盖层

- 位置：覆盖整个 `PhoneFrame` appViewport（`position: absolute; inset: 0`）
- 背景：`rgba(0,0,0,0.85)` 半透明遮罩
- 进入动画：`opacity: 0 → 1`，持续 300ms
- 选项按钮：`#2A2A2A` 背景，16px 高度，`border-radius: 8px`

### 9.3 帖子内小型评价（DiscoverFeed）

- 点赞操作（♡）：轻量评价，等同于「二分正面评价」
- 评论入口（💬）：进入帖子详情后可发评论，触发「反应」记录
- 无显式「评价按钮区」——评价融入自然操作中（惯性共谋设计）

---

## 10. 状态机对应（UIStore 字段）

```typescript
// 新版 UIStore 核心字段
interface UIStore {
  currentTab: 'home' | 'note' | 'publish' | 'message' | 'profile'
  homeSubTab: 'discover' | 'following'   // 首页内子Tab
  chatRoomNpcId: string | null           // 当前打开的聊天室 NPC ID
  pendingEvaluation: EvaluationOpportunity | null
  pendingDecision: DecisionNode | null
  isAILoading: boolean
  animationLock: boolean
}
```

---

## 11. 文件引用索引

| 参考文件 | 提取内容 |
|---------|---------|
| `xhs-h5.fake/static/js/index.129038e7.js` | 路由定义、emoji 列表、时间格式化 |
| `xhs-h5.fake/static/js/chatSub-room-single.b5123da3.js` | 消息气泡结构、输入区布局 |
| `xhs-h5.fake/static/js/pages-index-index.c8ca4383.js` | 首页/feed 结构 |
| `xhs-h5.fake/static/index.ed4a2d2b.css` | TabBar CSS、NavBar CSS、基础 token |
| `xhs-h5.fake/static/js/chatSub-room-history...` | NavBar 组件、emoji 选择器 |
