import type { EvaluationResult, EchoLevel, ActNumber } from '../types'

export class EchoEngine {
  // GDD 4.4.1
  computeImbalanceDelta(result: EvaluationResult): number {
    let delta = 0
    if (result.extremeFlag) delta += 2
    if (result.direction === 'negative') delta += 1.5
    if (result.direction === 'positive') delta -= 0.5
    return delta
  }

  applyImbalance(current: number, delta: number): number {
    return Math.max(0, Math.min(200, current + delta))
  }

  // GDD 4.4.2: dynamic thresholds per act
  calculateEchoLevel(imbalance: number, actNumber: ActNumber): EchoLevel {
    const m = 1 - (actNumber - 1) * 0.15
    const t = {
      lv1: 30 * m,
      lv2: 60 * m,
      lv3: 90 * m,
      lv4: 120 * m,
    }
    if (imbalance <= t.lv1) return 0
    if (imbalance <= t.lv2) return 1
    if (imbalance <= t.lv3) return 2
    if (imbalance <= t.lv4) return 3
    return 4
  }
}

export const echoEngine = new EchoEngine()
