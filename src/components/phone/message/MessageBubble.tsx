import { EchoText } from '../../shared/EchoText'
import type { ChatMessage } from '../../../types'

export function MessageBubble({
  msg,
  onTriggerEvaluation,
}: {
  msg: ChatMessage
  onTriggerEvaluation?: () => void
}) {
  const isPlayer = msg.role === 'player'
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isPlayer ? 'flex-end' : 'flex-start',
        margin: '6px 12px',
      }}
    >
      <div
        onClick={msg.triggersEvaluation && !isPlayer ? onTriggerEvaluation : undefined}
        style={{
          maxWidth: '74%',
          padding: '9px 13px',
          fontSize: 14.5,
          lineHeight: 1.5,
          color: isPlayer ? '#222' : '#222',
          background: isPlayer ? '#FFE8EC' : '#fff',
          borderRadius: isPlayer ? '14px 0 14px 14px' : '0 14px 14px 14px',
          boxShadow: isPlayer ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          cursor: msg.triggersEvaluation && !isPlayer ? 'pointer' : 'default',
          border: msg.triggersEvaluation && !isPlayer ? '1px solid rgba(255,36,66,0.25)' : 'none',
        }}
      >
        <EchoText text={msg.content} echoLevel={msg.echoLevel} />
        {msg.triggersEvaluation && !isPlayer && (
          <div
            style={{
              fontSize: 11,
              color: '#FF2442',
              marginTop: 6,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span style={{ fontSize: 10 }}>★</span> 点击给这句打分
          </div>
        )}
      </div>
    </div>
  )
}

export function TypingIndicator() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', margin: '6px 12px' }}>
      <div
        style={{
          padding: '10px 14px',
          background: '#fff',
          borderRadius: '0 14px 14px 14px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          display: 'flex',
          gap: 4,
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="typing-dot"
            style={{
              display: 'inline-block',
              width: 6,
              height: 6,
              borderRadius: 3,
              background: '#999',
              animationDelay: `${i * 0.16}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
