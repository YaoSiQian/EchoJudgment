import { z } from 'zod'

export const PlayerOptionSchema = z.object({
  id: z.string(),
  text: z.string().min(1).max(60),
  tone: z.enum(['warm', 'cold', 'aggressive', 'passive', 'curious', 'avoidant']),
  hidden_effect: z
    .object({
      moral_sensitivity_delta: z.number().min(-1).max(1),
      social_style_signal: z.string(),
    })
    .optional(),
})

export const CharacterResponseSchema = z.object({
  message: z.string().min(1),
  subtext: z.string().optional(),
  mood_change: z.enum(['happy', 'worried', 'suspicious', 'angry', 'neutral']),
  triggers_evaluation: z.boolean(),
  evaluation_prompt: z.string().nullable().optional(),
  evaluation_types: z.array(z.enum(['binary', 'star5', 'score10'])).optional(),
  wants_to_pause: z.boolean().optional().default(false),
  player_options: z.array(PlayerOptionSchema).min(2).max(4),
})

export const SocialPostResponseSchema = z.object({
  posts: z
    .array(
      z.object({
        npc_id: z.string(),
        text: z.string().min(1).max(500),
        image_description: z.string().optional(),
        echo_content: z.string().optional(),
        likes: z.number().int().min(0),
        comments_count: z.number().int().min(0),
        timestamp_offset_hours: z.number(),
      })
    )
    .min(1),
})

export const NewsResponseSchema = z.object({
  headline: z.string().min(1).max(120),
  body: z.string().min(1).max(800),
  category: z.enum(['社会', '教育', '职场', '娱乐', '本地']),
  echo_headline: z.string().optional(),
})

export type CharacterResponse = z.infer<typeof CharacterResponseSchema>
export type SocialPostsResponse = z.infer<typeof SocialPostResponseSchema>
export type NewsResponse = z.infer<typeof NewsResponseSchema>
