import { useGameStore } from '../../store/gameStore'
import { formatGameTime } from '../../utils/timeUtils'
import { XHSApp } from './XHSApp'

export function PhoneFrame() {
  const gameTime = useGameStore((s) => s.gameTime)
  return (
    <div
      style={{
        width: 375,
        height: 'min(812px, calc(100vh - 40px))',
        maxHeight: 812,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#1C1C1E',
          borderRadius: 52,
          boxShadow:
            '0 0 0 1px #000, 0 0 0 3px #3A3A3C, inset 0 0 0 1px rgba(255,255,255,0.04), 0 24px 80px rgba(0,0,0,0.85)',
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Status bar (white) */}
        <div
          style={{
            height: 50,
            background: '#fff',
            position: 'relative',
            borderRadius: '48px 48px 0 0',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            padding: '0 24px 6px',
            color: '#000',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: 0.2 }}>
            {formatGameTime(gameTime)}
          </span>
          <div
            style={{
              position: 'absolute',
              top: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 120,
              height: 32,
              background: '#1C1C1E',
              borderRadius: 20,
              zIndex: 10,
            }}
          />
          <StatusIcons />
        </div>

        {/* App viewport */}
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            background: '#fff',
            borderRadius: '0 0 48px 48px',
            position: 'relative',
            color: '#333',
          }}
        >
          <XHSApp />
        </div>
      </div>
    </div>
  )
}

function StatusIcons() {
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
      {/* Signal */}
      <svg width="17" height="11" viewBox="0 0 17 11" fill="#000">
        <rect x="0" y="7" width="3" height="4" rx="0.5" />
        <rect x="4" y="5" width="3" height="6" rx="0.5" />
        <rect x="8" y="2" width="3" height="9" rx="0.5" />
        <rect x="12" y="0" width="3" height="11" rx="0.5" />
      </svg>
      {/* Wifi */}
      <svg width="15" height="11" viewBox="0 0 15 11" fill="#000">
        <path d="M7.5 11l2-2.5a3 3 0 00-4 0L7.5 11z" />
        <path d="M7.5 7l4-4.5a8 8 0 00-8 0L7.5 7z" opacity="0.5" />
      </svg>
      {/* Battery */}
      <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
        <rect x="0.5" y="0.5" width="22" height="11" rx="2.5" stroke="#000" opacity="0.4" />
        <rect x="2" y="2" width="18" height="8" rx="1.5" fill="#000" />
        <rect x="23" y="4" width="1.5" height="4" rx="0.5" fill="#000" opacity="0.4" />
      </svg>
    </div>
  )
}
