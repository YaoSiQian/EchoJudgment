// 前后端共享类型定义

export interface Character {
  id: string;
  name: string;
  age: number;
  occupation: string;
  socialRole: string;
  personality: {
    extraversion: number;
    neuroticism: number;
    openness: number;
    agreeableness: number;
    conscientiousness: number;
  };
  currentState: {
    mood: number;
    careerProgress: number;
    socialStanding: number;
    hiddenSecretRevealed: boolean;
  };
  relationshipWithPlayer: {
    familiarity: number;
    trust: number;
    hiddenAttitude: number;
  };
  sensitivity: {
    positiveFactor: number;
    negativeFactor: number;
    recoverySpeed: number;
    hiddenVulnerability: string;
  };
  unlockableSubplots: string[];
  stateHistory?: CharacterStateHistoryEntry[];
}

export interface CharacterStateHistoryEntry {
  timeline: number;
  state: Character['currentState'];
  causedByEvaluationId?: string;
}

export type EvaluationType = 'binary' | 'star5' | 'point10' | 'ranking';
export type EchoType = 'mirror' | 'chain' | 'cognitive' | 'good-person';

export interface Evaluation {
  id: string;
  playerId: string;
  sessionId: string;
  sceneId: string;
  targetId: string;
  type: EvaluationType;
  rawValue: number | number[];
  normalizedScore: number;
  timestamp: string;
  actNumber: number;
  fateDelta?: {
    shortTermEffect: string;
    longTermTag: string;
  };
  echoTriggered: boolean;
  echoType?: EchoType;
  echoResolved: boolean;
}

export interface PlayerProfile {
  id: string;
  playerId: string;
  tendency: number;
  extremity: number;
  socialProximityBias: number;
  consistency: number;
  rankingPreference: 'utilitarian' | 'deontological' | 'mixed';
  currentArchetype: string;
  compressedHistory: string;
}

export interface Scene {
  id: string;
  sceneId: string;
  actNumber: number;
  sequence: number;
  title: string;
  description: string;
  triggerCondition?: {
    requiredEvaluations?: string[];
    requiredState?: Record<string, unknown>;
  };
  availableActions: SceneAction[];
  nextScenes: {
    sceneId: string;
    condition: string;
  }[];
}

export interface SceneAction {
  actionId: string;
  type: 'continue' | 'evaluate' | 'rank';
  targetIds?: string[];
  evaluationType?: 'binary' | 'star5' | 'point10';
  rankingCount?: number;
  prompt?: string;
}

export interface GameSession {
  id: string;
  playerId: string;
  currentAct: number;
  currentSceneId: string;
  startedAt: string;
  updatedAt: string;
}

export interface EchoEvent {
  id: string;
  type: EchoType;
  intensity: number;
  sourceEvaluationId: string;
  narrative: string;
  triggeredAt: string;
  resolved: boolean;
}

export interface NarrativeResponse {
  text: string;
  sceneId: string;
  nextActions: SceneAction[];
  echoEvent?: EchoEvent;
  characterUpdates?: CharacterUpdate[];
}

export interface CharacterUpdate {
  characterId: string;
  moodDelta: number;
  fateDeltaDescription: string;
}

export interface EvaluationInput {
  sessionId: string;
  sceneId: string;
  targetId: string;
  type: EvaluationType;
  value: number | number[];
}

export interface FateDelta {
  shortTermEffect: string;
  longTermTag: string;
  echoProbability: number;
  echoType?: EchoType;
}
