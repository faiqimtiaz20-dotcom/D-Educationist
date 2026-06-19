import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { FileCheck, CalendarClock, MessageSquarePlus, Plus } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { DataTable } from '@/components/data-display/DataTable'
import { QuickFilterTabs } from '@/components/filters/QuickFilterTabs'
import { FilterPanel } from '@/components/filters/FilterPanel'
import { ViewModeToggle } from '@/components/filters/ViewModeToggle'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton'
import { KanbanBoard, useKanbanColumns } from '@/components/kanban/KanbanBoard'
import { AssignStaffModal } from '@/components/modals/AssignStaffModal'
import { FollowupAppointmentModal } from '@/components/modals/FollowupAppointmentModal'
import { ConvertToApplicationDialog } from '@/components/modals/ConvertToApplicationDialog'
import { NotesDialog } from '@/components/modals/NotesDialog'
import { BulkActionBar } from '@/features/shared/BulkActionBar'
import { FilterSelect } from '@/features/shared/FilterField'
import { Button } from '@/components/ui/button'
import { IconTooltip } from '@/components/ui/icon-tooltip'
import { studentService } from '@/services'
import { STUDENT_STATUSES, BRANCHES } from '@/lib/constants'
import { exportToCsv } from '@/lib/exportCsv'
import { formatScheduleCell } from '@/lib/table'
import type { Student } from '@/types'
import { format } from 'date-fns'
import { type PortalPageProps, usePortalContext } from '@/features/shared/portal'
import { useConvertToApplication } from '@/features/student/useConvertToApplication'

const EXPORT_COLUMNS: { key: keyof Student; header: string }[] = [
  { key: 'studentId', header: 'Student ID' },
  { key: 'firstName', header: 'First Name' },
  { key: 'lastName', header: 'Last Name' },
  { key: 'email', header: 'Email' },
  { key: 'mobile', header: 'Mobile' },
  { key: 'status', header: 'Status' },
  { key: 'docStatus', header: 'Doc. Status' },
  { key: 'branch', header: 'Branch' },
]

