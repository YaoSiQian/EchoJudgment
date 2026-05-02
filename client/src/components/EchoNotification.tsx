import { useEffect } from 'react'

interface Props {
  open: boolean
  narrative: string | null
  onClose: () => void
}

export default function EchoNotification({ open, narrative, onClose }: Props) {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(onClose, 8000)
      return () => clearTimeout(timer)
    }
  }, [open, onClose])

  if (!open || !narrative) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        animation: 'fadeIn 0.4s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          maxWidth: 480,
          width: '90%',
          padding: '32px 28px',
          background: 'linear-gradient(135deg, #1a1025 0%, #150d20 100%)',
          border: '1px solid rgba(192, 132, 252, 0.2)',
          borderRadius: 16,
          boxShadow: '0 0 40px rgba(192, 132, 252, 0.15)',
          animation: 'echoPulse 0.6s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: 4,
            color: '#c084fc',
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          回荡已触发
        </div>

        <div
          style={{
            fontSize: 15,
            lineHeight: 1.8,
            color: '#d8b4fe',
            textAlign: 'center',
            fontFamily: '"Noto Serif SC", Georgia, serif',
          }}
        >
          {narrative}
        </div>

        <div
          style={{
            marginTop: 20,
            textAlign: 'center',
            fontSize: 11,
            color: '#6b7280',
          }}
        >
          点击任意处关闭
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes echoPulse {
          0% { transform: scale(0.95); opacity: 0; }
          50% { transform: scale(1.01); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
