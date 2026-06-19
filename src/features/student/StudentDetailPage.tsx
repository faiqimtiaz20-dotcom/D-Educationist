import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  FileCheck,
  FileText,
  Globe,
  GraduationCap,
  Mail,
  MapPin,
  MessageSquare,
  MessageSquarePlus,
  Phone,
  User,
  UserCheck,
  Wallet,
  Briefcase,
  BookOpen,
  History,
} from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { DocumentUploader } from '@/components/documents/DocumentUploader'
import { NotesDialog } from '@/components/activity/NotesDialog'
import { AssignStaffModal } from '@/components/modals/AssignStaffModal'
import { ConvertToApplicationDialog } from '@/components/modals/ConvertToApplicationDialog'
import { InvoicePdfPreview } from '@/components/modals/InvoicePdfPreview'
import { BulkMessageModal } from '@/components/modals/BulkMessageModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select } from '@/components/ui/select'
import { studentService } from '@/services'
import { STUDENT_STATUSES } from '@/lib/constants'
import { activityStore, logActivity } from '@/mocks/data/activities'
import { cn, formatCurrency } from '@/lib/utils'
import { type PortalPageProps, usePortalContext } from '@/features/shared/portal'
import { useStudentDetail } from '@/features/student/useStudentDetail'
import { useConvertToApplication } from '@/features/student/useConvertToApplication'
import type { Invoice } from '@/types'

const JOURNEY_STEPS = [
  { key: 1, label: 'Student', icon: User },
  { key: 2, label: 'Application', icon: FileText },
  { key: 3, label: 'Visa', icon: Globe },
  { key: 4, label: 'Enrolled', icon: GraduationCap },
]

const DOC_CHECKLIST = [
  'Passport',
  'IELTS Scorecard',
  'Academic Transcripts',
  'SOP',
  'LOR',
  'Resume/CV',
  'Offer Letter',
  'Financial Documents',
]

function InfoField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50/80 p-3 dark:border-gray-700 dark:bg-gray-800/50">
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{value || '—'}</p>
    </div>
  )
}

