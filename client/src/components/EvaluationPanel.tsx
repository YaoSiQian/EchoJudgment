import { useState } from 'react'
import { submitEvaluation, fetchStreamNarrative } from '../api/client.ts'
import { useGameStore } from '../store/gameStore.ts'
import type { SceneAction } from '../types/index.ts'

interface Props {
  action: SceneAction
  sessionId: string
  sceneId: string
  onComplete: (result: {
    echoTriggered: boolean
    echoNarrative?: string
    fateDelta?: { shortTermEffect: string }
  }) => void
}

export default function EvaluationPanel({ action, sessionId, sceneId, onComplete }: Props) {
  const [score, setScore] = useState<number>(3)
  const [_binary, _setBinary] = useState<number>(1)
  const [submitting, setSubmitting] = useState(false)
  const { appendNarrative, clearNarrative, setStreaming } = useGameStore()

  const targetId = action.targetIds?.[0] || ''
  const evalType = action.evaluationType || 'star5'
  const prompt = action.prompt || '请做出你的评价'

  async function handleSubmit(value: number | number[]) {
    if (submitting) return
    setSubmitting(true)
    clearNarrative()

    try {
      const result = await submitEvaluation({
        sessionId,
        sceneId,
        targetId,
        type: evalType,
        value,
      })

      // Stream fate narrative
      setStreaming(true)
      await fetchStreamNarrative(
        {
          sessionId,
          characterId: targetId,
          evaluationType: evalType,
          score: typeof value === 'number' ? value : undefined,
        },
        (chunk) => appendNarrative(chunk)
      )
      setStreaming(false)

      onComplete({
        echoTriggered: result.echoTriggered,
        echoNarrative: result.echoNarrative,
        fateDelta: result.fateDelta,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      style={{
        marginTop: 20,
        padding: '20px 24px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
      }}
    >
      <div
        style={{
          fontSize: 14,
          color: '#9ca3af',
          marginBottom: 16,
          lineHeight: 1.6,
        }}
      >
        {prompt}
      </div>

      {evalType === 'star5' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setScore(s)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  border: 'none',
                  background: s <= score ? '#fbbf24' : 'rgba(255,255,255,0.08)',
                  color: s <= score ? '#1a1d26' : '#6b7280',
                  fontSize: 18,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontWeight: 700,
                }}
              >
                ★
              </button>
            ))}
          </div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>
            {score === 1 && '极差'}
            {score === 2 && '较差'}
            {score === 3 && '一般'}
            {score === 4 && '良好'}
            {score === 5 && '卓越'}
          </div>
          <button
            onClick={() => handleSubmit(score)}
            disabled={submitting}
            style={{
              marginTop: 8,
              padding: '10px 32px',
              background: submitting ? 'rgba(255,255,255,0.05)' : 'rgba(192, 132, 252, 0.15)',
              border: '1px solid rgba(192, 132, 252, 0.3)',
              borderRadius: 8,
              color: '#c084fc',
              fontSize: 14,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? '回响域计算中...' : '提交评价'}
          </button>
        </div>
      )}

      {evalType === 'binary' && (
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={() => handleSubmit(1)}
            disabled={submitting}
            style={{
              padding: '12px 28px',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: 8,
              color: '#4ade80',
              fontSize: 14,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            是 / 原谅 / 支持
          </button>
          <button
            onClick={() => handleSubmit(0)}
            disabled={submitting}
            style={{
              padding: '12px 28px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 8,
              color: '#f87171',
              fontSize: 14,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            否 / 不原谅 / 反对
          </button>
        </div>
      )}
    </div>
  )
}
