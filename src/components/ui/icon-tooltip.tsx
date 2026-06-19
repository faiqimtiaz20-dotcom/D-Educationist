import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface IconTooltipProps {
  label: string
  children: ReactNode
  className?: string
}

export function IconTooltip({ label, children, className }: IconTooltipProps) {
  return (
    <div className={cn('group/icon relative inline-flex shrink-0', className)}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-0.5 text-[10px] font-medium text-white opacity-0 shadow-sm transition-opacity duration-150 group-hover/icon:opacity-100 group-focus-within/icon:opacity-100"
      >
        {label}
      </span>
    </div>
  )
}
