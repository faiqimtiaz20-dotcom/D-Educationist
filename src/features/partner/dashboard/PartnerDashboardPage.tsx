import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  MessageSquare,
  Users,
  FileText,
  Globe,
  GraduationCap,
  Wallet,
  AlertCircle,
} from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { StatCard } from '@/components/data-display/StatCard'
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBarChart, countByField } from '@/features/shared/StatusBarChart'
import { usePortalContext } from '@/features/shared/portal'
import { formatCurrency } from '@/lib/utils'
import {
  dashboardService,
  enquiryService,
  studentService,
  applicationService,
  visaService,
  invoiceService,
} from '@/services'
import {
  ENQUIRY_STATUSES,
  STUDENT_STATUSES,
  APPLICATION_STATUSES,
  VISA_STATUSES,
} from '@/lib/constants'

export default function PartnerDashboardPage() {
  const { partnerId, user } = usePortalContext({ portal: 'partner' })

  const filters = useMemo(() => ({ partnerId }), [partnerId])

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', filters],
    queryFn: () => dashboardService.getStats(filters),
  })

  const { data: partnerInvoicesData } = useQuery({
    queryKey: ['partner-invoices-summary', partnerId],
    queryFn: () => invoiceService.getAllPartnerInvoices({ pageSize: 100, partnerId }),
  })

  const { data: enquiriesData } = useQuery({
    queryKey: ['partner-dashboard-enquiries', partnerId],
    queryFn: () => enquiryService.getAll({ pageSize: 500, partnerId }),
  })

  const { data: studentsData } = useQuery({
    queryKey: ['partner-dashboard-students', partnerId],
    queryFn: () => studentService.getAll({ pageSize: 500, partnerId }),
  })

  const { data: applicationsData } = useQuery({
    queryKey: ['partner-dashboard-applications', partnerId],
    queryFn: () => applicationService.getAll({ pageSize: 500, partnerId, isPartner: true }),
  })

  const { data: visasData } = useQuery({
    queryKey: ['partner-dashboard-visas', partnerId],
    queryFn: () => visaService.getAll({ pageSize: 500, partnerId, isPartner: true }),
  })

  const invoices = partnerInvoicesData?.data ?? []
  const commissionSummary = useMemo(
    () => ({
      total: invoices.reduce((s, i) => s + i.totalCommission, 0),
      received: invoices.reduce((s, i) => s + i.receivedCommission, 0),
      pending: invoices.reduce((s, i) => s + i.pendingCommission, 0),
      count: invoices.length,
    }),
    [invoices],
  )

  const enquiries = enquiriesData?.data ?? []
  const students = studentsData?.data ?? []
  const applications = applicationsData?.data ?? []
  const visas = visasData?.data ?? []

  return (
    <PageShell
      title="Dashboard"
      breadcrumbs={[{ label: 'Dashboard' }]}
    >
      <p className="text-sm text-gray-500">
        Welcome back, {user?.name}. Here is your partner overview.
      </p>

      {statsLoading ? (
        <LoadingSkeleton variant="stats" className="mt-4 lg:grid-cols-3 xl:grid-cols-4" />
      ) : stats ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <StatCard icon={MessageSquare} label="Total Enquiries" count={stats.enquiries.total} />
          <StatCard icon={MessageSquare} label="New Enquiries" count={stats.enquiries.new} />
          <StatCard icon={AlertCircle} label="Follow-up Required" count={stats.enquiries.followUp} />
          <StatCard icon={Users} label="Total Students" count={stats.students.total} />
          <StatCard icon={FileText} label="Documents Pending" count={stats.students.documentsPending} />
          <StatCard icon={FileText} label="Applications" count={stats.applications.total} />
          <StatCard icon={Globe} label="Visa Records" count={stats.visas.total} />
          <StatCard icon={GraduationCap} label="Enrolled" count={stats.enrolled.total} />
        </div>
      ) : null}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="size-5 text-primary" />
            Commission Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Total Invoices</p>
              <p className="text-2xl font-bold">{commissionSummary.count}</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Total Commission</p>
              <p className="text-2xl font-bold">{formatCurrency(commissionSummary.total)}</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Received</p>
              <p className="text-2xl font-bold text-success">{formatCurrency(commissionSummary.received)}</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Pending Commission</p>
              <p className="text-2xl font-bold text-warning">
                {formatCurrency(stats?.partnerInvoices.pendingCommission ?? commissionSummary.pending)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatusBarChart
          title="Enquiry Status"
          data={countByField(enquiries, 'status', ENQUIRY_STATUSES)}
          color="#3b82f6"
        />
        <StatusBarChart
          title="Student Status"
          data={countByField(students, 'status', STUDENT_STATUSES)}
          color="#22c55e"
        />
        <StatusBarChart
          title="Application Status"
          data={countByField(applications, 'status', APPLICATION_STATUSES)}
          color="#f97316"
        />
        <StatusBarChart
          title="Visa Status"
          data={countByField(visas, 'visaStatus', VISA_STATUSES)}
          color="#8b5cf6"
        />
      </div>
    </PageShell>
  )
}
