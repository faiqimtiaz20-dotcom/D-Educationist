import { cn } from '@/lib/utils'

interface DashboardSectionProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function DashboardSection({
  title,
  subtitle,
  action,
  children,
  className,
}: DashboardSectionProps) {
  return (
    <section className={cn('space-y-4', className)}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-gray-900 laptop:text-sm">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-gray-500 laptop:text-xs">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
