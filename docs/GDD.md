# AI Native剧情游戏《回声评价》——游戏开发设计文档

## 文档信息

| 项目 | 内容 |
|------|------|
| 项目名称 | 《回声评价》（Echo Judgment） |
| 文档类型 | 游戏开发设计文档（GDD） |
| 开发平台 | Web端（浏览器） |
| 游戏类型 | AI Native叙事 + 策略决策 + 互动小说 |
| 目标受众 | 16-35岁叙事游戏爱好者、社会心理学兴趣者 |
| 参考游戏 | _turing、1001 Nights、Quest Machina、FT Climate Game、WILL:美好世界、Replica、奇异人生 |
| **文档版本** | **v2.0（研究增强版）** |
| 更新说明 | 基于联网研究补充了学术引用、AI 实现细节、MVP 路线图与数据模型设计；修正了 Yoroll.ai 架构描述 |

---

## 第一章：项目概述与设计理念

### 1.1 项目定位

《回声评价》是一款以“评价”为核心机制的AI native剧情游戏。玩家在网络化社交语境下获得“评价影响他人命运”的神秘能力，由此卷入一场关于权力、道德与人性的深层叙事。游戏融合叙事驱动与策略决策，将日常语境下的“打分”“点评”“排位”等评价行为转化为游戏核心操作，借由AI驱动生成个性化的剧情走向与被评价者的命运演绎。

**AI Native的定义与定位**：本游戏参考了“1001 Nights”的设计理念——该游戏被学界定义为AI-native game，其核心特征在于“GenAI不仅是功能增强，而是游戏存在和机制的基础”（Sun et al., AAAI/AIIDE 2023）。在1001 Nights中，玩家通过与大语言模型驱动的角色进行共创叙事来引导游戏现实中的故事走向，AI不再只是辅助工具，而是游戏本体不可分割的一部分。本游戏继承这一核心理念：AI将基于玩家对每位角色的评价数据，实时驱动角色命运的生成与分支剧情的走向，而非简单地从预设分支中选取。

**AI Native 的进一步界定**：参考 Hilary Mason 对生成式 AI 游戏的定义（"core mechanic, not augmentation"），本游戏的 AI 并非用来自动生成静态剧本的管线工具，而是**每回合都在线的叙事引擎**。每一次评价操作都会通过 LLM 实时重算角色状态与世界叙事，使每个玩家的游玩过程产生唯一的因果链。

### 1.2 设计哲学

- **“评价即命运”**：每一次打分、每一次排位都是对他人命运的介入
- **“回荡即报应”**：对他人的评价终将回响在自己身上，体现人性的复杂与多样
- **“语言即现实”**：与1001 Nights一致，本游戏也受到维特根斯坦“语言边界即世界边界”的理念影响——玩家的评价语言实实在在地塑造游戏世界的形态
- **“真实心理投射”**：游戏系统会记录和分析玩家的评价习惯，映射其心理学特征
- **“不可逆性”**：与奇异人生不同，本游戏中一旦做出评价和选择，无法“时光回溯”更改
- **“约束即创造力”**：参考 Hilary Mason 提出的 GenAI 游戏设计原则——AI 的创造力应当在明确的规则和约束下释放。玩家拥有清晰的目标（做出评价），而 AI 负责生成无限种评价后果的叙事演绎（Mason, 2026）

### 1.3 参考游戏与设计启示

| 参考游戏 | 核心借鉴 | 差异化设计 |
|----------|----------|------------|
| **_turing / 1001 Nights** | 玩家通过语言输入影响叙事，AI驱动角色行为，共创式叙事。1001 Nights 已在 AAAI/AIIDE 2023 发表，其关键架构为“Language as Reality”——将自然语言直接转化为游戏状态。参见 Sun et al., 2023 论文与 GitHub 开源项目[^1001] | 将自由文本改为结构化评价+排列操作，降低门槛同时保留策略深度 |
| **Quest Machina** | 每次游玩生成独特故事线，输入影响AI生成内容，多重结局。该作由 Small Train Games 开发，Steam 已上线，使用 OpenAI API 生成叙事、Leonardo.ai 生成美术[^quest] | 增加数据库驱动的连贯叙事与心理学评估层，提升叙事一致性 |
| **FT Climate Game** | 400+决策点的长期策略体验，量化结果反馈 | 将“全球政策”缩小为“人际评价”，保持类似的影响力数据可视化 |
| **WILL:美好世界** | 排列/重排改变命运的核心机制，蝴蝶效应叙事。玩家通过调整信件中文字的顺序来改变收信人命运[^will] | 将“文字顺序重排”发展为“对人的评价排序”，引入社交维度与连锁反应机制 |
| **Replica** | 通过手机/社交媒体界面展开叙事，窥探他人隐私的道德困境。由 Somi 开发，全程在手机 UI 中推进[^replica] | 将“窥探”扩展为“评价+影响”，玩家从被动观察者变为主动干预者 |
| **奇异人生** | 蝴蝶效应叙事，超能力设定，选择驱动情感代入 | 去除“时光回溯”机制，强化选择的不可逆性和评价的滞后回荡效应 |

[^1001]: 1001 Nights 项目主页: https://1001nights.ai/ | 论文预印本: arXiv:2308.12915 | 开源代码: https://github.com/Yuukin98/1001nights
[^quest]: Quest Machina Steam 页面: https://store.steampowered.com/app/2954080/Quest_Machina/ | 开发博客: https://medium.com/@atakan.uzun98/quest-machina-gdc-2025-b32a9db90e3d
[^will]: WILL: 美好世界 Steam 页面: https://store.steampowered.com/app/650450/WILL_A_Wonderful_World/
[^replica]: Replica Steam 页面: https://store.steampowered.com/app/508400/Replica/

## 第二章：世界观设定与故事背景

### 2.1 超现实世界观

**表层世界**：一个与当代都市别无二致的社会。人们生活在密集的社交网络中，日常使用各种社交媒体的评价功能——点赞、打分、点评、排位——这些看似平常的行为构成了人际交往的底色。

**里层世界（“回响域”）**：一个隐秘的、不受物理法则约束的维度。在这里，人与人之间的评价不再是虚无的言语，而是拥有真实“重量”的力量。极度负面的评价会像铅块一样压垮一个人的精神；真诚的赞美则如光照亮前路。极少数的“感知者”能够察觉回响域的存在，而更罕见的“评价者”则拥有直接影响回响域的能力。

