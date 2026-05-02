# 《回声评价》GDD v2.0 研究笔记

> 记录联网研究的核心发现，以及它们如何被整合进 v2.0 GDD。

---

## 1. 1001 Nights — AI Native 标杆验证

**来源**：
- 论文: arXiv:2308.12915 (Sun et al., AAAI/AIIDE 2023)
- 项目主页: https://1001nights.ai/
- 开源代码: https://github.com/Yuukin98/1001nights

**关键发现**：
- 1001 Nights 被学界正式定义为 "AI-native game"，核心特征是 "GenAI 不仅是功能增强，而是游戏存在和机制的基础"。
- 使用 GPT-4 驱动角色对话、Stable Diffusion 生成图像。
- 玩家通过自由文本输入与角色共创叙事，自然语言直接转化为游戏状态。
- DiGRA 2024 有专门论文分析该作如何将 LLM 幻觉转化为设计特征（国王的怪异发言被包装为角色特质）。

**如何融入 GDD**：
- 第 1.1 节增加了 Hilary Mason 的 "core mechanic, not augmentation" 定义，与 1001 Nights 形成互补。
- 第 4.2.2 节增加了 "受控幻觉" 策略，将 LLM 的不可预测性包装为"回响域的不稳定性"。
- 第 12 章补充了完整学术引用。

---

## 2. Quest Machina — 商业 AI 游戏的工程实践

**来源**：
- Steam: https://store.steampowered.com/app/2954080/Quest_Machina/
- GDC 博客: https://medium.com/@atakan.uzun98/quest-machina-gdc-2025-b32a9db90e3d

**关键发现**：
- 每次游玩生成独特故事线和最终 Boss。
- 使用 OpenAI API (GPT-4o) + Leonardo.ai。
- 每个世界有一个唯一 World ID，可用于分享和回溯。
- 核心架构是 "Prompt Engineering + State Management"。

**如何融入 GDD**：
- 第 1.3 节补充了 Quest Machina 的引用和差异化设计说明。
- 第 10 章 MVP 路线图中预留了 "World ID / 存档分享" 功能（Beta 阶段）。

---

## 3. NarrativeGenie — 叙事一致性技术方案

**来源**：
- 论文: https://arxiv.org/abs/2410.18896 (Kumaran, Rowe, Lester; AIIDE 2024)

**关键发现**：
- 提出 "narrative beats"（叙事节拍）概念：将故事拆分为有凝聚力的、部分有序的事件序列。
- 在保持玩家自主性的同时，确保 AI 生成的剧情不偏离整体故事弧线。
- 与自由生成的 LLM 叙事相比，beat-based 方法显著降低了叙事漂移。

**如何融入 GDD**：
- 第 4.2.2 节明确引用了 NarrativeGenie，作为"叙事一致性设计"的理论支撑。
- 第 11.1 节的 `scenes` 集合设计直接体现了 narrative beats 思想：每个 scene 是一个预定义节点，AI 负责生成节点内的叙事包装。

---

## 4. Quest Keeper AI — 因果图 + Function Calling 架构

**来源**：
- 文章: https://towardsdatascience.com/how-i-built-an-llm-based-game-from-scratch-86ac55ec7a10/ (Kaub, 2024)

**关键发现**：
- 提出核心原则："LLM describes while the engine validates — all game state comes from a database, not hallucination."
- 后端维护因果图（Causal Graph），LLM 不直接修改状态。
- 使用双 Agent：
  - **Game Master Agent**：面向玩家，基于过滤后的上下文生成叙事。
  - **Impactful Action Agent**：识别玩家的行动意图，匹配因果图中的 action_id。
- 两个关键函数：`filter_game_state`（防止剧透）和 `get_action_consequence`（查询后果）。
- 发现：function calling 能显著减少幻觉，但不能 100% 消除。

**如何融入 GDD**：
- **架构层面**：第 4.1 节新增"LLM 描述，引擎验证"作为核心架构原则。
- **Yoroll 修正**：原 GDD v1 引用 Yoroll.ai 时描述错误（说其架构是"表达/逻辑/数据"三层），经核实 Yoroll 真实架构为 Expression/Judgment/State，已修正并注明差异。
- **API 设计**：第 11.2 节的 function 定义直接参考了 Kaub 的设计（filter_game_state, apply_evaluation 等）。
- **Prompt 模板**：第 11.3 节 Prompt 模板 1 明确加入"你不允许直接修改任何角色的状态数值"规则。

---

## 5. TimeChara — 时间点一致性（防剧透）

**来源**：
- 论文: https://arxiv.org/abs/2503.10672 (Zhang et al., 2025)

**关键发现**：
- LLM 扮演虚构角色时最常出现的幻觉类型是"时间点幻觉"：知道未来剧情、遗忘已发生事件。
- 单纯限制训练数据或在 prompt 中加入时间线约束效果有限。
- 有效方案：迭代式专家验证（iterative prompting with narrative experts）+ 外部知识库过滤。

**如何融入 GDD**：
- 第 4.2.2 节新增"时间点一致性"小节，提出三项策略：状态过滤、时间点锁定、专家迭代。
- 第 9 章（风险表）新增"LLM 幻觉导致角色预知未来"风险及 TimeChara 应对策略。
- 第 11.1 节的 `stateHistory` 字段和 `causedByEvaluationId` 为时间点验证提供数据基础。

