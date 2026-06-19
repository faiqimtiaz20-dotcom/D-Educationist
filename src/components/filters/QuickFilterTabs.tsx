import { cn } from '@/lib/utils'

export interface QuickFilterOption {
  label: string
  value: string
  count?: number
}

interface QuickFilterTabsProps {
  options: QuickFilterOption[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function QuickFilterTabs({
  options,
  value,
  onChange,
  className,
}: QuickFilterTabsProps) {
  return (
    <div className={cn('relative -mx-1', className)}>
      <div className="flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-thin">
        {options.map((option) => {
          const active = value === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                active
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-primary/40 hover:text-primary',
              )}
            >
              {option.label}
              {option.count !== undefined && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-xs',
                    active ? 'bg-white/20' : 'bg-gray-100 text-gray-500',
                  )}
                >
                  {option.count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