**游戏的哲学根基**：
- **存在主义视角**：萨特说“他人即地狱”——他人的注视和评价构成了我们自我认知的牢笼
- **社会评价恐惧理论**：Weeks等人提出的“双价评价恐惧模型”（Bivalent Fear of Evaluation Model）揭示了人们不仅恐惧负面评价，同样恐惧正面评价——后者可能导致社会地位上升、引发他人嫉妒与更激烈的社会竞争（Weeks & Howell, 2012）
- **“评价恐惧”心理学**：负面评价恐惧被定义为“对他人评价的忧惧，为负面评价而苦恼，以及对他人可能给自己负面性评价的预期”，是社交焦虑的核心特征；而正面评价恐惧是指“对他人给予的积极评价感到恐惧，并因此而担忧”，因为“正面评价会将自己和他人进行比较，并担心其背后的动机”（Weeks et al., 2010; Wallace & Alden, 1997）
- **维特根斯坦“语言的边界”**：你的评价语言定义了被评价者在你世界中的存在方式

### 2.2 主角设定

**姓名**：林一（可自定义）
**出身**：普通大学毕业生，社媒评价记录上的“正常人”——从不给人打一星，也很少打五星，习惯给出中庸的3-4星评价
**性格底色**：善良但不果断，敏感但习惯压抑情绪，在群体中习惯处于“不显眼”的位置——这恰恰是“评价顾虑”心理的体现，即因害怕被他人评价而在社交场合中选择退缩
**初始状态**：毕业后进入一家小型文创公司工作，生活平淡，社交圈狭窄但稳定

### 2.3 能力觉醒

**触发事件**：某天深夜，主角在手机上收到一条匿名短信：“你被选中了。现在，你的评价将比其他人多一分重量。”

起初主角以为这是一个恶作剧，直到第二天他在公司的匿名评分系统上给一位同事打了低分——当天下午，这位同事的项目被突然叫停。几天后，他在社交媒体上给一位街头歌手点了五星好评——第二天，这位歌手接到了一家唱片公司的签约邀请。

主角开始惊恐地意识到：**他的评价具有了影响他人现实命运的实质性力量。**

### 2.4 主线剧情框架（四幕）

**第一幕：发现（Discovery）**
- 能力意外觉醒
- 初步验证评价的影响力
- 结识第一组关键NPC（被评价者群体）
- 引入“评价者”秘密社群的第一条线索
- **玩家操作引入**：玩家开始获得打分机会

**第二幕：滥用与沉迷（Power Trip）**
- 主角开始主动使用评价能力
- 帮助朋友、惩罚不喜欢的人
- 遭遇第一次“回荡”——之前评价的人反过来影响主角
- 道德边界逐渐模糊
- **玩家操作深化**：引入“排列”机制，需要策略性分配评价

**第三幕：恐惧与崩溃（Descent）**
- 回荡频率加强
- 主角发现自己的命运也在被他人评价
- 恐惧和偏执导致社交退缩和决策失误
- 第一次无法控制的灾难性后果
- **玩家操作压力**：评价产生不可预见的连锁反应，排列变得极其困难

**第四幕：真相与抉择（Revelation）**
- 得知“评价者”不止自己一人——甚至可能是所有人
- 面对最终道德抉择
- 多结局分叉
- **玩家操作终局**：最关键的一次评价选择

### 2.5 支线剧情

每个关键NPC都有一条独立的支线，讲述他们作为被评价者的完整故事，揭示主线中无法完全展开的背景和情感层次。支线剧情通过特定的评价组合解锁，提供额外的世界观细节和角色背景。

### 2.6 世界观补全：评价者社群与回荡机制

**“评价者”历史**：
- “评价者”并非新现象。17世纪的沙龙文化中，某些贵妇人的口头评价能决定一个艺术家的前程——她们被称为“社交法官”
- 20世纪，随着大众媒体兴起，“评价者”的能力更加隐蔽但也更加深远
- 21世纪互联网社交媒体的出现，使得评价行为变得空前普及——但大多数人不知道，某些评价拥有“超越数据”的力量

**回荡机制的哲学意涵**：
- **回荡类型A：镜像回荡**——玩家对他人打出的评价分数和类型，会以相似的形式反弹到自己身上。例如，频繁打出恶意低分的玩家，会发现自己也开始在社会关系中收到莫名其妙的低评价
- **回荡类型B：连锁回荡**——玩家的某个评价引发了蝴蝶效应，最终影响到自己的利益链。例如，玩家给某位供应商打低分，导致该供应商的业务崩溃，进而影响到玩家所在公司的供应链
- **回荡类型C：认知回荡**——玩家的评价习惯会内化为自我评价的标准。频繁对人严苛评价的玩家，会逐渐以同样的严苛标准审视自己，最终陷入自我否定的循环——这在心理学上被称为“反刍思维”（rumination），一种反复思考负面情境的心理过程，使个体陷入“观察者视角”的自我批判（Nolen-Hoeksema et al., 2008）
- **回荡类型D：好人困境**——即使是给所有人打出满分好评的“老好人”，也会经历回荡。一方面，过度正面评价导致他人对玩家产生过高期待；另一方面，这种“无差别正面评价”本身会被其他评价者视为不真实，从而引发针对玩家的负面评价——这呼应了正面评价恐惧的心理学机制：个体担心正面评价会“增加他人对自己的关注和期望，从而会导致一系列的威胁”（Weeks et al., 2008）

## 第三章：核心玩法设计

### 3.1 玩法概述

游戏以回合制推进，每回合玩家面对以下操作：

| 操作类型 | 说明 | 使用场景 |
|----------|------|----------|
| **继续** | 推进剧情，阅读叙事内容 | 无评价对象的纯叙事段落 |
| **打分** | 对特定人物/事件作出评价 | 质化评价：0/1好坏、1-5星、1-10分 |
| **排列** | 对多个被评价者进行序位排列 | 量化比较：排位越靠后等效分数越低 |

**创新点**：与传统叙事游戏中的“选项分支”不同，本游戏将日常社交中无处不在的“评分行为”转化为核心玩法——贴合当代用户在各类App中评价的习惯（评分、点评、点赞/踩、排行榜），同时呼应WILL:美好世界通过重排改变命运的设计思路：“重新排列文字顺序，组合新的命运”。在本游戏中，玩家重排的不是文字，而是对人的评价序位。

### 3.2 评分系统设计细则

三种评分量级在不同剧情场景下自动启用。启用哪种量级并非由玩家选择，而是由剧情场景决定——严肃场景使用0/1二元评价（如决定是否举报一个人），日常场景使用5星制（如评价同事的工作表现），重要抉择使用10分制（如评价一个对手的终生贡献）。

**0/1二元评价——“判决”**：
- 场景：道德抉择、法律设定、生死攸关
- 示例：“是否原谅背叛你的朋友？”→ 原谅(1) / 不原谅(0)
- 设计参考：FT Climate Game中的二元政策选择——支持还是反对某项决策，影响长远结果

**1-5星评价——“日常评分”**：
- 场景：工作关系、社交互动、日常接触
- 示例：“对同事小王本次项目表现的评价”→ ★★★★☆
- 设计参考：贴合现代App的五星评分习惯，降低认知门槛

**1-10分评价——“深度评判”**：
- 场景：重大事件、人生节点、命运转折
- 示例：“请对学生张明本次高考的表现打分”→ 7/10
- 设计参考：FT Climate Game中400+决策点的量化设计

