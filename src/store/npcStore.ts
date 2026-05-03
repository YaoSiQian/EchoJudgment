import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { NPCState, ChatMessage, GameEvent, Mood } from '../types'

interface NPCStore {
  npcs: NPCState[]
  chats: Record<string, ChatMessage[]>  // npcId -> messages
  setNPCs: (npcs: NPCState[]) => void
  upsertNPC: (npc: NPCState) => void
  updateRelationship: (npcId: string, delta: number) => void
  setMood: (npcId: string, mood: Mood) => void
  setEvaluator: (npcId: string, isEvaluator: boolean) => void
  addRecentEvent: (npcId: string, event: GameEvent) => void
  addMessage: (npcId: string, msg: ChatMessage) => void
  appendStream: (npcId: string, msgId: string, chunk: string) => void
  finalizeMessage: (npcId: string, msgId: string, patch: Partial<ChatMessage>) => void
  clearChat: (npcId: string) => void
  reset: () => void
}

// 5 starter NPCs (one per archetype)
const DEFAULT_NPCS: NPCState[] = [
  {
    id: 'npc_lin',
    name: '林昭',
    archetype: 'close_friend',
    relationshipValue: 35,
    isEvaluator: null,
    currentMood: 'neutral',
    awarenessOfPlayerAbility: 0,
    isActive: true,
    recentEvents: [],
  },
  {
    id: 'npc_zhou',
    name: '周屿',
    archetype: 'competitor',
    relationshipValue: -10,
    isEvaluator: null,
    currentMood: 'neutral',
    awarenessOfPlayerAbility: 0,
    isActive: true,
    recentEvents: [],
  },
  {
    id: 'npc_chen',
    name: '陈主任',
    archetype: 'authority',
    relationshipValue: 5,
    isEvaluator: null,
    currentMood: 'neutral',
    awarenessOfPlayerAbility: 0,
    isActive: true,
    recentEvents: [],
  },
  {
    id: 'npc_qi',
    name: '祁未',
    archetype: 'romantic',
    relationshipValue: 20,
    isEvaluator: null,
    currentMood: 'neutral',
    awarenessOfPlayerAbility: 0,
    isActive: true,
    recentEvents: [],
  },
  {
    id: 'npc_x',
    name: '陌生人',
    archetype: 'stranger',
    relationshipValue: 0,
    isEvaluator: null,
    currentMood: 'neutral',
    awarenessOfPlayerAbility: 0,
    isActive: false,
    recentEvents: [],
  },
]

export const useNPCStore = create<NPCStore>()(
  persist(
    (set) => ({
      npcs: DEFAULT_NPCS,
      chats: {},
      setNPCs: (npcs) => set({ npcs: Array.isArray(npcs) ? npcs : DEFAULT_NPCS }),
      upsertNPC: (npc) =>
        set((s) => {
          const idx = s.npcs.findIndex((n) => n.id === npc.id)
          if (idx === -1) return { npcs: [...s.npcs, npc] }
          const next = [...s.npcs]
          next[idx] = npc
          return { npcs: next }
        }),
      updateRelationship: (npcId, delta) =>
        set((s) => ({
          npcs: s.npcs.map((n) =>
            n.id === npcId
              ? { ...n, relationshipValue: Math.max(-100, Math.min(100, n.relationshipValue + delta)) }
              : n
          ),
        })),
      setMood: (npcId, mood) =>
        set((s) => ({
          npcs: s.npcs.map((n) => (n.id === npcId ? { ...n, currentMood: mood } : n)),
        })),
      setEvaluator: (npcId, isEvaluator) =>
        set((s) => ({
          npcs: s.npcs.map((n) => (n.id === npcId ? { ...n, isEvaluator } : n)),
        })),
      addRecentEvent: (npcId, event) =>
        set((s) => ({
          npcs: s.npcs.map((n) =>
            n.id === npcId ? { ...n, recentEvents: [...n.recentEvents.slice(-9), event] } : n
          ),
        })),
      addMessage: (npcId, msg) =>
        set((s) => ({
          chats: { ...s.chats, [npcId]: [...(s.chats[npcId] ?? []), msg] },
        })),
      appendStream: (npcId, msgId, chunk) =>
        set((s) => {
          const list = s.chats[npcId] ?? []
          return {
            chats: {
              ...s.chats,
              [npcId]: list.map((m) => (m.id === msgId ? { ...m, content: m.content + chunk } : m)),
            },
          }
        }),
      finalizeMessage: (npcId, msgId, patch) =>
        set((s) => {
          const list = s.chats[npcId] ?? []
          return {
            chats: {
              ...s.chats,
              [npcId]: list.map((m) => (m.id === msgId ? { ...m, ...patch } : m)),
            },
          }
        }),
      clearChat: (npcId) =>
        set((s) => ({ chats: { ...s.chats, [npcId]: [] } })),
      reset: () => set({ npcs: DEFAULT_NPCS, chats: {} }),
    }),
    { name: 'echo-npc-state',
      version: 2,
      migrate: (persisted: any, version) => {
        if (!persisted || version < 2 || !Array.isArray(persisted.npcs)) {
          return { npcs: DEFAULT_NPCS, chats: {} }
        }
        if (typeof persisted.chats !== 'object' || persisted.chats === null) {
          persisted.chats = {}
        }
        return persisted
      },
    }
  )
)
