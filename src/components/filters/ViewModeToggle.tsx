import { Kanban, LayoutList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type ViewMode = 'table' | 'kanban'

interface ViewModeToggleProps {
  value: ViewMode
  onChange: (mode: ViewMode) => void
  className?: string
}

export function ViewModeToggle({ value, onChange, className }: ViewModeToggleProps) {
  return (
    <div className={cn('inline-flex rounded-lg border border-gray-200 bg-white p-0.5', className)}>
      <Button
        type="button"
        variant={value === 'table' ? 'default' : 'ghost'}
        size="sm"
        className="h-8 gap-1.5"
        onClick={() => onChange('table')}
      >
        <LayoutList className="size-4" />
        Table
      </Button>
      <Button
        type="button"
        variant={value === 'kanban' ? 'default' : 'ghost'}
        size="sm"
        className="h-8 gap-1.5"
        onClick={() => onChange('kanban')}
      >
        <Kanban className="size-4" />
        Kanban
      </Button>
    </div>
  )
}
