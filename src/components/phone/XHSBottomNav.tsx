import { useUIStore } from '../../store/uiStore'
import { useNPCStore } from '../../store/npcStore'
import type { XHSTab } from '../../types'

const PRIMARY = '#FF2442'
const INACTIVE = '#999'

interface IconProps {
  active: boolean
}

function IconHome({ active }: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V10.5Z"
        stroke={active ? PRIMARY : INACTIVE}
        strokeWidth={active ? 2 : 1.6}
        strokeLinejoin="round"
        fill={active ? 'rgba(255,36,66,0.10)' : 'none'}
      />
    </svg>
  )
}

function IconNote({ active }: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect
        x="4"
        y="3"
        width="16"
        height="18"
        rx="2"
        stroke={active ? PRIMARY : INACTIVE}
        strokeWidth={active ? 2 : 1.6}
        fill={active ? 'rgba(255,36,66,0.10)' : 'none'}
      />
      <path
        d="M8 8h8M8 12h8M8 16h5"
        stroke={active ? PRIMARY : INACTIVE}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconMessage({ active }: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 6C4 4.9 4.9 4 6 4H18C19.1 4 20 4.9 20 6V16C20 17.1 19.1 18 18 18H10L6 22V18C4.9 18 4 17.1 4 16V6Z"
        stroke={active ? PRIMARY : INACTIVE}
        strokeWidth={active ? 2 : 1.6}
        strokeLinejoin="round"
        fill={active ? 'rgba(255,36,66,0.10)' : 'none'}
      />
    </svg>
  )
}

function IconProfile({ active }: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="8"
        r="4"
        stroke={active ? PRIMARY : INACTIVE}
        strokeWidth={active ? 2 : 1.6}
        fill={active ? 'rgba(255,36,66,0.10)' : 'none'}
      />
      <path
        d="M4 21C4 16.6 7.6 13 12 13C16.4 13 20 16.6 20 21"
        stroke={active ? PRIMARY : INACTIVE}
        strokeWidth={active ? 2 : 1.6}
        strokeLinecap="round"
        fill={active ? 'rgba(255,36,66,0.10)' : 'none'}
      />
    </svg>
  )
}

function PublishButton() {
  return (
    <div
      style={{
        width: 48,
        height: 30,
        background: 'linear-gradient(90deg, #FF2442, #FF5065)',
        borderRadius: 15,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 10px rgba(255,36,66,0.35)',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export function XHSBottomNav() {
  const { currentTab, setCurrentTab, setChatRoomNpcId } = useUIStore()
  const chats = useNPCStore((s) => s.chats)

  const unread = Object.values(chats).reduce((acc, list) => {
    if (!list.length) return acc
    const last = list[list.length - 1]
    return acc + (last.role === 'npc' ? 1 : 0)
  }, 0)

  const items: Array<{ key: XHSTab; label: string; render: (a: boolean) => React.ReactNode }> = [
    { key: 'home', label: '首页', render: (a) => <IconHome active={a} /> },
    { key: 'note', label: '商城', render: (a) => <IconNote active={a} /> },
    { key: 'publish', label: '', render: () => <PublishButton /> },
    { key: 'message', label: '消息', render: (a) => <IconMessage active={a} /> },
    { key: 'profile', label: '我', render: (a) => <IconProfile active={a} /> },
  ]

  return (
    <nav
      style={{
        height: 56,
        borderTop: '0.5px solid #EBEBEB',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        flexShrink: 0,
        paddingBottom: 4,
      }}
    >
      {items.map((it) => {
        const active = currentTab === it.key
        const isPublish = it.key === 'publish'
        return (
          <button
            key={it.key}
            onClick={() => {
              if (isPublish) return
              setChatRoomNpcId(null)
              setCurrentTab(it.key)
            }}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '4px 0',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              position: 'relative',
              color: active ? PRIMARY : INACTIVE,
              fontSize: 10.5,
              fontWeight: active ? 600 : 500,
            }}
          >
            <div style={{ position: 'relative' }}>
              {it.render(active)}
              {it.key === 'message' && unread > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -2,
                    right: -6,
                    minWidth: 16,
                    height: 16,
                    background: PRIMARY,
                    color: '#fff',
                    borderRadius: 8,
                    fontSize: 10,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                  }}
                >
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </div>
            {it.label && <span>{it.label}</span>}
          </button>
        )
      })}
    </nav>
  )
}
