import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { useUIStore } from '../../store/uiStore'
import { useNPCStore } from '../../store/npcStore'
import { generateId } from '../../utils/timeUtils'

const LINES = [
  '最近，过得不太好。',
  '加班、堵车、被人挤到地铁角落。',
  '你打开手机，林昭发来一条消息。',
]

export function OpeningScene({ onClose }: { onClose: () => void }) {
  const [lineIdx, setLineIdx] = useState(0)
  const [done, setDone] = useState(false)
  const [vented, setVented] = useState<string | null>(null)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (lineIdx >= LINES.length - 1) {
      setDone(true)
      return
    }
    const t = setTimeout(() => setLineIdx((i) => i + 1), 1700)
    return () => clearTimeout(t)
  }, [lineIdx])

  function chooseVent(text: string, mood: 'angry' | 'sad' | 'cold') {
    setVented(text)
    // Seed first event + greeting message
    useGameStore.getState().addEvent({
      id: generateId('evt'),
      type: 'opening_vent',
      description: `开场吐槽：${text}`,
      gameDay: 1,
      timestamp: Date.now(),
    })
    useGameStore.getState().completeScene('awakening')

    const npcId = 'npc_lin'
    const greetingByMood: Record<typeof mood, string> = {
      angry: '看你头像都生气，今天又被谁惹到了？',
      sad: '别一个人闷着，给你做了张表情包，发不发？',
      cold: '感觉你最近话变少了。要紧吗？',
    } as const
    useNPCStore.getState().addMessage(npcId, {
      id: generateId('msg'),
      npcId,
      role: 'npc',
      content: greetingByMood[mood],
      timestamp: Date.now(),
      triggersEvaluation: true,
      evaluationPrompt: '林昭这种关心，值多少分？',
      evaluationTypes: ['binary', 'star5'],
      options: [
        { id: 'op1', text: '挺暖的，谢谢你', tone: 'warm' },
        { id: 'op2', text: '没事，就是累', tone: 'cold' },
        { id: 'op3', text: '你怎么知道我心情不好？', tone: 'curious' },
      ],
    })
    setTimeout(() => {
      useUIStore.getState().setCurrentTab('message')
      useUIStore.getState().setChatRoomNpcId(npcId)
      setClosing(true)
      setTimeout(onClose, 600)
    }, 1400)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: closing ? 0 : 1 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(ellipse at center, #1A1A2E, #0F0F1E)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        color: '#E8E8E8',
        fontFamily: '-apple-system, "PingFang SC", sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 420,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
          minHeight: 220,
          justifyContent: 'flex-start',
        }}
      >
        {LINES.slice(0, lineIdx + 1).map((line, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            style={{
              fontSize: 18,
              lineHeight: 1.7,
              letterSpacing: 0.5,
              textAlign: 'center',
              margin: 0,
              color: 'rgba(255,255,255,0.85)',
            }}
          >
            {line}
          </motion.p>
        ))}
      </div>

      <AnimatePresence>
        {done && !vented && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              marginTop: 36,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              width: '100%',
              maxWidth: 420,
            }}
          >
            <p
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.5)',
                textAlign: 'center',
                margin: '0 0 6px',
                letterSpacing: 1,
              }}
            >
              你想怎么回？
            </p>
            <VentButton onClick={() => chooseVent('真烦，谁都看我不顺眼', 'angry')}>
              真烦，谁都看我不顺眼
            </VentButton>
            <VentButton onClick={() => chooseVent('就……不太想说话', 'sad')}>
              就……不太想说话
            </VentButton>
            <VentButton onClick={() => chooseVent('没事。习惯了', 'cold')}>没事。习惯了</VentButton>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {vented && (
          <motion.div
            key="awaken"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              marginTop: 32,
              textAlign: 'center',
              fontSize: 13,
              color: 'rgba(255,36,66,0.85)',
              letterSpacing: 4,
            }}
          >
            …你忽然觉得，这条消息的"分量"，可以由你决定。
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function VentButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        padding: '14px 18px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 12,
        color: '#E8E8E8',
        fontSize: 15,
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 200ms',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255,36,66,0.10)'
        e.currentTarget.style.borderColor = 'rgba(255,36,66,0.4)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
      }}
    >
      {children}
    </button>
  )
}
