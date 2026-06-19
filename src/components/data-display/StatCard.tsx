import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import type { DashboardAccent } from '@/features/dashboard/dashboardMetrics'
import { DASHBOARD_ACCENTS } from '@/features/dashboard/dashboardMetrics'

interface StatCardProps {
  icon: LucideIcon
  label: string
  count: number | string
  trend?: string
  accent?: DashboardAccent
  className?: string
  onClick?: () => void
  featured?: boolean
}

export function StatCard({
  icon: Icon,
  label,
  count,
  trend,
  accent = 'primary',
  className,
  onClick,
  featured = false,
}: StatCardProps) {
  const interactive = !!onClick
  const colors = DASHBOARD_ACCENTS[accent]

  return (
    <Card
      className={cn(
        'group relative overflow-hidden border-0 bg-white ring-1 ring-gray-200/70 shadow-sm transition-all duration-200',
        interactive && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:ring-gray-300/80',
        featured && 'sm:col-span-1',
        className,
      )}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      <div className={cn('absolute inset-x-0 top-0 h-1', colors.bar)} />
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-60', colors.bg)} />
      <CardContent className="relative flex items-start justify-between gap-3 p-4 laptop:p-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-gray-500 laptop:text-[11px]">
            {label}
          </p>
          <p
            className={cn(
              'mt-1 font-bold tracking-tight text-gray-900',
              featured ? 'text-3xl laptop:text-2xl' : 'text-2xl laptop:text-xl',
            )}
          >
            {count}
          </p>
          {trend && <p className="mt-1 text-xs text-gray-400">{trend}</p>}
        </div>
        <div
          className={cn(
            'flex shrink-0 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-105',
            featured ? 'size-12 laptop:size-10' : 'size-11 laptop:size-9',
            colors.icon,
          )}
        >
          <Icon className={cn(featured ? 'size-6 laptop:size-5' : 'size-5 laptop:size-4')} />
        </div>
      </CardContent>
    </Card>
  )
}
