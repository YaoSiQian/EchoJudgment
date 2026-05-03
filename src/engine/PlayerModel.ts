import type { PlayerModel, EvaluationResult, DecisionRecord } from '../types'

export class PlayerModelUpdater {
  updateAfterEvaluation(
    model: PlayerModel,
    result: EvaluationResult,
    processDuration: number
  ): Partial<PlayerModel> {
    const newRecord = {
      id: `eval_${Date.now()}`,
      type: result.type,
      value: 0,
      direction: result.direction,
      targetNPCId: '',
      timestamp: Date.now(),
      processDuration,
      extremeFlag: result.extremeFlag,
    }
    const history = [...model.evaluationHistory, newRecord]
    const recent = history.slice(-20)
    const total = recent.length || 1
    const positiveRatio = recent.filter((e) => e.direction === 'positive').length / total
    const negativeRatio = recent.filter((e) => e.direction === 'negative').length / total
    const extremeRatio = recent.filter((e) => e.extremeFlag).length / total

    const fastCount = recent.filter((e) => e.processDuration < 500).length
    const stressTolerance = Math.min(1, fastCount / total + 0.2)

    return {
      evaluationTendency: {
        positiveRatio,
        negativeRatio,
        neutralRatio: Math.max(0, 1 - positiveRatio - negativeRatio),
        extremeRatio,
      },
      stressTolerance,
    }
  }

  updateAfterDecision(model: PlayerModel, decision: DecisionRecord): Partial<PlayerModel> {
    const history = [...model.decisionHistory, decision]
    const moralChoices = history.filter(
      (d) => d.chosenOption.moralType === 'prosocial'
    ).length
    const moralSensitivity = history.length ? moralChoices / history.length : 0.5

    const recent = history.slice(-10)
    const aggressiveCount = recent.filter((d) => d.chosenOption.tone === 'aggressive').length
    const avoidantCount = recent.filter((d) => d.chosenOption.tone === 'avoidant').length
    const socialStyle: PlayerModel['socialStyle'] =
      aggressiveCount > 4
        ? 'aggressive'
        : avoidantCount > 4
        ? 'passive'
        : aggressiveCount > avoidantCount
        ? 'active'
        : 'defensive'

    return { moralSensitivity, socialStyle }
  }
}

export const playerModelUpdater = new PlayerModelUpdater()
