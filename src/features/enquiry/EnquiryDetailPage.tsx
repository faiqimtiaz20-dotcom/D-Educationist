import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { enquiryService } from '@/services'
import { format } from 'date-fns'
import { type PortalPageProps, usePortalContext } from '@/features/shared/portal'

export function EnquiryDetailPage(props: PortalPageProps = {}) {
  const { id } = useParams<{ id: string }>()
  const { prefix } = usePortalContext(props)

  const { data: enquiry, isLoading } = useQuery({
    queryKey: ['enquiry', id],
    queryFn: () => enquiryService.getById(id!),
    enabled: !!id,
  })

  if (isLoading) return <LoadingSkeleton className="mt-4" />
  if (!enquiry) {
    return (
      <PageShell title="Enquiry Not Found" breadcrumbs={[{ label: 'Enquiry' }]}>
        <p className="text-gray-500">The requested enquiry could not be found.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to={`${prefix}/enquiry`}>
            <ArrowLeft className="size-4" />
            Back to Enquiries
          </Link>
        </Button>
      </PageShell>
    )
  }

  return (
    <PageShell
      title={`${enquiry.firstName} ${enquiry.lastName}`}
      breadcrumbs={[
        { label: 'Enquiry', href: `${prefix}/enquiry` },
        { label: 'Detail' },
      ]}
      action={
        <Button variant="outline" asChild>
          <Link to={`${prefix}/enquiry`}>
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2 text-base">
            Enquiry Details
            <StatusBadge status={enquiry.status} />
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-gray-500">Email</p>
            <p>{enquiry.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Mobile</p>
            <p>{enquiry.mobile}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Course</p>
            <p>{enquiry.interestedCourse}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Country</p>
            <p>{enquiry.interestedCountry}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Intake</p>
            <p>{enquiry.intake}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Branch</p>
            <p>{enquiry.branch}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Assigned To</p>
            <p>{enquiry.assignedTo}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Created</p>
            <p>{format(new Date(enquiry.createdAt), 'dd MMM yyyy')}</p>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}
