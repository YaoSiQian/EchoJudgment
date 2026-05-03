import { useNPCStore } from '../../../store/npcStore'
import { useGameStore } from '../../../store/gameStore'
import { EchoText } from '../../shared/EchoText'
import type { SocialPost } from '../../../types'

const GRADIENTS = [
  'linear-gradient(135deg, #FFD1DC, #FFAEC9)',
  'linear-gradient(135deg, #B5EAEA, #88D8D8)',
  'linear-gradient(135deg, #DDD6F3, #FAACA8)',
  'linear-gradient(135deg, #C6FFDD, #F7797D)',
  'linear-gradient(135deg, #FEE140, #FA709A)',
  'linear-gradient(135deg, #A1C4FD, #C2E9FB)',
]

const ARCHETYPE_COLOR: Record<string, string> = {
  close_friend: '#FF8A65',
  competitor: '#7E57C2',
  authority: '#455A64',
  stranger: '#9E9E9E',
  romantic: '#EC407A',
}

export function PostCard({ post, fullWidth }: { post: SocialPost; fullWidth?: boolean }) {
  const npc = useNPCStore((s) => s.npcs.find((n) => n.id === post.npcId))
  const echoLevel = useGameStore((s) => s.echoLevel)
  const gradient = GRADIENTS[post.gradientIndex % GRADIENTS.length]
  // image height derived from id
  const h = 120 + (Array.from(post.id).reduce((a, c) => a + c.charCodeAt(0), 0) % 80)

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        width: fullWidth ? '100%' : undefined,
      }}
    >
      <div
        style={{
          width: '100%',
          height: fullWidth ? 180 : h,
          background: gradient,
          position: 'relative',
        }}
      >
        {post.imageDescription && (
          <div
            style={{
              position: 'absolute',
              bottom: 6,
              left: 8,
              right: 8,
              fontSize: 10,
              color: 'rgba(255,255,255,0.7)',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }}
          >
            {post.imageDescription}
          </div>
        )}
      </div>
      <div style={{ padding: '8px 10px 10px' }}>
        <div
          style={{
            fontSize: 13,
            color: '#222',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          <EchoText text={post.text} echoLevel={echoLevel} echoContent={post.echoContent} />
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 8,
            fontSize: 11,
            color: '#999',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                background: ARCHETYPE_COLOR[npc?.archetype ?? ''] ?? '#999',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 600,
              }}
            >
              {npc?.name?.[0] ?? '?'}
            </span>
            <span style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {npc?.name ?? '未知'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#999">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span>{post.likes}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
