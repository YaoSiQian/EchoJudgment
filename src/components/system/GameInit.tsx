import { useEffect, useRef } from 'react'
import { useGameStore } from '../../store/gameStore'
import { usePlayerStore } from '../../store/playerStore'
import { useNPCStore } from '../../store/npcStore'
import { narrativeEngine } from '../../engine/NarrativeEngine'
import { generateNewsArticle } from '../../ai/feedService'
import { generateId } from '../../utils/timeUtils'

// Wires cross-cutting concerns: act advancement, news on heavy consequences
export function GameInit() {
  const lastNewsConsequenceCount = useRef(0)
  const lastImbalance = useRef(0)
  const acts = useGameStore((s) => s.currentAct)
  const consequences = useGameStore((s) => s.revealedConsequences)
  const imbalance = useGameStore((s) => s.imbalanceValue)

  // Act advance check
  useEffect(() => {
    const game = useGameStore.getState()
    const player = usePlayerStore.getState()
    const advance = narrativeEngine.shouldAdvanceAct(game, player)
    if (advance) {
      useGameStore.getState().advanceAct(advance.nextAct)
      useGameStore.getState().addEvent({
        id: generateId('evt'),
        type: 'act_advance',
        description: `进入第${advance.nextAct}幕（${advance.reason}）`,
        gameDay: game.gameTime.day,
        timestamp: Date.now(),
      })
    }
  }, [acts, consequences.length, imbalance])

  // Trigger news article when a heavy consequence appears
  useEffect(() => {
    if (consequences.length <= lastNewsConsequenceCount.current) return
    const newOnes = consequences.slice(lastNewsConsequenceCount.current)
    lastNewsConsequenceCount.current = consequences.length
    const heavy = newOnes.find((c) => c.type === 'news_article')
    if (heavy) {
      const npc = useNPCStore.getState().npcs.find((n) => n.id === heavy.data.npcId)
      const hint = `${npc?.name ?? '某人'} 因近期受到强烈${heavy.direction === 'negative' ? '负面' : '正面'}评价，命运发生重大变化。`
      generateNewsArticle(useGameStore.getState(), hint).catch(() => {})
    }
  }, [consequences])

  // Re-trigger feed pull on imbalance crossing thresholds
  useEffect(() => {
    if (Math.abs(imbalance - lastImbalance.current) >= 30) {
      lastImbalance.current = imbalance
      // could batch new social posts; left out to avoid runaway calls
    }
  }, [imbalance])

  return null
}
