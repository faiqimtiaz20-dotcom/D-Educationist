import { useMemo } from 'react'
import { format } from 'date-fns'
import { History } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { activityStore, type ActivityEntry } from '@/mocks/data/activities'

interface HistoryDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityType: ActivityEntry['entityType']
  entityId: string
  title?: string
}

export function HistoryDrawer({
  open,
  onOpenChange,
  entityType,
  entityId,
  title = 'Activity History',
}: HistoryDrawerProps) {
  const activities = useMemo(
    () =>
      activityStore.activities.filter(
        (a) => a.entityType === entityType && a.entityId === entityId,
      ),
    [entityType, entityId, open],
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="size-5 text-primary" />
            {title}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 flex-1 overflow-y-auto">
          {activities.length === 0 ? (
            <p className="text-sm text-gray-500">No activity recorded yet.</p>
          ) : (
            <ul className="relative space-y-0 border-l border-gray-200 pl-4">
              {activities.map((entry) => (
                <li key={entry.id} className="relative pb-6 last:pb-0">
                  <span className="absolute -left-[5px] top-1.5 size-2.5 rounded-full border-2 border-white bg-primary" />
                  <p className="text-sm font-medium text-gray-900">{entry.action}</p>
                  {entry.detail && (
                    <p className="mt-0.5 text-sm text-gray-600">{entry.detail}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {entry.user} · {format(new Date(entry.createdAt), 'dd MMM yyyy HH:mm')}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
