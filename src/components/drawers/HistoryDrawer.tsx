import { History } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { activityStore } from '@/mocks/data/activities'
import type { ActivityEntry } from '@/mocks/data/activities'
import { format } from 'date-fns'

interface HistoryDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityType: ActivityEntry['entityType']
  entityId: string
  title: string
  status?: string
  createdAt?: string
  updatedAt?: string
}

export function HistoryDrawer({
  open,
  onOpenChange,
  entityType,
  entityId,
  title,
  status,
  createdAt,
  updatedAt,
}: HistoryDrawerProps) {
  const activities = activityStore.activities.filter(
    (a) => a.entityType === entityType && a.entityId === entityId,
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="size-5" />
            History — {title}
          </SheetTitle>
        </SheetHeader>

        <ul className="mt-4 space-y-2 text-sm">
          {createdAt && (
            <li className="rounded border border-gray-100 p-3">
              <p className="font-medium">Created</p>
              <p className="text-gray-500">{format(new Date(createdAt), 'dd MMM yyyy HH:mm')}</p>
            </li>
          )}
          {updatedAt && (
            <li className="rounded border border-gray-100 p-3">
              <p className="font-medium">Last Updated</p>
              <p className="text-gray-500">{format(new Date(updatedAt), 'dd MMM yyyy HH:mm')}</p>
            </li>
          )}
          {status && (
            <li className="rounded border border-gray-100 p-3">
              <p className="mb-1 font-medium">Current Status</p>
              <StatusBadge status={status} />
            </li>
          )}
          {activities.map((entry) => (
            <li key={entry.id} className="rounded border border-gray-100 p-3">
              <p className="font-medium">{entry.action}</p>
              {entry.detail && <p className="text-gray-600">{entry.detail}</p>}
              <p className="mt-1 text-xs text-gray-500">
                {entry.user} · {format(new Date(entry.createdAt), 'dd MMM yyyy HH:mm')}
              </p>
            </li>
          ))}
          {!createdAt && activities.length === 0 && (
            <li className="py-8 text-center text-gray-400">No history recorded yet</li>
          )}
        </ul>
      </SheetContent>
    </Sheet>
  )
}
