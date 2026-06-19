import { useMemo } from 'react'
import { cn } from '@/lib/utils'

export interface KanbanColumn<T> {
  id: string
  title: string
  items: T[]
  color?: string
}

interface KanbanBoardProps<T> {
  columns: KanbanColumn<T>[]
  getItemId: (item: T) => string
  renderCard: (item: T) => React.ReactNode
  onMove?: (itemId: string, fromColumn: string, toColumn: string) => void
  className?: string
}

export function KanbanBoard<T>({
  columns,
  getItemId,
  renderCard,
  onMove,
  className,
}: KanbanBoardProps<T>) {
  const handleDrop = (e: React.DragEvent, toColumn: string) => {
    e.preventDefault()
    const itemId = e.dataTransfer.getData('itemId')
    const fromColumn = e.dataTransfer.getData('fromColumn')
    if (itemId && fromColumn && fromColumn !== toColumn) {
      onMove?.(itemId, fromColumn, toColumn)
    }
  }

  return (
    <div className={cn('flex gap-4 overflow-x-auto pb-4', className)}>
      {columns.map((col) => (
        <div
          key={col.id}
          className="min-w-[280px] flex-1 rounded-lg bg-gray-100 p-3 dark:bg-gray-800"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, col.id)}
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{col.title}</h3>
            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              {col.items.length}
            </span>
          </div>
          <div className="space-y-2">
            {col.items.map((item) => (
              <div
                key={getItemId(item)}
                draggable={!!onMove}
                onDragStart={(e) => {
                  e.dataTransfer.setData('itemId', getItemId(item))
                  e.dataTransfer.setData('fromColumn', col.id)
                }}
                className={cn(
                  'rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow dark:border-gray-600 dark:bg-gray-900',
                  onMove && 'cursor-grab active:cursor-grabbing hover:shadow-md',
                )}
              >
                {renderCard(item)}
              </div>
            ))}
            {col.items.length === 0 && (
              <p className="py-4 text-center text-xs text-gray-400">No items</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export function useKanbanColumns<T>(
  items: T[],
  statusField: keyof T,
  statusOrder: string[],
): KanbanColumn<T>[] {
  return useMemo(
    () =>
      statusOrder.map((status) => ({
        id: status,
        title: status,
        items: items.filter((item) => item[statusField] === status),
      })),
    [items, statusField, statusOrder],
  )
}
