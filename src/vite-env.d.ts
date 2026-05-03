/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AI_MODEL: string
  readonly VITE_GAME_DEBUG: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
