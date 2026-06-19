import { cn } from '@/lib/utils'

interface DashboardPartnerTileProps {
  label: string
  value: number | string
  className?: string
}

export function DashboardPartnerTile({ label, value, className }: DashboardPartnerTileProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-gradient-to-br from-gray-50 to-white p-4 ring-1 ring-gray-200/80 laptop:p-3',
        className,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900 laptop:text-xl">{value}</p>
    </div>
  )
}