export function ViewStudentPage(props: PortalPageProps = {}) {
  const { prefix, partnerId, isAdmin } = usePortalContext(props)
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') ?? 'all')
  const [branchFilter, setBranchFilter] = useState('')
  const [docFilter, setDocFilter] = useState(searchParams.get('docStatus') ?? '')
  const [selected, setSelected] = useState<Student[]>([])
  const [notesTarget, setNotesTarget] = useState<Student | null>(null)
  const [followupTarget, setFollowupTarget] = useState<Student | null>(null)
  const [applicationTarget, setApplicationTarget] = useState<Student | null>(null)
  const [assignOpen, setAssignOpen] = useState(false)

  const convertMutation = useConvertToApplication(prefix)

  const { data, isLoading } = useQuery({
    queryKey: ['students', statusFilter, partnerId],
    queryFn: () =>
      studentService.getAll({
        pageSize: 100,
        status: statusFilter === 'all' ? undefined : statusFilter,
        partnerId,
      }),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      studentService.update(id, { status }),
    onSuccess: () => {
      toast.success('Status updated')
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
    onError: () => toast.error('Failed to update status'),
  })

  const assignMutation = useMutation({
    mutationFn: ({ ids, assignedTo }: { ids: string[]; assignedTo: string }) =>
      Promise.all(ids.map((id) => studentService.update(id, { assignedTo }))),
    onSuccess: () => {
      toast.success('Staff assigned')
      setSelected([])
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
    onError: () => toast.error('Failed to assign staff'),
  })

  const students = useMemo(() => {
    let items = data?.data ?? []
    if (branchFilter) items = items.filter((s) => s.branch === branchFilter)
    if (docFilter) items = items.filter((s) => s.docStatus === docFilter)
    return items
  }, [data, branchFilter, docFilter])

  const kanbanColumns = useKanbanColumns(students, 'status', STUDENT_STATUSES)

  const statusCounts = useMemo(() => {
    const all = data?.data ?? []
    return [
      { label: 'All', value: 'all', count: all.length },
      ...STUDENT_STATUSES.map((s) => ({
        label: s,
        value: s,
        count: all.filter((st) => st.status === s).length,
      })),
    ]
  }, [data])

  const handleExport = (rows: Student[]) => {
    exportToCsv(rows, EXPORT_COLUMNS, `students-${format(new Date(), 'yyyy-MM-dd')}`)
    toast.success(`Exported ${rows.length} student record(s)`)
  }

  const columns: ColumnDef<Student>[] = [
    { accessorKey: 'studentId', header: 'Student ID' },
    {
      id: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <Link
          to={`${prefix}/student/${row.original.id}`}
          className="whitespace-nowrap font-medium text-primary hover:underline"
        >
          {row.original.firstName} {row.original.lastName}
        </Link>
      ),
    },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'mobile', header: 'Mobile' },
    { accessorKey: 'interestedCourse', header: 'Course' },
    { accessorKey: 'interestedCountry', header: 'Country' },
    { accessorKey: 'intake', header: 'Intake' },
    { accessorKey: 'applyLevel', header: 'Level' },
    { accessorKey: 'source', header: 'Source' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} compact />,
    },
    {
      accessorKey: 'docStatus',
      header: 'Doc. Status',
      cell: ({ row }) => <StatusBadge status={row.original.docStatus} compact />,
    },
    { accessorKey: 'passportNo', header: 'Passport' },
    ...(isAdmin ? [{ accessorKey: 'branch', header: 'Branch' } as ColumnDef<Student>] : []),
    ...(isAdmin ? [{ accessorKey: 'assignedTo', header: 'Assigned To' } as ColumnDef<Student>] : []),
    ...(isAdmin
      ? [{
          accessorKey: 'partnerName',
          header: 'Partner',
          cell: ({ row }: { row: { original: Student } }) => row.original.partnerName ?? '—',
        } as ColumnDef<Student>]
      : []),
    {
      id: 'followUp',
      header: 'Follow Up',
      cell: ({ row }) => formatScheduleCell(row.original.followUp),
    },
    {
      id: 'appointment',
      header: 'Appointment',
      cell: ({ row }) => formatScheduleCell(row.original.appointment),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => format(new Date(row.original.createdAt), 'dd MMM yyyy'),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex w-max flex-nowrap items-center gap-1">
          <IconTooltip label="Follow Up">
            <Button
              variant="outline"
              size="sm"
              className="size-6 p-0"
              aria-label="Follow Up"
              onClick={() => setFollowupTarget(row.original)}
            >
              <CalendarClock className="size-3" />
            </Button>
          </IconTooltip>
          <IconTooltip label="Notes">
            <Button
              variant="outline"
              size="sm"
              className="size-6 p-0"
              aria-label="Notes"
              onClick={() => setNotesTarget(row.original)}
            >
              <MessageSquarePlus className="size-3" />
            </Button>
          </IconTooltip>
          <IconTooltip label="Ready For Application">
            <Button
              variant="outline"
              size="sm"
              className="size-6 p-0"
              aria-label="Ready For Application"
              onClick={() => setApplicationTarget(row.original)}
            >
              <FileCheck className="size-3" />
            </Button>
          </IconTooltip>
        </div>
      ),
    },
  ]

  const renderKanbanCard = (student: Student) => (
    <div className="space-y-1">
      <Link
        to={`${prefix}/student/${student.id}`}
        className="text-sm font-medium text-primary hover:underline"
      >
        {student.firstName} {student.lastName}
      </Link>
      <p className="text-xs text-gray-500">{student.studentId}</p>
      <p className="text-xs">{student.interestedCourse} · {student.interestedCountry}</p>
      <StatusBadge status={student.docStatus} />
    </div>
  )

  return (
    <PageShell
      title="View Student"
      breadcrumbs={[{ label: 'Student' }]}
      action={
        <div className="flex flex-wrap items-center gap-2">
          <ViewModeToggle value={viewMode} onChange={setViewMode} />
          <Button asChild>
            <Link to={`${prefix}/student/add`}>
              <Plus className="size-4" />
              Add Student
            </Link>
          </Button>
        </div>
      }
    >
      <QuickFilterTabs options={statusCounts} value={statusFilter} onChange={setStatusFilter} />

      <FilterPanel className="mt-4">
        <FilterSelect
          label="Branch"
          value={branchFilter}
          onChange={setBranchFilter}
          options={BRANCHES.map((b) => ({ label: b, value: b }))}
        />
        <FilterSelect
          label="Doc. Status"
          value={docFilter}
          onChange={setDocFilter}
          options={[
            { label: 'Pending', value: 'Pending' },
            { label: 'Completed', value: 'Completed' },
          ]}
        />
      </FilterPanel>

      <BulkActionBar
        count={selected.length}
        className="mt-4"
        onExport={() => handleExport(selected.length ? selected : students)}
        onAssign={isAdmin ? () => setAssignOpen(true) : undefined}
      />

      {isLoading ? (
        <LoadingSkeleton className="mt-4" />
      ) : viewMode === 'table' ? (
        <DataTable
          data={students}
          columns={columns}
          enableRowSelection={isAdmin}
          onRowSelectionChange={isAdmin ? setSelected : undefined}
          searchPlaceholder="Search students..."
          className="mt-4"
          mobileRender={(row) => (
            <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link
                    to={`${prefix}/student/${row.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {row.firstName} {row.lastName}
                  </Link>
                  <p className="text-xs text-gray-500">{row.studentId}</p>
                </div>
                <StatusBadge status={row.docStatus} />
              </div>
              <p className="text-sm text-gray-500">{row.interestedCourse} · {row.interestedCountry}</p>
              <div className="flex gap-1">
                <IconTooltip label="Follow Up">
                  <Button
                    size="sm"
                    variant="outline"
                    className="size-7 p-0"
                    aria-label="Follow Up"
                    onClick={() => setFollowupTarget(row)}
                  >
                    <CalendarClock className="size-3.5" />
                  </Button>
                </IconTooltip>
                <IconTooltip label="Notes">
                  <Button
                    size="sm"
                    variant="outline"
                    className="size-7 p-0"
                    aria-label="Notes"
                    onClick={() => setNotesTarget(row)}
                  >
                    <MessageSquarePlus className="size-3.5" />
                  </Button>
                </IconTooltip>
                <IconTooltip label="Ready For Application">
                  <Button
                    size="sm"
                    variant="outline"
                    className="size-7 p-0"
                    aria-label="Ready For Application"
                    onClick={() => setApplicationTarget(row)}
                  >
                    <FileCheck className="size-3.5" />
                  </Button>
                </IconTooltip>
              </div>
            </div>
          )}
        />
      ) : (
        <KanbanBoard
          className="mt-4"
          columns={kanbanColumns}
          getItemId={(s) => s.id}
          renderCard={renderKanbanCard}
          onMove={
            isAdmin
              ? (itemId, _from, toColumn) =>
                  statusMutation.mutate({ id: itemId, status: toColumn })
              : undefined
          }
        />
      )}

      <ConvertToApplicationDialog
        open={!!applicationTarget}
        onOpenChange={(open) => !open && setApplicationTarget(null)}
        loading={convertMutation.isPending}
        onConfirm={() => {
          if (!applicationTarget) return
          convertMutation.mutate(applicationTarget, {
            onSuccess: () => setApplicationTarget(null),
          })
        }}
      />

      <FollowupAppointmentModal
        open={!!followupTarget}
        onOpenChange={(open) => !open && setFollowupTarget(null)}
        entityType="student"
        entity={followupTarget}
        profileHref={followupTarget ? `${prefix}/student/${followupTarget.id}` : ''}
        statusOptions={STUDENT_STATUSES}
        dropStatus="On Hold"
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['students'] })}
      />

      <NotesDialog
        open={!!notesTarget}
        onOpenChange={(open) => !open && setNotesTarget(null)}
        entityType="student"
        entityId={notesTarget?.id ?? ''}
        title={notesTarget ? `${notesTarget.firstName} ${notesTarget.lastName}` : ''}
      />

      <AssignStaffModal
        open={assignOpen}
        onOpenChange={setAssignOpen}
        onAssign={(staff) =>
          assignMutation.mutate({ ids: selected.map((s) => s.id), assignedTo: staff })
        }
      />
    </PageShell>
  )
}
