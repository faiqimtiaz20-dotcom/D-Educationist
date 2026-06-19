import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Globe, Building2, BookOpen, Calendar } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useStudentPortal } from '@/features/shared/useStudentPortal'
import { visaService } from '@/services'
import { format } from 'date-fns'

export default function StudentVisaPage() {
  const { studentInternalId, studentRef, isLoading: profileLoading } = useStudentPortal()

  const { data, isLoading } = useQuery({
    queryKey: ['student-visa', studentInternalId],
    queryFn: () => visaService.getAll({ pageSize: 50 }),
    enabled: Boolean(studentInternalId),
  })

  const visa = useMemo(
    () =>
      (data?.data ?? []).find(
        (v) => v.studentId === studentInternalId || v.studentRef === studentRef,
      ),
    [data, studentInternalId, studentRef],
  )

  if (profileLoading || isLoading) {
    return (
      <PageShell title="Visa Status">
        <LoadingSkeleton variant="card" rows={2} />
      </PageShell>
    )
  }

  if (!visa) {
    return (
      <PageShell title="Visa Status" className="pb-20 lg:pb-6">
        <Card>
          <CardContent className="py-8 text-center">
            <Globe className="mx-auto size-12 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">No visa application on record yet.</p>
          </CardContent>
        </Card>
      </PageShell>
    )
  }

  return (
    <PageShell title="Visa Status" className="pb-20 lg:pb-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg">Visa Application</CardTitle>
            <StatusBadge status={visa.visaStatus} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Globe className="mt-0.5 size-5 text-primary" />
              <div>
                <p className="text-xs text-gray-500">Country</p>
                <p className="font-medium">{visa.appliedCountry}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="mt-0.5 size-5 text-primary" />
              <div>
                <p className="text-xs text-gray-500">University</p>
                <p className="font-medium">{visa.university}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BookOpen className="mt-0.5 size-5 text-primary" />
              <div>
                <p className="text-xs text-gray-500">Course</p>
                <p className="font-medium">{visa.course}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 size-5 text-primary" />
              <div>
                <p className="text-xs text-gray-500">Intake</p>
                <p className="font-medium">{visa.intake}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Document Status</p>
              <StatusBadge status={visa.docStatus} />
            </div>
            <p className="mt-2 text-xs text-gray-400">
              Last updated {format(new Date(visa.updatedAt), 'dd MMM yyyy')}
            </p>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}
