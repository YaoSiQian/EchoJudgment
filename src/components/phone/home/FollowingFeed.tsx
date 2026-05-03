import { useFeedStore } from '../../../store/feedStore'
import { useGameStore } from '../../../store/gameStore'
import { NewsPost } from './NewsPost'
import { PostCard } from './PostCard'

export function FollowingFeed() {
  const news = useFeedStore((s) => s.newsArticles)
  const posts = useFeedStore((s) => s.socialPosts)
  const echoLevel = useGameStore((s) => s.echoLevel)

  type Item =
    | { kind: 'news'; ts: number; data: typeof news[number] }
    | { kind: 'post'; ts: number; data: typeof posts[number] }
  const items: Item[] = [
    ...news.map((n) => ({ kind: 'news' as const, ts: n.timestamp, data: n })),
    ...posts.slice(0, 6).map((p) => ({ kind: 'post' as const, ts: p.timestamp, data: p })),
  ].sort((a, b) => b.ts - a.ts)

  return (
    <div className="h-full overflow-y-auto xhs-scroll" style={{ background: '#F5F5F5', padding: 8 }}>
      {items.length === 0 && (
        <div className="text-center py-16" style={{ color: '#999', fontSize: 13 }}>
          关注列表暂无��容
        </div>
      )}
      {items.map((it) =>
        it.kind === 'news' ? (
          <div key={it.data.id} style={{ marginBottom: 8 }}>
            <NewsPost article={it.data} echoLevel={echoLevel} />
          </div>
        ) : (
          <div key={it.data.id} style={{ marginBottom: 8 }}>
            <PostCard post={it.data} fullWidth />
          </div>
        )
      )}
    </div>
  )
}
