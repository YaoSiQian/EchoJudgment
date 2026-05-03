import { LeftPanel } from './LeftPanel'
import { RightPanel } from './RightPanel'
import { PhoneFrame } from '../phone/PhoneFrame'

export function GameShell() {
  return (
    <div
      className="flex h-screen w-full overflow-hidden relative"
      style={{ background: 'linear-gradient(135deg, #0F0F1E 0%, #1A1A2E 50%, #16213E 100%)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,36,66,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,36,66,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <aside
        className="hidden lg:flex w-56 xl:w-64 flex-shrink-0 flex-col relative z-10"
        style={{
          borderRight: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(8px)',
          background: 'rgba(15,15,30,0.45)',
        }}
      >
        <LeftPanel />
      </aside>

      <main className="flex-1 flex items-center justify-center relative p-4">
        <div
          className="absolute pointer-events-none"
          style={{
            width: 600,
            height: 600,
            background: 'radial-gradient(ellipse, rgba(255,36,66,0.10), transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <PhoneFrame />
      </main>

      <aside
        className="hidden lg:flex w-56 xl:w-64 flex-shrink-0 flex-col relative z-10"
        style={{
          borderLeft: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(8px)',
          background: 'rgba(15,15,30,0.45)',
        }}
      >
        <RightPanel />
      </aside>
    </div>
  )
}
