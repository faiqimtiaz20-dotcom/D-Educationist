import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import {
  MessageSquare,
  FileText,
  Globe,
  GraduationCap,
  Calendar,
  Wallet,
  Megaphone,
  CheckCircle2,
  Circle,
} from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useStudentPortal } from '@/features/shared/useStudentPortal'
import { formatCurrency } from '@/lib/utils'
import {
  applicationService,
  visaService,
  enrolledService,
  invoiceService,
  enquiryService,
} from '@/services'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { STUDENT_ANNOUNCEMENTS } from '@/features/student/shared/content'

const PROGRESS_STEPS = [
  { key: 'enquiry', label: 'Enquiry', icon: MessageSquare },
  { key: 'application', label: 'Application', icon: FileText },
  { key: 'visa', label: 'Visa', icon: Globe },
  { key: 'enrolled', label: 'Enrolled', icon: GraduationCap },
] as const

const STEP_ROUTES: Record<(typeof PROGRESS_STEPS)[number]['key'], string> = {
  enquiry: '/student/dashboard',
  application: '/student/applications',
  visa: '/student/visa',
  enrolled: '/student/applications',
}

export default function StudentDashboardPage() {
  const navigate = useNavigate()
  const { student, studentInternalId, studentRef, isLoading: profileLoading } = useStudentPortal()

  const { data: applicationsData, isLoading: appsLoading } = useQuery({
    queryKey: ['student-apps', studentInternalId],
    queryFn: () => applicationService.getAll({ pageSize: 50 }),
    enabled: Boolean(studentInternalId),
  })

  const { data: visasData } = useQuery({
    queryKey: ['student-visas', studentInternalId],
    queryFn: () => visaService.getAll({ pageSize: 50 }),
    enabled: Boolean(studentInternalId),
  })

  const { data: enrolledData } = useQuery({
    queryKey: ['student-enrolled', studentRef],
    queryFn: () => enrolledService.getAll({ pageSize: 50 }),
    enabled: Boolean(studentRef),
  })

  const { data: invoicesData } = useQuery({
    queryKey: ['student-invoices-dash', studentInternalId],
    queryFn: () => invoiceService.getAll({ pageSize: 50 }),
    enabled: Boolean(studentInternalId),
  })

  const { data: enquiriesData } = useQuery({
    queryKey: ['student-enquiries', student?.email],
    queryFn: () => enquiryService.getAll({ pageSize: 50 }),
    enabled: Boolean(student?.email),
  })

  const applications = useMemo(
    () =>
      (applicationsData?.data ?? []).filter(
        (a) => a.studentId === studentInternalId || a.studentRef === studentRef,
      ),
    [applicationsData, studentInternalId, studentRef],
  )

  const visas = useMemo(
    () =>
      (visasData?.data ?? []).filter(
        (v) => v.studentId === studentInternalId || v.studentRef === studentRef,
      ),
    [visasData, studentInternalId, studentRef],
  )

  const enrolled = useMemo(
    () =>
      (enrolledData?.data ?? []).filter(
        (e) => e.studentId === studentInternalId || e.studentRef === studentRef,
      ),
    [enrolledData, studentInternalId, studentRef],
  )

  const pendingInvoices = useMemo(
    () =>
      (invoicesData?.data ?? []).filter(
        (i) =>
          i.studentId === studentInternalId &&
          (i.status === 'Pending' || i.status === 'Partial Paid'),
      ),
    [invoicesData, studentInternalId],
  )

  const hasEnquiry = useMemo(
    () =>
      Boolean(
        (enquiriesData?.data ?? []).some((e) => e.email === student?.email) || student,
      ),
    [enquiriesData, student],
  )

  const progressState = {
    enquiry: hasEnquiry,
    application: applications.length > 0,
    visa: visas.length > 0,
    enrolled: enrolled.length > 0,
  }

  const docPercent = student?.docStatus === 'Completed' ? 100 : 42
  const upcomingAppointment = student?.appointment

  if (profileLoading || appsLoading) {
    return (
      <PageShell title="Dashboard">
        <LoadingSkeleton variant="card" rows={4} />
      </PageShell>
    )
  }

  return (
    <PageShell title="Dashboard" className="pb-20 lg:pb-6">
      <p className="text-sm text-gray-500">
        Hello, {student?.firstName ?? 'Student'}. Track your study abroad journey below.
      </p>

      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Application Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {PROGRESS_STEPS.map((step, index) => {
              const done = progressState[step.key]
              const Icon = step.icon
              const active =
                done ||
                (index === 0 ||
                  progressState[PROGRESS_STEPS[index - 1].key as keyof typeof progressState])
              const route = STEP_ROUTES[step.key]
              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => navigate(route)}
                  className="flex flex-1 items-center gap-2 rounded-lg p-1 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-full border-2',
                      done
                        ? 'border-success bg-success/10 text-success'
                        : active
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 text-gray-400 dark:border-gray-600',
                    )}
                  >
                    {done ? <CheckCircle2 className="size-5" /> : <Icon className="size-5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{step.label}</p>
                    <p className="text-[10px] text-gray-500">{done ? 'Complete' : 'Pending'}</p>
                  </div>
                  {index < PROGRESS_STEPS.length - 1 && (
                    <Circle className="hidden size-2 shrink-0 text-gray-300 sm:block" />
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Document Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold">{docPercent}%</p>
              <StatusBadge status={student?.docStatus ?? 'Pending'} />
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${docPercent}%` }}
              />
            </div>
            <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
              <Link to="/student/documents">View Documents</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Calendar className="size-4" />
              Upcoming Appointment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingAppointment?.date ? (
              <>
                <p className="font-medium">
                  {format(new Date(upcomingAppointment.date), 'dd MMM yyyy')}
                  {upcomingAppointment.time ? ` at ${upcomingAppointment.time}` : ''}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {upcomingAppointment.remarks ?? 'Counselling session scheduled'}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500">No upcoming appointments</p>
            )}
            <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
              <Link to="/student/appointments">All Appointments</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Wallet className="size-4" />
            Pending Invoices
          </CardTitle>
          <span className="text-xs text-gray-500">{pendingInvoices.length} pending</span>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingInvoices.length === 0 ? (
            <p className="text-sm text-gray-500">No pending invoices</p>
          ) : (
            pendingInvoices.slice(0, 3).map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
              >
                <div>
                  <p className="text-sm font-medium">{inv.serviceType}</p>
                  <p className="text-xs text-gray-500">Due {format(new Date(inv.dueDate), 'dd MMM yyyy')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{formatCurrency(inv.pendingAmount, inv.currency)}</p>
                  <StatusBadge status={inv.status} />
                </div>
              </div>
            ))
          )}
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link to="/student/invoices">View All Invoices</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Megaphone className="size-4" />
            Announcements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {STUDENT_ANNOUNCEMENTS.slice(0, 2).map((item) => (
            <div key={item.id} className="rounded-lg border border-gray-100 p-3">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="mt-1 text-xs text-gray-500">{item.body}</p>
              <p className="mt-2 text-[10px] text-gray-400">
                {format(new Date(item.date), 'dd MMM yyyy')}
              </p>
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link to="/student/announcements">View All</Link>
          </Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
