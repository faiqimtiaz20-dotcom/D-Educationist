import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardHighlightCardProps {
  title: string
  value: number | string
  description: string
  icon: LucideIcon
  variant?: 'warning' | 'danger'
  onClick?: () => void
}

export function DashboardHighlightCard({
  title,
  value,
  description,
  icon: Icon,
  variant = 'warning',
  onClick,
}: DashboardHighlightCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'group relative w-full overflow-hidden rounded-2xl p-5 text-left ring-1 transition-all laptop:p-4',
        'disabled:cursor-default',
        onClick && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg',
        variant === 'warning' &&
          'bg-gradient-to-br from-amber-50 via-white to-orange-50 ring-amber-200/70 hover:ring-amber-300',
        variant === 'danger' &&
          'bg-gradient-to-br from-rose-50 via-white to-red-50 ring-rose-200/70 hover:ring-rose-300',
      )}
    >
      <div
        className={cn(
          'absolute -right-6 -top-6 size-24 rounded-full opacity-40 blur-2xl transition-opacity group-hover:opacity-60',
          variant === 'warning' ? 'bg-amber-300' : 'bg-rose-300',
        )}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-600 laptop:text-xs">{title}</p>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 laptop:text-3xl">{value}</p>
          <p className="mt-1 text-sm text-gray-500 laptop:text-xs">{description}</p>
        </div>
        <div
          className={cn(
            'flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-sm laptop:size-10',
            variant === 'warning' ? 'bg-amber-500/15 text-amber-600' : 'bg-rose-500/15 text-rose-600',
          )}
        >
          <Icon className="size-6 laptop:size-5" />
        </div>
      </div>
    </button>
  )
}
