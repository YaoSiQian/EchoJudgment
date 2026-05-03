import type { ActNumber } from '../types'
import type { CharacterResponse } from '../ai/OutputValidator'

export interface FallbackChatLine {
  npcId?: string
  text: string
  triggersEvaluation?: boolean
  evaluationPrompt?: string
}

export const FALLBACK_CHAT_OPENERS: Record<ActNumber, FallbackChatLine[]> = {
  1: [
    { text: '最近怎么样？好久没聊了' },
    { text: '今天上班路上看到一只猫，超可爱' },
    { text: '你周末有空吗，一起吃饭？', triggersEvaluation: true, evaluationPrompt: '你愿意答应吗？' },
  ],
  2: [
    { text: '我跟你说一件事，你不会信的' },
    { text: '你觉得人是不是有时候会被命运推着走' },
  ],
  3: [
    { text: '你这几天，是不是有点不一样？' },
    { text: '我做了个奇怪的梦，梦里你在看着我' },
  ],
  4: [
    { text: '你知道吗，有些事不是你想停就停得下来的' },
  ],
}

export function pickFallback(act: ActNumber): CharacterResponse {
  const list = FALLBACK_CHAT_OPENERS[act] ?? FALLBACK_CHAT_OPENERS[1]
  const line = list[Math.floor(Math.random() * list.length)]
  return {
    message: line.text,
    mood_change: 'neutral',
    triggers_evaluation: !!line.triggersEvaluation,
    evaluation_prompt: line.triggersEvaluation ? line.evaluationPrompt ?? null : null,
    evaluation_types: line.triggersEvaluation ? ['binary'] : undefined,
    wants_to_pause: false,
    player_options: [
      { id: 'fb1', text: '嗯，挺好的呀', tone: 'warm' },
      { id: 'fb2', text: '说说看具体怎么了？', tone: 'curious' },
      { id: 'fb3', text: '我现在没空', tone: 'cold' },
    ],
  }
}

export const FALLBACK_POSTS: Record<ActNumber, Array<{ npcId: string; text: string }>> = {
  1: [
    { npcId: 'npc_lin', text: '今天阳光真好，路边的玉兰开了' },
    { npcId: 'npc_zhou', text: '又赶完一个 deadline，瘫在工位上' },
    { npcId: 'npc_qi', text: '深夜放毒：刚做完的舒芙蕾🍰' },
  ],
  2: [
    { npcId: 'npc_lin', text: '有些朋友，越熟越觉得陌生' },
    { npcId: 'npc_chen', text: '这一届年轻人确实让人捉摸不透' },
  ],
  3: [
    { npcId: 'npc_zhou', text: '总觉得最近被什么盯着，又说不清楚' },
    { npcId: 'npc_qi', text: '最近不太想见人' },
  ],
  4: [
    { npcId: 'npc_lin', text: '昨晚梦里有人在叫我的名字。今天醒来还在响' },
  ],
}
