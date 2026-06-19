import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { History, MessageSquarePlus, UserCheck, Plus, CalendarClock } from 'lucide-react'
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
import { MoveEnquiryToStudentModal } from '@/components/modals/MoveEnquiryToStudentModal'
import { NotesDialog } from '@/components/modals/NotesDialog'
import { BulkMessageModal, type BulkMessageChannel } from '@/components/modals/BulkMessageModal'
import { HistoryDrawer } from '@/components/drawers/HistoryDrawer'
import { BulkActionBar } from '@/features/shared/BulkActionBar'
import { FilterSelect } from '@/features/shared/FilterField'
import { Button } from '@/components/ui/button'
import { IconTooltip } from '@/components/ui/icon-tooltip'
import { Select } from '@/components/ui/select'
import { enquiryService } from '@/services'
import { ENQUIRY_STATUSES, BRANCHES, COUNTRIES } from '@/lib/constants'
import { exportToCsv } from '@/lib/exportCsv'
import { formatScheduleCell } from '@/lib/table'
import type { Enquiry } from '@/types'
import { format } from 'date-fns'
import { type PortalPageProps, usePortalContext } from '@/features/shared/portal'

const EXPORT_COLUMNS: { key: keyof Enquiry; header: string }[] = [
  { key: 'firstName', header: 'First Name' },
  { key: 'lastName', header: 'Last Name' },
  { key: 'email', header: 'Email' },
  { key: 'mobile', header: 'Mobile' },
  { key: 'interestedCourse', header: 'Course' },
  { key: 'interestedCountry', header: 'Country' },
  { key: 'status', header: 'Status' },
  { key: 'branch', header: 'Branch' },
]

