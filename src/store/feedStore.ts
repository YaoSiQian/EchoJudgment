import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SocialPost, NewsArticle } from '../types'

interface FeedStore {
  socialPosts: SocialPost[]
  newsArticles: NewsArticle[]
  followedAccounts: string[]  // 锡陵晚报 + 关注的 NPC
  addSocialPost: (p: SocialPost) => void
  addNewsArticle: (n: NewsArticle) => void
  prependPosts: (ps: SocialPost[]) => void
  reset: () => void
}

export const useFeedStore = create<FeedStore>()(
  persist(
    (set) => ({
      socialPosts: [],
      newsArticles: [],
      followedAccounts: ['xiling_evening_news'],
      addSocialPost: (p) =>
        set((s) => ({ socialPosts: [p, ...s.socialPosts].slice(0, 100) })),
      addNewsArticle: (n) =>
        set((s) => ({ newsArticles: [n, ...s.newsArticles].slice(0, 50) })),
      prependPosts: (ps) =>
        set((s) => ({ socialPosts: [...ps, ...s.socialPosts].slice(0, 100) })),
      reset: () => set({ socialPosts: [], newsArticles: [], followedAccounts: ['xiling_evening_news'] }),
    }),
    {
      name: 'echo-feed',
      version: 2,
      migrate: (p: any, v) => {
        if (v < 2 || !p) return { socialPosts: [], newsArticles: [], followedAccounts: ['xiling_evening_news'] }
        if (!Array.isArray(p.socialPosts)) p.socialPosts = []
        if (!Array.isArray(p.newsArticles)) p.newsArticles = []
        if (!Array.isArray(p.followedAccounts)) p.followedAccounts = ['xiling_evening_news']
        return p
      },
    }
  )
)
