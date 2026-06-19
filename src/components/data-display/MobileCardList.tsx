import { cn } from '@/lib/utils'

interface MobileCardListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  emptyMessage?: string
  className?: string
}

export function MobileCardList<T>({
  items,
  renderItem,
  emptyMessage = 'No items to display.',
  className,
}: MobileCardListProps<T>) {
  if (items.length === 0) {
    return (
      <p className={cn('rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500', className)}>
        {emptyMessage}
      </p>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {items.map((item, index) => (
        <div
          key={index}
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  )
}