### 3.3 排列系统设计细节

**适用场景**：
- 公司年度评优排序（影响同事的职业发展）
- 创意方案评选排位（影响创作者的前途）
- 群体面试候选排序（影响每个人的录用机会）

**等效分数映射**：
- 排序越靠前，等效分数越高
- 例如5人排列：第1位→等效9.5分，第2位→8分，第3位→6分，第4位→4分，第5位→2分

**策略性体现**：
- 有限空间内进行资源/机会分配
- 玩家的排序实际上是在不同人的命运之间作权衡
- 被排在末尾的角色将会在后续剧情中展现出强烈的反应
- WILL:美好世界中对排列组合的“爆发式增长”处理方式被借鉴——通过逻辑分类为每种组合安排合理的剧情结果

### 3.4 评价→波动→回荡因果链

```
玩家评价（输入）
    ↓
AI评估玩家输入（心理学评估）
    ↓
AI生成被评价者命运波动（短期+长期）
    ↓ 时间推进
命运波动触发回荡（反弹至玩家）
    ↓
玩家因回荡而做出后续评价（再次输入）
    ↓
循环往复，滑向终局
```

**短期波动（即时-几天内）**：
- 正面波动：被评高分者获得机会、灵感、贵人相助
- 负面波动：被评低分者遭遇挫折、厄运、人际疏离

**长期波动（几周-几个月后）**：
- 命运轨迹偏离或回归
- 连锁反应波及相关人物
- 社会网络结构的重组

**回荡触发条件**：
- 评价累积达到一定阈值
- 关键剧情节点
- 被评价者与主角的关系网络重叠区

**回荡强度因素**：
- 评价极端程度（极低/极高分回荡更强）
- 被评价者与主角的社会距离（越近越强）
- 评价频率（频繁评价同一对象增强回荡）

## 第四章：AI系统架构设计

### 4.1 整体架构

借鉴“1001 Nights”中将GenAI作为游戏核心机制的设计思路，本游戏构建了以下AI系统架构。在1001 Nights中，GPT-4和Stable Diffusion被用于驱动角色行为和游戏世界生成；Quest Machina则展示了AI如何在每次游玩中生成独特的故事线和最终Boss。

**核心架构原则——“LLM 描述，引擎验证”**：参考 Quest Keeper AI（Kaub, 2024）提出的确定性后端设计[^kaub]，本游戏采用一个关键原则：**所有游戏世界状态均来自数据库与确定性逻辑，而非 LLM 的即兴编造**。LLM 的任务是“描述”当前状态和生成叙事文本，而状态变更必须通过预定义的函数调用由后端因果图计算后写入数据库。这一设计从根本上解决了 LLM 叙事中最棘手的“幻觉”与“剧透”问题。

[^kaub]: Kaub, J. (2024). *How I Built an LLM-Based Game from Scratch*. Towards Data Science. https://towardsdatascience.com/how-i-built-an-llm-based-game-from-scratch-86ac55ec7a10/

**架构总览图**：

