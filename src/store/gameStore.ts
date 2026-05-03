import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  GameState,
  ActNumber,
  EchoLevel,
  GameEvent,
  ConsequenceEvent,
  GameTime,
} from '../types'

interface GameStore extends GameState {
  advanceAct: (next: ActNumber) => void
  addEvent: (event: GameEvent) => void
  setImbalance: (v: number) => void
  setEchoLevel: (lv: EchoLevel) => void
  addRevealedConsequence: (c: ConsequenceEvent) => void
  setGameTime: (t: GameTime) => void
  completeScene: (id: string) => void
  resetGame: () => void
}

const INITIAL: GameState = {
  currentAct: 1,
  currentScene: 'intro',
  gameTime: { day: 1, hour: 9, minute: 0 },
  imbalanceValue: 0,
  echoLevel: 0,
  isEchoActive: false,
  eventLog: [],
  revealedConsequences: [],
  completedScenes: [],
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      ...INITIAL,
      advanceAct: (next) =>
        set((s) => ({
          currentAct: next,
          completedScenes: [...s.completedScenes, `act${s.currentAct}_complete`],
        })),
      addEvent: (event) =>
        set((s) => ({ eventLog: [...s.eventLog.slice(-99), event] })),
      setImbalance: (v) => set({ imbalanceValue: Math.max(0, Math.min(200, v)) }),
      setEchoLevel: (lv) => set({ echoLevel: lv, isEchoActive: lv > 0 }),
      addRevealedConsequence: (c) =>
        set((s) => ({ revealedConsequences: [...s.revealedConsequences, c] })),
      setGameTime: (t) => set({ gameTime: t }),
      completeScene: (id) =>
        set((s) => ({
          completedScenes: s.completedScenes.includes(id)
            ? s.completedScenes
            : [...s.completedScenes, id],
        })),
      resetGame: () => set(INITIAL),
    }),
    {
      name: 'echo-game-state',
      version: 2,
      migrate: (p: any, v) => (v < 2 || !p ? INITIAL : p),
      partialize: (s) => ({
        currentAct: s.currentAct,
        currentScene: s.currentScene,
        gameTime: s.gameTime,
        imbalanceValue: s.imbalanceValue,
        echoLevel: s.echoLevel,
        isEchoActive: s.isEchoActive,
        eventLog: s.eventLog,
        revealedConsequences: s.revealedConsequences,
        completedScenes: s.completedScenes,
      }),
    }
  )
)
