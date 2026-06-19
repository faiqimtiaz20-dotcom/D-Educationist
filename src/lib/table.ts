import { format } from 'date-fns'
import type { Appointment, FollowUp } from '@/types'

export const COMPACT_BADGE_CLASS = 'whitespace-nowrap px-1.5 py-0 text-xs'

export function formatScheduleCell(schedule?: FollowUp | Appointment) {
  if (!schedule?.date) return '—'
  const date = format(new Date(schedule.date), 'dd MMM yyyy')
  return schedule.time ? `${date} ${schedule.time}` : date
}
