import { useGameStore } from '../../store/gameStore'
import { usePlayerStore } from '../../store/playerStore'
import { useNPCStore } from '../../store/npcStore'

const PANEL_BG = 'rgba(255,255,255,0.02)'

export function LeftPanel() {
  const game = useGameStore((s) => s)
  const player = usePlayerStore((s) => s)
  const allNpcs = useNPCStore((s) => s.npcs)
  const npcs = allNpcs.filter((n) => n.isActive)

  const evalCount = player.evaluationHistory.length
  const posCount = player.evaluationHistory.filter((e) => e.direction === 'positive').length
  const negCount = player.evaluationHistory.filter((e) => e.direction === 'negative').length
  const extremeCount = player.evaluationHistory.filter((e) => e.extremeFlag).length

  return (
    <div className="flex flex-col h-full p-4 gap-4 overflow-y-auto xhs-scroll">
      <Header title="状态" subtitle={`第 ${game.gameTime.day} 天 · 第${game.currentAct}幕`} />

      <Card>
        <Bar label="失衡值" value={game.imbalanceValue} max={200} color={imbalanceColor(game.imbalanceValue)} />
        <Bar label="自我感知" value={Math.round((1 - player.suspicionIndex) * 100)} max={100} color="#5C9CFF" />
        <Bar label="压力承受" value={Math.round(player.stressTolerance * 100)} max={100} color="#9C27B0" />
      </Card>

      <Header title="评价统计" />
      <Card>
        <Stat label="好评" value={posCount} color="#16A34A" />
        <Stat label="差评" value={negCount} color="#FF2442" />
        <Stat label="极端" value={extremeCount} color="#FF9800" />
        <Stat label="累计" value={evalCount} color="#999" />
      </Card>

      <Header title="人物关系" />
      <Card>
        {npcs.map((n) => (
          <RelationRow key={n.id} name={n.name} value={n.relationshipValue} />
        ))}
      </Card>
    </div>
  )
}

function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase' }}>
        {title}
      </div>
      {subtitle && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{subtitle}</div>}
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: PANEL_BG,
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 10,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {children}
    </div>
  )
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ color }}>
          {Math.round(value)}
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>/{max}</span>
        </span>
      </div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: color,
            transition: 'width 600ms ease',
          }}
        />
      </div>
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
      <span style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</span>
      <span style={{ color, fontWeight: 600 }}>{value}</span>
    </div>
  )
}

function RelationRow({ name, value }: { name: string; value: number }) {
  const isPos = value >= 0
  const pct = Math.min(100, Math.abs(value))
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
        <span style={{ color: 'rgba(255,255,255,0.8)' }}>{name}</span>
        <span style={{ color: isPos ? '#16A34A' : '#FF2442' }}>
          {value > 0 ? '+' : ''}
          {value}
        </span>
      </div>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 1.5 }}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: isPos ? '#16A34A' : '#FF2442',
            transition: 'width 400ms ease',
          }}
        />
      </div>
    </div>
  )
}

function imbalanceColor(v: number): string {
  if (v < 30) return '#16A34A'
  if (v < 80) return '#F59E0B'
  if (v < 150) return '#FF2442'
  return '#9333EA'
}
