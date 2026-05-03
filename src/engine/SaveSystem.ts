import Dexie, { type Table } from 'dexie'
import type { GameState, PlayerModel, NPCState, ChatMessage } from '../types'
import { useGameStore } from '../store/gameStore'
import { usePlayerStore } from '../store/playerStore'
import { useNPCStore } from '../store/npcStore'

interface SaveRecord {
  id?: number
  timestamp: number
  slotName: string
  gameState: GameState
  playerModel: PlayerModel
  npcStates: NPCState[]
  chats: Record<string, ChatMessage[]>
  narrativeContext: string
}

class EchoDB extends Dexie {
  saves!: Table<SaveRecord>
  constructor() {
    super('EchoJudgmentDB')
    this.version(1).stores({ saves: '++id, timestamp, slotName' })
  }
}

const db = new EchoDB()

export async function saveGame(slotName: string = 'autosave'): Promise<void> {
  const gameState = useGameStore.getState()
  const playerModel = usePlayerStore.getState()
  const { npcs, chats } = useNPCStore.getState()
  await db.saves.where('slotName').equals(slotName).delete()
  await db.saves.add({
    timestamp: Date.now(),
    slotName,
    gameState: { ...gameState },
    playerModel: { ...playerModel },
    npcStates: npcs,
    chats,
    narrativeContext: gameState.eventLog.slice(-20).map((e) => e.description).join('\n'),
  })
}

export async function loadGame(slotName: string = 'autosave'): Promise<boolean> {
  const record = await db.saves.where('slotName').equals(slotName).last()
  if (!record) return false
  useGameStore.setState(record.gameState)
  usePlayerStore.setState(record.playerModel)
  useNPCStore.setState({ npcs: record.npcStates, chats: record.chats })
  return true
}

export async function listSaves(): Promise<SaveRecord[]> {
  return db.saves.orderBy('timestamp').reverse().toArray()
}
