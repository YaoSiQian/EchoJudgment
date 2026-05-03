import { motion, AnimatePresence } from 'framer-motion'

export function Tooltip({
  show,
  text,
  onDismiss,
  position,
}: {
  show: boolean
  text: string
  onDismiss: () => void
  position: { top?: number | string; bottom?: number | string; left?: number | string; right?: number | string }
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="tooltip"
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          onClick={onDismiss}
          style={{
            position: 'fixed',
            zIndex: 800,
            maxWidth: 240,
            padding: '10px 14px',
            background: 'rgba(15,15,30,0.96)',
            color: '#fff',
            border: '1px solid rgba(255,36,66,0.4)',
            borderRadius: 10,
            fontSize: 12,
            lineHeight: 1.55,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            ...position,
          }}
        >
          {text}
          <div
            style={{
              marginTop: 6,
              fontSize: 10,
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: 0.5,
            }}
          >
            点击关闭
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
