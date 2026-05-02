import { create } from 'zustand'
import type { GameSession, Scene, Character } from '../types/index.ts'

interface GameState {
  session: GameSession | null
  scene: Scene | null
  narrativeText: string
  isStreaming: boolean
  characters: Character[]
  playerStats: {
    totalEvaluations: number
    positiveCount: number
    negativeCount: number
    pendingEchoes: number
    archetype: string
    tendency: number
    extremity: number
  } | null
  echoNarrative: string | null
  showEcho: boolean
  loading: boolean

  setSession: (session: GameSession) => void
  setScene: (scene: Scene) => void
  appendNarrative: (text: string) => void
  clearNarrative: () => void
  setStreaming: (v: boolean) => void
  setCharacters: (chars: Character[]) => void
  setPlayerStats: (stats: GameState['playerStats']) => void
  setEchoNarrative: (text: string | null) => void
  setShowEcho: (v: boolean) => void
  setLoading: (v: boolean) => void
}

export const useGameStore = create<GameState>((set) => ({
  session: null,
  scene: null,
  narrativeText: '',
  isStreaming: false,
  characters: [],
  playerStats: null,
  echoNarrative: null,
  showEcho: false,
  loading: false,

  setSession: (session) => set({ session }),
  setScene: (scene) => set({ scene }),
  appendNarrative: (text) =>
    set((state) => ({ narrativeText: state.narrativeText + text })),
  clearNarrative: () => set({ narrativeText: '' }),
  setStreaming: (isStreaming) => set({ isStreaming }),
  setCharacters: (characters) => set({ characters }),
  setPlayerStats: (playerStats) => set({ playerStats }),
  setEchoNarrative: (echoNarrative) => set({ echoNarrative }),
  setShowEcho: (showEcho) => set({ showEcho }),
  setLoading: (loading) => set({ loading }),
}))
