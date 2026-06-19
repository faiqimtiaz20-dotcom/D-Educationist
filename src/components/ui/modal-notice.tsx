import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalNoticeProps {
  children: React.ReactNode
  className?: string
  icon?: LucideIcon
}

/** Branded info banner for modal forms */
export function ModalNotice({ children, className, icon: Icon }: ModalNoticeProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-primary/15 bg-primary/5 px-4 py-2.5 text-xs leading-relaxed text-primary',
        className,
      )}
    >
      {Icon ? (
        <span className="inline-flex items-start gap-2">
          <Icon className="mt-0.5 size-3.5 shrink-0" />
          <span>{children}</span>
        </span>
      ) : (
        children
      )}
    </div>
  )
}