```
┌─────────────────────────────────────────────────────────────┐
│                    前端呈现层 (Presentation Layer)            │
│   剧情阅读界面  │  评价操作面板  │  命运数据看板  │  角色状态界面  │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    游戏逻辑层 (Game Logic Layer)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ 回合流程管理  │  │ 评价策略计算  │  │ 回荡触发判断  │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ 心理学评估模块│  │ 分支叙事管理  │  │ 状态一致性检查│        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                     AI生成层 (AI Generation Layer)            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ 对话与叙事    │  │ 命运波动生成  │  │ 角色动机推导  │        │
│  │ LLM (Qwen3)  │  │ LLM + 逻辑   │  │ LLM + 历史   │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ 情节一致性   │  │ 用户画像生成  │  │ 回荡叙事生成  │        │
│  │ 验证模块     │  │ (心理学维度) │  │              │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    数据持久层 (Data Persistence Layer)        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ 角色状态数据库│  │ 评价历史记录  │  │ 剧情节点图谱  │        │
│  │ (MongoDB)    │  │              │  │              │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│  ┌──────────────┐  ┌──────────────┐                          │
│  │ 对话记忆缓存  │  │ 用户心理画像  │                          │
│  └──────────────┘  └──────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

**关于 Yoroll.ai 架构的说明**：原 GDD v1 引用了 Yoroll.ai 的三层架构。经核实，Yoroll.ai 提出的真实架构为 **Expression（世界模型生成）/ Judgment（VLM 观察与评判）/ State（传统确定性逻辑）**三层，其核心目标是构建“无引擎”的生成式视频游戏，与本项目的架构思路存在差异[^yoroll]。本游戏采用的是更接近 Quest Keeper AI 的“确定性后端 + LLM 叙事层”架构，上文架构图已据此修正。

[^yoroll]: Yoroll (2025). *The Three-Layer Architecture for AI-Native Games*. https://yoroll.ai/blog/three-layer-architecture

### 4.2 模块详解

#### 4.2.1 用户心理评估模块

**评估维度**：

| 维度 | 测量方式 | 心理学依据 |
|------|----------|------------|
| 评价倾向性 | 正评频率 vs 负评频率 | 基于评价恐惧理论区分正面/负面评价倾向 |
| 评价极端程度 | 评分分布的标准差 | 高分/低分聚集度反映认知风格 |
| 社交亲近度偏好 | 对不同社会距离角色的评价差异 | 内群体偏好 vs 外群体偏见 |
| 一致性/随意性 | 对同类角色的评价一致性 | 反映评价是否基于真实判断 |
| 排列偏好模式 | 排列中体现的价值取向 | 功利主义 vs 道义主义倾向 |

**评估输出**：生成玩家“评价人格画像”，影响后续AI生成的叙事风格、回荡类型和结局走向。

**心理学理论应用**：
- “双价评价恐惧模型”：正面评价带来的压力同样令人不安，游戏系统会同时追踪玩家对正负评价的接受度，在合适的时机给予正面或负面的回荡
- “评价顾虑”：在他人存在的情境中，因害怕被评价而改变行为，这一心理现象将被用于设计主角面对“被评价”时的内心独白和情绪反应
- “反刍思维”：反复思考负面情境，使个体陷入“观察者视角”的自我批判——用于第三幕主角恐惧崩溃阶段的心理描写

#### 4.2.2 AI对话与情节生成

借鉴1001 Nights中玩家通过对话引导AI走向关键词（使用GPT-4实现）的设计思路，但本游戏在对话生成的基础上加入“评价驱动的叙事分支”。

**核心原则**：
- 每次调用LLM时注入当前角色状态、评价历史和玩家画像作为上下文
- 控制生成内容的“命运波动”幅度在设定范围内
- 确保叙事连续性——使用情节一致性验证模块

**叙事一致性设计——解决AI幻觉问题**：参考 NarrativeGenie（Kumaran et al., AIIDE 2024）的框架——生成“叙事节拍”（narrative beats）作为有凝聚力的、部分有序的事件序列，确保AI生成的剧情在保持玩家自主性的同时不偏离整体故事弧线[^narrativegenie]。同时结合 Quest Keeper AI 的“函数调用”方法增强叙事质量和状态更新一致性——当AI生成的剧情偏离预设逻辑时，一致性验证模块通过函数调用对生成内容进行约束和修正。

[^narrativegenie]: Kumaran, V., Rowe, J. P., & Lester, J. C. (2024). *NarrativeGenie: Generating Dynamic and Cohesive Narrative Events for AI-Driven Role-Playing Games*. AIIDE 2024. https://arxiv.org/abs/2410.18896

**“受控幻觉”策略（Controlled Hallucination）**：
根据 DiGRA 2024 对 1001 Nights 的研究，LLM 的叙事幻觉在某些场景下可以被转化为设计特征[^digrallm]。在本游戏中，AI 生成角色行为时的轻微偏差可以被包装为“回响域的不稳定性”——一种超自然的力量扰动。但这仅适用于非关键状态的“ flavor text ”；所有涉及角色状态数值变更、剧情分支切换的操作，必须通过 function calling 由确定性后端执行。

[^digrallm]: Reconceptualizing LLM-Induced Hallucinations as Game Mechanics. DiGRA 2024. https://dl.digra.org/index.php/dl/article/download/2426/2419/2455

**对话记忆管理**：
- 短期缓存：最近5个回合的对话内容
- 长期存储：关键评价事件和命运转折节点
- 上下文压缩：将历史信息压缩为摘要注入prompt

**时间点一致性（Point-in-Time Consistency）**：
参考 TimeChara 基准测试（Zhang et al., 2025）的研究结论[^timechara]，LLM 扮演虚构角色时最容易在时间轴上“剧透”或遗忘已发生事件。本游戏采用以下策略：
- **状态过滤**：每次调用 LLM 前，通过 `filter_game_state` 函数过滤因果图，仅暴露当前时间点玩家**已发生且已知情**的事件，隐藏未来剧情与未知信息
- **时间点锁定**：在 prompt 中明确声明“当前时间点”和“该角色此时已知的信息边界”
- **专家迭代**：当检测到时间线矛盾时，触发一致性验证 agent 重新生成

[^timechara]: Zhang et al. (2025). *TimeChara: Evaluating Point-in-Time Character Hallucination of Role-Playing Large Language Models*. https://arxiv.org/abs/2503.10672

#### 4.2.3 命运波动计算模型

**输入变量**：
- 评价分数（标准化至0-1）
- 评价量级（二元/5星/10分）、评价频率
- 被评价者当前状态、与主角的社会距离
- 当前剧情幕数（不同幕允许的波动幅度不同）

**输出变量**（由AI生成具体叙事）：
- 短期波动类型（积极/消极/中性）
- 长期波动程度
- 波动影响的次要角色列表
- 潜在回荡标记

#### 4.2.4 数据分析与统计

借鉴FT Climate Game的量化反馈设计，玩家在结束一个阶段后可以看到类似“数据仪表盘”的结果总结——不是全球温度，而是“你的人际影响足迹”：

- **评价统计**：正面/负面评价比例、平均分数、评价分布
- **影响量化**：直接影响的角色数量、连锁波动次数、回荡遭遇频率
- **心理学洞察**：根据评价模式推理的心理特征标签
- **命运轨迹**：关键角色受评价影响前后的状态变化可视化

## 第五章：技术方案选择

### 5.1 总体技术选型

| 层级 | 技术方案 | 选择理由 |
|------|----------|----------|
| **前端框架** | React 18 + TypeScript | Web端主流方案，组件化支持复杂UI |
| **状态管理** | Zustand | 轻量，适合单页游戏的客户端状态；支持持久化中间件 |
| **后端框架** | Node.js + Express + TypeScript | JavaScript全栈一致性，快速原型 |
| **数据库** | MongoDB (文档) + Redis (缓存) | 灵活的文档结构适合存储角色状态；Redis 缓存 LLM 上下文 |
| **AI API** | 阿里云 DashScope (通义千问 Qwen3-Max) | 项目 .env 已配置 DashScope OpenAI 兼容端点，支持 function calling 与流式输出 |
| **前端动画** | Framer Motion | 提供视觉戏剧性，声明式 API 适合 React |
| **数据可视化** | Recharts | 心理评估仪表盘和命运波动的数据可视化呈现 |
| **部署** | Vercel (前端) + 阿里云/Render (后端) | Web端标准部署方案 |

**Qwen3-Max 集成要点**：
- 端点：`https://dashscope-intl.aliyuncs.com/compatible-mode/v1`
- 模型 ID：`qwen3-max`
- 兼容模式：完全兼容 OpenAI SDK 协议，支持 `chat.completions.create` 的 `stream`、`tools` 和 `tool_choice` 参数
- **流式输出**：前端通过 `stream: true` 获取 SSE 流，实现逐字呈现叙事文本
- **Function Calling**：通过 `tools` 字段定义结构化函数（见 5.3 节），模型返回 `tool_calls` 后由后端执行状态更新
- **思考模式控制**：Qwen3 默认启用“深度思考”模式。对于需要快速响应的命运评估等场景，可通过 `extra_body.chat_template_kwargs.enable_thinking=false` 关闭思考以加快响应；对于重大叙事转折场景，保留思考模式以获得更高质量输出

### 5.2 前端架构设计

**核心页面**：
1. **剧情阅读器**（主页面）：文本展示、动画效果、环境氛围
2. **评价操作面板**：打分/排列的UI组件，三类评分的不同交互方式
3. **角色档案簿**：已遇NPC的状态和关系追踪
4. **命运数据看板**：玩家评价行为的数据统计与可视化
5. **设置与存档**：游戏存档管理和个性化设置

**自定义剧情阅读器设计——参考Replica的沉浸感设计**：Replica通过手机界面进行游戏叙事——玩家通过“窥探他人手机”来推进故事。本游戏中，剧情阅读器也模拟UI界面风格，融入以下元素来增强沉浸感：
- **社交动态流**：剧情中插入类似社交App时间线的展示方式
- **即时消息界面**：角色之间的对话以消息气泡形式呈现
- **匿名评价系统**：玩家做出的评价以系统通知的形式反馈
- **状态变化通知**：被评价者命运发生变化时以推送式通知呈现

### 5.3 AI服务架构——提示词工程与幻觉管理

**核心架构模式：确定性因果图 + Function Calling**

参考 Quest Keeper AI（Kaub, 2024）的设计，本游戏在后端维护一个**因果图（Causal Graph）**，存储所有剧情事件、角色状态、可用行动及其后果。LLM 不直接修改游戏状态；LLM 仅负责生成叙事描述，状态变更通过 function calling 由确定性后端执行。

**预定义 Function 集合**：

