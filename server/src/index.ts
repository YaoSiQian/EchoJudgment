import express from 'express'
import cors from 'cors'
import { config } from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { initDb } from './db.js'
import { seedDatabase } from './data/seed.js'
import gameRoutes from './routes/game.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '../../../.env') })

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Initialize database
initDb()
seedDatabase()

app.use('/api/game', gameRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', model: 'qwen3-max', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`[server] Echo Judgment backend running on http://localhost:${PORT}`)
  console.log(`[server] Health check: http://localhost:${PORT}/api/health`)
})
