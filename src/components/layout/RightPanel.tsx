import { useGameStore } from '../../store/gameStore'

const LEVEL_COLOR: Record<number, string> = {
  0: '#16A34A',
  1: '#5C9CFF',
  2: '#F59E0B',
  3: '#FF2442',
  4: '#9333EA',
}

const LEVEL_LABEL: Record<number, string> = {
  0: '稳定',
  1: '微涟漪',
  2: '呼应',
  3: '意味深长',
  4: '风暴',
}

export function RightPanel() {
  const game = useGameStore((s) => s)
  const echo = game.echoLevel
  const color = LEVEL_COLOR[echo]

  return (
    <div className="flex flex-col h-full p-4 gap-4 overflow-y-auto xhs-scroll">
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase' }}>
        回响监测
      </div>

      <div
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: `1px solid ${color}40`,
          borderRadius: 12,
          padding: 16,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {echo > 0 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(ellipse at center, ${color}25, transparent 70%)`,
              animation: 'echo-pulse 2s ease-in-out infinite',
              pointerEvents: 'none',
            }}
          />
        )}
        <style>{`
          @keyframes echo-pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
        `}</style>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', position: 'relative' }}>当前等级</div>
        <div style={{ fontSize: 56, fontWeight: 800, color, lineHeight: 1, marginTop: 6, position: 'relative' }}>
          Lv{echo}
        </div>
        <div style={{ fontSize: 13, color, marginTop: 6, fontWeight: 600, position: 'relative' }}>
          {LEVEL_LABEL[echo]}
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
          <span>失衡值</span>
          <span style={{ color }}>{Math.round(game.imbalanceValue)}/200</span>
        </div>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
          <div
            style={{
              width: `${(game.imbalanceValue / 200) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #16A34A, #F59E0B 40%, #FF2442 70%, #9333EA)',
              transition: 'width 700ms ease',
            }}
          />
        </div>
      </div>

      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase', marginTop: 4 }}>
        事件日志
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[...game.eventLog].slice(-20).reverse().map((e) => (
          <div
            key={e.id}
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: 6,
              padding: '7px 10px',
              fontSize: 12,
              color: 'rgba(255,255,255,0.78)',
              lineHeight: 1.4,
            }}
          >
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>
              第{e.gameDay}天
            </div>
            {e.description}
          </div>
        ))}
        {game.eventLog.length === 0 && (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', padding: 6 }}>
            暂无事件
          </div>
        )}
      </div>
    </div>
  )
}
