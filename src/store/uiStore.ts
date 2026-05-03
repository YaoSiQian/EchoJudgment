import { create } from 'zustand'
import type { XHSTab, HomeSubTab, EvaluationOpportunity, DecisionNode } from '../types'

interface UIStore {
  currentTab: XHSTab
  homeSubTab: HomeSubTab
  chatRoomNpcId: string | null
  pendingEvaluation: EvaluationOpportunity | null
  pendingDecision: DecisionNode | null
  isAILoading: boolean
  animationLock: boolean
  isDebug: boolean
  setCurrentTab: (t: XHSTab) => void
  setHomeSubTab: (t: HomeSubTab) => void
  setChatRoomNpcId: (id: string | null) => void
  setPendingEvaluation: (o: EvaluationOpportunity | null) => void
  setPendingDecision: (d: DecisionNode | null) => void
  setAILoading: (b: boolean) => void
  setDebug: (b: boolean) => void
}

export const useUIStore = create<UIStore>((set) => ({
  currentTab: 'message',
  homeSubTab: 'discover',
  chatRoomNpcId: null,
  pendingEvaluation: null,
  pendingDecision: null,
  isAILoading: false,
  animationLock: false,
  isDebug: import.meta.env.VITE_GAME_DEBUG === 'true',
  setCurrentTab: (t) => set({ currentTab: t }),
  setHomeSubTab: (t) => set({ homeSubTab: t }),
  setChatRoomNpcId: (id) => set({ chatRoomNpcId: id }),
  setPendingEvaluation: (o) => set({ pendingEvaluation: o }),
  setPendingDecision: (d) => set({ pendingDecision: d }),
  setAILoading: (b) => set({ isAILoading: b }),
  setDebug: (b) => set({ isDebug: b }),
}))
