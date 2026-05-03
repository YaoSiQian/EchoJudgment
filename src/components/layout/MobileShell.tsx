import { PhoneFrame } from '../phone/PhoneFrame'

export function MobileShell() {
  return (
    <div
      className="flex h-screen w-full items-center justify-center"
      style={{ background: '#1A1A2E' }}
    >
      <PhoneFrame />
    </div>
  )
}