```typescript
// 1. 过滤当前可用的游戏状态（防止剧透）
function filter_game_state(sceneId: string, playerKnownEvents: string[]): {
  availableActions: Action[];
  visibleCharacters: Character[];
  currentNarrativeContext: string;
}

// 2. 执行评价并计算命运波动
function apply_evaluation(
  targetId: string,
  evaluationType: 'binary' | 'star5' | 'point10' | 'ranking',
  rawValue: number | number[],
  playerProfile: PlayerProfile
): {
  fateChange: FateDelta;
  shortTermEffect: string;
  longTermTag: string;
  echoProbability: number;
  echoType?: EchoType;
}

// 3. 触发回荡事件
function trigger_echo(
  echoType: 'mirror' | 'chain' | 'cognitive' | 'good-person',
  intensity: number,
  sourceEvaluationId: string
): EchoEvent

// 4. 更新角色状态（唯一的状态变更入口）
function update_character_state(
  characterId: string,
  moodDelta: number,
  fateDelta: FateDelta,
  relationshipChanges: RelationshipDelta[]
): CharacterState

// 5. 验证叙事一致性
function validate_narrative_consistency(
  generatedText: string,
  characterHistories: CharacterHistory[],
  currentTimeline: number
): { isConsistent: boolean; violations: string[] }
```

**提示词设计原则**：

1. **角色锚定**：每次AI调用注入角色的核心人格参数
   ```
   [系统指令] 你现在扮演角色“陈墨”。你是28岁的独立插画师，性格内向敏感。
   当前状态：焦虑（因最近收到匿名差评）。你对主角林一的信任度为0.6（0-1）。
   请根据以下场景生成回应...
   ```

2. **叙事边界控制**：通过 function calling 约束AI输出范围
   - 所有状态变更必须通过 `update_character_state` 或 `apply_evaluation` 完成
   - 不允许 LLM 在自由文本中声明“某某角色获得了晋升”等确定性事实——这类陈述必须由后端因果图计算后，再由 LLM 进行叙事包装

3. **幻觉管理**：AI生成内容必须通过一致性验证
   - 使用 `validate_narrative_consistency` 将AI输出与数据库中的角色历史进行交叉验证
   - 在关键情节节点增加人工设计“锚点叙事”，确保总体故事主线不受AI波动影响
   - 负面处理：当检测到叙事不一致时，自动回滚并重新生成，或在保留玩家选择的前提下修复矛盾部分

**API调用策略**：

| 场景 | 模型配置 | 流式 | 说明 |
|------|----------|------|------|
| 命运评估、短期波动 | Qwen3-Max (关闭思考) | 是 | 快速反馈，低延迟 |
| 角色内心独白、对话 | Qwen3-Max (关闭思考) | 是 | 中等质量，实时呈现 |
| 重大命运转折、长段叙事 | Qwen3-Max (开启思考) | 是 | 高质量文学性生成 |
| 一致性验证、状态更新 | 后端确定性逻辑 | 否 | 零幻觉，零 API 成本 |

**缓存复用**：
- 对重复场景的叙事描述进行缓存（Redis key: `narrative:{sceneId}:{characterHash}`）
- 玩家心理画像更新频率低于每回合，可缓存于内存

## 第六章：多结局与情感曲线设计

### 6.1 结局系统

**结局由三个维度共同决定**：

| 维度 | 计算方式 | 影响 |
|------|----------|------|
| 评价倾向得分 | 正评比例 - 负评比例 | 角色自我认知的性质和结局的基调 |
| 回荡承受度 | 面对回荡时的应对方式 | 角色精神状态和成长/崩溃程度 |
| 关键抉择 | 第四幕的重大选择 | 剧情的具体最终走向 |

**多维交汇→结局名称→结局叙事**：
- 上述三个维度形成多种组合，每种组合对应一个独特的结局叙事
- 不存在简单的“好结局/坏结局”二元对立，每种结局都有其合理性与悲剧/希望成分，反映人性的复杂性

**可重玩性设计**：
- 每次游戏结束后展示“评价人格画像”（本次人格类型 + 关键数据统计）
- 提示玩家还有哪些支线剧情未解锁
- 鼓励玩家以不同评价策略重玩游戏，发现被隐藏的叙事碎片

### 6.2 玩家情感曲线设计——学习奇异人生的选择机制

参考《奇异人生》中玩家选择机制的设计与批评：

- **回溯机制的问题**：在奇异人生中，Max 的时光回溯能力虽然增加了策略深度，但也被批评为“将存档读档变成了核心机制”，导致选择的紧迫感和情感重量被削弱（Bailes, 2016; Barnett, 2023）。本游戏去除回溯，正是对这一设计缺陷的回应——强化不可逆性，让每一次评价都具有真实的道德重量。
- **“霍布森选择”陷阱**：奇异人生第一章中，部分选择无论怎么选都导向相同结果，被玩家批评为“假选择”（Hobson's choice）。本游戏的早期选择虽然短期内不会产生巨大分歧，但会**在数据层面**被记录为玩家的评价偏好，从而在第二幕之后逐渐显现出显著的叙事差异，确保“选择取向”名副其实。

**情感曲线设计逻辑**：

| 游戏阶段 | 情感基调 | 设计方式 |
|----------|----------|----------|
| 第一幕 | 好奇 + 兴奋 | 能力刚发现，短期反馈积极但已有不安伏笔 |
| 第二幕 | 权力感 + 道德模糊 | 选择空间大，但第一次回荡出现引发疑问 |
| 第三幕 | 恐惧 + 崩溃 | 回荡频发造成心理压力，反刍思维加剧心理负担 |
| 第四幕 | 顿悟 + 抉择 | 真相揭示时的两种方向：觉醒走向新希望，或崩坏走向极端结局 |

### 6.3 回荡机制与人性复杂性体现

**四种回荡类型的叙事设计**：

1. **镜像回荡**：玩家对他人的评价分数被以相似的方式返还给自己——但返还的方式经过叙事包装，不是简单的复制粘贴
2. **连锁回荡**：评价引发的蝴蝶效应意外地烧回到玩家的利益网络
3. **认知回荡**：评价习惯内化为自我对话模式，改变玩家角色的内心独白语气和主题
4. **老好人回荡**：全部高分评价的玩家将面临正面评价恐惧的困境——别人对玩家的期望值不断攀升，最终无法满足而被反噬。这呼应了心理学的发现：人们害怕正面评价的原因在于“它可能带来社会地位的提升，从而引发更激烈的社会竞争”（Weeks et al., 2008）

## 第七章：特殊系统设计

### 7.1 “评价者视角”系统

随着剧情推进，主角逐渐获得看到他人评价（不只是自己的）的能力。这被设计为一个“能力解锁”系统：
- **第一阶段**（默认）：只能给出评价，看到被评价者的命运变化
- **第二阶段**（第二幕中期）：能感知到自己正在被他人评价，但看不到具体内容
- **第三阶段**（第三幕）：偶然能看到他人对其他人的评价记录
- **第四阶段**（第四幕）：真相揭示——认识到评价系统是一个所有人都在参与的网络，自己并非特殊的存在

