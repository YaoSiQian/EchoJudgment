import { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { useUIStore } from '../../store/uiStore'
import type { EchoLevel } from '../../types'

export function DebugPanel() {
  const [open, setOpen] = useState(false)
  const game = useGameStore((s) => s)
  const setImbalance = useGameStore((s) => s.setImbalance)
  const setEchoLevel = useGameStore((s) => s.setEchoLevel)
  const setDebug = useUIStore((s) => s.setDebug)

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: 12,
          left: 12,
          width: 36,
          height: 36,
          borderRadius: 18,
          background: 'rgba(255,36,66,0.9)',
          color: '#fff',
          border: 'none',
          fontSize: 11,
          fontWeight: 700,
          zIndex: 999,
        }}
      >
        DBG
      </button>
    )
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 12,
        left: 12,
        width: 240,
        background: 'rgba(15,15,30,0.96)',
        border: '1px solid rgba(255,36,66,0.4)',
        borderRadius: 10,
        padding: 12,
        color: '#fff',
        fontSize: 12,
        zIndex: 999,
        backdropFilter: 'blur(8px)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <strong style={{ color: '#FF2442' }}>DEBUG</strong>
        <button onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', color: '#999' }}>
          ×
        </button>
      </div>
      <Row label="幕" value={`第${game.currentAct}幕`} />
      <Row label="天" value={game.gameTime.day.toString()} />
      <Row label="失衡" value={Math.round(game.imbalanceValue).toString()} />
      <Row label="回响" value={`Lv.${game.echoLevel}`} />
      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <button onClick={() => setImbalance(game.imbalanceValue + 30)} style={btn}>失衡 +30</button>
        <button onClick={() => setEchoLevel(Math.min(4, game.echoLevel + 1) as EchoLevel)} style={btn}>回响 +1</button>
        <button onClick={() => setImbalance(0)} style={btn}>重置失衡</button>
        <button onClick={() => setDebug(false)} style={{ ...btn, background: '#333' }}>关闭调试</button>
      </div>
    </div>
  )
}

const btn: React.CSSProperties = {
  padding: '5px 8px',
  background: 'rgba(255,36,66,0.2)',
  color: '#FF2442',
  border: '1px solid rgba(255,36,66,0.3)',
  borderRadius: 4,
  fontSize: 11,
  cursor: 'pointer',
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
      <span style={{ color: '#999' }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  )
}
