import type {
  EvaluationInput,
  EvaluationResult,
  NPCState,
  EvalDirection,
  Visibility,
} from '../types'

export class EvaluationEngine {
  calculate(input: EvaluationInput, npc: NPCState): EvaluationResult {
    const magnitude = this.getMagnitude(input)
    const directionNum = this.getDirection(input)
    const weight = this.getRelationshipWeight(npc.relationshipValue)
    const rawImpact = magnitude * directionNum * weight

    const direction: EvalDirection =
      directionNum > 0 ? 'positive' : directionNum < 0 ? 'negative' : 'neutral'

    return {
      impactScore: rawImpact,
      direction,
      visibility: this.assignVisibility(),
      delayDays: this.assignDelay(),
      extremeFlag: this.isExtreme(input),
      type: input.type,
    }
  }

  private getMagnitude(input: EvaluationInput): number {
    if (input.type === 'binary') return 1
    if (input.type === 'star5') return 3
    return 6
  }

  private getDirection(input: EvaluationInput): number {
    if (input.type === 'binary') return input.value > 0 ? 1 : -1
    if (input.type === 'star5') {
      if (input.value >= 4) return 1
      if (input.value <= 2) return -1
      return 0
    }
    if (input.value >= 7) return 1
    if (input.value <= 3) return -1
    return 0
  }

  private getRelationshipWeight(rel: number): number {
    if (rel < 20) return 0.5
    if (rel < 50) return 1.0
    return 2.0
  }

  private assignVisibility(): Visibility {
    const r = Math.random()
    if (r < 0.4) return 'immediate'
    if (r < 0.75) return 'delayed'
    return 'hidden'
  }

  private assignDelay(): number {
    const opts = [1, 3, 7]
    return opts[Math.floor(Math.random() * opts.length)]
  }

  private isExtreme(input: EvaluationInput): boolean {
    if (input.type === 'binary') return true
    if (input.type === 'star5') return input.value === 1 || input.value === 5
    return input.value <= 2 || input.value >= 9
  }
}

export const evaluationEngine = new EvaluationEngine()
