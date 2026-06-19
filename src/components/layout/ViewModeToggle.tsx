import { LayoutGrid, Table2 } from 'lucide-react'
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
    <div className={cn('inline-flex rounded-lg border border-gray-200 bg-gray-100 p-0.5', className)}>
      <Button
        variant={value === 'table' ? 'default' : 'ghost'}
        size="sm"
        className="h-8 gap-1.5 px-3"
        onClick={() => onChange('table')}
      >
        <Table2 className="size-3.5" />
        Table
      </Button>
      <Button
        variant={value === 'kanban' ? 'default' : 'ghost'}
        size="sm"
        className="h-8 gap-1.5 px-3"
        onClick={() => onChange('kanban')}
      >
        <LayoutGrid className="size-3.5" />
        Kanban
      </Button>
    </div>
  )
}
