import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PlayerModel, EvaluationRecord, DecisionRecord, InteractionMetrics } from '../types'

interface PlayerStore extends PlayerModel {
  addEvaluation: (rec: EvaluationRecord) => void
  addDecision: (rec: DecisionRecord) => void
  setEvaluationTendency: (t: PlayerModel['evaluationTendency']) => void
  setSocialStyle: (s: PlayerModel['socialStyle']) => void
  setMoralSensitivity: (v: number) => void
  setStressTolerance: (v: number) => void
  setSuspicionIndex: (v: number) => void
  updateInteractionMetrics: (m: Partial<InteractionMetrics>) => void
  reset: () => void
}

const INITIAL: PlayerModel = {
  evaluationTendency: {
    positiveRatio: 0,
    negativeRatio: 0,
    neutralRatio: 1,
    extremeRatio: 0,
  },
  moralSensitivity: 0.5,
  socialStyle: 'defensive',
  stressTolerance: 0.5,
  suspicionIndex: 0,
  evaluationHistory: [],
  decisionHistory: [],
  interactionMetrics: {
    avgHoverDuration: 0,
    cancelCount: 0,
    fastDecisionCount: 0,
    slowDecisionCount: 0,
  },
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set) => ({
      ...INITIAL,
      addEvaluation: (rec) =>
        set((s) => ({ evaluationHistory: [...s.evaluationHistory, rec] })),
      addDecision: (rec) =>
        set((s) => ({ decisionHistory: [...s.decisionHistory, rec] })),
      setEvaluationTendency: (t) => set({ evaluationTendency: t }),
      setSocialStyle: (s) => set({ socialStyle: s }),
      setMoralSensitivity: (v) => set({ moralSensitivity: Math.max(0, Math.min(1, v)) }),
      setStressTolerance: (v) => set({ stressTolerance: Math.max(0, Math.min(1, v)) }),
      setSuspicionIndex: (v) => set({ suspicionIndex: Math.max(0, Math.min(1, v)) }),
      updateInteractionMetrics: (m) =>
        set((s) => ({ interactionMetrics: { ...s.interactionMetrics, ...m } })),
      reset: () => set(INITIAL),
    }),
    { name: 'echo-player-model', version: 2, migrate: (p: any, v) => (v < 2 || !p ? INITIAL : p) }
  )
)
