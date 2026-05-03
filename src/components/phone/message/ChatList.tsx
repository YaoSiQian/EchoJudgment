import { useNPCStore } from '../../../store/npcStore'
import { useUIStore } from '../../../store/uiStore'
import type { NPCState, ChatMessage } from '../../../types'

const ARCHETYPE_COLOR: Record<string, string> = {
  close_friend: '#FF8A65',
  competitor: '#7E57C2',
  authority: '#455A64',
  stranger: '#9E9E9E',
  romantic: '#EC407A',
}

export function ChatList() {
  const allNpcs = useNPCStore((s) => s.npcs)
  const npcs = allNpcs.filter((n) => n.isActive)
  const chats = useNPCStore((s) => s.chats)
  const setChatRoomNpcId = useUIStore((s) => s.setChatRoomNpcId)

  const sorted = [...npcs].sort((a, b) => {
    const la = chats[a.id]?.[chats[a.id].length - 1]
    const lb = chats[b.id]?.[chats[b.id].length - 1]
    return (lb?.timestamp ?? 0) - (la?.timestamp ?? 0)
  })

  return (
    <div className="h-full overflow-y-auto xhs-scroll" style={{ background: '#fff' }}>
      <div
        style={{
          padding: '10px 16px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '0.5px solid #F0F0F0',
        }}
      >
        <span style={{ fontSize: 18, fontWeight: 700, color: '#222' }}>消息</span>
        <span style={{ fontSize: 12, color: '#999' }}>{npcs.length} 个联系人</span>
      </div>
      {sorted.map((npc) => {
        const list = chats[npc.id] ?? []
        const last = list[list.length - 1]
        return (
          <ChatListItem
            key={npc.id}
            npc={npc}
            last={last}
            onClick={() => setChatRoomNpcId(npc.id)}
          />
        )
      })}
      {!sorted.length && (
        <div className="text-center py-12" style={{ color: '#999', fontSize: 13 }}>
          暂无会话
        </div>
      )}
    </div>
  )
}

function ChatListItem({
  npc,
  last,
  onClick,
}: {
  npc: NPCState
  last?: ChatMessage
  onClick: () => void
}) {
  const unread = last?.role === 'npc'
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        background: '#fff',
        border: 'none',
        borderBottom: '0.5px solid #F0F0F0',
        textAlign: 'left',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          background: ARCHETYPE_COLOR[npc.archetype] ?? '#999',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          fontWeight: 600,
          marginRight: 12,
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {npc.name[0]}
        {unread && (
          <span
            style={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 10,
              height: 10,
              borderRadius: 5,
              background: '#FF2442',
              border: '2px solid #fff',
            }}
          />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#222' }}>{npc.name}</span>
          <span style={{ fontSize: 11, color: '#999' }}>
            {last ? formatTime(last.timestamp) : ''}
          </span>
        </div>
        <div
          style={{
            fontSize: 13,
            color: '#777',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {last?.content ?? '点击开始对话'}
        </div>
      </div>
    </button>
  )
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
