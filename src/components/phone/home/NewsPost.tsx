import { EchoText } from '../../shared/EchoText'
import type { NewsArticle, EchoLevel } from '../../../types'

const CATEGORY_COLOR: Record<string, string> = {
  社会: '#FF2442',
  教育: '#5C6BC0',
  职场: '#26A69A',
  娱乐: '#EC407A',
  本地: '#FB8C00',
}

export function NewsPost({ article, echoLevel }: { article: NewsArticle; echoLevel: EchoLevel }) {
  const headline = echoLevel >= 3 && article.echoHeadline ? article.echoHeadline : article.headline
  const catColor = CATEGORY_COLOR[article.category] ?? '#FF2442'

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      <div
        style={{
          aspectRatio: '16 / 9',
          background: 'linear-gradient(135deg, #2A2A2A, #1A1A2E)',
          position: 'relative',
        }}
      >
        <span
          style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            background: catColor,
            color: '#fff',
            fontSize: 10,
            padding: '2px 8px',
            borderRadius: 10,
            fontWeight: 600,
          }}
        >
          {article.category}
        </span>
      </div>
      <div style={{ padding: '12px 14px' }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#222',
            lineHeight: 1.35,
            marginBottom: 6,
          }}
        >
          <EchoText text={headline} echoLevel={echoLevel >= 3 ? echoLevel : undefined} />
        </div>
        <div
          style={{
            fontSize: 12.5,
            color: '#666',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {article.body}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: 10,
            fontSize: 11,
            color: '#999',
            gap: 8,
          }}
        >
          <span
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              background: '#FF2442',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            晚
          </span>
          <span>锡陵晚报</span>
          <span>· 第{Math.max(1, Math.floor((Date.now() - article.timestamp) / 60000))}分钟前</span>
        </div>
      </div>
    </div>
  )
}
