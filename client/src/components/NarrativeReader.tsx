import { useEffect, useRef } from 'react'

interface Props {
  text: string
  isStreaming: boolean
}

export default function NarrativeReader({ text, isStreaming }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [text])

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        padding: '24px 28px',
        minHeight: 200,
        maxHeight: '50vh',
        overflowY: 'auto',
        fontSize: 16,
        lineHeight: 1.8,
        color: '#d1d5db',
        fontFamily: '"Noto Serif SC", "Source Han Serif SC", Georgia, serif',
        position: 'relative',
      }}
    >
      <div style={{ whiteSpace: 'pre-wrap' }}>{text}</div>
      {isStreaming && (
        <span
          style={{
            display: 'inline-block',
            width: 8,
            height: 18,
            background: '#c084fc',
            marginLeft: 4,
            borderRadius: 2,
            animation: 'blink 1s infinite',
            verticalAlign: 'text-bottom',
          }}
        />
      )}
      <div ref={bottomRef} />
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
