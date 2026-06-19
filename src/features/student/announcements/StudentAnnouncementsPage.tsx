import { Megaphone } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { BRAND } from '@/lib/constants'
import { Card, CardContent } from '@/components/ui/card'
import { STUDENT_ANNOUNCEMENTS } from '@/features/student/shared/content'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export default function StudentAnnouncementsPage() {
  return (
    <PageShell title="Announcements" className="pb-20 lg:pb-6">
      <p className="text-sm text-gray-500">
        Stay updated with the latest news and reminders from {BRAND.name}.
      </p>

      <div className="mt-4 space-y-3">
        {STUDENT_ANNOUNCEMENTS.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-lg',
                    item.priority === 'high' ? 'bg-warning/10' : 'bg-primary/10',
                  )}
                >
                  <Megaphone
                    className={cn(
                      'size-5',
                      item.priority === 'high' ? 'text-warning' : 'text-primary',
                    )}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">{item.title}</p>
                    {item.priority === 'high' && (
                      <span className="shrink-0 rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-medium uppercase text-warning">
                        Important
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{item.body}</p>
                  <p className="mt-2 text-xs text-gray-400">
                    {format(new Date(item.date), 'dd MMM yyyy')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  )
}
