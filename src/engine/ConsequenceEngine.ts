import type { EvaluationResult, NPCState, GameState, ConsequenceEvent } from '../types'

export class ConsequenceEngine {
  schedule(result: EvaluationResult, npc: NPCState, gameState: GameState): ConsequenceEvent[] {
    const events: ConsequenceEvent[] = []
    if (result.visibility === 'hidden') {
      events.push({
        type: 'context_update',
        data: { npcId: npc.id, impactScore: result.impactScore },
        triggerAt: gameState.gameTime.day,
        direction: result.direction,
      })
      return events
    }

    const triggerDay =
      gameState.gameTime.day + (result.visibility === 'delayed' ? result.delayDays : 0)

    const magnitude = Math.abs(result.impactScore)

    if (magnitude <= 1) {
      events.push({
        type: 'chat_mood_shift',
        data: { npcId: npc.id, direction: result.direction, intensity: 'light' },
        triggerAt: triggerDay,
        direction: result.direction,
      })
    } else if (magnitude <= 3) {
      events.push({
        type: 'social_post',
        data: { npcId: npc.id, direction: result.direction, intensity: 'medium' },
        triggerAt: triggerDay,
        direction: result.direction,
      })
    } else {
      events.push({
        type: 'news_article',
        data: { npcId: npc.id, direction: result.direction, intensity: 'heavy' },
        triggerAt: triggerDay,
        direction: result.direction,
      })
    }
    return events
  }

  applyTimeDecay(impactScore: number, delayDays: number): number {
    const decay: Record<number, number> = { 0: 1.0, 1: 0.8, 3: 0.5, 7: 0.2 }
    return impactScore * (decay[delayDays] ?? 0.1)
  }
}

export const consequenceEngine = new ConsequenceEngine()
