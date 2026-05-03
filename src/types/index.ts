// Core domain types for《回响》

export type ActNumber = 1 | 2 | 3 | 4
export type EchoLevel = 0 | 1 | 2 | 3 | 4
export type EvalType = 'binary' | 'star5' | 'score10'
export type EvalDirection = 'positive' | 'negative' | 'neutral'
export type Visibility = 'immediate' | 'delayed' | 'hidden'
export type Archetype = 'close_friend' | 'competitor' | 'authority' | 'stranger' | 'romantic'
export type SocialStyle = 'active' | 'passive' | 'defensive' | 'aggressive'
export type Mood = 'happy' | 'worried' | 'suspicious' | 'angry' | 'neutral'
export type Tone = 'warm' | 'cold' | 'aggressive' | 'passive' | 'curious' | 'avoidant'
export type XHSTab = 'home' | 'note' | 'publish' | 'message' | 'profile'
export type HomeSubTab = 'discover' | 'following'

export interface GameTime {
  day: number
  hour: number
  minute: number
}

export interface PlayerOption {
  id: string
  text: string
  tone: Tone
  hidden_effect?: {
    moral_sensitivity_delta: number
    social_style_signal: string
  }
}

export interface EvaluationOpportunity {
  npcId: string
  prompt: string
  types: EvalType[]
  triggerMessageId?: string
}

export interface EvaluationRecord {
  id: string
  type: EvalType
  value: number
  direction: EvalDirection
  targetNPCId: string
  timestamp: number
  processDuration: number
  extremeFlag: boolean
}

export interface DecisionOption extends PlayerOption {
  moralType?: 'prosocial' | 'selfish' | 'neutral'
}

export interface DecisionNode {
  id: string
  prompt: string
  options: DecisionOption[]
  countdownMs?: number
}

export interface DecisionRecord {
  decisionId: string
  chosenOption: DecisionOption
  timestamp: number
  durationMs: number
}

export interface GameEvent {
  id: string
  type: string
  description: string
  gameDay: number
  timestamp: number
  npcId?: string
}

export interface ConsequenceEvent {
  type: 'context_update' | 'chat_mood_shift' | 'social_post' | 'news_article'
  data: Record<string, any>
  triggerAt: number
  direction?: EvalDirection
}

export interface GameState {
  currentAct: ActNumber
  currentScene: string
  gameTime: GameTime
  imbalanceValue: number
  echoLevel: EchoLevel
  isEchoActive: boolean
  eventLog: GameEvent[]
  revealedConsequences: ConsequenceEvent[]
  completedScenes: string[]
}

export interface InteractionMetrics {
  avgHoverDuration: number
  cancelCount: number
  fastDecisionCount: number
  slowDecisionCount: number
}

export interface PlayerModel {
  evaluationTendency: {
    positiveRatio: number
    negativeRatio: number
    neutralRatio: number
    extremeRatio: number
  }
  moralSensitivity: number
  socialStyle: SocialStyle
  stressTolerance: number
  suspicionIndex: number
  evaluationHistory: EvaluationRecord[]
  decisionHistory: DecisionRecord[]
  interactionMetrics: InteractionMetrics
}

export interface NPCState {
  id: string
  name: string
  archetype: Archetype
  relationshipValue: number
  isEvaluator: boolean | null
  currentMood: Mood
  awarenessOfPlayerAbility: number
  isActive: boolean
  recentEvents: GameEvent[]
}

export interface ChatMessage {
  id: string
  npcId: string
  role: 'npc' | 'player'
  content: string
  timestamp: number
  echoLevel?: EchoLevel
  triggersEvaluation?: boolean
  evaluationPrompt?: string
  evaluationTypes?: EvalType[]
  wantsToPause?: boolean
  options?: PlayerOption[]
}

export interface SocialPost {
  id: string
  npcId: string
  text: string
  imageDescription?: string
  echoContent?: string
  likes: number
  commentsCount: number
  timestamp: number
  gradientIndex: number
}

export interface NewsArticle {
  id: string
  headline: string
  body: string
  category: '社会' | '教育' | '职场' | '娱乐' | '本地'
  echoHeadline?: string
  timestamp: number
}

export interface EvaluationInput {
  type: EvalType
  value: number
  targetNPCId: string
  timestamp: number
}

export interface EvaluationResult {
  impactScore: number
  direction: EvalDirection
  visibility: Visibility
  delayDays: number
  extremeFlag: boolean
  type: EvalType
}
