import { Link } from 'react-router-dom'
import { PageShell } from '@/components/layout/PageShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { REPORTS } from '@/lib/constants'
import { getNavIcon } from '@/lib/nav-icons'
import { type PortalPageProps, usePortalContext } from '@/features/shared/portal'

const PARTNER_REPORT_SLUGS = ['enquiry', 'student', 'application', 'visa', 'partner-invoice']

export function ReportsHubPage(props: PortalPageProps = {}) {
  const { prefix, isPartner } = usePortalContext(props)
  const reports = isPartner
    ? REPORTS.filter((r) => PARTNER_REPORT_SLUGS.includes(r.slug))
    : REPORTS

  return (
    <PageShell title="Reports" breadcrumbs={[{ label: 'Reports' }]}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {reports.map((report) => {
          const Icon = getNavIcon(report.icon)
          return (
            <Link key={report.slug} to={`${prefix}/reports/${report.slug}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle className="text-base">{report.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">{report.description}</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </PageShell>
  )
}
