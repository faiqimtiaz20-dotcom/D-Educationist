import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { isAxiosError } from 'axios'
import { format } from 'date-fns'
import {
  Edit,
  Eye,
  Globe,
  History,
  MessageSquarePlus,
  Plus,
  Trash2,
  Users,
  LayoutList,
} from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { DataTable } from '@/components/data-display/DataTable'
import { QuickFilterTabs } from '@/components/filters/QuickFilterTabs'
import { FilterPanel } from '@/components/filters/FilterPanel'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton'
import { BulkMessageModal, type BulkMessageChannel } from '@/components/modals/BulkMessageModal'
import { NotesDialog } from '@/components/modals/NotesDialog'
import { HistoryDrawer } from '@/components/drawers/HistoryDrawer'
import { AssignStaffModal } from '@/components/modals/AssignStaffModal'
import { AddUniversityApplicationModal } from '@/components/modals/AddUniversityApplicationModal'
import { ApplicationCommentModal } from '@/components/modals/ApplicationCommentModal'
import { BulkActionBar } from '@/features/shared/BulkActionBar'
import { FilterSelect } from '@/features/shared/FilterField'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { IconTooltip } from '@/components/ui/icon-tooltip'
import { Badge } from '@/components/ui/badge'
import { applicationService } from '@/services'
import { BRANCHES, APPLICATION_STATUSES, BRAND } from '@/lib/constants'
import { exportToCsv } from '@/lib/exportCsv'
import { logActivity } from '@/mocks/data/activities'
import type { Application } from '@/types'
import { type PortalPageProps, usePortalContext } from '@/features/shared/portal'
import {
  filterApplicationsByScope,
  filterStudentGroupsByScope,
  getApplicationRowClass,
  getStudentGroupRowClass,
  groupApplicationsByStudent,
  type StudentApplicationGroup,
} from '@/features/application/groupApplicationsByStudent'
import { cn } from '@/lib/utils'

type ListView = 'by-student' | 'all'

const BY_STUDENT_FILTERS = [
  { label: 'All Applications', value: 'all' },
  { label: BRAND.directApplicationLabel, value: BRAND.directScopeKey },
  { label: 'Partner Application', value: 'partner' },
  { label: 'Pending', value: 'pending' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Finalized', value: 'finalized' },
  { label: 'Offer Received', value: 'offer' },
] as const

const ALL_APPLICATION_FILTERS = [
  { label: 'All Application', value: 'all' },
  { label: 'Assigned Application', value: 'assigned' },
  { label: 'Unassigned Application', value: 'unassigned' },
  { label: 'Partner Application', value: 'partner' },
  { label: BRAND.directApplicationLabel, value: BRAND.directScopeKey },
] as const

const EXPORT_COLUMNS: { key: keyof Application; header: string }[] = [
  { key: 'studentRef', header: 'Student ID' },
  { key: 'studentName', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'university', header: 'University' },
  { key: 'intCountry', header: 'Country' },
  { key: 'intCourse', header: 'Course' },
  { key: 'status', header: 'Status' },
  { key: 'branch', header: 'Branch' },
]

function DateRangeCell({ createdAt, updatedAt }: { createdAt: string; updatedAt: string }) {
  return (
    <div className="space-y-0.5 text-xs leading-tight">
      <div>{format(new Date(createdAt), 'dd/MM/yyyy hh:mm a')}</div>
      <div className="text-gray-500">{format(new Date(updatedAt), 'dd/MM/yyyy hh:mm a')}</div>
    </div>
  )
}

function ListViewToggle({
  value,
  onChange,
}: {
  value: ListView
  onChange: (value: ListView) => void
}) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5">
      <Button
        type="button"
        variant={value === 'by-student' ? 'default' : 'ghost'}
        size="sm"
        className="h-8 gap-1.5"
        onClick={() => onChange('by-student')}
      >
        <Users className="size-4" />
        By Student
      </Button>
      <Button
        type="button"
        variant={value === 'all' ? 'default' : 'ghost'}
        size="sm"
        className="h-8 gap-1.5"
        onClick={() => onChange('all')}
      >
        <LayoutList className="size-4" />
        All Applications
      </Button>
    </div>
  )
}

