import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import {
  Users,
  MessageSquare,
  FileText,
  Globe,
  Clock,
  GraduationCap,
  Wallet,
  Building2,
  Handshake,
  AlertCircle,
  TrendingDown,
  Sparkles,
} from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { StatCard } from '@/components/data-display/StatCard'
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardFiltersBar } from '@/features/dashboard/components/DashboardFiltersBar'
import { DashboardSection } from '@/features/dashboard/components/DashboardSection'
import { DashboardHighlightCard } from '@/features/dashboard/components/DashboardHighlightCard'
import { DashboardPartnerTile } from '@/features/dashboard/components/DashboardPartnerTile'
import { formatCurrency } from '@/lib/utils'
import { StatusBarChart, countByField } from '@/features/shared/StatusBarChart'
import { useAuthStore } from '@/stores/authStore'
import {
  dashboardService,
  enquiryService,
  studentService,
  applicationService,
  visaService,
} from '@/services'
import {
  ENQUIRY_STATUSES,
  STUDENT_STATUSES,
  APPLICATION_STATUSES,
  VISA_STATUSES,
} from '@/lib/constants'

export function DashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [branch, setBranch] = useState('')
  const [staff, setStaff] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [country, setCountry] = useState('')
  const [intake, setIntake] = useState('')

  const filters = useMemo(() => ({ branch: branch || undefined }), [branch])

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', filters],
    queryFn: () => dashboardService.getStats(filters),
  })

  const { data: enquiriesData } = useQuery({
    queryKey: ['dashboard-enquiries', filters],
    queryFn: () => enquiryService.getAll({ pageSize: 500, ...filters }),
  })

  const { data: studentsData } = useQuery({
    queryKey: ['dashboard-students', filters],
    queryFn: () => studentService.getAll({ pageSize: 500, ...filters }),
  })

  const { data: applicationsData } = useQuery({
    queryKey: ['dashboard-applications', filters],
    queryFn: () => applicationService.getAll({ pageSize: 500, ...filters }),
  })

  const { data: visasData } = useQuery({
    queryKey: ['dashboard-visas', filters],
    queryFn: () => visaService.getAll({ pageSize: 500, ...filters }),
  })

  const filterItems = <
    T extends {
      branch?: string
      assignedTo?: string
      interestedCountry?: string
      intake?: string
      appliedCountry?: string
      intCountry?: string
      createdAt?: string
    },
  >(
    items: T[],
  ) =>
    items.filter((item) => {
      if (branch && item.branch !== branch) return false
      if (staff && item.assignedTo !== staff) return false
      const itemCountry = item.interestedCountry ?? item.appliedCountry ?? item.intCountry
      if (country && itemCountry !== country) return false
      if (intake && item.intake !== intake) return false
      if (dateFrom && item.createdAt && item.createdAt < dateFrom) return false
      if (dateTo && item.createdAt && item.createdAt > `${dateTo}T23:59:59`) return false
      return true
    })

  const enquiries = filterItems(enquiriesData?.data ?? [])
  const students = filterItems(studentsData?.data ?? [])
  const applications = filterItems(applicationsData?.data ?? [])
  const visas = filterItems(visasData?.data ?? [])

  const missedFollowups = enquiries.filter((e) => e.status === 'Follow-up Required').length
  const dropped = enquiries.filter((e) => e.status === 'Drop').length

  const resetFilters = () => {
    setBranch('')
    setStaff('')
    setDateFrom('')
    setDateTo('')
    setCountry('')
    setIntake('')
  }

  const goTo = (path: string) => navigate(path)
  const today = format(new Date(), 'EEEE, MMMM d, yyyy')

  return (
    <PageShell title="Dashboard" breadcrumbs={[{ label: 'Dashboard' }]} showBack={false}>
      <div className="space-y-6 laptop:space-y-4">
        {/* Welcome hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-[#243f66] to-[#1a2f4a] px-6 py-5 text-white shadow-lg laptop:px-5 laptop:py-4">
          <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-10 right-1/4 size-32 rounded-full bg-accent/20 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-white/80">
                <Sparkles className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wider laptop:text-[11px]">
                  {today}
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight laptop:text-lg">
                Welcome back{user?.name ? `, ${user.name}` : ''}
              </h2>
              <p className="mt-1 max-w-xl text-sm text-white/75 laptop:text-xs">
                Track enquiries, students, applications, and revenue at a glance.
              </p>
            </div>
            {stats && !statsLoading && (
              <div className="flex flex-wrap gap-3 sm:justify-end">
                <div className="rounded-xl bg-white/10 px-4 py-2 backdrop-blur-sm ring-1 ring-white/20">
                  <p className="text-xs text-white/70">Enquiries</p>
                  <p className="text-lg font-bold">{stats.enquiries.total}</p>
                </div>
                <div className="rounded-xl bg-white/10 px-4 py-2 backdrop-blur-sm ring-1 ring-white/20">
                  <p className="text-xs text-white/70">Students</p>
                  <p className="text-lg font-bold">{stats.students.total}</p>
                </div>
                <div className="rounded-xl bg-white/10 px-4 py-2 backdrop-blur-sm ring-1 ring-white/20">
                  <p className="text-xs text-white/70">Applications</p>
                  <p className="text-lg font-bold">{stats.applications.total}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DashboardFiltersBar
          branch={branch}
          staff={staff}
          country={country}
          intake={intake}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onBranchChange={setBranch}
          onStaffChange={setStaff}
          onCountryChange={setCountry}
          onIntakeChange={setIntake}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onReset={resetFilters}
        />

        {statsLoading ? (
          <LoadingSkeleton variant="stats" className="lg:grid-cols-3 xl:grid-cols-4" />
        ) : stats ? (
          <>
            <DashboardSection title="Key Metrics" subtitle="Your most important numbers today">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  featured
                  accent="blue"
                  icon={MessageSquare}
                  label="Total Enquiries"
                  count={stats.enquiries.total}
                  onClick={() => goTo('/admin/enquiry')}
                />
                <StatCard
                  featured
                  accent="green"
                  icon={Users}
                  label="Total Students"
                  count={stats.students.total}
                  onClick={() => goTo('/admin/student')}
                />
                <StatCard
                  featured
                  accent="orange"
                  icon={FileText}
                  label="Total Applications"
                  count={stats.applications.total}
                  onClick={() => goTo('/admin/application')}
                />
                <StatCard
                  featured
                  accent="amber"
                  icon={Wallet}
                  label="Pending Invoice Amount"
                  count={formatCurrency(stats.invoices.totalPendingAmount)}
                  onClick={() => goTo('/admin/accounts/student-invoices?status=Pending')}
                />
              </div>
            </DashboardSection>

            <DashboardSection title="All Summary" subtitle="Complete operational overview">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <StatCard
                  accent="blue"
                  icon={MessageSquare}
                  label="New Enquiries"
                  count={stats.enquiries.new}
                  onClick={() => goTo('/admin/enquiry?status=New Enquiry')}
                />
                <StatCard
                  accent="blue"
                  icon={AlertCircle}
                  label="Follow-up Required"
                  count={stats.enquiries.followUp}
                  onClick={() => goTo('/admin/enquiry?status=Follow-up Required')}
                />
                <StatCard
                  accent="blue"
                  icon={Users}
                  label="Interested Enquiries"
                  count={stats.enquiries.interested}
                  onClick={() => goTo('/admin/enquiry?status=Interested')}
                />
                <StatCard
                  accent="green"
                  icon={FileText}
                  label="Documents Pending"
                  count={stats.students.documentsPending}
                  onClick={() => goTo('/admin/student?docStatus=Pending')}
                />
                <StatCard
                  accent="green"
                  icon={Clock}
                  label="Students On Hold"
                  count={stats.students.onHold}
                  onClick={() => goTo('/admin/student?status=On Hold')}
                />
                <StatCard
                  accent="purple"
                  icon={Globe}
                  label="Total Visas"
                  count={stats.visas.total}
                  onClick={() => goTo('/admin/visa')}
                />
                <StatCard
                  accent="green"
                  icon={GraduationCap}
                  label="Enrolled Students"
                  count={stats.enrolled.total}
                  onClick={() => goTo('/admin/enrolled')}
                />
                <StatCard accent="rose" icon={Handshake} label="Active Partners" count={stats.partners.total} />
              </div>
            </DashboardSection>
          </>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <DashboardHighlightCard
            variant="warning"
            icon={AlertCircle}
            title="Missed Follow-ups"
            value={missedFollowups}
            description="Enquiries requiring follow-up action"
            onClick={() => goTo('/admin/enquiry?status=Follow-up Required')}
          />
          <DashboardHighlightCard
            variant="danger"
            icon={TrendingDown}
            title="Drop Summary"
            value={dropped}
            description="Enquiries marked as dropped"
            onClick={() => goTo('/admin/enquiry?status=Drop')}
          />
        </div>

        <DashboardSection title="Analytics" subtitle="Status breakdowns and trends">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
            <StatusBarChart
              title="Enquiry by Country"
              data={countByField(enquiries, 'interestedCountry')}
              color="#06b6d4"
            />
            <StatusBarChart
              title="Enquiry by Intake"
              data={countByField(enquiries, 'intake')}
              color="#ec4899"
            />
          </div>
        </DashboardSection>

        <Card className="overflow-hidden border-0 ring-1 ring-gray-200/80 shadow-sm">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/80 to-white">
            <CardTitle className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building2 className="size-4" />
              </div>
              Partner Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <DashboardPartnerTile label="Partner Invoices" value={stats?.partnerInvoices?.total ?? 0} />
              <DashboardPartnerTile
                label="Pending Commission"
                value={formatCurrency(stats?.partnerInvoices?.pendingCommission ?? 0)}
              />
              <DashboardPartnerTile
                label="University Commission"
                value={stats?.universityCommission?.total ?? 0}
              />
              <DashboardPartnerTile
                label="Uni. Pending Commission"
                value={formatCurrency(stats?.universityCommission?.pendingCommission ?? 0)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
