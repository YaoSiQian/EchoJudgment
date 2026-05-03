import { useEffect, useRef, useState } from 'react'
import { useChatRoom } from '../../../hooks/useChatRoom'
import { useUIStore } from '../../../store/uiStore'
import { useGameStore } from '../../../store/gameStore'
import { useNPCStore } from '../../../store/npcStore'
import { usePlayerStore } from '../../../store/playerStore'
import { MessageBubble, TypingIndicator } from './MessageBubble'
import { EvaluationBar } from './EvaluationBar'
import { SuggestionChips } from './SuggestionChips'
import { evaluationEngine } from '../../../engine/EvaluationEngine'
import { echoEngine } from '../../../engine/EchoEngine'
import { consequenceEngine } from '../../../engine/ConsequenceEngine'
import { playerModelUpdater } from '../../../engine/PlayerModel'
import { generateId } from '../../../utils/timeUtils'
import type { EvalType, PlayerOption } from '../../../types'

const ARCHETYPE_COLOR: Record<string, string> = {
  close_friend: '#FF8A65',
  competitor: '#7E57C2',
  authority: '#455A64',
  stranger: '#9E9E9E',
  romantic: '#EC407A',
}

export function ChatRoom({ npcId }: { npcId: string }) {
  const { npc, messages, isStreaming, generateNextMessage, sendPlayerMessage } = useChatRoom(npcId)
  const { setChatRoomNpcId, pendingEvaluation, setPendingEvaluation } = useUIStore()
  const [input, setInput] = useState('')
  const [customOpen, setCustomOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Latest npc message → its options become suggestions
  const lastNpc = [...messages].reverse().find((m) => m.role === 'npc')
  const suggestions = lastNpc?.options ?? []
  const lastIsPlayer = messages[messages.length - 1]?.role === 'player'

  // Auto-greet on first open
  useEffect(() => {
    if (!messages.length && !isStreaming) {
      generateNextMessage()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [npcId])

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length, isStreaming])

  if (!npc) return null

  function handleSend() {
    if (!input.trim() || isStreaming) return
    sendPlayerMessage(input)
    setInput('')
    setCustomOpen(false)
  }

  function handlePickSuggestion(opt: PlayerOption) {
    if (isStreaming) return
    sendPlayerMessage(opt.text)
    // Record as a soft "decision" for player-model shaping
    const player = usePlayerStore.getState()
    const rec = {
      decisionId: generateId('dec'),
      chosenOption: { ...opt, moralType: 'neutral' as const },
      timestamp: Date.now(),
      durationMs: 0,
    }
    player.addDecision(rec)
    const patch = playerModelUpdater.updateAfterDecision(player, rec)
    if (patch.socialStyle) player.setSocialStyle(patch.socialStyle)
    if (typeof patch.moralSensitivity === 'number') player.setMoralSensitivity(patch.moralSensitivity)
  }

  function handleEvalSubmit(type: EvalType, value: number, durationMs: number) {
    const opp = pendingEvaluation
    if (!opp) return
    const npcState = useNPCStore.getState().npcs.find((n) => n.id === opp.npcId)
    if (!npcState) return

    const result = evaluationEngine.calculate(
      { type, value, targetNPCId: opp.npcId, timestamp: Date.now() },
      npcState
    )

    // imbalance + echo level
    const game = useGameStore.getState()
    const delta = echoEngine.computeImbalanceDelta(result)
    const newImbalance = echoEngine.applyImbalance(game.imbalanceValue, delta)
    useGameStore.getState().setImbalance(newImbalance)
    const newEcho = echoEngine.calculateEchoLevel(newImbalance, game.currentAct)
    useGameStore.getState().setEchoLevel(newEcho)

    // npc relationship: signed magnitude = direction × |impactScore|
    const relDelta = Math.round(result.impactScore * 3)
    if (relDelta !== 0) useNPCStore.getState().updateRelationship(opp.npcId, relDelta)

    // schedule consequence
    const cons = consequenceEngine.schedule(result, npcState, useGameStore.getState())
    cons.forEach((c) => {
      if (c.type !== 'context_update') {
        useGameStore.getState().addRevealedConsequence(c)
      }
    })

    // event log
    useGameStore.getState().addEvent({
      id: generateId('evt'),
      type: 'evaluation',
      description: `对${npcState.name}作出${result.direction === 'positive' ? '正面' : result.direction === 'negative' ? '负面' : '中性'}评价`,
      gameDay: game.gameTime.day,
      timestamp: Date.now(),
      npcId: opp.npcId,
    })

    // player model
    const player = usePlayerStore.getState()
    const evalRecord = {
      id: generateId('eval'),
      type,
      value,
      direction: result.direction,
      targetNPCId: opp.npcId,
      timestamp: Date.now(),
      processDuration: durationMs,
      extremeFlag: result.extremeFlag,
    }
    usePlayerStore.getState().addEvaluation(evalRecord)
    const patch = playerModelUpdater.updateAfterEvaluation(player, result, durationMs)
    if (patch.evaluationTendency) usePlayerStore.getState().setEvaluationTendency(patch.evaluationTendency)
    if (typeof patch.stressTolerance === 'number') usePlayerStore.getState().setStressTolerance(patch.stressTolerance)

    // dismiss + advance after a beat
    setPendingEvaluation(null)
    setTimeout(() => generateNextMessage(), 600)
  }

  return (
    <div className="flex flex-col h-full" style={{ background: '#F5F5F5' }}>
      {/* NavBar */}
      <div
        style={{
          height: 48,
          background: '#FAFAFA',
          borderBottom: '0.5px solid #EBEBEB',
          display: 'flex',
          alignItems: 'center',
          padding: '0 8px',
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => setChatRoomNpcId(null)}
          style={{
            background: 'transparent',
            border: 'none',
            padding: 8,
            color: '#222',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            background: ARCHETYPE_COLOR[npc.archetype] ?? '#999',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 600,
            marginRight: 10,
          }}
        >
          {npc.name[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#222' }}>{npc.name}</div>
          <div style={{ fontSize: 11, color: isStreaming ? '#FF2442' : '#999' }}>
            {isStreaming ? '正在输入…' : ARCHETYPE_LABEL[npc.archetype]}
          </div>
        </div>
        <button
          style={{
            background: 'transparent',
            border: 'none',
            padding: 8,
            color: '#222',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#222">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="xhs-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 0 8px',
          background: '#F5F5F5',
        }}
      >
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            msg={m}
            onTriggerEvaluation={() => {
              if (!pendingEvaluation && m.evaluationPrompt) {
                setPendingEvaluation({
                  npcId,
                  prompt: m.evaluationPrompt,
                  types: m.evaluationTypes ?? ['binary', 'star5'],
                  triggerMessageId: m.id,
                })
              }
            }}
          />
        ))}
        {isStreaming && <TypingIndicator />}
      </div>

      {/* Bottom area: eval bar > suggestions > collapsed custom input */}
      {pendingEvaluation && pendingEvaluation.npcId === npcId ? (
        <EvaluationBar
          opp={pendingEvaluation}
          onSubmit={handleEvalSubmit}
          onCancel={() => {
            setPendingEvaluation(null)
            usePlayerStore.getState().updateInteractionMetrics({
              cancelCount: usePlayerStore.getState().interactionMetrics.cancelCount + 1,
            })
          }}
        />
      ) : customOpen ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            background: '#FAFAFA',
            borderTop: '0.5px solid #EBEBEB',
            gap: 8,
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setCustomOpen(false)}
            style={{
              width: 32, height: 32, border: 'none', background: 'transparent', color: '#999',
              fontSize: 20, lineHeight: 1, cursor: 'pointer',
            }}
            aria-label="返回建议"
          >
            ×
          </button>
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isStreaming ? '对方正在输入…' : '想自己组织一句话…'}
            disabled={isStreaming}
            style={{
              flex: 1, height: 36, borderRadius: 18, border: '1px solid #EBEBEB',
              padding: '0 14px', background: '#fff', fontSize: 14, color: '#222', outline: 'none',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            style={{
              width: 36, height: 36, borderRadius: 18, border: 'none',
              background: input.trim() ? '#FF2442' : '#EEE', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
            </svg>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          {lastNpc?.wantsToPause && !lastIsPlayer && (
            <div
              style={{
                padding: '10px 12px 6px',
                background: '#FAFAFA',
                borderTop: '0.5px solid #EBEBEB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
              }}
            >
              <span style={{ fontSize: 11, color: '#999' }}>{npc.name} 想结束这段对话</span>
              <button
                onClick={() => setChatRoomNpcId(null)}
                style={{
                  fontSize: 12,
                  padding: '6px 14px',
                  background: '#FF2442',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(255,36,66,0.30)',
                }}
              >
                先到这里
              </button>
            </div>
          )}
          {suggestions.length > 0 && !lastIsPlayer && (
            <SuggestionChips
              options={suggestions}
              disabled={isStreaming}
              hint={
                lastNpc?.wantsToPause
                  ? '或者再说一句…'
                  : lastNpc?.triggersEvaluation
                  ? '点上方红框消息打分，或选一句继续聊'
                  : '点一句继续 ↓'
              }
              onPick={(opt) => handlePickSuggestion(opt)}
            />
          )}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 0 8px',
              background: '#FAFAFA',
              borderTop: suggestions.length === 0 ? '0.5px solid #EBEBEB' : 'none',
              gap: 16,
            }}
          >
            <button
              onClick={() => setCustomOpen(true)}
              disabled={isStreaming}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#AAA',
                fontSize: 11,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer',
                padding: '4px 10px',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                  fill="#AAA" />
              </svg>
              自己说
            </button>
            {suggestions.length === 0 && !isStreaming && (
              <button
                onClick={() => generateNextMessage()}
                style={{
                  background: 'transparent', border: 'none', color: '#FF2442',
                  fontSize: 11, cursor: 'pointer', padding: '4px 10px',
                }}
              >
                让 TA 继续说
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const ARCHETYPE_LABEL: Record<string, string> = {
  close_friend: '挚友',
  competitor: '竞争者',
  authority: '权威',
  stranger: '陌生人',
  romantic: '恋人',
}
