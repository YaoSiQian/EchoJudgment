import type { Character } from '../types/index.ts'

interface Props {
  character: Character
}

export default function CharacterCard({ character }: Props) {
  const moodColor =
    character.currentState.mood > 2
      ? '#4ade80'
      : character.currentState.mood < -2
        ? '#f87171'
        : '#9ca3af'

  return (
    <div
      style={{
        padding: '14px 16px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 10,
        fontSize: 13,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <span style={{ fontWeight: 600, color: '#e2e4e9', fontSize: 14 }}>
          {character.name}
        </span>
        <span style={{ fontSize: 11, color: '#6b7280' }}>
          {character.occupation}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
        <Stat label="心情" value={character.currentState.mood} color={moodColor} />
        <Stat label="职业" value={character.currentState.careerProgress} />
        <Stat label="社交" value={character.currentState.socialStanding} />
      </div>

      <div style={{ display: 'flex', gap: 8, fontSize: 11, color: '#6b7280' }}>
        <span>信任度: {(character.relationshipWithPlayer.trust * 100).toFixed(0)}%</span>
        <span>熟悉度: {(character.relationshipWithPlayer.familiarity * 100).toFixed(0)}%</span>
      </div>

      {character.currentState.hiddenSecretRevealed && (
        <div
          style={{
            marginTop: 8,
            padding: '6px 10px',
            background: 'rgba(192, 132, 252, 0.08)',
            borderRadius: 6,
            fontSize: 11,
            color: '#c084fc',
          }}
        >
          脆弱点: {character.sensitivity.hiddenVulnerability}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontWeight: 600, color: color || '#c9cdd4', fontSize: 13 }}>
        {value.toFixed(0)}
      </span>
    </div>
  )
}
