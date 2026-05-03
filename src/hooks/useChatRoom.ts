import { useCallback, useRef, useState } from 'react'
import { useNPCStore } from '../store/npcStore'
import { useGameStore } from '../store/gameStore'
import { useUIStore } from '../store/uiStore'
import { callJSON, type ChatTurn } from '../ai/client'
import { buildCharacterSystemPrompt, buildPlayerTurnUserText } from '../ai/prompts/character'
import { CharacterResponseSchema, type CharacterResponse } from '../ai/OutputValidator'
import { pickFallback } from '../data/fallback'
import { generateId } from '../utils/timeUtils'
import type { ChatMessage } from '../types'

const EMPTY_MESSAGES: ChatMessage[] = []
const MAX_HISTORY = 20

export function useChatRoom(npcId: string) {
  const npc = useNPCStore((s) => s.npcs.find((n) => n.id === npcId))
  const messages = useNPCStore((s) => s.chats[npcId] ?? EMPTY_MESSAGES)
  const addMessage = useNPCStore((s) => s.addMessage)
  const setMood = useNPCStore((s) => s.setMood)
  const game = useGameStore.getState
  const setAILoading = useUIStore((s) => s.setAILoading)

  const [isStreaming, setIsStreaming] = useState(false)
  const inFlightRef = useRef(false)

  const generateNextMessage = useCallback(
    async (userInput?: string) => {
      if (!npc || inFlightRef.current) return
      inFlightRef.current = true
      setIsStreaming(true)
      setAILoading(true)

      const g = game()
      const systemPrompt = buildCharacterSystemPrompt(npc, {
        echoLevel: g.echoLevel,
        imbalanceValue: g.imbalanceValue,
        currentAct: g.currentAct,
        gameDay: g.gameTime.day,
      })

      const recent = messages.slice(-MAX_HISTORY)
      const turns: ChatTurn[] = [
        { role: 'system', content: systemPrompt },
        ...recent.map((m) => ({
          role: m.role === 'player' ? ('user' as const) : ('assistant' as const),
          content: m.role === 'npc' ? m.content : m.content,
        })),
      ]
      if (userInput !== undefined) {
        turns.push({ role: 'user', content: buildPlayerTurnUserText(userInput) })
      } else if (!recent.length) {
        turns.push({ role: 'user', content: '[场景开始：请你作为该角色主动发出第一句话]' })
      } else {
        turns.push({ role: 'user', content: '[继续对话]' })
      }

      let parsed: CharacterResponse
      try {
        const raw = await callJSON<unknown>(turns, { temperature: 0.85 })
        parsed = CharacterResponseSchema.parse(raw)
      } catch (err) {
        console.warn('[useChatRoom] AI failed, falling back', err)
        parsed = pickFallback(g.currentAct)
      }

      // Safety net: if conversation runs >= 12 turns since open without a pause,
      // force the next npc message to be a soft sign-off.
      const turnsSinceOpen = recent.length
      const sinceLastPause = (() => {
        for (let i = recent.length - 1; i >= 0; i--) {
          if (recent[i].role === 'npc' && recent[i].wantsToPause) return recent.length - 1 - i
        }
        return recent.length
      })()
      if (!parsed.wants_to_pause && (turnsSinceOpen >= 14 || sinceLastPause >= 12)) {
        parsed = {
          ...parsed,
          wants_to_pause: true,
          message: parsed.message + '\n（我先去忙了，回头再聊）',
        }
      }

      const msg: ChatMessage = {
        id: generateId('msg'),
        npcId,
        role: 'npc',
        content: parsed.message,
        timestamp: Date.now(),
        echoLevel: g.echoLevel || undefined,
        triggersEvaluation: parsed.triggers_evaluation,
        evaluationPrompt: parsed.evaluation_prompt ?? undefined,
        evaluationTypes: parsed.evaluation_types,
        wantsToPause: parsed.wants_to_pause,
        options: parsed.player_options,
      }
      addMessage(npcId, msg)
      if (parsed.mood_change && parsed.mood_change !== npc.currentMood) {
        setMood(npcId, parsed.mood_change)
      }
      // Note: 不再自动 setPendingEvaluation。
      // 玩家点击带评价提示的气泡时，由 ChatRoom 显式开启评价栏。
      // 这样建议气泡（点一句继续）和评价契机不会同时强制出现。

      setIsStreaming(false)
      setAILoading(false)
      inFlightRef.current = false
    },
    [npc, npcId, messages, addMessage, setMood, setAILoading, game]
  )

  const sendPlayerMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return
      const playerMsg: ChatMessage = {
        id: generateId('msg'),
        npcId,
        role: 'player',
        content: trimmed,
        timestamp: Date.now(),
      }
      addMessage(npcId, playerMsg)
      setTimeout(() => generateNextMessage(trimmed), 250)
    },
    [npcId, addMessage, generateNextMessage]
  )

  return { npc, messages, isStreaming, generateNextMessage, sendPlayerMessage }
}
