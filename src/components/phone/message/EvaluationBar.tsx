import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { EvalType, EvaluationOpportunity } from '../../../types'
import { StarRating } from '../../shared/StarRating'
import { ScoreSlider } from '../../shared/ScoreSlider'

export function EvaluationBar({
  opp,
  onSubmit,
  onCancel,
}: {
  opp: EvaluationOpportunity
  onSubmit: (type: EvalType, value: number, durationMs: number) => void
  onCancel: () => void
}) {
  const [openedAt] = useState(() => Date.now())
  const types = opp.types && opp.types.length ? opp.types : (['binary'] as EvalType[])
  const [activeType, setActiveType] = useState<EvalType>(types[0])
  const [stars, setStars] = useState(0)
  const [score, setScore] = useState(5)

  function submit(type: EvalType, value: number) {
    onSubmit(type, value, Date.now() - openedAt)
  }

  return (
    <AnimatePresence>
      <motion.div
        key="eval-bar"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 360, damping: 32 }}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          background: '#fff',
          borderTop: '1px solid #FFE8EC',
          padding: '14px 16px 18px',
          boxShadow: '0 -8px 24px rgba(255,36,66,0.10)',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#222' }}>{opp.prompt}</div>
          <button
            onClick={onCancel}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#999',
              fontSize: 12,
            }}
          >
            稍后再说
          </button>
        </div>

        {types.length > 1 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setActiveType(t)}
                style={{
                  fontSize: 11,
                  padding: '4px 10px',
                  borderRadius: 12,
                  background: activeType === t ? '#FFE8EC' : '#F5F5F5',
                  color: activeType === t ? '#FF2442' : '#777',
                  border: 'none',
                  fontWeight: activeType === t ? 600 : 500,
                }}
              >
                {TYPE_LABEL[t]}
              </button>
            ))}
          </div>
        )}

        {activeType === 'binary' && (
          <div style={{ display: 'flex', gap: 10 }}>
            <BinaryButton variant="negative" onClick={() => submit('binary', -1)}>
              👎 不太行
            </BinaryButton>
            <BinaryButton variant="positive" onClick={() => submit('binary', 1)}>
              👍 真不错
            </BinaryButton>
          </div>
        )}

        {activeType === 'star5' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <StarRating value={stars} onChange={setStars} />
            <button
              disabled={!stars}
              onClick={() => submit('star5', stars)}
              style={{
                width: '100%',
                padding: '10px 0',
                background: stars ? '#FF2442' : '#EEE',
                color: '#fff',
                fontWeight: 600,
                border: 'none',
                borderRadius: 22,
                fontSize: 14,
              }}
            >
              提交评分
            </button>
          </div>
        )}

        {activeType === 'score10' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <ScoreSlider value={score} onChange={setScore} />
            <button
              onClick={() => submit('score10', score)}
              style={{
                padding: '10px 0',
                background: '#FF2442',
                color: '#fff',
                fontWeight: 600,
                border: 'none',
                borderRadius: 22,
                fontSize: 14,
              }}
            >
              提交 {score} 分
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

const TYPE_LABEL: Record<EvalType, string> = {
  binary: '一句话',
  star5: '五星',
  score10: '十分',
}

function BinaryButton({
  children,
  variant,
  onClick,
}: {
  children: React.ReactNode
  variant: 'positive' | 'negative'
  onClick: () => void
}) {
  const isPos = variant === 'positive'
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '12px 0',
        borderRadius: 22,
        border: 'none',
        background: isPos
          ? 'linear-gradient(135deg, #FF2442, #FF5065)'
          : 'linear-gradient(135deg, #455A64, #2C3E50)',
        color: '#fff',
        fontSize: 14,
        fontWeight: 600,
        boxShadow: isPos
          ? '0 4px 12px rgba(255,36,66,0.30)'
          : '0 4px 12px rgba(69,90,100,0.30)',
      }}
    >
      {children}
    </button>
  )
}