每一阶段的解锁伴随着UI界面的变化——新增的数据呈现和叙事信息的扩展。

### 7.2 角色关系图谱系统

一个动态可视化的社交网络图，展示：
- 玩家与各NPC的关系状态
- NPC之间的相互关系
- 角色状态异常提示（正在经历波动的角色高亮显示）
- 被评价影响后的连锁变化以箭头动画显示

参考FT Climate Game的排放轨迹可视化设计——“每个玩家都会生成自己独特的温室气体排放轨迹……不是简单的一条轨道或另一条轨道”——本游戏中，每个玩家也会生成独特的“人际影响轨迹”，展示在不同社会关系维度上的评价涟漪效应。

### 7.3 回声日志系统

记录所有玩家的评价行为，以某种神秘叙事方式呈现——仿佛有一个看不见的记录者在写日志。日志不仅记录评价本身，还会添加一些带有暗示性的旁白，增强超现实感。这些旁白随游戏推进而改变语气，呼应主角心态的演变。

## 第八章：Web端用户体验设计

### 8.1 界面设计原则

- **沉浸优先**：叙事区占视觉中心，其他UI按需显示
- **触达即操作**：减少菜单层级，评价操作与剧情阅读同屏
- **反馈强化**：每次评价后的波动信息以独特的视觉/动效语言呈现
- **移动适配**：采用响应式设计，同时优化桌面端和手机端体验

### 8.2 核心交互流程

```
剧情表现 → [评价提示出现] → 玩家操作(打分/排列) → 
波动反馈 → 剧情继续 → [回荡提示出现（如触发）] → 玩家应对 →
进入下一回合
```

### 8.3 视觉风格

- **色调方案**：基础以低饱和冷色调为主（灰蓝/深灰），评价操作时色彩增强
- **动效设计**：命运波动以波动脉冲呈现（正面金、负面紫、中性蓝色渐变）
- **字体设计**：剧情文本使用衬线体营造文学感，评价界面上使用无衬线体保持当代感
- **氛围渲染**：背景随情绪变化——良好时平静淡雅，紧张时色彩偏移

### 8.4 辅助功能

- 剧情回放（非时间回溯，不能改变选择）
- 角色档案随时查阅
- 评价历史记录与数据统计
- 多存档位支持

## 第九章：关键风险与应对策略

| 风险 | 可能性 | 应对策略 |
|------|--------|----------|
| AI生成叙事不一致 | 中 | 引入“叙事节拍”约束机制（NarrativeGenie模式），结合 function calling 进行状态一致性验证（参考 Quest Keeper AI 的因果图架构），关键节点锚定人工撰写 |
| LLM API延迟影响体验 | 中 | 预生成+流式加载，低延迟场景关闭 Qwen3 思考模式，叙事类输出通过 streaming 实现逐字呈现；Redis 缓存高频复用场景 |
| 评价系统的策略深度不足 | 低 | 排列机制引入时间压力和社交网络效应的复杂度 |
| 剧情分支爆炸 | 高 | 采用“重点分支 + 情感变化”模型，而非完全自由分支，主线框架保持稳定；AI 生成的是叙事包装，分支节点由因果图预定义 |
| 文本内容量过大 | 中 | 利用AI生成辅助填充，人工审核修改，确保质量与效率平衡 |
| **LLM 幻觉导致角色“预知未来”** | 中 | 采用 TimeChara 研究中的时间点一致性策略：过滤未来信息、锁定时间轴、专家迭代验证 |
| **AI Native 游戏的接受度** | 低 | 参考 1001 Nights 的设计——降低自由文本门槛，使用结构化评价操作，让玩家更容易理解“AI 在生成什么” |

## 第十章：MVP 开发路线图

> 本章节为 v2.0 新增，基于 GDD 全量设计进行阶段性拆解，确保项目可落地。

### 10.1 MVP 阶段（可玩原型，4-6 周）

**目标**：实现第一幕“发现”的完整可玩流程，验证核心循环（评价→波动→叙事）的技术可行性。

**范围**：
- **剧情**：第一幕全部内容（约 15-20 个评价节点）
- **NPC**：5 位核心角色（含完整的性格参数与状态模型）
- **评价系统**：5 星制 + 二元评价两种量级
- **排列系统**：暂不实现（放入 Alpha）
- **AI 集成**：Qwen3-Max 接入，实现单轮叙事生成 + function calling 状态更新
- **前端**：剧情阅读器 + 评价操作面板 + 基础角色档案
- **后端**：Express API + MongoDB 存储角色状态与评价历史
- **回荡系统**：仅实现“镜像回荡”一种类型（Alpha 扩展至四种）

**技术验证点**：
1. Qwen3-Max 的 function calling 在中文叙事场景下的可靠性
2. 流式输出在前端的逐字渲染性能
3. 状态过滤机制能否有效防止剧透/幻觉

### 10.2 Alpha 阶段（核心系统完整，6-8 周）

**目标**：扩展至第二幕“滥用与沉迷”，四种回荡类型全部实现，引入排列机制。

**范围**：
- **剧情**：第一幕 + 第二幕（约 40-50 个评价节点）
- **NPC**：8-10 位角色 + 2-3 条支线剧情
- **评价系统**：三种量级全部启用（二元 / 5星 / 10分）
- **排列系统**：3-5 人排列场景实现
- **回荡系统**：四种回荡类型全部实现
- **角色关系图谱**：基础可视化版本
- **心理学评估模块**：基础画像生成（评价倾向 + 极端程度）

### 10.3 Beta 阶段（完整体验，8-10 周）

**目标**：四幕完整剧情、多结局系统、回声日志、数据看板。

**范围**：
- **剧情**：全部四幕 + 所有支线
- **NPC**：12-15 位角色
- **心理学评估**：五维度完整画像
- **UI 打磨**：全部 8.3 节视觉风格实现
- **移动端适配**：响应式优化
- **存档与分享**：多存档位 + 评价人格画像分享

### 10.4 技术债务预留

- **Redis 缓存层**：MVP 阶段可使用内存缓存，Alpha 阶段接入 Redis
- **一致性验证 agent**：MVP 阶段使用规则引擎简单校验，Alpha 阶段引入轻量 LLM 二次验证
- **排列系统的等效分数映射**：MVP 预留接口，Alpha 填充算法

## 第十一章：数据模型与 API 设计

> 本章节为 v2.0 新增，提供可直接落地的技术实现细节。

### 11.1 MongoDB 核心集合设计