export function ViewEnquiryPage(props: PortalPageProps = {}) {
  const { partnerId, prefix, isAdmin } = usePortalContext(props)
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') ?? 'all')
  const [branchFilter, setBranchFilter] = useState('')
  const [countryFilter, setCountryFilter] = useState('')
  const [selected, setSelected] = useState<Enquiry[]>([])
  const [notesTarget, setNotesTarget] = useState<Enquiry | null>(null)
  const [followupTarget, setFollowupTarget] = useState<Enquiry | null>(null)
  const [registerTarget, setRegisterTarget] = useState<Enquiry | null>(null)
  const [historyTarget, setHistoryTarget] = useState<Enquiry | null>(null)
  const [assignOpen, setAssignOpen] = useState(false)
  const [messageChannel, setMessageChannel] = useState<BulkMessageChannel | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['enquiries', statusFilter, branchFilter, countryFilter, partnerId],
    queryFn: () =>
      enquiryService.getAll({
        pageSize: 100,
        status: statusFilter === 'all' ? undefined : statusFilter,
        partnerId,
      }),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      enquiryService.update(id, { status }),
    onSuccess: () => {
      toast.success('Status updated')
      queryClient.invalidateQueries({ queryKey: ['enquiries'] })
    },
    onError: () => toast.error('Failed to update status'),
  })

  const assignMutation = useMutation({
    mutationFn: ({ ids, assignedTo }: { ids: string[]; assignedTo: string }) =>
      Promise.all(ids.map((id) => enquiryService.update(id, { assignedTo }))),
    onSuccess: () => {
      toast.success('Staff assigned')
      setSelected([])
      queryClient.invalidateQueries({ queryKey: ['enquiries'] })
    },
    onError: () => toast.error('Failed to assign staff'),
  })

  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) => enquiryService.delete(ids),
    onSuccess: () => {
      toast.success('Enquiries deleted')
      setSelected([])
      queryClient.invalidateQueries({ queryKey: ['enquiries'] })
    },
    onError: () => toast.error('Failed to delete'),
  })

  const enquiries = useMemo(() => {
    let items = data?.data ?? []
    if (branchFilter) items = items.filter((e) => e.branch === branchFilter)
    if (countryFilter) items = items.filter((e) => e.interestedCountry === countryFilter)
    return items
  }, [data, branchFilter, countryFilter])

  const kanbanColumns = useKanbanColumns(enquiries, 'status', ENQUIRY_STATUSES)

  const statusCounts = useMemo(() => {
    const all = data?.data ?? []
    return [
      { label: 'All', value: 'all', count: all.length },
      ...ENQUIRY_STATUSES.map((s) => ({
        label: s,
        value: s,
        count: all.filter((e) => e.status === s).length,
      })),
    ]
  }, [data])

  const handleExport = (rows: Enquiry[]) => {
    exportToCsv(rows, EXPORT_COLUMNS, `enquiries-${format(new Date(), 'yyyy-MM-dd')}`)
    toast.success(`Exported ${rows.length} enquiry record(s)`)
  }

  const columns: ColumnDef<Enquiry>[] = [
    {
      id: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <Link
          to={`${prefix}/enquiry/${row.original.id}`}
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
      cell: ({ row }) =>
        isAdmin ? (
          <Select
            value={row.original.status}
            onChange={(e) =>
              statusMutation.mutate({ id: row.original.id, status: e.target.value })
            }
            className="min-w-36 text-xs"
          >
            {ENQUIRY_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        ) : (
          <StatusBadge status={row.original.status} compact />
        ),
    },
    ...(isAdmin ? [{ accessorKey: 'branch', header: 'Branch' } as ColumnDef<Enquiry>] : []),
    ...(isAdmin ? [{ accessorKey: 'assignedTo', header: 'Assigned To' } as ColumnDef<Enquiry>] : []),
    ...(isAdmin
      ? [{
          accessorKey: 'partnerName',
          header: 'Partner',
          cell: ({ row }: { row: { original: Enquiry } }) => row.original.partnerName ?? '—',
        } as ColumnDef<Enquiry>]
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
          <IconTooltip label="History">
            <Button
              variant="outline"
              size="sm"
              className="size-6 p-0"
              aria-label="History"
              onClick={() => setHistoryTarget(row.original)}
            >
              <History className="size-3" />
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
          <IconTooltip label="Ready For Register">
            <Button
              variant="outline"
              size="sm"
              className="size-6 p-0"
              aria-label="Ready For Register"
              onClick={() => setRegisterTarget(row.original)}
            >
              <UserCheck className="size-3" />
            </Button>
          </IconTooltip>
        </div>
      ),
    },
  ]

  const renderKanbanCard = (enquiry: Enquiry) => (
    <div className="space-y-1">
      <Link
        to={`${prefix}/enquiry/${enquiry.id}`}
        className="text-sm font-medium text-primary hover:underline"
      >
        {enquiry.firstName} {enquiry.lastName}
      </Link>
      <p className="text-xs text-gray-500">{enquiry.email}</p>
      <p className="text-xs">{enquiry.interestedCourse} · {enquiry.interestedCountry}</p>
    </div>
  )

  return (
    <PageShell
      title="View Enquiry"
      breadcrumbs={[{ label: 'Enquiry' }]}
      action={
        <div className="flex flex-wrap items-center gap-2">
          <ViewModeToggle value={viewMode} onChange={setViewMode} />
          <Button asChild>
            <Link to={`${prefix}/enquiry/add`}>
              <Plus className="size-4" />
              Add Enquiry
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
          label="Country"
          value={countryFilter}
          onChange={setCountryFilter}
          options={COUNTRIES.map((c) => ({ label: c, value: c }))}
        />
      </FilterPanel>

      <BulkActionBar
        count={selected.length}
        className="mt-4"
        onDelete={isAdmin ? () => deleteMutation.mutate(selected.map((e) => e.id)) : undefined}
        onExport={() => handleExport(selected.length ? selected : enquiries)}
        onAssign={isAdmin ? () => setAssignOpen(true) : undefined}
        onEmail={() => setMessageChannel('email')}
        onSms={() => setMessageChannel('sms')}
        onWhatsapp={() => setMessageChannel('whatsapp')}
      />

      {isLoading ? (
        <LoadingSkeleton className="mt-4" />
      ) : viewMode === 'table' ? (
        <DataTable
          data={enquiries}
          columns={columns}
          enableRowSelection={isAdmin}
          onRowSelectionChange={isAdmin ? setSelected : undefined}
          searchPlaceholder="Search enquiries..."
          className="mt-4"
          mobileRender={(row) => (
            <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <Link
                  to={`${prefix}/enquiry/${row.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {row.firstName} {row.lastName}
                </Link>
                <StatusBadge status={row.status} />
              </div>
              <p className="text-sm text-gray-500">{row.email}</p>
              <p className="text-sm">{row.interestedCourse} · {row.interestedCountry}</p>
            </div>
          )}
        />
      ) : (
        <KanbanBoard
          className="mt-4"
          columns={kanbanColumns}
          getItemId={(e) => e.id}
          renderCard={renderKanbanCard}
          onMove={
            isAdmin
              ? (itemId, _from, toColumn) =>
                  statusMutation.mutate({ id: itemId, status: toColumn })
              : undefined
          }
        />
      )}

      <MoveEnquiryToStudentModal
        open={!!registerTarget}
        onOpenChange={(open) => !open && setRegisterTarget(null)}
        enquiry={registerTarget}
        prefix={prefix}
        onMoved={() => queryClient.invalidateQueries({ queryKey: ['enquiries'] })}
      />

      <FollowupAppointmentModal
        open={!!followupTarget}
        onOpenChange={(open) => !open && setFollowupTarget(null)}
        entityType="enquiry"
        entity={followupTarget}
        profileHref={followupTarget ? `${prefix}/enquiry/${followupTarget.id}` : ''}
        statusOptions={ENQUIRY_STATUSES}
        dropStatus="Drop"
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['enquiries'] })}
      />

      <NotesDialog
        open={!!notesTarget}
        onOpenChange={(open) => !open && setNotesTarget(null)}
        entityType="enquiry"
        entityId={notesTarget?.id ?? ''}
        title={notesTarget ? `${notesTarget.firstName} ${notesTarget.lastName}` : ''}
      />

      <HistoryDrawer
        open={!!historyTarget}
        onOpenChange={(open) => !open && setHistoryTarget(null)}
        entityType="enquiry"
        entityId={historyTarget?.id ?? ''}
        title={historyTarget ? `${historyTarget.firstName} ${historyTarget.lastName}` : ''}
        status={historyTarget?.status}
        createdAt={historyTarget?.createdAt}
        updatedAt={historyTarget?.updatedAt}
      />

      <AssignStaffModal
        open={assignOpen}
        onOpenChange={setAssignOpen}
        onAssign={(staff) =>
          assignMutation.mutate({ ids: selected.map((e) => e.id), assignedTo: staff })
        }
      />

      <BulkMessageModal
        open={!!messageChannel}
        onOpenChange={(open) => !open && setMessageChannel(null)}
        channel={messageChannel ?? 'email'}
        recipientCount={selected.length || enquiries.length}
      />
    </PageShell>
  )
}
