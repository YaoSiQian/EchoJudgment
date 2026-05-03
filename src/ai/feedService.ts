import type { GameState, NPCState } from '../types'
import { useFeedStore } from '../store/feedStore'
import { callJSON } from './client'
import { buildSocialPostsPrompt, buildNewsPrompt } from './prompts/narrative'
import { SocialPostResponseSchema, NewsResponseSchema } from './OutputValidator'
import { FALLBACK_POSTS } from '../data/fallback'
import { generateId } from '../utils/timeUtils'

let inflight = false

export async function generateSocialPosts(state: GameState, npcs: NPCState[]) {
  if (inflight) return
  inflight = true
  try {
    let postList: Array<{
      npc_id: string
      text: string
      image_description?: string
      echo_content?: string
      likes: number
      comments_count: number
      timestamp_offset_hours: number
    }>
    try {
      const raw = await callJSON<unknown>(
        [
          { role: 'system', content: '你是《回响》游戏的内容引擎，输出严格 JSON。' },
          { role: 'user', content: buildSocialPostsPrompt(state, npcs) },
        ],
        { temperature: 0.95 }
      )
      postList = SocialPostResponseSchema.parse(raw).posts
    } catch (e) {
      console.warn('[feedService] AI failed, using fallback', e)
      postList = (FALLBACK_POSTS[state.currentAct] ?? FALLBACK_POSTS[1]).map((p, i) => ({
        npc_id: p.npcId,
        text: p.text,
        likes: 12 + i * 7,
        comments_count: 1 + i,
        timestamp_offset_hours: -(i + 1) * 2,
      }))
    }

    const now = Date.now()
    const posts = postList.map((p, idx) => ({
      id: generateId('post'),
      npcId: p.npc_id,
      text: p.text,
      imageDescription: p.image_description,
      echoContent: p.echo_content,
      likes: p.likes,
      commentsCount: p.comments_count,
      timestamp: now + p.timestamp_offset_hours * 3600_000,
      gradientIndex: idx,
    }))
    useFeedStore.getState().prependPosts(posts)
  } finally {
    inflight = false
  }
}

export async function generateNewsArticle(state: GameState, hint: string) {
  try {
    const raw = await callJSON<unknown>(
      [
        { role: 'system', content: '你是《回响》游戏中"锡陵晚报"的编辑，输出严格 JSON。' },
        { role: 'user', content: buildNewsPrompt(state, hint) },
      ],
      { temperature: 0.85 }
    )
    const parsed = NewsResponseSchema.parse(raw)
    useFeedStore.getState().addNewsArticle({
      id: generateId('news'),
      headline: parsed.headline,
      body: parsed.body,
      category: parsed.category,
      echoHeadline: parsed.echo_headline,
      timestamp: Date.now(),
    })
  } catch (e) {
    console.warn('[feedService] news gen failed', e)
  }
}
