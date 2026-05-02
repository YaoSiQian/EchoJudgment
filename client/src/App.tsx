import { useEffect } from 'react'
import { useGameStore } from './store/gameStore.ts'
import { startGame, getCharacters, getPlayerStats, advanceScene, fetchStreamNarrative } from './api/client.ts'
import NarrativeReader from './components/NarrativeReader.tsx'
import EvaluationPanel from './components/EvaluationPanel.tsx'
import CharacterCard from './components/CharacterCard.tsx'
import EchoNotification from './components/EchoNotification.tsx'

function App() {
  const {
    session, scene, narrativeText, isStreaming,
    characters, playerStats, echoNarrative, showEcho,
    loading,
    setSession, setScene, appendNarrative, clearNarrative,
    setStreaming, setCharacters, setPlayerStats,
    setEchoNarrative, setShowEcho, setLoading,
  } = useGameStore()

  useEffect(() => {
    initGame()
  }, [])

  async function initGame() {
    setLoading(true)
    try {
      const { session: s, scene: sc } = await startGame()
      setSession(s)
      setScene(sc)
      await loadCharacters()
      await loadNarrative(s.id, sc.sceneId)
    } finally {
      setLoading(false)
    }
  }

  async function loadCharacters() {
    const chars = await getCharacters()
    setCharacters(chars)
  }

  async function loadPlayerStats() {
    if (!session) return
    const stats = await getPlayerStats(session.playerId)
    setPlayerStats(stats)
  }

  async function loadNarrative(sessionId: string, _sceneId: string) {
    clearNarrative()
    setStreaming(true)
    try {
      await fetchStreamNarrative(
        { sessionId, characterId: scene?.availableActions?.[0]?.targetIds?.[0] },
        (chunk) => appendNarrative(chunk)
      )
    } finally {
      setStreaming(false)
    }
  }

  async function handleContinue() {
    if (!session || !scene) return
    setLoading(true)
    clearNarrative()
    try {
      const { scene: nextScene } = await advanceScene(session.id)
      if (nextScene) {
        setScene(nextScene)
        await loadNarrative(session.id, nextScene.sceneId)
      } else {
        appendNarrative('\n\n【第一幕 结束】')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleEvaluationComplete(result: {
    echoTriggered: boolean
    echoNarrative?: string
    fateDelta?: { shortTermEffect: string }
  }) {
    await loadPlayerStats()
    if (result.echoTriggered && result.echoNarrative) {
      setEchoNarrative(result.echoNarrative)
      setShowEcho(true)
    }
    // Auto-advance after short delay
    setTimeout(() => handleContinue(), 2000)
  }

  const currentAction = scene?.availableActions?.[0]

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f1115 0%, #1a1d26 100%)',
        color: '#e2e4e9',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 16px',
      }}
    >
      <header style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 300, letterSpacing: 4, margin: 0, color: '#c9cdd4' }}>
          回声评价
        </h1>
        <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4, letterSpacing: 2 }}>
          ECHO JUDGMENT
        </p>
      </header>

      {playerStats && (
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginBottom: 20,
            padding: '12px 20px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.06)',
            fontSize: 12,
            color: '#9ca3af',
          }}
        >
          <span>评价: {playerStats.totalEvaluations}</span>
          <span>正面: {playerStats.positiveCount}</span>
          <span>负面: {playerStats.negativeCount}</span>
          <span>人格: {playerStats.archetype}</span>
          {playerStats.pendingEchoes > 0 && (
            <span style={{ color: '#c084fc' }}>回荡: {playerStats.pendingEchoes}</span>
          )}
        </div>
      )}

      <main style={{ width: '100%', maxWidth: 720 }}>
        {scene && (
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: 3,
                color: '#6b7280',
                marginBottom: 8,
              }}
            >
              第一幕 · {scene.title}
            </div>
          </div>
        )}

        <NarrativeReader
          text={narrativeText}
          isStreaming={isStreaming}
        />

        {scene && currentAction?.type === 'continue' && !isStreaming && !loading && (
          <button
            onClick={handleContinue}
            style={{
              width: '100%',
              padding: '14px 24px',
              marginTop: 20,
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 8,
              color: '#c9cdd4',
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            继续
          </button>
        )}

        {scene && currentAction?.type === 'evaluate' && !isStreaming && !loading && (
          <EvaluationPanel
            action={currentAction}
            sessionId={session!.id}
            sceneId={scene.sceneId}
            onComplete={handleEvaluationComplete}
          />
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: 40, color: '#6b7280', fontSize: 14 }}>
            <div style={{ animation: 'pulse 1.5s infinite' }}>回响域正在波动...</div>
          </div>
        )}
      </main>

      {characters.length > 0 && (
        <section
          style={{
            width: '100%',
            maxWidth: 720,
            marginTop: 32,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 12,
          }}
        >
          {characters
            .filter((c) => c.id !== 'anonymous')
            .map((char) => (
              <CharacterCard key={char.id} character={char} />
            ))}
        </section>
      )}

      <EchoNotification
        open={showEcho}
        narrative={echoNarrative}
        onClose={() => setShowEcho(false)}
      />
    </div>
  )
}

export default App
