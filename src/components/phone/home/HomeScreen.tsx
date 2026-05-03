import { useState } from 'react'
import { motion } from 'framer-motion'
import { useUIStore } from '../../../store/uiStore'
import { DiscoverFeed } from './DiscoverFeed'
import { FollowingFeed } from './FollowingFeed'

const PRIMARY = '#FF2442'

export function HomeScreen() {
  const { homeSubTab, setHomeSubTab } = useUIStore()

  return (
    <div className="flex flex-col h-full" style={{ background: '#F5F5F5' }}>
      {/* Top bar */}
      <div
        style={{
          height: 48,
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          flexShrink: 0,
          borderBottom: '0.5px solid #EBEBEB',
        }}
      >
        <button style={{ background: 'transparent', border: 'none', padding: 6 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="#222" strokeWidth="2" />
            <path d="M20 20l-3-3" stroke="#222" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 22 }}>
          <TabButton
            active={homeSubTab === 'discover'}
            label="推荐"
            onClick={() => setHomeSubTab('discover')}
          />
          <TabButton
            active={homeSubTab === 'following'}
            label="关注"
            onClick={() => setHomeSubTab('following')}
          />
        </div>

        <button style={{ background: 'transparent', border: 'none', padding: 6 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 22a2 2 0 002-2h-4a2 2 0 002 2zM18 16v-5a6 6 0 10-12 0v5l-2 2v1h16v-1l-2-2z"
              stroke="#222"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {homeSubTab === 'discover' ? <DiscoverFeed /> : <FollowingFeed />}
      </div>
    </div>
  )
}

function TabButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'transparent',
        border: 'none',
        padding: '4px 0',
        position: 'relative',
        fontSize: active ? 17 : 14,
        fontWeight: active ? 700 : 500,
        color: active ? '#222' : '#999',
        transition: 'all 200ms',
      }}
    >
      {label}
      {active && (
        <motion.span
          layoutId="home-tab-bar"
          style={{
            position: 'absolute',
            bottom: 4,
            left: '50%',
            translate: '-50% 0',
            width: 20,
            height: 3,
            borderRadius: 2,
            background: PRIMARY,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      )}
    </button>
  )
}
