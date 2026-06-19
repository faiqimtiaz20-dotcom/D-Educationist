import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Circle } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useStudentPortal } from '@/features/shared/useStudentPortal'
import { applicationService } from '@/services'
import { APPLICATION_STATUSES } from '@/lib/constants'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export default function StudentApplicationsPage() {
  const { student, studentInternalId, studentRef, isLoading: profileLoading } = useStudentPortal()

  const { data, isLoading } = useQuery({
    queryKey: ['student-applications', studentInternalId],
    queryFn: () => applicationService.getAll({ pageSize: 50 }),
    enabled: Boolean(studentInternalId),
  })

  const applications = useMemo(
    () =>
      (data?.data ?? []).filter(
        (a) => a.studentId === studentInternalId || a.studentRef === studentRef,
      ),
    [data, studentInternalId, studentRef],
  )

  if (profileLoading || isLoading) {
    return (
      <PageShell title="My Applications">
        <LoadingSkeleton variant="card" rows={3} />
      </PageShell>
    )
  }

  return (
    <PageShell title="My Applications" className="pb-20 lg:pb-6">
      {applications.length === 0 ? (
        <p className="text-sm text-gray-500">No applications found yet.</p>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const statusIndex = APPLICATION_STATUSES.indexOf(app.status)
            return (
              <Card key={app.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{app.university ?? app.intCourse}</CardTitle>
                      <p className="text-sm text-gray-500">{app.intCountry} · {app.intake}</p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Course</p>
                      <p className="font-medium">{app.intCourse}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Level</p>
                      <p className="font-medium">{app.applyLevel}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Doc. Status</p>
                      <StatusBadge status={app.docStatus} />
                    </div>
                    <div>
                      <p className="text-gray-500">Submitted</p>
                      <p className="font-medium">{format(new Date(app.createdAt), 'dd MMM yyyy')}</p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Status Timeline</p>
                    <div className="space-y-2">
                      {APPLICATION_STATUSES.slice(0, 6).map((status, index) => {
                        const reached = statusIndex >= index
                        return (
                          <div key={status} className="flex items-center gap-2">
                            {reached ? (
                              <CheckCircle2 className="size-4 shrink-0 text-success" />
                            ) : (
                              <Circle className="size-4 shrink-0 text-gray-300" />
                            )}
                            <span
                              className={cn(
                                'text-sm',
                                status === app.status ? 'font-semibold text-primary' : 'text-gray-600',
                              )}
                            >
                              {status}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}
