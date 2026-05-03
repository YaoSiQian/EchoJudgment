import { useNPCStore } from '../../store/npcStore'
import { usePlayerStore } from '../../store/playerStore'
import { useGameStore } from '../../store/gameStore'

export function ProfileScreen() {
  const npcs = useNPCStore((s) => s.npcs)
  const player = usePlayerStore((s) => s)
  const game = useGameStore((s) => s)

  return (
    <div className="h-full overflow-y-auto xhs-scroll" style={{ background: '#fff' }}>
      <div
        style={{
          padding: '32px 20px 20px',
          background: 'linear-gradient(135deg, #FFE8EC, #fff)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              background: 'linear-gradient(135deg, #FF2442, #FF5065)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            我
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#222' }}>未署名</div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              第 {game.gameTime.day} 天 · 锡陵
            </div>
          </div>
        </div>
      </div>

      <Section title="自我感知">
        <Row label="评价倾向 · 正" value={(player.evaluationTendency.positiveRatio * 100).toFixed(0) + '%'} />
        <Row label="评价倾向 · 负" value={(player.evaluationTendency.negativeRatio * 100).toFixed(0) + '%'} />
        <Row label="极端评价比例" value={(player.evaluationTendency.extremeRatio * 100).toFixed(0) + '%'} />
        <Row label="社交风格" value={STYLE_TEXT[player.socialStyle]} />
      </Section>

      <Section title="人际网络">
        {npcs.filter((n) => n.isActive).map((n) => (
          <div
            key={n.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 16px',
              borderBottom: '0.5px solid #F0F0F0',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                background: ARCHETYPE_COLOR[n.archetype],
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 600,
                marginRight: 10,
              }}
            >
              {n.name[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: '#222' }}>{n.name}</div>
              <div style={{ fontSize: 11, color: '#999' }}>{ARCHETYPE_LABEL[n.archetype]}</div>
            </div>
            <RelationBar value={n.relationshipValue} />
          </div>
        ))}
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 12, color: '#999', padding: '8px 16px' }}>{title}</div>
      <div style={{ background: '#fff' }}>{children}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '0.5px solid #F0F0F0',
        fontSize: 14,
      }}
    >
      <span style={{ color: '#555' }}>{label}</span>
      <span style={{ color: '#222', fontWeight: 500 }}>{value}</span>
    </div>
  )
}

function RelationBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.abs(value))
  const isPos = value >= 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div
        style={{
          width: 60,
          height: 4,
          background: '#F0F0F0',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: isPos ? '#16A34A' : '#FF2442',
          }}
        />
      </div>
      <span style={{ fontSize: 11, color: isPos ? '#16A34A' : '#FF2442', minWidth: 28 }}>
        {value > 0 ? '+' : ''}{value}
      </span>
    </div>
  )
}

const STYLE_TEXT: Record<string, string> = {
  active: '主动型', passive: '被动型', defensive: '防御型', aggressive: '进攻型',
}
const ARCHETYPE_LABEL: Record<string, string> = {
  close_friend: '挚友', competitor: '竞争者', authority: '权威', stranger: '陌生人', romantic: '恋人',
}
const ARCHETYPE_COLOR: Record<string, string> = {
  close_friend: '#FF8A65', competitor: '#7E57C2', authority: '#455A64', stranger: '#9E9E9E', romantic: '#EC407A',
}
