import { db } from '../db.js'
import type { Character, Scene } from '../shared/types.ts'

const characters: Character[] = [
  {
    id: 'wang_lei',
    name: '王磊',
    age: 32,
    occupation: '项目经理',
    socialRole: '同事',
    personality: {
      extraversion: 0.3,
      neuroticism: -0.2,
      openness: -0.1,
      agreeableness: 0.2,
      conscientiousness: 0.5,
    },
    currentState: {
      mood: 2,
      careerProgress: 55,
      socialStanding: 50,
      hiddenSecretRevealed: false,
    },
    relationshipWithPlayer: {
      familiarity: 0.6,
      trust: 0.5,
      hiddenAttitude: 0.1,
    },
    sensitivity: {
      positiveFactor: 0.8,
      negativeFactor: 1.2,
      recoverySpeed: 0.6,
      hiddenVulnerability: '害怕被取代',
    },
    unlockableSubplots: ['职场暗斗', '家庭压力'],
  },
  {
    id: 'xiao_yu',
    name: '小雨',
    age: 24,
    occupation: '街头歌手',
    socialRole: '陌生人',
    personality: {
      extraversion: 0.6,
      neuroticism: 0.4,
      openness: 0.8,
      agreeableness: 0.5,
      conscientiousness: 0.3,
    },
    currentState: {
      mood: -1,
      careerProgress: 20,
      socialStanding: 30,
      hiddenSecretRevealed: false,
    },
    relationshipWithPlayer: {
      familiarity: 0.1,
      trust: 0.3,
      hiddenAttitude: 0.0,
    },
    sensitivity: {
      positiveFactor: 1.5,
      negativeFactor: 0.7,
      recoverySpeed: 0.4,
      hiddenVulnerability: '极度渴望被认可',
    },
    unlockableSubplots: ['音乐梦想', '过去的故事'],
  },
  {
    id: 'chen_mo',
    name: '陈墨',
    age: 28,
    occupation: '独立插画师',
    socialRole: '网友',
    personality: {
      extraversion: -0.6,
      neuroticism: 0.7,
      openness: 0.9,
      agreeableness: 0.3,
      conscientiousness: 0.4,
    },
    currentState: {
      mood: -3,
      careerProgress: 40,
      socialStanding: 35,
      hiddenSecretRevealed: false,
    },
    relationshipWithPlayer: {
      familiarity: 0.3,
      trust: 0.6,
      hiddenAttitude: 0.2,
    },
    sensitivity: {
      positiveFactor: 1.3,
      negativeFactor: 1.4,
      recoverySpeed: 0.2,
      hiddenVulnerability: '对差评有创伤反应',
    },
    unlockableSubplots: ['匿名差评事件', '创作瓶颈'],
  },
  {
    id: 'director_li',
    name: '李建国',
    age: 45,
    occupation: '公司总监',
    socialRole: '上级',
    personality: {
      extraversion: 0.4,
      neuroticism: -0.3,
      openness: 0.1,
      agreeableness: -0.2,
      conscientiousness: 0.8,
    },
    currentState: {
      mood: 1,
      careerProgress: 75,
      socialStanding: 70,
      hiddenSecretRevealed: false,
    },
    relationshipWithPlayer: {
      familiarity: 0.4,
      trust: 0.3,
      hiddenAttitude: -0.1,
    },
    sensitivity: {
      positiveFactor: 0.6,
      negativeFactor: 1.0,
      recoverySpeed: 0.8,
      hiddenVulnerability: '权力焦虑',
    },
    unlockableSubplots: ['公司裁员计划'],
  },
  {
    id: 'anonymous',
    name: '？？？',
    age: 0,
    occupation: '未知',
    socialRole: '神秘存在',
    personality: {
      extraversion: 0,
      neuroticism: 0,
      openness: 0,
      agreeableness: 0,
      conscientiousness: 0,
    },
    currentState: {
      mood: 0,
      careerProgress: 0,
      socialStanding: 0,
      hiddenSecretRevealed: false,
    },
    relationshipWithPlayer: {
      familiarity: 0,
      trust: 0,
      hiddenAttitude: 0,
    },
    sensitivity: {
      positiveFactor: 1.0,
      negativeFactor: 1.0,
      recoverySpeed: 1.0,
      hiddenVulnerability: '',
    },
    unlockableSubplots: [],
  },
]

