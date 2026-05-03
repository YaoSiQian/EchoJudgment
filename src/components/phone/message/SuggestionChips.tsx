import { motion, AnimatePresence } from 'framer-motion'
import type { PlayerOption } from '../../../types'

const TONE_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  warm:       { bg: '#FFF1F4', color: '#D72C4A', border: '#FFD1DC' },
  cold:       { bg: '#EEF1F4', color: '#4B5C6B', border: '#D4DDE5' },
  aggressive: { bg: '#FFE3E3', color: '#B91C1C', border: '#FBBABA' },
  passive:    { bg: '#F4F0FF', color: '#6B5B95', border: '#DCD3F0' },
  curious:    { bg: '#E8F4FF', color: '#1E6FB8', border: '#BFDFFA' },
  avoidant:   { bg: '#F0F0F0', color: '#777',    border: '#E0E0E0' },
}

export function SuggestionChips({
  options,
  onPick,
  disabled,
  hint,
}: {
  options: PlayerOption[]
  onPick: (opt: PlayerOption) => void
  disabled?: boolean
  hint?: string
}) {
  return (
    <div
      style={{
        padding: '8px 12px 12px',
        background: '#FAFAFA',
        borderTop: '0.5px solid #EBEBEB',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: '#999',
          letterSpacing: 1,
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        {hint ?? '点一句继续 ↓'}
      </div>
      <AnimatePresence initial={false}>
        {options.map((opt, i) => {
          const t = TONE_STYLE[opt.tone] ?? TONE_STYLE.curious
          return (
            <motion.button
              key={opt.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 360, damping: 30 }}
              exit={{ opacity: 0 }}
              disabled={disabled}
              onClick={() => onPick(opt)}
              style={{
                width: '100%',
                padding: '11px 14px',
                background: t.bg,
                color: t.color,
                border: `1px solid ${t.border}`,
                borderRadius: 18,
                fontSize: 14,
                lineHeight: 1.4,
                textAlign: 'left',
                fontWeight: 500,
                cursor: disabled ? 'default' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                transition: 'transform 120ms',
              }}
            >
              {opt.text}
            </motion.button>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
