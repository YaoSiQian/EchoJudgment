import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const AI_BASE = env.AI_BASE_URL || 'https://api.openai-next.com'
  const AI_TOKEN = env.AI_AUTH_TOKEN || ''

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 3000,
      proxy: {
        '/ai': {
          target: AI_BASE,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/ai/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (AI_TOKEN) proxyReq.setHeader('Authorization', `Bearer ${AI_TOKEN}`)
            })
          },
        },
      },
    },
    define: {
      'import.meta.env.VITE_AI_MODEL': JSON.stringify(env.AI_MODEL || 'claude-opus-4-6'),
    },
  }
})