```typescript
// characters 集合
interface Character {
  _id: string;
  name: string;
  age: number;
  occupation: string;
  socialRole: string;
  // 人格参数（五大人格简化版）
  personality: {
    extraversion: number;      // -1 ~ 1
    neuroticism: number;       // -1 ~ 1
    openness: number;          // -1 ~ 1
    agreeableness: number;     // -1 ~ 1
    conscientiousness: number; // -1 ~ 1
  };
  // 当前状态
  currentState: {
    mood: number;              // -10 ~ 10
    careerProgress: number;    // 0 ~ 100
    socialStanding: number;    // 0 ~ 100
    hiddenSecretRevealed: boolean;
  };
  // 与主角关系
  relationshipWithPlayer: {
    familiarity: number;       // 0 ~ 1
    trust: number;             // 0 ~ 1
    hiddenAttitude: number;    // -1 ~ 1
  };
  // 评价敏感度
  sensitivity: {
    positiveFactor: number;    // 0.5 ~ 2.0
    negativeFactor: number;    // 0.5 ~ 2.0
    recoverySpeed: number;     // 0.1 ~ 1.0
    hiddenVulnerability: string;
  };
  // 支线剧情标签
  unlockableSubplots: string[];
  // 历史状态（用于 TimeChara 时间点一致性）
  stateHistory: {
    timeline: number;
    state: Character['currentState'];
    causedByEvaluationId?: string;
  }[];
}

// evaluations 集合
interface Evaluation {
  _id: string;
  playerId: string;
  sessionId: string;
  sceneId: string;
  targetId: string;            // 被评价角色ID
  type: 'binary' | 'star5' | 'point10' | 'ranking';
  rawValue: number | number[]; // 单个分数或排列数组
  normalizedScore: number;     // 标准化至 0~1
  timestamp: Date;
  actNumber: number;           // 第几幕
  // 计算后的波动
  fateDelta: {
    shortTermEffect: string;
    longTermTag: string;
  };
  // 回荡标记
  echoTriggered: boolean;
  echoType?: 'mirror' | 'chain' | 'cognitive' | 'good-person';
  echoResolved: boolean;
}

// player_profiles 集合
interface PlayerProfile {
  _id: string;
  playerId: string;
  // 五维度评估
  tendency: number;            // 正评倾向 -1~1
  extremity: number;           // 评分标准差 0~5
  socialProximityBias: number; // 社交亲近度偏好 -1~1
  consistency: number;         // 评价一致性 0~1
  rankingPreference: 'utilitarian' | 'deontological' | 'mixed';
  // 当前人格画像标签
  currentArchetype: string;
  // 历史记录摘要（用于上下文压缩）
  compressedHistory: string;
}

// scenes 集合（剧情节点图谱）
interface Scene {
  _id: string;
  sceneId: string;
  actNumber: number;
  sequence: number;
  title: string;
  description: string;         // 人工撰写的锚点叙事
  triggerCondition?: {
    requiredEvaluations?: string[];
    requiredState?: Record<string, any>;
  };
  availableActions: {
    actionId: string;
    type: 'continue' | 'evaluate' | 'rank';
    targetIds?: string[];
    evaluationType?: 'binary' | 'star5' | 'point10';
    rankingCount?: number;
  }[];
  // 因果图连接
  nextScenes: {
    sceneId: string;
    condition: string;         // 简化的条件表达式
  }[];
}
```

### 11.2 核心 API 路由设计

```
POST   /api/game/start              // 开始新游戏，初始化角色状态
GET    /api/game/session/:id        // 获取当前会话状态
POST   /api/game/evaluate           // 提交评价
GET    /api/game/stream-narrative   // SSE 流式获取叙事文本
POST   /api/game/advance            // 推进到下一回合
GET    /api/characters/:id          // 获取角色档案（时间点过滤）
GET    /api/player/profile          // 获取玩家心理画像
GET    /api/dashboard/stats         // 获取命运数据看板统计
POST   /api/save                    // 存档
GET    /api/save/:slot              // 读档
```

### 11.3 LLM Prompt 模板结构

**模板 1：叙事生成（Narrative Generation）**

```
你是一位精通心理惊悚叙事的作家，正在为互动小说《回声评价》撰写剧情。

【系统规则】
- 你只能描述当前场景下发生的事件和角色的情绪反应。
- 你不允许直接修改任何角色的状态数值。
- 如果你认为某个角色的状态应当改变，请使用 function_call: update_character_state。
- 当前时间点：第 {actNumber} 幕，回合 {turnNumber}。你只能引用该时间点之前已发生的事件。

【角色状态】
{characterStates}

【玩家刚刚做出的评价】
目标：{targetName}
评价类型：{evaluationType}
分数：{score}

【叙事要求】
- 基调：{tone}
- 长度：150-300字
- 必须包含：角色对评价的即时反应、环境细节暗示、一句内心独白
- 不要剧透未来的剧情节点

请生成叙事文本：
```

**模板 2：命运波动计算（Fate Fluctuation）**

```
你是一位社会动力学模拟专家。请根据以下输入，计算一次评价对被评价者命运的短期和长期影响。

【输入】
- 被评价者：{characterName}，当前状态 {currentState}
- 评价分数（标准化 0-1）：{normalizedScore}
- 评价量级：{evaluationType}
- 玩家评价人格画像：{playerProfile}
- 当前幕数：{actNumber}

【输出要求】（请严格使用 function_call: apply_evaluation）
- shortTermEffect：50字以内的即时事件描述
- longTermTag：一个标签，用于后续剧情检索（如 "career_boost", "social_isolation"）
- echoProbability：0-1 的回荡触发概率
- echoType：如有回荡，指定类型
```

### 11.4 前端状态管理设计（Zustand）

```typescript
interface GameStore {
  // 当前会话
  sessionId: string | null;
  currentAct: number;
  currentScene: Scene | null;
  narrativeText: string;
  isStreaming: boolean;

  // 角色数据
  characters: Record<string, Character>;

  // 玩家状态
  playerProfile: PlayerProfile | null;
  evaluationHistory: Evaluation[];

  // UI 状态
  pendingEvaluation: Evaluation | null;
  showEchoNotification: boolean;
  echoEvent: EchoEvent | null;

  // Actions
  startGame: () => Promise<void>;
  submitEvaluation: (eval: EvaluationInput) => Promise<void>;
  advanceScene: () => Promise<void>;
  loadSave: (slot: number) => Promise<void>;
}
```

## 第十二章：学术参考与延伸阅读

> 本章节汇总了本 GDD 中引用的学术文献与技术资料，便于团队深入研究与验证设计决策。

### 12.1 AI Native 游戏设计

1. **Sun, Y., et al. (2023).** *1001 Nights: AI-native game design*. AAAI/AIIDE 2023.  
   论文预印本: https://arxiv.org/abs/2308.12915  
   项目主页: https://1001nights.ai/  
   开源代码: https://github.com/Yuukin98/1001nights

2. **Mason, H. (2026).** *Generative AI and the Future of Game Design*. GDC 2026.  
   核心观点："Core mechanic, not augmentation"; "Constrained creativity wins".  
   博客整理: https://www.hilarymason.com/