export function ApplicationsPage(props: PortalPageProps = {}) {
  const { prefix, partnerId, isAdmin, isPartner } = usePortalContext(props)
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialStudent = searchParams.get('student')

  const [listView, setListView] = useState<ListView>(initialStudent ? 'all' : 'by-student')
  const [scopeFilter, setScopeFilter] = useState('all')
  const [branchFilter, setBranchFilter] = useState('')
  const [studentFilter, setStudentFilter] = useState<string | null>(initialStudent)
  const [selectedApplications, setSelectedApplications] = useState<Application[]>([])
  const [selectedGroups, setSelectedGroups] = useState<StudentApplicationGroup[]>([])
  const [messageChannel, setMessageChannel] = useState<BulkMessageChannel | null>(null)
  const [assignOpen, setAssignOpen] = useState(false)
  const [notesTarget, setNotesTarget] = useState<StudentApplicationGroup | null>(null)
  const [historyTarget, setHistoryTarget] = useState<StudentApplicationGroup | null>(null)
  const [addApplicationTarget, setAddApplicationTarget] = useState<StudentApplicationGroup | null>(null)
  const [editApplicationTarget, setEditApplicationTarget] = useState<Application | null>(null)
  const [commentTarget, setCommentTarget] = useState<Application | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['applications', partnerId, isPartner],
    queryFn: () =>
      applicationService.getAll({
        pageSize: 200,
        partnerId,
        isPartner: isPartner ? true : undefined,
      }),
  })

  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) => applicationService.delete(ids),
    onSuccess: () => {
      toast.success('Application(s) deleted')
      setSelectedApplications([])
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
    onError: () => toast.error('Failed to delete application(s)'),
  })

  const assignMutation = useMutation({
    mutationFn: ({ ids, assignedTo }: { ids: string[]; assignedTo: string }) =>
      Promise.all(ids.map((id) => applicationService.update(id, { assignedTo }))),
    onSuccess: () => {
      toast.success('Staff assigned')
      setSelectedApplications([])
      setAssignOpen(false)
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
    onError: () => toast.error('Failed to assign staff'),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      applicationService.update(id, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['applications'] })
      const queryKey = ['applications', partnerId, isPartner] as const
      const previous = queryClient.getQueryData<{ data: Application[] }>(queryKey)
      if (previous) {
        queryClient.setQueryData(queryKey, {
          ...previous,
          data: previous.data.map((app) =>
            app.id === id ? { ...app, status, updatedAt: new Date().toISOString() } : app,
          ),
        })
      }
      return { previous, queryKey }
    },
    onSuccess: (data, variables) => {
      logActivity(
        'student',
        data.studentId,
        'Application status updated',
        `Status changed to ${variables.status}`,
      )
      toast.success('Application status updated')
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.queryKey, context.previous)
      }
      const message =
        isAxiosError(error) && error.response?.status === 404
          ? 'Application not found — refresh the page and try again'
          : 'Failed to update status'
      toast.error(message)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
  })

  const allApplications = useMemo(() => {
    let items = data?.data ?? []
    if (branchFilter) items = items.filter((app) => app.branch === branchFilter)
    return items
  }, [data, branchFilter])

  const scopedApplications = useMemo(() => {
    let items = filterApplicationsByScope(allApplications, scopeFilter)
    if (studentFilter) items = items.filter((app) => app.studentId === studentFilter)
    return items
  }, [allApplications, scopeFilter, studentFilter])

  const studentGroups = useMemo(() => {
    const grouped = groupApplicationsByStudent(allApplications)
    return filterStudentGroupsByScope(grouped, scopeFilter)
  }, [allApplications, scopeFilter])

  const filteredStudentName = useMemo(() => {
    if (!studentFilter) return null
    return allApplications.find((app) => app.studentId === studentFilter)?.studentName ?? null
  }, [allApplications, studentFilter])

  const filterOptions = useMemo(() => {
    const source = listView === 'by-student' ? studentGroups : allApplications
    const base = listView === 'by-student' ? BY_STUDENT_FILTERS : ALL_APPLICATION_FILTERS

    return base.map((option) => {
      let count = source.length
      if (option.value !== 'all') {
        if (listView === 'by-student') {
          count = filterStudentGroupsByScope(
            groupApplicationsByStudent(allApplications),
            option.value,
          ).length
        } else {
          count = filterApplicationsByScope(allApplications, option.value).length
        }
      }
      return { ...option, count }
    })
  }, [allApplications, listView, studentGroups])

  const handleExport = (rows: Application[]) => {
    exportToCsv(rows, EXPORT_COLUMNS, `applications-${format(new Date(), 'yyyy-MM-dd')}`)
    toast.success(`Exported ${rows.length} application record(s)`)
  }

  const openStudentApplications = (studentId: string) => {
    setStudentFilter(studentId)
    setListView('all')
    setScopeFilter('all')
    setSearchParams({ student: studentId })
  }

  const clearStudentFilter = () => {
    setStudentFilter(null)
    setSearchParams({})
  }

  const handleListViewChange = (view: ListView) => {
    setListView(view)
    setScopeFilter('all')
    if (view === 'by-student') clearStudentFilter()
    setSelectedApplications([])
    setSelectedGroups([])
  }

  const handleAddApplication = (group: StudentApplicationGroup) => {
    setEditApplicationTarget(null)
    setAddApplicationTarget(group)
  }

  const handleEditApplication = (application: Application) => {
    setAddApplicationTarget(null)
    setEditApplicationTarget(application)
  }

  const closeApplicationModal = () => {
    setAddApplicationTarget(null)
    setEditApplicationTarget(null)
  }

  const studentColumns: ColumnDef<StudentApplicationGroup>[] = [
    {
      id: 'dates',
      header: 'Created - Updated',
      cell: ({ row }) => (
        <DateRangeCell createdAt={row.original.createdAt} updatedAt={row.original.updatedAt} />
      ),
    },
    {
      id: 'overview',
      header: 'Overview',
      cell: ({ row }) => (
        <div className="flex w-max flex-col gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-6 px-2 text-[10px]"
            onClick={() => setHistoryTarget(row.original)}
          >
            <History className="size-3" />
            History
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-6 px-2 text-[10px]"
            onClick={() => setNotesTarget(row.original)}
          >
            <MessageSquarePlus className="size-3" />
            Notes
          </Button>
          <Button variant="outline" size="sm" className="h-6 px-2 text-[10px]" asChild>
            <Link to={`${prefix}/visa?student=${row.original.studentId}`}>
              <Globe className="size-3" />
              Ready For Visa
            </Link>
          </Button>
        </div>
      ),
    },
    {
      id: 'student',
      header: 'ID - Name',
      cell: ({ row }) => (
        <div className="min-w-[10rem]">
          <p className="text-xs text-gray-500">{row.original.studentRef}</p>
          <Link
            to={`${prefix}/student/${row.original.studentId}`}
            className="font-medium text-primary hover:underline"
          >
            {row.original.studentName}
          </Link>
        </div>
      ),
    },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'mobile', header: 'Mobile' },
    {
      id: 'applications',
      header: 'Application',
      cell: ({ row }) => (
        <div className="flex min-w-[8rem] flex-col gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => openStudentApplications(row.original.studentId)}
          >
            {row.original.applicationCount} Application
            {row.original.applicationCount > 1 ? 's' : ''}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto justify-start p-0 text-xs text-primary hover:text-primary/80"
            onClick={() => handleAddApplication(row.original)}
          >
            <Plus className="size-3" />
            Add Application
          </Button>
        </div>
      ),
    },
    {
      accessorKey: 'docStatus',
      header: 'Doc. Status',
      cell: ({ row }) => <StatusBadge status={row.original.docStatus} compact />,
    },
    { accessorKey: 'assignedBy', header: 'Assigned By' },
    { accessorKey: 'assignedTo', header: 'Assigned To' },
    { accessorKey: 'intCountry', header: 'Int. Country' },
    { accessorKey: 'intake', header: 'Intake' },
    { accessorKey: 'intCourse', header: 'Int. Course' },
    { accessorKey: 'applyLevel', header: 'Apply Level' },
    { accessorKey: 'passportNo', header: 'Passport No' },
    {
      accessorKey: 'dateOfBirth',
      header: 'Date of Birth',
      cell: ({ row }) =>
        row.original.dateOfBirth
          ? format(new Date(row.original.dateOfBirth), 'dd/MM/yyyy')
          : '—',
    },
    { accessorKey: 'branch', header: 'Branch' },
    ...(isAdmin
      ? [{
          accessorKey: 'partnerName',
          header: 'Partner',
          cell: ({ row }: { row: { original: StudentApplicationGroup } }) =>
            row.original.partnerName ?? '—',
        } as ColumnDef<StudentApplicationGroup>]
      : []),
    {
      id: 'view',
      header: 'View',
      cell: ({ row }) => (
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs" asChild>
          <Link to={`${prefix}/student/${row.original.studentId}`}>
            <Eye className="size-3" />
            View
          </Link>
        </Button>
      ),
    },
  ]

  const allColumns: ColumnDef<Application>[] = [
    {
      id: 'dates',
      header: 'Created - Updated',
      cell: ({ row }) => (
        <DateRangeCell createdAt={row.original.createdAt} updatedAt={row.original.updatedAt} />
      ),
    },
    ...(isAdmin
      ? [{
          id: 'actions',
          header: 'Action',
          cell: ({ row }: { row: { original: Application } }) => (
            <div className="flex items-center gap-1">
              <IconTooltip label="Edit">
                <Button
                  variant="outline"
                  size="sm"
                  className="size-6 p-0 text-orange-600"
                  aria-label="Edit"
                  onClick={() => handleEditApplication(row.original)}
                >
                  <Edit className="size-3" />
                </Button>
              </IconTooltip>
              <IconTooltip label="Delete">
                <Button
                  variant="outline"
                  size="sm"
                  className="size-6 p-0 text-danger"
                  onClick={() => deleteMutation.mutate([row.original.id])}
                >
                  <Trash2 className="size-3" />
                </Button>
              </IconTooltip>
              {row.original.status === 'Finalized' && (
                <Badge variant="success" className="text-[10px]">
                  Finalized
                </Badge>
              )}
            </div>
          ),
        } as ColumnDef<Application>]
      : []),
    {
      id: 'student',
      header: 'ID - Name',
      cell: ({ row }) => (
        <div className="min-w-[10rem]">
          <p className="text-xs text-gray-500">{row.original.studentRef}</p>
          <Link
            to={`${prefix}/student/${row.original.studentId}`}
            className="font-medium text-primary hover:underline"
          >
            {row.original.studentName}
          </Link>
        </div>
      ),
    },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'mobile', header: 'Mobile' },
    { accessorKey: 'intCountry', header: 'Country' },
    { accessorKey: 'university', header: 'University' },
    { accessorKey: 'intCourse', header: 'Course' },
    { accessorKey: 'intake', header: 'Intake' },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <div className="flex w-[11.5rem] flex-col gap-1.5">
          <Select
            value={row.original.status}
            onChange={(e) => {
              const status = e.target.value
              if (!status || status === row.original.status) return
              statusMutation.mutate({ id: row.original.id, status })
            }}
            className="h-8 min-w-[10.5rem] text-xs"
            disabled={
              !isAdmin ||
              (statusMutation.isPending && statusMutation.variables?.id === row.original.id)
            }
          >
            <option value="">Select Status</option>
            {APPLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="h-7 justify-start gap-1.5 px-2 text-[10px] shadow-sm"
            onClick={() => setCommentTarget(row.original)}
          >
            <History className="size-3 shrink-0" />
            View Application History
          </Button>
        </div>
      ),
    },
    {
      id: 'associate',
      header: 'Associate',
      cell: ({ row }) => row.original.associate ?? row.original.partnerName ?? '—',
    },
    { accessorKey: 'assignedBy', header: 'Assigned By' },
    { accessorKey: 'assignedTo', header: 'Assigned To' },
    ...(isAdmin
      ? [{
          accessorKey: 'partnerName',
          header: 'Partner',
          cell: ({ row }: { row: { original: Application } }) => row.original.partnerName ?? '—',
        } as ColumnDef<Application>]
      : []),
  ]

  return (
    <PageShell
      title="Applications"
      breadcrumbs={[
        { label: 'Application', href: `${prefix}/application` },
        ...(listView === 'all'
          ? [{ label: studentFilter && filteredStudentName ? filteredStudentName : 'All Application' }]
          : []),
      ]}
      action={<ListViewToggle value={listView} onChange={handleListViewChange} />}
    >
      <QuickFilterTabs
        options={filterOptions}
        value={scopeFilter}
        onChange={setScopeFilter}
      />

      {studentFilter && filteredStudentName && listView === 'all' && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-sm">
          <span>
            Showing all applications for{' '}
            <strong className="text-primary">{filteredStudentName}</strong>
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const group = studentGroups.find((item) => item.studentId === studentFilter)
                if (group) handleAddApplication(group)
              }}
            >
              <Plus className="size-3.5" />
              Add Application
            </Button>
            <Button variant="ghost" size="sm" onClick={clearStudentFilter}>
              View all students
            </Button>
          </div>
        </div>
      )}

      <FilterPanel className="mt-4">
        <FilterSelect
          label="Branch"
          value={branchFilter}
          onChange={setBranchFilter}
          options={BRANCHES.map((branch) => ({ label: branch, value: branch }))}
        />
      </FilterPanel>

      {listView === 'by-student' && (
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-yellow-100 ring-1 ring-yellow-300" />
            Submitted
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-green-100 ring-1 ring-green-300" />
            Finalized
          </span>
        </div>
      )}

      <BulkActionBar
        count={listView === 'by-student' ? selectedGroups.length : selectedApplications.length}
        className="mt-4"
        onDelete={
          isAdmin && listView === 'all'
            ? () => deleteMutation.mutate(selectedApplications.map((app) => app.id))
            : undefined
        }
        onExport={() =>
          handleExport(
            listView === 'all'
              ? selectedApplications.length
                ? selectedApplications
                : scopedApplications
              : selectedGroups.flatMap((group) => group.applications),
          )
        }
        onAssign={isAdmin && listView === 'all' ? () => setAssignOpen(true) : undefined}
        onEmail={() => setMessageChannel('email')}
        onSms={() => setMessageChannel('sms')}
        onWhatsapp={() => setMessageChannel('whatsapp')}
      />

      {isLoading ? (
        <LoadingSkeleton className="mt-4" />
      ) : listView === 'by-student' ? (
        <DataTable
          data={studentGroups}
          columns={studentColumns}
          enableRowSelection={isAdmin}
          onRowSelectionChange={isAdmin ? setSelectedGroups : undefined}
          searchPlaceholder="Name / Email / Mobile / Student ID..."
          className="mt-4"
          getRowClassName={getStudentGroupRowClass}
          mobileRender={(row) => (
            <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link
                    to={`${prefix}/student/${row.studentId}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {row.studentName}
                  </Link>
                  <p className="text-xs text-gray-500">{row.studentRef}</p>
                </div>
                <StatusBadge status={row.docStatus} />
              </div>
              <p className="text-sm text-gray-500">
                {row.intCourse} · {row.intCountry} · {row.intake}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => openStudentApplications(row.studentId)}
                >
                  {row.applicationCount} Application{row.applicationCount > 1 ? 's' : ''}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => handleAddApplication(row)}
                >
                  Add Application
                </Button>
              </div>
            </div>
          )}
        />
      ) : (
        <DataTable
          data={scopedApplications}
          columns={allColumns}
          enableRowSelection={isAdmin}
          onRowSelectionChange={isAdmin ? setSelectedApplications : undefined}
          searchPlaceholder="Name / Email / Mobile / University..."
          className="mt-4"
          getRowClassName={getApplicationRowClass}
          mobileRender={(row) => (
            <div
              className={cn(
                'space-y-2 rounded-lg border border-gray-200 bg-white p-4',
                getApplicationRowClass(row),
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <Link
                    to={`${prefix}/student/${row.studentId}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {row.studentName}
                  </Link>
                  <p className="text-xs text-gray-500">{row.studentRef}</p>
                </div>
                <StatusBadge status={row.status} />
              </div>
              <p className="text-sm">{row.university}</p>
              <p className="text-sm text-gray-500">
                {row.intCourse} · {row.intCountry} · {row.intake}
              </p>
            </div>
          )}
        />
      )}

      <ApplicationCommentModal
        open={!!commentTarget}
        onOpenChange={(open) => !open && setCommentTarget(null)}
        application={commentTarget}
      />

      <AddUniversityApplicationModal
        open={!!addApplicationTarget || !!editApplicationTarget}
        onOpenChange={(open) => !open && closeApplicationModal()}
        student={addApplicationTarget}
        application={editApplicationTarget}
        prefix={prefix}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['applications'] })}
      />

      <NotesDialog
        open={!!notesTarget}
        onOpenChange={(open) => !open && setNotesTarget(null)}
        entityType="student"
        entityId={notesTarget?.studentId ?? ''}
        title={notesTarget?.studentName ?? ''}
      />

      <HistoryDrawer
        open={!!historyTarget}
        onOpenChange={(open) => !open && setHistoryTarget(null)}
        entityType="student"
        entityId={historyTarget?.studentId ?? ''}
        title={historyTarget?.studentName ?? ''}
      />

      <AssignStaffModal
        open={assignOpen}
        onOpenChange={setAssignOpen}
        onAssign={(staff) =>
          assignMutation.mutate({
            ids: selectedApplications.map((app) => app.id),
            assignedTo: staff,
          })
        }
      />

      <BulkMessageModal
        open={!!messageChannel}
        onOpenChange={(open) => !open && setMessageChannel(null)}
        channel={messageChannel ?? 'email'}
        recipientCount={
          listView === 'by-student'
            ? selectedGroups.length || studentGroups.length
            : selectedApplications.length || scopedApplications.length
        }
      />
    </PageShell>
  )
}