const scenes: Scene[] = [
  {
    id: 'scene_1_1',
    sceneId: 'act1_opening',
    actNumber: 1,
    sequence: 1,
    title: '深夜的短信',
    description: '林一在凌晨两点收到一条匿名短信。手机屏幕在黑暗中亮起，像是一只睁开的眼睛。',
    availableActions: [
      {
        actionId: 'continue_1',
        type: 'continue',
      },
    ],
    nextScenes: [{ sceneId: 'act1_morning', condition: 'always' }],
  },
  {
    id: 'scene_1_2',
    sceneId: 'act1_morning',
    actNumber: 1,
    sequence: 2,
    title: '平凡的早晨',
    description: '第二天，一切如常。地铁、早餐、打卡。直到王磊把一份项目报告放在你桌上。',
    availableActions: [
      {
        actionId: 'eval_wang_lei_1',
        type: 'evaluate',
        targetIds: ['wang_lei'],
        evaluationType: 'star5',
        prompt: '王磊把本季度的项目报告放在你桌上。他的方案中规中矩，有几个明显的漏洞，但也有可取之处。在公司的匿名评分系统上，你决定给他打几分？',
      },
    ],
    nextScenes: [{ sceneId: 'act1_consequence_work', condition: 'evaluated_wang_lei' }],
  },
  {
    id: 'scene_1_3',
    sceneId: 'act1_consequence_work',
    actNumber: 1,
    sequence: 3,
    title: '涟漪',
    description: '你的评分提交后，系统显示"已录入"。下午，你注意到王磊被叫进了总监办公室。',
    availableActions: [
      {
        actionId: 'continue_2',
        type: 'continue',
      },
    ],
    nextScenes: [{ sceneId: 'act1_evening', condition: 'always' }],
  },
  {
    id: 'scene_1_4',
    sceneId: 'act1_evening',
    actNumber: 1,
    sequence: 4,
    title: '地下通道的歌声',
    description: '下班回家的路上，你在地铁站入口看到了一个正在唱歌的女孩。她的声音清澈，但路过的行人大多低着头匆匆走过。',
    availableActions: [
      {
        actionId: 'eval_xiao_yu_1',
        type: 'evaluate',
        targetIds: ['xiao_yu'],
        evaluationType: 'star5',
        prompt: '小雨在地铁站唱歌。她的吉他弹得有些生涩，但嗓音中有种让你停住脚步的东西。你在音乐平台的"附近艺人"页面给她打了多少分？',
      },
    ],
    nextScenes: [{ sceneId: 'act1_consequence_street', condition: 'evaluated_xiao_yu' }],
  },
  {
    id: 'scene_1_5',
    sceneId: 'act1_consequence_street',
    actNumber: 1,
    sequence: 5,
    title: '回音',
    description: '第二天，你在朋友圈里看到有人转发——那个地铁歌手接到了唱片公司的邀约。而你，收到了一条新短信。',
    availableActions: [
      {
        actionId: 'continue_3',
        type: 'continue',
      },
    ],
    nextScenes: [{ sceneId: 'act1_moral_choice', condition: 'always' }],
  },
  {
    id: 'scene_1_6',
    sceneId: 'act1_moral_choice',
    actNumber: 1,
    sequence: 6,
    title: '陈墨的请求',
    description: '你的网友陈墨发来消息。她正在为一个重要比赛准备作品，希望你能帮她看看草稿。你看完后，内心五味杂陈。',
    availableActions: [
      {
        actionId: 'eval_chen_mo_1',
        type: 'evaluate',
        targetIds: ['chen_mo'],
        evaluationType: 'binary',
        prompt: '陈墨的插画草稿技法尚可，但缺乏灵魂。她看起来非常焦虑，反复问你"真的很差吗"。你会直接告诉她真相吗？',
      },
    ],
    nextScenes: [{ sceneId: 'act1_echo', condition: 'evaluated_chen_mo' }],
  },
  {
    id: 'scene_1_7',
    sceneId: 'act1_echo',
    actNumber: 1,
    sequence: 7,
    title: '第一次回荡',
    description: '你躺在床上，刷着社交媒体。突然，你发现自己的名字出现在一个匿名评价帖里。有人给你打了一颗星。',
    availableActions: [
      {
        actionId: 'continue_4',
        type: 'continue',
      },
    ],
    nextScenes: [{ sceneId: 'act1_clue', condition: 'always' }],
  },
  {
    id: 'scene_1_8',
    sceneId: 'act1_clue',
    actNumber: 1,
    sequence: 8,
    title: '碎片',
    description: '你开始注意到一些不对劲的事。公司茶水间的窃窃私语、社交媒体上巧合般出现的评价、以及那个始终回复"系统消息"的匿名号码。',
    availableActions: [
      {
        actionId: 'eval_director_li_1',
        type: 'evaluate',
        targetIds: ['director_li'],
        evaluationType: 'star5',
        prompt: '总监李建国宣布了下季度的考核方案。方案明显偏袒某些老员工。在内部匿名反馈中，你会给他打几分？',
      },
    ],
    nextScenes: [{ sceneId: 'act1_end', condition: 'evaluated_director_li' }],
  },
  {
    id: 'scene_1_9',
    sceneId: 'act1_end',
    actNumber: 1,
    sequence: 9,
    title: '觉醒',
    description: '你终于确认了一件事：你的评价，真的有重量。而这份重量，已经开始压在你自己的肩上。第一幕·发现，到此结束。',
    availableActions: [
      {
        actionId: 'end_act1',
        type: 'continue',
      },
    ],
    nextScenes: [],
  },
]

