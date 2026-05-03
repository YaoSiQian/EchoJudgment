import { Component, type ErrorInfo, type ReactNode, useEffect, useState } from 'react'
import { GameShell } from '../components/layout/GameShell'
import { MobileShell } from '../components/layout/MobileShell'
import { GameInit } from '../components/system/GameInit'
import { DebugPanel } from '../components/system/DebugPanel'
import { OpeningScene } from '../components/system/OpeningScene'
import { TutorialTooltips } from '../components/system/TutorialTooltips'
import { useUIStore } from '../store/uiStore'
import { useTutorialStore } from '../store/tutorialStore'

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(e: Error) {
    return { error: e }
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Echo]', error, info)
  }
  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 16,
            background: '#0F0F1E',
            color: '#fff',
            padding: 24,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 18, opacity: 0.9 }}>《回响》遇到了一个意外</div>
          <div style={{ fontSize: 13, opacity: 0.6, maxWidth: 480 }}>
            {String(this.state.error?.message ?? this.state.error)}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              borderRadius: 999,
              border: '1px solid rgba(255,36,66,0.4)',
              background: 'rgba(255,36,66,0.1)',
              color: '#FF2442',
              fontWeight: 600,
            }}
          >
            重新载入
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export function App() {
  const [isWide, setIsWide] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  )
  const isDebug = useUIStore((s) => s.isDebug)
  const openingDone = useTutorialStore((s) => s.openingDone)
  const setOpeningDone = useTutorialStore((s) => s.setOpeningDone)

  useEffect(() => {
    const handler = () => setIsWide(window.innerWidth >= 1024)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return (
    <ErrorBoundary>
      <GameInit />
      {isDebug && <DebugPanel />}
      {!openingDone && <OpeningScene onClose={setOpeningDone} />}
      {openingDone && <TutorialTooltips />}
      {isWide ? <GameShell /> : <MobileShell />}
    </ErrorBoundary>
  )
}
