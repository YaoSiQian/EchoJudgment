import type { GameTime } from '../types'

export function formatGameTime(time: GameTime): string {
  return `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`
}

export function formatRelativeTime(eventDay: number, eventHour: number, currentDay: number, currentHour: number): string {
  const diffH = currentDay * 24 + currentHour - (eventDay * 24 + eventHour)
  if (diffH < 1) return '刚刚'
  if (diffH < 24) return `${diffH}小时前`
  const d = Math.floor(diffH / 24)
  if (d === 1) return '昨天'
  return `${d}天前`
}

export function advanceGameTime(time: GameTime, minutesToAdd: number): GameTime {
  const total = time.day * 1440 + time.hour * 60 + time.minute + minutesToAdd
  return {
    day: Math.floor(total / 1440),
    hour: Math.floor((total % 1440) / 60),
    minute: total % 60,
  }
}

export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}
