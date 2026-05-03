import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TutorialStore {
  openingDone: boolean
  seenHomeIntro: boolean
  seenImbalanceIntro: boolean
  seenEchoIntro: boolean
  setOpeningDone: () => void
  setSeen: (key: 'home' | 'imbalance' | 'echo') => void
  reset: () => void
}

export const useTutorialStore = create<TutorialStore>()(
  persist(
    (set) => ({
      openingDone: false,
      seenHomeIntro: false,
      seenImbalanceIntro: false,
      seenEchoIntro: false,
      setOpeningDone: () => set({ openingDone: true }),
      setSeen: (key) =>
        set(
          key === 'home'
            ? { seenHomeIntro: true }
            : key === 'imbalance'
            ? { seenImbalanceIntro: true }
            : { seenEchoIntro: true }
        ),
      reset: () =>
        set({
          openingDone: false,
          seenHomeIntro: false,
          seenImbalanceIntro: false,
          seenEchoIntro: false,
        }),
    }),
    { name: 'echo-tutorial', version: 1 }
  )
)