export function seedDatabase() {
  const insertCharacter = db.prepare(`
    INSERT OR REPLACE INTO characters (
      id, name, age, occupation, social_role,
      extraversion, neuroticism, openness, agreeableness, conscientiousness,
      mood, career_progress, social_standing, hidden_secret_revealed,
      familiarity, trust, hidden_attitude,
      positive_factor, negative_factor, recovery_speed, hidden_vulnerability,
      unlockable_subplots
    ) VALUES (
      @id, @name, @age, @occupation, @socialRole,
      @extraversion, @neuroticism, @openness, @agreeableness, @conscientiousness,
      @mood, @careerProgress, @socialStanding, @hiddenSecretRevealed,
      @familiarity, @trust, @hiddenAttitude,
      @positiveFactor, @negativeFactor, @recoverySpeed, @hiddenVulnerability,
      @unlockableSubplots
    )
  `)

  for (const char of characters) {
    insertCharacter.run({
      id: char.id,
      name: char.name,
      age: char.age,
      occupation: char.occupation,
      socialRole: char.socialRole,
      extraversion: char.personality.extraversion,
      neuroticism: char.personality.neuroticism,
      openness: char.personality.openness,
      agreeableness: char.personality.agreeableness,
      conscientiousness: char.personality.conscientiousness,
      mood: char.currentState.mood,
      careerProgress: char.currentState.careerProgress,
      socialStanding: char.currentState.socialStanding,
      hiddenSecretRevealed: char.currentState.hiddenSecretRevealed ? 1 : 0,
      familiarity: char.relationshipWithPlayer.familiarity,
      trust: char.relationshipWithPlayer.trust,
      hiddenAttitude: char.relationshipWithPlayer.hiddenAttitude,
      positiveFactor: char.sensitivity.positiveFactor,
      negativeFactor: char.sensitivity.negativeFactor,
      recoverySpeed: char.sensitivity.recoverySpeed,
      hiddenVulnerability: char.sensitivity.hiddenVulnerability,
      unlockableSubplots: JSON.stringify(char.unlockableSubplots),
    })
  }

  const insertScene = db.prepare(`
    INSERT OR REPLACE INTO scenes (
      id, scene_id, act_number, sequence, title, description,
      trigger_condition, available_actions, next_scenes
    ) VALUES (
      @id, @sceneId, @actNumber, @sequence, @title, @description,
      @triggerCondition, @availableActions, @nextScenes
    )
  `)

  for (const scene of scenes) {
    insertScene.run({
      id: scene.id,
      sceneId: scene.sceneId,
      actNumber: scene.actNumber,
      sequence: scene.sequence,
      title: scene.title,
      description: scene.description,
      triggerCondition: scene.triggerCondition ? JSON.stringify(scene.triggerCondition) : null,
      availableActions: JSON.stringify(scene.availableActions),
      nextScenes: JSON.stringify(scene.nextScenes),
    })
  }

  console.log('[seed] Database seeded with', characters.length, 'characters and', scenes.length, 'scenes')
}