export function StudentDetailPage(props: PortalPageProps = {}) {
  const { id } = useParams<{ id: string }>()
  const { prefix, isAdmin } = usePortalContext(props)
  const queryClient = useQueryClient()
  const { student, applications, visas, invoices, enrolled, journeyStage, isLoading } =
    useStudentDetail(id)

  const [notesOpen, setNotesOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [applicationOpen, setApplicationOpen] = useState(false)
  const [messageOpen, setMessageOpen] = useState(false)
  const [invoicePreview, setInvoicePreview] = useState<Invoice | null>(null)
  const [docStates, setDocStates] = useState<Record<string, { status: 'Pending' | 'Uploaded' | 'Verified' | 'Rejected'; fileName?: string }>>({})

  const convertMutation = useConvertToApplication(prefix)

  const statusMutation = useMutation({
    mutationFn: (status: string) => studentService.update(id!, { status }),
    onSuccess: (_, status) => {
      logActivity('student', id!, 'Status updated', status)
      toast.success('Status updated')
      queryClient.invalidateQueries({ queryKey: ['student', id] })
    },
  })

  const getDocStatus = (name: string, index: number) => {
    if (docStates[name]) return docStates[name]
    const existing = activityStore.documents.find(
      (d) => d.studentId === id && d.name.toLowerCase().includes(name.split(' ')[0].toLowerCase()),
    )
    if (existing) return { status: existing.status, fileName: existing.fileName }
    return { status: index < 2 ? 'Verified' as const : index < 4 ? 'Uploaded' as const : 'Pending' as const }
  }

  const activities = activityStore.activities.filter(
    (a) => a.entityType === 'student' && a.entityId === id,
  )
  const notes = activityStore.notes.filter((n) => n.entityType === 'student' && n.entityId === id)

  const totalPending = invoices.reduce((s, i) => s + i.pendingAmount, 0)

  if (isLoading) {
    return (
      <PageShell title="Loading..." breadcrumbs={[{ label: 'Student', href: `${prefix}/student` }]}>
        <LoadingSkeleton rows={8} className="mt-4" />
      </PageShell>
    )
  }

  if (!student) {
    return (
      <PageShell title="Student Not Found" breadcrumbs={[{ label: 'Student' }]}>
        <p className="text-gray-500">The requested student could not be found.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to={`${prefix}/student`}>
            <ArrowLeft className="size-4" />
            Back to Students
          </Link>
        </Button>
      </PageShell>
    )
  }

  const fullName = `${student.firstName} ${student.lastName}`

  return (
    <PageShell
      title=""
      breadcrumbs={[
        { label: 'Student', href: `${prefix}/student` },
        { label: 'View Student', href: `${prefix}/student` },
        { label: student.studentId },
      ]}
    >
      {/* Profile header */}
      <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="bg-gradient-to-r from-primary to-[#2a4a73] px-6 py-5 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-white/20 text-2xl font-bold backdrop-blur">
                {student.firstName.charAt(0)}{student.lastName.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl font-bold sm:text-2xl">{fullName}</h1>
                <p className="mt-0.5 font-mono text-sm text-white/80">{student.studentId}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <StatusBadge status={student.status} />
                  <StatusBadge status={student.docStatus} />
                  {student.partnerName && (
                    <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium">
                      Partner: {student.partnerName}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {isAdmin && (
                <Button size="sm" variant="secondary" className="bg-white/10 text-white hover:bg-white/20" asChild>
                  <Link to={`${prefix}/student/add`}>
                    <Edit className="size-4" />
                    Edit
                  </Link>
                </Button>
              )}
              <Button size="sm" variant="secondary" className="bg-white/10 text-white hover:bg-white/20" onClick={() => setMessageOpen(true)}>
                <Mail className="size-4" />
                Email
              </Button>
              <Button size="sm" variant="secondary" className="bg-white/10 text-white hover:bg-white/20" onClick={() => setNotesOpen(true)}>
                <MessageSquarePlus className="size-4" />
                Notes
              </Button>
              {isAdmin && (
                <Button size="sm" variant="secondary" className="bg-white/10 text-white hover:bg-white/20" onClick={() => setAssignOpen(true)}>
                  <UserCheck className="size-4" />
                  Assign
                </Button>
              )}
              <Button size="sm" variant="secondary" className="bg-white/10 text-white hover:bg-white/20" asChild>
                <Link to={`${prefix}/student`}>
                  <ArrowLeft className="size-4" />
                  Back
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Contact strip */}
        <div className="grid grid-cols-2 gap-px bg-gray-100 sm:grid-cols-4 dark:bg-gray-700">
          {[
            { icon: Mail, label: student.email },
            { icon: Phone, label: student.mobile },
            { icon: MapPin, label: student.interestedCountry ?? '—' },
            { icon: Calendar, label: `Intake: ${student.intake ?? '—'}` },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 bg-white px-4 py-3 dark:bg-gray-900">
              <Icon className="size-4 shrink-0 text-primary" />
              <span className="truncate text-sm text-gray-700 dark:text-gray-300">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Journey stepper */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {JOURNEY_STEPS.map((step, i) => {
              const Icon = step.icon
              const active = journeyStage >= step.key
              const current = journeyStage === step.key
              return (
                <div key={step.key} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={cn(
                        'flex size-10 items-center justify-center rounded-full border-2 transition-colors',
                        active ? 'border-primary bg-primary text-white' : 'border-gray-300 bg-gray-50 text-gray-400',
                        current && 'ring-4 ring-primary/20',
                      )}
                    >
                      <Icon className="size-4" />
                    </div>
                    <span className={cn('text-xs font-medium', active ? 'text-primary' : 'text-gray-400')}>
                      {step.label}
                    </span>
                  </div>
                  {i < JOURNEY_STEPS.length - 1 && (
                    <div className={cn('mx-2 h-0.5 flex-1', active && journeyStage > step.key ? 'bg-primary' : 'bg-gray-200')} />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Applications', value: applications.length, icon: FileText, color: 'text-blue-600' },
          { label: 'Visa Records', value: visas.length, icon: Globe, color: 'text-purple-600' },
          { label: 'Invoices', value: invoices.length, icon: Wallet, color: 'text-green-600' },
          { label: 'Pending Amount', value: formatCurrency(totalPending), icon: Wallet, color: 'text-orange-600' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <stat.icon className={cn('size-8', stat.color)} />
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-lg font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status + assignment bar */}
      {isAdmin && (
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Student Status:</span>
            <Select
              value={student.status}
              onChange={(e) => statusMutation.mutate(e.target.value)}
              className="w-48"
            >
              {STUDENT_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="text-gray-500">Assigned to:</span> <strong>{student.assignedTo}</strong>
            <span className="mx-2 text-gray-300">|</span>
            <span className="text-gray-500">By:</span> {student.assignedBy}
            <span className="mx-2 text-gray-300">|</span>
            <span className="text-gray-500">Branch:</span> {student.branch}
          </div>
          <Button size="sm" variant="success" className="ml-auto" onClick={() => setApplicationOpen(true)}>
            <FileCheck className="size-4" />
            Ready For Application
          </Button>
        </div>
      )}

      {/* Main tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
          {[
            { value: 'overview', label: 'Overview', icon: User },
            { value: 'academic', label: 'Academic', icon: BookOpen },
            { value: 'tests', label: 'Proficiency', icon: FileText },
            { value: 'work', label: 'Work Exp.', icon: Briefcase },
            { value: 'applications', label: `Applications (${applications.length})`, icon: FileText },
            { value: 'visa', label: `Visa (${visas.length})`, icon: Globe },
            { value: 'documents', label: 'Documents', icon: FileCheck },
            { value: 'invoices', label: `Invoices (${invoices.length})`, icon: Wallet },
            { value: 'timeline', label: 'Timeline', icon: History },
            { value: 'notes', label: `Notes (${notes.length})`, icon: MessageSquare },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <tab.icon className="size-3.5" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-base">Personal Details</CardTitle></CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <InfoField label="First Name" value={student.firstName} />
                <InfoField label="Last Name" value={student.lastName} />
                <InfoField label="Email" value={student.email} />
                <InfoField label="Mobile" value={student.mobile} />
                <InfoField label="Alternate No" value={student.alternateNo} />
                <InfoField label="Date of Birth" value={student.dateOfBirth ? format(new Date(student.dateOfBirth), 'dd/MM/yyyy') : undefined} />
                <InfoField label="Gender" value={student.gender} />
                <InfoField label="Nationality" value={student.nationality} />
                <InfoField label="Marital Status" value={student.maritalStatus} />
                <InfoField label="Address" value={student.address} />
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Follow Up</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="size-4 text-primary" />
                    {student.followUp?.date ? format(new Date(student.followUp.date), 'dd MMM yyyy') : '—'}
                    {student.followUp?.time && ` at ${student.followUp.time}`}
                  </div>
                  <p className="text-gray-600">{student.followUp?.remarks || 'No remarks'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Appointment</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="size-4 text-primary" />
                    {student.appointment?.date ? format(new Date(student.appointment.date), 'dd MMM yyyy') : '—'}
                    {student.appointment?.time && ` at ${student.appointment.time}`}
                  </div>
                  <p className="text-gray-600">{student.appointment?.remarks || 'No remarks'}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Study Preferences</CardTitle></CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <InfoField label="Highest Qualification" value={student.highestQualification} />
                <InfoField label="Interested Course" value={student.interestedCourse} />
                <InfoField label="Interested Country" value={student.interestedCountry} />
                <InfoField label="Intake" value={student.intake} />
                <InfoField label="Apply Level" value={student.applyLevel} />
                <InfoField label="Source" value={student.source} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Passport Details</CardTitle></CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <InfoField label="Passport No" value={student.passportNo} />
                <InfoField label="Date of Issue" value={student.passportIssue ? format(new Date(student.passportIssue), 'dd/MM/yyyy') : undefined} />
                <InfoField label="Date of Expiry" value={student.passportExpiry ? format(new Date(student.passportExpiry), 'dd/MM/yyyy') : undefined} />
                <InfoField label="Partner" value={student.partnerName} />
              </CardContent>
            </Card>
          </div>

          {student.remark && (
            <Card>
              <CardHeader><CardTitle className="text-base">Remarks</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-gray-700 dark:text-gray-300">{student.remark}</p></CardContent>
            </Card>
          )}

          <div className="grid gap-3 text-xs text-gray-500 sm:grid-cols-2">
            <span>Created: {format(new Date(student.createdAt), 'dd MMM yyyy, hh:mm a')}</span>
            <span>Last Updated: {format(new Date(student.updatedAt), 'dd MMM yyyy, hh:mm a')}</span>
          </div>
        </TabsContent>

        {/* ACADEMIC */}
        <TabsContent value="academic">
          <Card>
            <CardHeader><CardTitle className="text-base">Academic History</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              {(student.academics?.length ?? 0) > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase text-gray-500">
                      <th className="pb-2 pr-4">Qualification</th>
                      <th className="pb-2 pr-4">Subjects/Stream</th>
                      <th className="pb-2 pr-4">College/Board</th>
                      <th className="pb-2 pr-4">%</th>
                      <th className="pb-2 pr-4">Backlogs</th>
                      <th className="pb-2">Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.academics!.map((row, i) => (
                      <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 pr-4 font-medium">{row.qualification}</td>
                        <td className="py-3 pr-4">{row.subjects}</td>
                        <td className="py-3 pr-4">{row.college}</td>
                        <td className="py-3 pr-4">{row.percentage}</td>
                        <td className="py-3 pr-4">{row.backlogs}</td>
                        <td className="py-3">{row.yearOfPassing}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="py-8 text-center text-gray-500">No academic records added</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PROFICIENCY */}
        <TabsContent value="tests">
          <div className="grid gap-4 sm:grid-cols-2">
            {(student.proficiencyTests?.length ?? 0) > 0 ? (
              student.proficiencyTests!.map((test) => (
                <Card key={test.type}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">
                      {test.type}
                      <StatusBadge status="Completed" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3">
                    <InfoField label="Overall" value={test.overall} />
                    {test.listening && <InfoField label="Listening" value={test.listening} />}
                    {test.reading && <InfoField label="Reading" value={test.reading} />}
                    {test.writing && <InfoField label="Writing" value={test.writing} />}
                    {test.speaking && <InfoField label="Speaking" value={test.speaking} />}
                    {test.testDate && <InfoField label="Test Date" value={format(new Date(test.testDate), 'dd MMM yyyy')} />}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="col-span-2">
                <CardContent className="py-8 text-center text-gray-500">No proficiency tests recorded</CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* WORK */}
        <TabsContent value="work">
          <Card>
            <CardHeader><CardTitle className="text-base">Work Experience</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              {(student.workExperience?.length ?? 0) > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase text-gray-500">
                      <th className="pb-2 pr-4">Company</th>
                      <th className="pb-2 pr-4">Position</th>
                      <th className="pb-2 pr-4">Start</th>
                      <th className="pb-2 pr-4">End</th>
                      <th className="pb-2">Experience</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.workExperience!.map((row, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-3 pr-4 font-medium">{row.companyName}</td>
                        <td className="py-3 pr-4">{row.position}</td>
                        <td className="py-3 pr-4">{row.startDate}</td>
                        <td className="py-3 pr-4">{row.endDate}</td>
                        <td className="py-3">{row.totalExperience}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="py-8 text-center text-gray-500">No work experience recorded</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* APPLICATIONS */}
        <TabsContent value="applications">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">University Applications</CardTitle>
              {isAdmin && (
                <Button size="sm" asChild>
                  <Link to={`${prefix}/application`}>+ Add Application</Link>
                </Button>
              )}
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {applications.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase text-gray-500">
                      <th className="pb-2 pr-4">University</th>
                      <th className="pb-2 pr-4">Country</th>
                      <th className="pb-2 pr-4">Course</th>
                      <th className="pb-2 pr-4">Intake</th>
                      <th className="pb-2 pr-4">Status</th>
                      <th className="pb-2">Doc. Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.id} className="border-b border-gray-100">
                        <td className="py-3 pr-4 font-medium">{app.university}</td>
                        <td className="py-3 pr-4">{app.intCountry}</td>
                        <td className="py-3 pr-4">{app.intCourse}</td>
                        <td className="py-3 pr-4">{app.intake}</td>
                        <td className="py-3 pr-4"><StatusBadge status={app.status} /></td>
                        <td className="py-3"><StatusBadge status={app.docStatus} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="py-8 text-center text-gray-500">No applications yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* VISA */}
        <TabsContent value="visa">
          <Card>
            <CardHeader><CardTitle className="text-base">Visa Applications</CardTitle></CardHeader>
            <CardContent>
              {visas.length > 0 ? (
                <div className="space-y-4">
                  {visas.map((visa) => (
                    <div key={visa.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">{visa.university}</p>
                          <p className="text-sm text-gray-500">{visa.appliedCountry} · {visa.course} · {visa.intake}</p>
                        </div>
                        <StatusBadge status={visa.visaStatus} />
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                        <InfoField label="Passport" value={visa.passportNo} />
                        <InfoField label="Assigned To" value={visa.assignedTo} />
                        <InfoField label="Doc. Status" value={visa.docStatus} />
                        <InfoField label="Updated" value={format(new Date(visa.updatedAt), 'dd MMM yyyy')} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-gray-500">No visa records yet</p>
              )}
            </CardContent>
          </Card>
          {enrolled.length > 0 && (
            <Card className="mt-4">
              <CardHeader><CardTitle className="text-base text-success">Enrolled</CardTitle></CardHeader>
              <CardContent>
                {enrolled.map((e) => (
                  <div key={e.id} className="text-sm">
                    <p className="font-medium">{e.appliedUniversity} — {e.course}</p>
                    <p className="text-gray-500">{e.appliedCountry} · Intake {e.intake}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* DOCUMENTS */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Document Checklist</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {DOC_CHECKLIST.map((doc, i) => {
                const state = getDocStatus(doc, i)
                return (
                  <DocumentUploader
                    key={doc}
                    label={doc}
                    status={state.status}
                    fileName={state.fileName}
                    onUpload={() => {
                      setDocStates((s) => ({ ...s, [doc]: { status: 'Uploaded', fileName: `${doc.toLowerCase().replace(/\s/g, '-')}.pdf` } }))
                      logActivity('student', id!, 'Document uploaded', doc)
                      toast.success(`${doc} uploaded`)
                    }}
                  />
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* INVOICES */}
        <TabsContent value="invoices">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Student Invoices</CardTitle>
              {isAdmin && (
                <Button size="sm" asChild>
                  <Link to={`${prefix}/accounts/student-invoices`}>+ Create Invoice</Link>
                </Button>
              )}
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {invoices.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase text-gray-500">
                      <th className="pb-2 pr-4">Invoice ID</th>
                      <th className="pb-2 pr-4">Service</th>
                      <th className="pb-2 pr-4">Grand Total</th>
                      <th className="pb-2 pr-4">Paid</th>
                      <th className="pb-2 pr-4">Pending</th>
                      <th className="pb-2 pr-4">Due Date</th>
                      <th className="pb-2 pr-4">Status</th>
                      <th className="pb-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="border-b border-gray-100">
                        <td className="py-3 pr-4 font-mono text-xs">{inv.invoiceId}</td>
                        <td className="py-3 pr-4">{inv.serviceType}</td>
                        <td className="py-3 pr-4">{formatCurrency(inv.grandTotal, inv.currency)}</td>
                        <td className="py-3 pr-4">{formatCurrency(inv.paidAmount, inv.currency)}</td>
                        <td className="py-3 pr-4">{formatCurrency(inv.pendingAmount, inv.currency)}</td>
                        <td className="py-3 pr-4">{format(new Date(inv.dueDate), 'dd MMM yyyy')}</td>
                        <td className="py-3 pr-4"><StatusBadge status={inv.status} /></td>
                        <td className="py-3">
                          <Button size="sm" variant="outline" onClick={() => setInvoicePreview(inv)}>View</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="py-8 text-center text-gray-500">No invoices yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TIMELINE */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader><CardTitle className="text-base">Activity Timeline</CardTitle></CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <div className="relative space-y-0">
                  {activities.map((act, i) => (
                    <div key={act.id} className="flex gap-4 pb-6">
                      <div className="flex flex-col items-center">
                        <div className="size-3 rounded-full bg-primary" />
                        {i < activities.length - 1 && <div className="w-px flex-1 bg-gray-200" />}
                      </div>
                      <div className="flex-1 pb-2">
                        <p className="text-sm font-medium">{act.action}</p>
                        {act.detail && <p className="text-sm text-gray-600">{act.detail}</p>}
                        <p className="mt-1 text-xs text-gray-400">
                          {act.user} · {format(new Date(act.createdAt), 'dd MMM yyyy, hh:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-gray-500">No activity recorded yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTES */}
        <TabsContent value="notes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Internal Notes</CardTitle>
              <Button size="sm" onClick={() => setNotesOpen(true)}>
                <MessageSquarePlus className="size-4" />
                Add Note
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {notes.length > 0 ? (
                notes.map((note) => (
                  <div key={note.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                    <p className="text-sm text-gray-800 dark:text-gray-200">{note.text}</p>
                    <p className="mt-2 text-xs text-gray-400">
                      {note.user} · {format(new Date(note.createdAt), 'dd MMM yyyy, hh:mm a')}
                    </p>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-gray-500">No notes yet. Click Add Note to create one.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <NotesDialog open={notesOpen} onOpenChange={setNotesOpen} entityType="student" entityId={id!} title={`Notes — ${fullName}`} />
      <AssignStaffModal open={assignOpen} onOpenChange={setAssignOpen} onAssign={(staff) => { toast.success(`Assigned to ${staff}`); logActivity('student', id!, 'Assigned to', staff) }} />
      <ConvertToApplicationDialog
        open={applicationOpen}
        onOpenChange={setApplicationOpen}
        loading={convertMutation.isPending}
        onConfirm={() => {
          if (student) convertMutation.mutate(student)
        }}
      />
      <BulkMessageModal open={messageOpen} onOpenChange={setMessageOpen} channel="email" recipientCount={1} />
      {invoicePreview && (
        <InvoicePdfPreview open={!!invoicePreview} onOpenChange={() => setInvoicePreview(null)} invoice={invoicePreview} />
      )}
    </PageShell>
  )
}
