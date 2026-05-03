import { useEffect } from 'react'
import { useFeedStore } from '../../../store/feedStore'
import { useGameStore } from '../../../store/gameStore'
import { useNPCStore } from '../../../store/npcStore'
import { PostCard } from './PostCard'
import { generateSocialPosts } from '../../../ai/feedService'

export function DiscoverFeed() {
  const posts = useFeedStore((s) => s.socialPosts)
  const game = useGameStore((s) => s)
  const npcs = useNPCStore((s) => s.npcs)

  useEffect(() => {
    if (posts.length === 0) {
      generateSocialPosts(game, npcs).catch((e) => console.warn('feed gen failed', e))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="h-full overflow-y-auto xhs-scroll" style={{ background: '#F5F5F5', padding: 8 }}>
      <div className="waterfall-grid">
        {posts.map((p) => (
          <div key={p.id} className="waterfall-item">
            <PostCard post={p} />
          </div>
        ))}
      </div>
      {posts.length === 0 && (
        <div className="text-center py-16" style={{ color: '#999', fontSize: 13 }}>
          正在加载内容…
        </div>
      )}
    </div>
  )
}
