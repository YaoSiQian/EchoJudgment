import { useUIStore } from '../../store/uiStore'
import { XHSBottomNav } from './XHSBottomNav'
import { HomeScreen } from './home/HomeScreen'
import { ChatList } from './message/ChatList'
import { ChatRoom } from './message/ChatRoom'
import { ProfileScreen } from './ProfileScreen'

export function XHSApp() {
  const tab = useUIStore((s) => s.currentTab)
  const chatNpcId = useUIStore((s) => s.chatRoomNpcId)

  let body: React.ReactNode
  if (tab === 'home') body = <HomeScreen />
  else if (tab === 'message') body = chatNpcId ? <ChatRoom npcId={chatNpcId} /> : <ChatList />
  else if (tab === 'profile') body = <ProfileScreen />
  else if (tab === 'note') body = <PlaceholderScreen title="笔记" />
  else body = <PlaceholderScreen title="发布" />

  // Hide bottom nav inside chat room
  const showNav = !(tab === 'message' && chatNpcId)

  return (
    <div className="flex flex-col h-full" style={{ background: '#F5F5F5' }}>
      <div className="flex-1 overflow-hidden xhs-scroll">{body}</div>
      {showNav && <XHSBottomNav />}
    </div>
  )
}

function PlaceholderScreen({ title }: { title: string }) {
  return (
    <div className="h-full flex items-center justify-center text-sm" style={{ color: '#999' }}>
      {title} 功能尚未开放
    </div>
  )
}