3. **Yoroll (2025).** *The Three-Layer Architecture for AI-Native Games*.  
   原文: https://yoroll.ai/blog/three-layer-architecture  
   架构：Expression（世界模型）/ Judgment（VLM 观察）/ State（确定性逻辑）

4. **Quest Machina (2025).** Steam 页面与开发博客.  
   Steam: https://store.steampowered.com/app/2954080/Quest_Machina/  
   GDC 博客: https://medium.com/@atakan.uzun98/quest-machina-gdc-2025-b32a9db90e3d

### 12.2 叙事一致性与幻觉管理

5. **Kumaran, V., Rowe, J. P., & Lester, J. C. (2024).** *NarrativeGenie: Generating Dynamic and Cohesive Narrative Events for AI-Driven Role-Playing Games*. AIIDE 2024.  
   论文: https://arxiv.org/abs/2410.18896

6. **Kaub, J. (2024).** *How I Built an LLM-Based Game from Scratch*. Towards Data Science.  
   核心贡献：因果图 + function calling + 双 agent（Game Master / Impactful Action）架构.  
   原文: https://towardsdatascience.com/how-i-built-an-llm-based-game-from-scratch-86ac55ec7a10/

7. **Zhang et al. (2025).** *TimeChara: Evaluating Point-in-Time Character Hallucination of Role-Playing Large Language Models*.  
   论文: https://arxiv.org/abs/2503.10672

8. **DiGRA (2024).** *Reconceptualizing LLM-Induced Hallucinations as Game Mechanics*.  
   核心观点：将 LLM 幻觉转化为游戏设计特征（以 1001 Nights 为案例）.  
   论文: https://dl.digra.org/index.php/dl/article/download/2426/2419/2455

### 12.3 心理学理论

9. **Weeks, J. W., & Howell, A. N. (2012).** *The bivalent fear of evaluation model: Theoretical implications and treatment outcomes for social anxiety*.  
   双价评价恐惧模型（BFOE）的核心理论文献.

10. **Weeks, J. W., Jakatdar, T. A., & Heimberg, R. G. (2010).** *Comparing and contrasting fears of positive and negative evaluation as facets of social anxiety*. Journal of Social and Clinical Psychology.

11. **Weeks, J. W., Heimberg, R. G., & Rodebaugh, T. L. (2008).** *The fear of positive evaluation scale: Assessing a proposed cognitive component of social anxiety*. Journal of Anxiety Disorders.

12. **Wallace, S. T., & Alden, L. E. (1997).** *Social phobia and positive social events: The price of success*. Journal of Abnormal Psychology.

13. **Nolen-Hoeksema, S., Wisco, B. E., & Lyubomirsky, S. (2008).** *Rethinking rumination*. Perspectives on Psychological Science.  
    反刍思维（rumination）的权威综述.

### 12.4 参考游戏

14. **Replica (2016).** Somi. https://store.steampowered.com/app/508400/Replica/
15. **WILL: A Wonderful World (2017).** WMY Studio. https://store.steampowered.com/app/650450/WILL_A_Wonderful_World/
16. **Life is Strange (2015).** Dontnod Entertainment. https://store.steampowered.com/app/319630/Life_Is_Strange/
17. **1001 Nights (2023).** Yuqian Sun et al. https://1001nights.ai/
18. **FT Climate Game.** Financial Times. https://ig.ft.com/climate-game/

### 12.5 DashScope / Qwen3 技术文档

19. **阿里云 DashScope.** *OpenAI 兼容模式 API 文档*.  
    https://help.aliyun.com/zh/model-studio/developer-reference/use-qwen-by-calling-openai-compatible-api

20. **Qwen3 技术文档.** *Function Calling 与 Streaming 使用指南*.  
    https://qwen.readthedocs.io/en/latest/

---

## 附录

### 附录A：关键NPC模板

每个NPC包含以下属性维度：
- 基本信息（姓名、年龄、职业、社会角色）
- 人格参数（外向/内向、神经质、开放性等五人格维度）
- 当前状态（心理状态、职业进展、人际关系、隐藏秘密）
- 与主角关系（初始熟悉度、信任度、隐藏态度）
- 评价敏感度（正面敏感因子、负面敏感因子、波动恢复速度、隐藏脆弱点）
- 可触发的支线剧情标签

### 附录B：评价场景设计模板

每个评价场景的模板结构：
- **场景编号**、**剧情幕数**、**触发条件**
- **评价对象**、**对象当前状态**
- **评价量级类型**（0/1 | 1-5星 | 1-10分 | 排列）
- **可用选项**（列表或排列范围）
- **短期效果**（玩家可感知的即时剧本变化）
- **长期影响**（游戏中后期回溯的变化锚点）
- **回荡类型与概率**（镜像/连锁/认知/好人困境 + 触发概率）
- **信息透明度**（完全透明=玩家知道全部背景 / 半透明=部分背景 / 完全不透明）

### 附录C：心理学评估模型参考

评估维度与数据来源对照表，明确每个维度的计算公式和阈值标准：

- **评价倾向性**：正评频率 = 3分以上评价数 / 总评价数；负评频率 = 3分以下评价数 / 总评价数；阈值：>0.7为显著倾向
- **评价极端程度**：评分标准差；阈值：>2.0（10分制）为高度极端
- **社交亲近度偏好**：对不同社会距离（1-5级）角色的平均评分差异
- **一致性/随意性**：对同类角色（同类职业/同类关系类型）评价的组内标准差
- **排列偏好模式**：是否为熟人优先排列、是否为弱者优先排列、是否为能力优先排列

### 附录D：评价策略深度与玩家类型

不同玩家类型的评价行为模式预测与游戏体验差异：

| 玩家类型 | 评价模式 | 可能的回荡后果 | 典型结局倾向 |
|----------|----------|----------------|--------------|
| 严格评判者 | 频繁低分、高标准 | 强烈镜像回荡，他人严苛反噬 | 孤立/觉醒 |
| 讨好型 | 全高分、避免冲突 | 好人困境回荡，期望值反噬 | 崩溃/释然 |
| 策略型 | 差异化评价、计算得失 | 复杂回荡组合 | 掌控/反噬 |
| 随性型 | 无规律评价、凭直觉 | 不可预测的混沌回荡 | 所有结局均可能 |
| 回避型 | 尽量不评价、中性化 | 认知回荡，自我审判 | 停滞/被迫抉择 |

这种玩家类型的多样性确保了游戏的高重玩价值，每种评价人格都会经历独特的叙事旅程。

---

**文档版本**：v2.0（研究增强版）
**编制日期**：2026年5月
**适用范围**：项目立项、团队沟通、技术选型参考、MVP 开发依据

> 本文档为《回声评价》游戏开发的总体设计蓝图。v2.0 版本基于联网研究补充了学术引用、AI 实现细节、MVP 路线图与数据模型设计。在进入具体开发阶段后，各模块需要进一步细化为各自的设计文档，包括AI系统详细技术方案、叙事内容脚本、UI设计稿和测试用例等。
