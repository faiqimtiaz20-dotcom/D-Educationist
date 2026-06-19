import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { Clock, GraduationCap } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { DataTable } from '@/components/data-display/DataTable'
import { QuickFilterTabs } from '@/components/filters/QuickFilterTabs'
import { FilterPanel } from '@/components/filters/FilterPanel'
import { ViewModeToggle } from '@/components/filters/ViewModeToggle'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton'
import { KanbanBoard, useKanbanColumns } from '@/components/kanban/KanbanBoard'
import { BulkMessageModal, type BulkMessageChannel } from '@/components/modals/BulkMessageModal'
import { BulkActionBar } from '@/features/shared/BulkActionBar'
import { FilterSelect } from '@/features/shared/FilterField'
import { Button } from '@/components/ui/button'
import { IconTooltip } from '@/components/ui/icon-tooltip'
import { Select } from '@/components/ui/select'
import { visaService } from '@/services'
import { VISA_STATUSES, BRANCHES } from '@/lib/constants'
import { exportToCsv } from '@/lib/exportCsv'
import type { VisaRecord } from '@/types'
import { format } from 'date-fns'
import { type PortalPageProps, usePortalContext } from '@/features/shared/portal'

const EXPORT_COLUMNS: { key: keyof VisaRecord; header: string }[] = [
  { key: 'studentRef', header: 'Student ID' },
  { key: 'studentName', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'appliedCountry', header: 'Country' },
  { key: 'university', header: 'University' },
  { key: 'visaStatus', header: 'Visa Status' },
  { key: 'branch', header: 'Branch' },
]

