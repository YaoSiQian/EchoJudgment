import type { GameState, NPCState } from '../../types'

const ACT_NAMES: Record<number, string> = { 1: '觉醒', 2: '诱惑', 3: '猜疑', 4: '回响' }
const ACT_TONES: Record<number, string> = {
  1: '轻松好奇，偶尔有一丝神秘感',
  2: '权力感与不安并存，开始有道德模糊地带',
  3: '偏执恐惧，内容越来越令人不安',
  4: '压迫感极强，每条内容都有重量',
}

export function buildSocialPostsPrompt(state: GameState, npcs: NPCState[]): string {
  const active = npcs.filter((n) => n.isActive).slice(0, 5)
  return `你是《回���》的内容生成引擎，为虚构小红书生成 4-5 条NPC动态。

## 游戏状态
- 第${state.currentAct}幕（${ACT_NAMES[state.currentAct]}）；第${state.gameTime.day}天
- 失衡值 ${state.imbalanceValue}/200；回响 Lv.${state.echoLevel}
- 叙事基调：${ACT_TONES[state.currentAct]}

## 活跃 NPC
${active.map((n) => `- ${n.id} (${n.name}) 原型=${n.archetype} 关系=${n.relationshipValue} 心情=${n.currentMood}`).join('\n')}

## 输出（严格 JSON）
{
  "posts": [
    {
      "npc_id": "npc_xxx（必须是上面活跃NPC之一）",
      "text": "帖子正文（中文，30-100字，符合该NPC人设和当前情绪）",
      "image_description": "图片描述（中文短句，可省）",
      "echo_content": "回响异常内容（仅当回响等级>0；可省）",
      "likes": 数字,
      "comments_count": 数字,
      "timestamp_offset_hours": 距现在的小时数（负数）
    }
  ]
}

只输出 JSON，不要附加文字。`
}

export function buildNewsPrompt(state: GameState, hint: string): string {
  return `你是《回响》游戏世界中"锡陵晚报"的编辑，根据玩家最近的评价后果撰写一则新闻。

## 当前状态
- 第${state.currentAct}幕（${ACT_NAMES[state.currentAct]}）；第${state.gameTime.day}天
- 失衡值 ${state.imbalanceValue}/200；回响 Lv.${state.echoLevel}
- 叙事基调：${ACT_TONES[state.currentAct]}

## 后果线索
${hint}

## 输出（严格 JSON）
{
  "headline": "标题（中文，10-20字，地方都市报风格）",
  "body": "正文（150-300字）",
  "category": "社会" | "教育" | "职场" | "娱乐" | "本地",
  "echo_headline": "回响替换标题（仅 echoLevel>=3 时；可省）"
}

只输出 JSON。`
}
