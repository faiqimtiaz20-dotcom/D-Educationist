import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Download, Edit, Eye, FileSpreadsheet, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-display/DataTable'
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton'
import { IconTooltip } from '@/components/ui/icon-tooltip'
import { AddUniversityMasterModal } from '@/components/modals/AddUniversityMasterModal'
import { exportToCsv } from '@/lib/exportCsv'
import { universityMasterService } from '@/services'
import type { UniversityMaster } from '@/types'

interface ViewUniversityDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  country: string | null
  countries: string[]
  onChanged?: () => void
}

function formatMasterDate(value: string, withTime = false) {
  const date = new Date(value)
  if (withTime) return format(date, 'dd/MM/yyyy hh:mm a')
  return format(date, 'dd/MM/yyyy')
}

export function ViewUniversityDetailsModal({
  open,
  onOpenChange,
  country,
  countries,
  onChanged,
}: ViewUniversityDetailsModalProps) {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<UniversityMaster[]>([])
  const [editTarget, setEditTarget] = useState<UniversityMaster | null>(null)
  const [campusTarget, setCampusTarget] = useState<UniversityMaster | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['university-masters', country],
    queryFn: () => universityMasterService.getAll({ country: country ?? undefined, pageSize: 500 }),
    enabled: open && !!country,
  })

  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) => universityMasterService.delete(ids),
    onSuccess: () => {
      toast.success('University record(s) deleted')
      setSelected([])
      queryClient.invalidateQueries({ queryKey: ['university-masters'] })
      queryClient.invalidateQueries({ queryKey: ['masters-universities'] })
      onChanged?.()
    },
    onError: () => toast.error('Failed to delete university record(s)'),
  })

  const universities = data?.data ?? []

  const columns: ColumnDef<UniversityMaster>[] = useMemo(
    () => [
      {
        id: 'createdAt',
        header: 'Created Date',
        cell: ({ row }) => (
          <div className="whitespace-nowrap text-xs">
            <div>{formatMasterDate(row.original.createdAt)}</div>
            {row.original.updatedAt !== row.original.createdAt && (
              <div className="text-[10px] text-gray-500">
                {formatMasterDate(row.original.updatedAt, true)}
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'updatedAt',
        header: 'Updated Date',
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs">
            {formatMasterDate(row.original.updatedAt)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <IconTooltip label="Edit">
              <Button
                variant="outline"
                size="sm"
                className="size-7 p-0"
                onClick={() => setEditTarget(row.original)}
              >
                <Edit className="size-3.5" />
              </Button>
            </IconTooltip>
            <IconTooltip label="Delete">
              <Button
                variant="outline"
                size="sm"
                className="size-7 p-0 text-danger"
                onClick={() => deleteMutation.mutate([row.original.id])}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </IconTooltip>
          </div>
        ),
      },
      { accessorKey: 'country', header: 'Country' },
      {
        accessorKey: 'name',
        header: 'University Name',
        cell: ({ row }) => <span className="min-w-[14rem] text-xs">{row.original.name}</span>,
      },
      {
        id: 'campus',
        header: 'Campus',
        cell: ({ row }) =>
          row.original.campuses.length > 0 ? (
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              onClick={() => setCampusTarget(row.original)}
            >
              <Eye className="size-3" />
              View
            </Button>
          ) : (
            <span className="text-xs text-gray-400">N/A</span>
          ),
      },
      {
        id: 'agreementExpiry',
        header: 'Agr. Expiry',
        cell: ({ row }) =>
          row.original.agreementExpiry ? (
            <span className="text-xs">{formatMasterDate(row.original.agreementExpiry)}</span>
          ) : (
            <span className="text-xs text-gray-400">N/A</span>
          ),
      },
      {
        id: 'agreementFile',
        header: 'Agr. File',
        cell: ({ row }) =>
          row.original.agreementFileName ? (
            <span className="text-xs text-primary">{row.original.agreementFileName}</span>
          ) : (
            <span className="text-xs text-gray-400">N/A</span>
          ),
      },
      {
        id: 'logo',
        header: 'University Logo',
        cell: ({ row }) =>
          row.original.logoFileName ? (
            <div className="flex items-center gap-1">
              <Button
                variant="default"
                size="sm"
                className="size-7 p-0"
                onClick={() => toast.info(`Preview: ${row.original.logoFileName}`)}
              >
                <Eye className="size-3.5" />
              </Button>
              <Button
                variant="success"
                size="sm"
                className="size-7 p-0"
                onClick={() => toast.success(`Download started: ${row.original.logoFileName}`)}
              >
                <Download className="size-3.5" />
              </Button>
            </div>
          ) : (
            <span className="text-xs text-gray-400">N/A</span>
          ),
      },
    ],
    [deleteMutation],
  )

  const handleExport = () => {
    exportToCsv(
      universities as unknown as Record<string, unknown>[],
      [
        { key: 'country' as keyof UniversityMaster, header: 'Country' },
        { key: 'name' as keyof UniversityMaster, header: 'University Name' },
        { key: 'commissionContract' as keyof UniversityMaster, header: 'Commission Contract' },
        { key: 'agreementExpiry' as keyof UniversityMaster, header: 'Agreement Expiry' },
      ],
      `${country ?? 'universities'}-export`,
    )
    toast.success('Excel export started')
  }

  const handleBulkDelete = () => {
    if (selected.length === 0) {
      toast.error('Select at least one record')
      return
    }
    deleteMutation.mutate(selected.map((item) => item.id))
  }

  const handleSaved = () => {
    queryClient.invalidateQueries({ queryKey: ['university-masters'] })
    queryClient.invalidateQueries({ queryKey: ['masters-universities'] })
    onChanged?.()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent size="4xl" className="flex flex-col">
          <DialogHeader>
            <DialogTitle>View University Details</DialogTitle>
          </DialogHeader>

          <DialogBody className="flex min-h-0 flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}>
                <FileSpreadsheet className="size-4" />
                Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-danger"
                onClick={handleBulkDelete}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="size-4" />
                Bulk Delete
              </Button>
            </div>

            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <div className="min-h-0 flex-1 overflow-auto">
                <DataTable
                  data={universities}
                  columns={columns}
                  searchPlaceholder="University"
                  searchKey="name"
                  enableRowSelection
                  onRowSelectionChange={setSelected}
                  pageSize={10}
                />
              </div>
            )}
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddUniversityMasterModal
        open={!!editTarget}
        onOpenChange={(next) => !next && setEditTarget(null)}
        countries={countries}
        university={editTarget}
        onSaved={handleSaved}
      />

      <Dialog open={!!campusTarget} onOpenChange={(next) => !next && setCampusTarget(null)}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Campus List</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-2">
            <p className="text-sm font-medium text-gray-800">{campusTarget?.name}</p>
            {campusTarget?.campuses.map((campus) => (
              <div
                key={campus.id}
                className="rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700"
              >
                {campus.name}
                {campus.city ? ` — ${campus.city}` : ''}
              </div>
            ))}
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCampusTarget(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