---

## 6. 幻觉作为设计机制（DiGRA 2024）

**来源**：
- 论文: https://dl.digra.org/index.php/dl/article/download/2426/2419/2455

**关键发现**：
- LLM 幻觉在游戏语境下可以超越"错误"的范畴，成为设计特征。
- 1001 Nights 中，国王的怪异发言正是利用了 LLM 的不可预测性，增强了神秘感。
- 但前提是有机制防止幻觉蔓延到核心状态系统。

**如何融入 GDD**：
- 第 4.2.2 节新增"受控幻觉策略"段落。
- 明确区分：flavor text（氛围描述）可容忍幻觉；状态数值变更必须通过 function calling。

---

## 7. 奇异人生 — 选择机制的批评与设计教训

**来源**：
- 多篇 Medium 分析与 Steam 社区讨论
- 核心批评：回溯机制削弱选择重量、假选择（Hobson's choice）、最终结局二元化

**关键发现**：
- 奇异人生最被诟病的不是"选择不重要"，而是"给了回溯能力又最终否定它"。
- Kate 屋顶场景（无法回溯）是全作情感高峰，说明"剥夺控制"比"给予控制"更有力。
- 部分早期选择确实导向相同结果（被批评为假选择）。

**如何融入 GDD**：
- 第 6.2 节重写了"学习奇异人生的选择机制"小节，从"失败类型"改为更准确的"选择机制批评"。
- 明确将"去除回溯"定位为对奇异人生设计缺陷的回应。
- 强调第一幕选择虽短期结果相似，但会数据层面记录偏好，后续产生显著差异。

---

## 8. DashScope / Qwen3 技术集成要点

**来源**：
- 阿里云 DashScope 官方文档: https://help.aliyun.com/zh/model-studio/developer-reference/use-qwen-by-calling-openai-compatible-api
- Qwen3 文档: https://qwen.readthedocs.io/en/latest/

**关键发现**：
- DashScope 的 OpenAI 兼容端点完全支持 `stream`、`tools`、`tool_choice`。
- Qwen3 默认启用"深度思考"模式，可通过 `extra_body.chat_template_kwargs.enable_thinking=false` 关闭。
- 关闭思考后响应速度显著提升，适合快速评估场景；开启思考适合重大叙事转折。
- SSE 流式输出可通过 `stream_options.include_usage=true` 获取 token 用量。

**如何融入 GDD**：
- 第 5.1 节技术选型表明确选择 DashScope + Qwen3-Max。
- 第 5.1 节新增 Qwen3 集成要点小节。
- 第 5.3 节 API 调用策略表区分了"关闭思考"和"开启思考"两种模式的使用场景。

---

## 9. 心理学理论引用核实

| 理论 | 状态 | 说明 |
|------|------|------|
| BFOE (Weeks & Howell, 2012) | 已验证 | 真实发表，引用广泛 |
| 评价顾虑 (Fear of Negative Evaluation) | 已验证 | Weeks, Heimberg & Rodebaugh (2008) 及更早文献 |
| 正面评价恐惧 | 已验证 | Weeks, Jakatdar & Heimberg (2010) |
| 反刍思维 (Rumination) | 已验证 | Nolen-Hoeksema, Wisco & Lyubomirsky (2008) |

**如何融入 GDD**：
- 第 2.1 节、2.6 节、6.3 节均补充了具体文献引用。
- 第 12 章集中列出所有心理学参考文献。

---

## 10. 其他参考游戏核实

| 游戏 | 状态 | 关键核实 |
|------|------|----------|
| Replica (Somi, 2016) | 已验证 | 手机 UI 叙事，全程在他人手机内操作 |
| WILL:美好世界 (2017) | 已验证 | 重排文字顺序改变收信人命运，S-rank 结局系统 |
| FT Climate Game | 已验证 | FT 官方出品，400+ 决策点 |

---

## 总结：v2.0 相比 v1.0 的主要变更

1. **修正错误**：Yoroll.ai 架构描述从错误的"表达/逻辑/数据"更正为真实的"Expression/Judgment/State"，并明确本项目采用 Quest Keeper AI 架构而非 Yoroll 架构。
2. **补充学术引用**：新增 12 篇可溯源的论文/技术文档引用，涵盖 AI 游戏设计、叙事一致性、心理学理论。
3. **新增架构原则**：引入 "LLM 描述，引擎验证" 核心原则，将 function calling 作为状态变更的唯一入口。
4. **新增技术实现章节**：
   - 第十章：MVP / Alpha / Beta 分阶段路线图
   - 第十一章：MongoDB 数据模型 + API 路由 + Zustand 状态管理 + Prompt 模板
   - 第十二章：完整学术参考列表
5. **细化 AI 集成方案**：明确 Qwen3-Max 的流式输出、function calling、思考模式控制策略。
6. **强化防幻觉设计**：引入 TimeChara 时间点一致性策略、受控幻觉机制、状态过滤函数。
7. **优化情感曲线论述**：将原"失败类型"小节改为更准确的"选择机制批评"，引用真实批评文献。
