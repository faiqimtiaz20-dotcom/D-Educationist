import { cn } from '@/lib/utils'

interface DashboardMetricCardProps {
  label: string
  value: number | string
  color: string
  className?: string
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
}

export function DashboardMetricCard({
  label,
  value,
  color,
  className,
  onClick,
  size = 'md',
}: DashboardMetricCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'flex flex-col items-center justify-center rounded-md border border-black/5 text-center shadow-sm transition hover:brightness-95 disabled:cursor-default',
        size === 'sm' && 'min-h-[4.5rem] px-2 py-2 laptop:min-h-[3.75rem] laptop:px-1.5 laptop:py-1.5',
        size === 'md' && 'min-h-[5.5rem] px-3 py-3 laptop:min-h-[4.5rem] laptop:px-2 laptop:py-2',
        size === 'lg' && 'min-h-[7rem] px-4 py-4 laptop:min-h-[5.5rem] laptop:px-3 laptop:py-3',
        onClick && 'cursor-pointer',
        className,
      )}
      style={{ backgroundColor: color }}
    >
      <span className={cn('font-semibold text-gray-800', size === 'lg' ? 'text-sm laptop:text-xs' : 'text-xs laptop:text-[11px]')}>
        {label}
      </span>
      <span
        className={cn(
          'font-bold text-gray-900',
          size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-2xl' : 'text-xl',
          size === 'lg' && 'laptop:text-3xl',
          size === 'md' && 'laptop:text-xl',
          size === 'sm' && 'laptop:text-lg',
        )}
      >
        {value}
      </span>
    </button>
  )
}
