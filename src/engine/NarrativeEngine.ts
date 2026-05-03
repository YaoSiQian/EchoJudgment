import type { GameState, PlayerModel, NPCState, ActNumber } from '../types'

export interface ActAdvanceCondition {
  nextAct: ActNumber
  reason: string
}

export class NarrativeEngine {
  shouldAdvanceAct(gameState: GameState, playerModel: PlayerModel): ActAdvanceCondition | null {
    const { currentAct, completedScenes } = gameState
    switch (currentAct) {
      case 1:
        if (completedScenes.includes('awakening') && playerModel.evaluationHistory.length >= 1) {
          return { nextAct: 2, reason: 'awakening_complete' }
        }
        break
      case 2: {
        const hasNeg = gameState.revealedConsequences.some((c) => c.direction === 'negative')
        if (playerModel.evaluationHistory.length >= 5 && hasNeg) {
          return { nextAct: 3, reason: 'temptation_complete' }
        }
        break
      }
      case 3:
        if (gameState.imbalanceValue > 80) {
          return { nextAct: 4, reason: 'suspicion_peak' }
        }
        break
    }
    return null
  }

  buildNarrativeSummary(
    gameState: GameState,
    playerModel: PlayerModel,
    npcs: NPCState[]
  ): string {
    const recentEvents = gameState.eventLog.slice(-10)
    const activeNPCs = npcs.filter((n) => n.isActive).slice(0, 4)
    return JSON.stringify({
      currentAct: gameState.currentAct,
      gameDay: gameState.gameTime.day,
      imbalanceValue: gameState.imbalanceValue,
      echoLevel: gameState.echoLevel,
      recentEvents: recentEvents.map((e) => ({
        type: e.type,
        description: e.description,
        day: e.gameDay,
      })),
      activeNPCs: activeNPCs.map((n) => ({
        id: n.id,
        name: n.name,
        archetype: n.archetype,
        relationship: n.relationshipValue,
        mood: n.currentMood,
      })),
      playerSummary: {
        tendency: playerModel.evaluationTendency,
        style: playerModel.socialStyle,
        suspicion: playerModel.suspicionIndex,
      },
    })
  }
}

export const narrativeEngine = new NarrativeEngine()