export function VisaPage(props: PortalPageProps = {}) {
  const { prefix, partnerId, isAdmin, isPartner } = usePortalContext(props)
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') ?? 'all')
  const [branchFilter, setBranchFilter] = useState('')
  const [selected, setSelected] = useState<VisaRecord[]>([])
  const [messageChannel, setMessageChannel] = useState<BulkMessageChannel | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['visas', statusFilter, partnerId, isPartner],
    queryFn: () =>
      visaService.getAll({
        pageSize: 100,
        status: statusFilter === 'all' ? undefined : statusFilter,
        partnerId,
        isPartner: isPartner ? true : undefined,
      }),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, visaStatus }: { id: string; visaStatus: string }) =>
      visaService.update(id, { visaStatus }),
    onSuccess: () => {
      toast.success('Visa status updated')
      queryClient.invalidateQueries({ queryKey: ['visas'] })
    },
    onError: () => toast.error('Failed to update visa status'),
  })

  const visas = useMemo(() => {
    let items = data?.data ?? []
    if (branchFilter) items = items.filter((v) => v.branch === branchFilter)
    if (statusFilter !== 'all') items = items.filter((v) => v.visaStatus === statusFilter)
    return items
  }, [data, branchFilter, statusFilter])

  const kanbanColumns = useKanbanColumns(visas, 'visaStatus', VISA_STATUSES)

  const statusCounts = useMemo(() => {
    const all = data?.data ?? []
    return [
      { label: 'All', value: 'all', count: all.length },
      ...VISA_STATUSES.map((s) => ({
        label: s,
        value: s,
        count: all.filter((v) => v.visaStatus === s).length,
      })),
    ]
  }, [data])

  const handleExport = (rows: VisaRecord[]) => {
    exportToCsv(rows, EXPORT_COLUMNS, `visas-${format(new Date(), 'yyyy-MM-dd')}`)
    toast.success(`Exported ${rows.length} visa record(s)`)
  }

  const columns: ColumnDef<VisaRecord>[] = [
    { accessorKey: 'studentRef', header: 'Student ID' },
    {
      accessorKey: 'studentName',
      header: 'Name',
      cell: ({ row }) => (
        <Link
          to={`${prefix}/student/${row.original.studentId}`}
          className="whitespace-nowrap font-medium text-primary hover:underline"
        >
          {row.original.studentName}
        </Link>
      ),
    },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'mobile', header: 'Mobile' },
    {
      accessorKey: 'docStatus',
      header: 'Doc. Status',
      cell: ({ row }) => <StatusBadge status={row.original.docStatus} compact />,
    },
    { accessorKey: 'appliedCountry', header: 'Country' },
    { accessorKey: 'university', header: 'University' },
    { accessorKey: 'course', header: 'Course' },
    { accessorKey: 'intake', header: 'Intake' },
    {
      accessorKey: 'visaStatus',
      header: 'Visa Status',
      cell: ({ row }) =>
        isAdmin ? (
          <Select
            value={row.original.visaStatus}
            onChange={(e) =>
              statusMutation.mutate({ id: row.original.id, visaStatus: e.target.value })
            }
            className="min-w-40 text-xs"
          >
            {VISA_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        ) : (
          <StatusBadge status={row.original.visaStatus} compact />
        ),
    },
    ...(isAdmin ? [{ accessorKey: 'branch', header: 'Branch' } as ColumnDef<VisaRecord>] : []),
    ...(isAdmin
      ? [{
          accessorKey: 'partnerName',
          header: 'Partner',
          cell: ({ row }: { row: { original: VisaRecord } }) => row.original.partnerName ?? '—',
        } as ColumnDef<VisaRecord>]
      : []),
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => format(new Date(row.original.createdAt), 'dd MMM yyyy'),
    },
    ...(isAdmin
      ? [{
          id: 'actions',
          header: 'Actions',
          cell: () => (
            <div className="flex w-max flex-nowrap items-center gap-1">
              <IconTooltip label="Defer">
                <Button variant="outline" size="sm" className="size-6 p-0" asChild>
                  <Link to={`${prefix}/defer`} aria-label="Defer">
                    <Clock className="size-3" />
                  </Link>
                </Button>
              </IconTooltip>
              <IconTooltip label="Enrolled">
                <Button variant="outline" size="sm" className="size-6 p-0" asChild>
                  <Link to={`${prefix}/enrolled`} aria-label="Enrolled">
                    <GraduationCap className="size-3" />
                  </Link>
                </Button>
              </IconTooltip>
            </div>
          ),
        } as ColumnDef<VisaRecord>]
      : []),
  ]

  const renderKanbanCard = (visa: VisaRecord) => (
    <div className="space-y-1">
      <Link
        to={`${prefix}/student/${visa.studentId}`}
        className="text-sm font-medium text-primary hover:underline"
      >
        {visa.studentName}
      </Link>
      <p className="text-xs text-gray-500">{visa.university}</p>
      <p className="text-xs">{visa.appliedCountry}</p>
    </div>
  )

  return (
    <PageShell
      title="Visa"
      breadcrumbs={[{ label: 'Visa' }]}
      action={<ViewModeToggle value={viewMode} onChange={setViewMode} />}
    >
      <QuickFilterTabs options={statusCounts} value={statusFilter} onChange={setStatusFilter} />

      <FilterPanel className="mt-4">
        <FilterSelect
          label="Branch"
          value={branchFilter}
          onChange={setBranchFilter}
          options={BRANCHES.map((b) => ({ label: b, value: b }))}
        />
      </FilterPanel>

      <BulkActionBar
        count={selected.length}
        className="mt-4"
        onExport={() => handleExport(selected.length ? selected : visas)}
        onEmail={() => setMessageChannel('email')}
        onSms={() => setMessageChannel('sms')}
        onWhatsapp={() => setMessageChannel('whatsapp')}
      />

      {isLoading ? (
        <LoadingSkeleton className="mt-4" />
      ) : viewMode === 'table' ? (
        <DataTable
          data={visas}
          columns={columns}
          enableRowSelection
          onRowSelectionChange={setSelected}
          searchPlaceholder="Search visa records..."
          className="mt-4"
          mobileRender={(row) => (
            <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-4">
              <Link
                to={`${prefix}/student/${row.studentId}`}
                className="font-medium text-primary hover:underline"
              >
                {row.studentName}
              </Link>
              <StatusBadge status={row.visaStatus} />
              <p className="text-sm text-gray-500">{row.university} · {row.appliedCountry}</p>
            </div>
          )}
        />
      ) : (
        <KanbanBoard
          className="mt-4"
          columns={kanbanColumns}
          getItemId={(v) => v.id}
          renderCard={renderKanbanCard}
          onMove={
            isAdmin
              ? (itemId, _from, toColumn) =>
                  statusMutation.mutate({ id: itemId, visaStatus: toColumn })
              : undefined
          }
        />
      )}

      <BulkMessageModal
        open={!!messageChannel}
        onOpenChange={(open) => !open && setMessageChannel(null)}
        channel={messageChannel ?? 'email'}
        recipientCount={selected.length || visas.length}
      />
    </PageShell>
  )
}
