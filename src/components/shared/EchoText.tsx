import type { EchoLevel } from '../../types'

export function EchoText({
  text,
  echoLevel,
  echoContent,
}: {
  text: string
  echoLevel?: EchoLevel
  echoContent?: string
}) {
  if (!echoLevel) return <>{text}</>
  const cls = `echo-lv${echoLevel}`
  // For Lv >= 2, mix in echoContent if provided (a single phrase)
  if (echoContent && echoLevel >= 2) {
    return (
      <>
        {text}
        <span className={cls} style={{ marginLeft: 4 }}>
          {echoContent}
        </span>
      </>
    )
  }
  return <span className={cls}>{text}</span>
}
