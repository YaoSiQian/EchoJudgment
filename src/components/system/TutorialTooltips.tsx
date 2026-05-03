import { useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'
import { useUIStore } from '../../store/uiStore'
import { useTutorialStore } from '../../store/tutorialStore'
import { Tooltip } from './Tooltip'

export function TutorialTooltips() {
  const tab = useUIStore((s) => s.currentTab)
  const imbalance = useGameStore((s) => s.imbalanceValue)
  const echoLevel = useGameStore((s) => s.echoLevel)
  const t = useTutorialStore((s) => s)
  const setSeen = useTutorialStore((s) => s.setSeen)

  // Trigger flags
  const showHome = !t.seenHomeIntro && tab === 'home'
  const showImbalance = !t.seenImbalanceIntro && imbalance > 0
  const showEcho = !t.seenEchoIntro && echoLevel >= 1

  // Auto-dismiss imbalance + echo after 8s if untouched
  useEffect(() => {
    if (showImbalance) {
      const id = setTimeout(() => setSeen('imbalance'), 8000)
      return () => clearTimeout(id)
    }
  }, [showImbalance, setSeen])
  useEffect(() => {
    if (showEcho) {
      const id = setTimeout(() => setSeen('echo'), 8000)
      return () => clearTimeout(id)
    }
  }, [showEcho, setSeen])

  return (
    <>
      <Tooltip
        show={showHome}
        onDismiss={() => setSeen('home')}
        text="这是虚构小红书。NPC 的命运变化（晋升、绯闻、消失）都会在这里以社媒/锡陵晚报的形式悄悄出现。"
        position={{ top: 92, left: '50%' }}
      />
      <Tooltip
        show={showImbalance}
        onDismiss={() => setSeen('imbalance')}
        text="左栏的「失衡值」开始上涨了。极端评价、连续差评会让世界变得不稳定，超过阈值就会触发『回响』。"
        position={{ top: 120, left: 280 }}
      />
      <Tooltip
        show={showEcho}
        onDismiss={() => setSeen('echo')}
        text="文字有点不对劲了——这是『回响』。等级越高，对话和新闻里的异常越明显。它在暗示你被注视。"
        position={{ top: 60, right: 280 }}
      />
    </>
  )
}