export function getCharacterById(id: string) {
  const row = db.prepare('SELECT * FROM characters WHERE id = ?').get(id) as Record<string, unknown> | undefined
  if (!row) return null
  return rowToCharacter(row)
}

export function getAllCharacters() {
  const rows = db.prepare('SELECT * FROM characters').all() as Record<string, unknown>[]
  return rows.map(rowToCharacter)
}

export function updateCharacterState(id: string, moodDelta: number, careerDelta: number, socialDelta: number) {
  db.prepare(`
    UPDATE characters
    SET mood = mood + @moodDelta,
        career_progress = MAX(0, MIN(100, career_progress + @careerDelta)),
        social_standing = MAX(0, MIN(100, social_standing + @socialDelta))
    WHERE id = @id
  `).run({ id, moodDelta, careerDelta, socialDelta })
}

export function getSceneById(sceneId: string) {
  const row = db.prepare('SELECT * FROM scenes WHERE scene_id = ?').get(sceneId) as Record<string, unknown> | undefined
  if (!row) return null
  return rowToScene(row)
}

export function getFirstScene() {
  const row = db.prepare('SELECT * FROM scenes WHERE act_number = 1 ORDER BY sequence LIMIT 1').get() as Record<string, unknown> | undefined
  if (!row) return null
  return rowToScene(row)
}

export function getNextScene(sceneId: string) {
  const current = getSceneById(sceneId)
  if (!current) return null
  const next = db.prepare(
    'SELECT * FROM scenes WHERE act_number = 1 AND sequence > @seq ORDER BY sequence LIMIT 1'
  ).get({ seq: current.sequence }) as Record<string, unknown> | undefined
  if (!next) return null
  return rowToScene(next)
}

function rowToCharacter(row: Record<string, unknown>): Character {
  return {
    id: row.id as string,
    name: row.name as string,
    age: row.age as number,
    occupation: row.occupation as string,
    socialRole: row.social_role as string,
    personality: {
      extraversion: row.extraversion as number,
      neuroticism: row.neuroticism as number,
      openness: row.openness as number,
      agreeableness: row.agreeableness as number,
      conscientiousness: row.conscientiousness as number,
    },
    currentState: {
      mood: row.mood as number,
      careerProgress: row.career_progress as number,
      socialStanding: row.social_standing as number,
      hiddenSecretRevealed: (row.hidden_secret_revealed as number) === 1,
    },
    relationshipWithPlayer: {
      familiarity: row.familiarity as number,
      trust: row.trust as number,
      hiddenAttitude: row.hidden_attitude as number,
    },
    sensitivity: {
      positiveFactor: row.positive_factor as number,
      negativeFactor: row.negative_factor as number,
      recoverySpeed: row.recovery_speed as number,
      hiddenVulnerability: row.hidden_vulnerability as string,
    },
    unlockableSubplots: JSON.parse((row.unlockable_subplots as string) || '[]'),
  }
}

function rowToScene(row: Record<string, unknown>): Scene {
  return {
    id: row.id as string,
    sceneId: row.scene_id as string,
    actNumber: row.act_number as number,
    sequence: row.sequence as number,
    title: row.title as string,
    description: row.description as string,
    triggerCondition: row.trigger_condition ? JSON.parse(row.trigger_condition as string) : undefined,
    availableActions: JSON.parse(row.available_actions as string),
    nextScenes: JSON.parse(row.next_scenes as string),
  }
}
