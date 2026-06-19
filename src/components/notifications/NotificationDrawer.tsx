import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useNotificationStore } from '@/stores/notificationStore'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface NotificationDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const typeColors = {
  info: 'border-l-info',
  warning: 'border-l-warning',
  success: 'border-l-success',
  danger: 'border-l-danger',
}

export function NotificationDrawer({ open, onOpenChange }: NotificationDrawerProps) {
  const navigate = useNavigate()
  const { notifications, markRead, markAllRead } = useNotificationStore()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="size-5" />
            Notifications
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4 flex justify-end">
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            <CheckCheck className="size-4" />
            Mark all read
          </Button>
        </div>
        <div className="mt-2 space-y-2 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              className={cn(
                'w-full rounded-lg border-l-4 bg-gray-50 p-3 text-left transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700',
                typeColors[n.type],
                !n.read && 'ring-1 ring-primary/20',
              )}
              onClick={() => {
                markRead(n.id)
                if (n.link) {
                  navigate(n.link)
                  onOpenChange(false)
                }
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold">{n.title}</p>
                {!n.read && <span className="size-2 shrink-0 rounded-full bg-primary" />}
              </div>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">{n.message}</p>
              <p className="mt-1 text-[10px] text-gray-400">
                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
              </p>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
