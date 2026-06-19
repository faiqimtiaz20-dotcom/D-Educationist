import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import type { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { DataTable } from '@/components/data-display/DataTable'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { invoiceService } from '@/services'
import { COUNTRIES, BRAND } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import type { UniversityCommission } from '@/types'
import { format } from 'date-fns'

interface CreateCommissionForm {
  country: string
  university: string
  studentCount: number
  totalCommission: number
  commissionType: string
  commissionSubType: string
}

export function UniversityCommissionPage() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const form = useForm<CreateCommissionForm>({
    defaultValues: { commissionType: 'Fixed', commissionSubType: 'Per Student', studentCount: 1 },
  })

  const { data, isLoading } = useQuery({
    queryKey: ['university-commission'],
    queryFn: () => invoiceService.getAllUniversityCommission({ pageSize: 100 }),
  })

  const createMutation = useMutation({
    mutationFn: invoiceService.createUniversityCommission,
    onSuccess: () => {
      toast.success('Commission invoice created')
      setCreateOpen(false)
      form.reset()
      queryClient.invalidateQueries({ queryKey: ['university-commission'] })
    },
    onError: () => toast.error('Failed to create commission'),
  })

  const records = data?.data ?? []

  const summary = useMemo(() => ({
    total: records.reduce((s, r) => s + r.totalCommission, 0),
    received: records.reduce((s, r) => s + r.receivedCommission, 0),
    pending: records.reduce((s, r) => s + r.pendingCommission, 0),
    count: records.length,
  }), [records])

  const columns: ColumnDef<UniversityCommission>[] = [
    { accessorKey: 'invoiceNo', header: 'Invoice No.' },
    { accessorKey: 'country', header: 'Country' },
    { accessorKey: 'university', header: 'University' },
    { accessorKey: 'studentCount', header: 'Students' },
    {
      accessorKey: 'totalCommission',
      header: 'Total',
      cell: ({ row }) => formatCurrency(row.original.totalCommission),
    },
    {
      accessorKey: 'receivedCommission',
      header: 'Received',
      cell: ({ row }) => formatCurrency(row.original.receivedCommission),
    },
    {
      accessorKey: 'pendingCommission',
      header: 'Pending',
      cell: ({ row }) => formatCurrency(row.original.pendingCommission),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} compact />,
    },
    { accessorKey: 'commissionType', header: 'Type' },
    { accessorKey: 'createdBy', header: 'Created By' },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => format(new Date(row.original.createdAt), 'dd MMM yyyy'),
    },
  ]

  const onCreate = (values: CreateCommissionForm) => {
    createMutation.mutate({
      invoiceNo: `UC/${Date.now()}`,
      country: values.country,
      university: values.university,
      studentCount: values.studentCount,
      totalCommission: values.totalCommission,
      receivedCommission: 0,
      pendingCommission: values.totalCommission,
      status: 'Pending',
      createdBy: BRAND.staffLabel,
      commissionType: values.commissionType,
      commissionSubType: values.commissionSubType,
    })
  }

  return (
    <PageShell
      title="University Commission"
      breadcrumbs={[{ label: 'University Comm.' }]}
      action={
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Create Commission
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Total Records</p>
          <p className="text-2xl font-bold">{summary.count}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Total Commission</p>
          <p className="text-2xl font-bold">{formatCurrency(summary.total)}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Received</p>
          <p className="text-2xl font-bold text-success">{formatCurrency(summary.received)}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-warning">{formatCurrency(summary.pending)}</p>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton className="mt-4" />
      ) : (
        <DataTable
          data={records}
          columns={columns}
          searchPlaceholder="Search commission records..."
          className="mt-4"
        />
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Create University Commission</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onCreate)}>
            <DialogBody className="space-y-4">
            <div className="space-y-1.5">
              <Label>Country</Label>
              <select {...form.register('country', { required: true })} className="flex h-9 w-full rounded-md border border-gray-300 px-3 text-sm">
                <option value="">Select</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>University</Label>
              <Input {...form.register('university', { required: true })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Student Count</Label>
                <Input type="number" {...form.register('studentCount', { valueAsNumber: true })} />
              </div>
              <div className="space-y-1.5">
                <Label>Total Commission</Label>
                <Input type="number" {...form.register('totalCommission', { valueAsNumber: true })} />
              </div>
            </div>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
