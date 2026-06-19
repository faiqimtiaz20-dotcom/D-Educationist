import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useSearchParams } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { Plus, CreditCard, Eye } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { DataTable } from '@/components/data-display/DataTable'
import { FilterPanel } from '@/components/filters/FilterPanel'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton'
import { FilterSelect } from '@/features/shared/FilterField'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { invoiceService } from '@/services'
import { SERVICE_TYPES, CURRENCIES, BRAND, formatMiscInvoiceId } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import { InvoicePdfPreview } from '@/components/modals/InvoicePdfPreview'
import type { Invoice } from '@/types'
import { format } from 'date-fns'

interface CreateInvoiceForm {
  name: string
  email: string
  mobile: string
  serviceType: string
  totalAmount: number
  discount: number
  taxPercent: number
  currency: string
  dueDate: string
}

interface PaymentForm {
  amount: number
  paymentDate: string
  paymentMode: string
}

export function StudentInvoicesPage() {
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') ?? '')
  const [createOpen, setCreateOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState<Invoice | null>(null)
  const [previewOpen, setPreviewOpen] = useState<Invoice | null>(null)

  const createForm = useForm<CreateInvoiceForm>({
    defaultValues: {
      serviceType: 'Admission',
      currency: 'PKR',
      taxPercent: 18,
      discount: 0,
    },
  })

  const paymentForm = useForm<PaymentForm>({
    defaultValues: { paymentMode: 'Bank Transfer', paymentDate: new Date().toISOString().slice(0, 10) },
  })

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', statusFilter],
    queryFn: () =>
      invoiceService.getAll({
        pageSize: 100,
        status: statusFilter || undefined,
      }),
  })

  const createMutation = useMutation({
    mutationFn: invoiceService.create,
    onSuccess: () => {
      toast.success('Invoice created')
      setCreateOpen(false)
      createForm.reset()
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
    onError: () => toast.error('Failed to create invoice'),
  })

  const paymentMutation = useMutation({
    mutationFn: ({ id, paidAmount, status }: { id: string; paidAmount: number; status: Invoice['status'] }) =>
      invoiceService.update(id, { paidAmount, pendingAmount: 0, status }),
    onSuccess: () => {
      toast.success('Payment recorded')
      setPaymentOpen(null)
      paymentForm.reset()
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
    onError: () => toast.error('Failed to record payment'),
  })

  const invoices = data?.data ?? []

  const summary = useMemo(() => ({
    total: invoices.reduce((s, i) => s + i.grandTotal, 0),
    paid: invoices.reduce((s, i) => s + i.paidAmount, 0),
    pending: invoices.reduce((s, i) => s + i.pendingAmount, 0),
    count: invoices.length,
  }), [invoices])

  const columns: ColumnDef<Invoice>[] = [
    { accessorKey: 'invoiceId', header: 'Invoice ID' },
    { accessorKey: 'name', header: 'Student' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'mobile', header: 'Mobile' },
    { accessorKey: 'serviceType', header: 'Service' },
    {
      accessorKey: 'grandTotal',
      header: 'Grand Total',
      cell: ({ row }) => formatCurrency(row.original.grandTotal, row.original.currency),
    },
    {
      accessorKey: 'paidAmount',
      header: 'Paid',
      cell: ({ row }) => formatCurrency(row.original.paidAmount, row.original.currency),
    },
    {
      accessorKey: 'pendingAmount',
      header: 'Pending',
      cell: ({ row }) => formatCurrency(row.original.pendingAmount, row.original.currency),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} compact />,
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => format(new Date(row.original.dueDate), 'dd MMM yyyy'),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setPreviewOpen(row.original)}
          >
            <Eye className="size-3" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setPaymentOpen(row.original)}
            disabled={row.original.status === 'Fully Paid'}
          >
            <CreditCard className="size-3" />
            Add Payment
          </Button>
        </div>
      ),
    },
  ]

  const onCreate = (values: CreateInvoiceForm) => {
    const afterDiscount = values.totalAmount - values.discount
    const taxAmount = Math.round(afterDiscount * values.taxPercent / 100)
    const grandTotal = afterDiscount + taxAmount
    createMutation.mutate({
      invoiceId: formatMiscInvoiceId(),
      studentId: 's-new',
      name: values.name,
      email: values.email,
      mobile: values.mobile,
      totalAmount: values.totalAmount,
      discount: values.discount,
      afterDiscount,
      taxPercent: values.taxPercent,
      taxType: 'Include Tax',
      taxAmount,
      grandTotal,
      paidAmount: 0,
      pendingAmount: grandTotal,
      dueDate: values.dueDate,
      status: 'Pending',
      serviceType: values.serviceType,
      currency: values.currency,
      createdBy: BRAND.staffLabel,
    })
  }

  const onPayment = (values: PaymentForm) => {
    if (!paymentOpen) return
    const newPaid = paymentOpen.paidAmount + values.amount
    const newPending = Math.max(0, paymentOpen.grandTotal - newPaid)
    const status: Invoice['status'] =
      newPending === 0 ? 'Fully Paid' : newPaid > 0 ? 'Partial Paid' : 'Pending'
    paymentMutation.mutate({ id: paymentOpen.id, paidAmount: newPaid, status })
  }

  return (
    <PageShell
      title="Student Invoices"
      breadcrumbs={[
        { label: 'Accounts', href: '/admin/accounts/student-invoices' },
        { label: 'Student Invoices' },
      ]}
      action={
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Create Invoice
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Total Invoices</p>
          <p className="text-2xl font-bold">{summary.count}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Grand Total</p>
          <p className="text-2xl font-bold">{formatCurrency(summary.total)}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Total Paid</p>
          <p className="text-2xl font-bold text-success">{formatCurrency(summary.paid)}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Total Pending</p>
          <p className="text-2xl font-bold text-warning">{formatCurrency(summary.pending)}</p>
        </div>
      </div>

      <FilterPanel className="mt-4">
        <FilterSelect
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: 'Pending', value: 'Pending' },
            { label: 'Partial Paid', value: 'Partial Paid' },
            { label: 'Fully Paid', value: 'Fully Paid' },
          ]}
        />
      </FilterPanel>

      {isLoading ? (
        <LoadingSkeleton className="mt-4" />
      ) : (
        <DataTable data={invoices} columns={columns} searchPlaceholder="Search invoices..." className="mt-4" />
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
          </DialogHeader>
          <form onSubmit={createForm.handleSubmit(onCreate)}>
            <DialogBody className="space-y-4">
            <div className="space-y-1.5">
              <Label>Student Name *</Label>
              <Input {...createForm.register('name', { required: true })} />
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input type="email" {...createForm.register('email', { required: true })} />
            </div>
            <div className="space-y-1.5">
              <Label>Mobile *</Label>
              <Input {...createForm.register('mobile', { required: true })} />
            </div>
            <div className="space-y-1.5">
              <Label>Service Type</Label>
              <Select {...createForm.register('serviceType')}>
                {SERVICE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Amount</Label>
                <Input type="number" {...createForm.register('totalAmount', { valueAsNumber: true })} />
              </div>
              <div className="space-y-1.5">
                <Label>Discount</Label>
                <Input type="number" {...createForm.register('discount', { valueAsNumber: true })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tax %</Label>
                <Input type="number" {...createForm.register('taxPercent', { valueAsNumber: true })} />
              </div>
              <div className="space-y-1.5">
                <Label>Currency</Label>
                <Select {...createForm.register('currency')}>
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Due Date</Label>
              <Input type="date" {...createForm.register('dueDate', { required: true })} />
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

      <Dialog open={!!paymentOpen} onOpenChange={() => setPaymentOpen(null)}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Add Payment — {paymentOpen?.invoiceId}</DialogTitle>
          </DialogHeader>
          <form onSubmit={paymentForm.handleSubmit(onPayment)}>
            <DialogBody className="space-y-4">
            <div className="space-y-1.5">
              <Label>Amount</Label>
              <Input type="number" {...paymentForm.register('amount', { valueAsNumber: true, required: true })} />
            </div>
            <div className="space-y-1.5">
              <Label>Payment Date</Label>
              <Input type="date" {...paymentForm.register('paymentDate', { required: true })} />
            </div>
            <div className="space-y-1.5">
              <Label>Payment Mode</Label>
              <Select {...paymentForm.register('paymentMode')}>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
              </Select>
            </div>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPaymentOpen(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={paymentMutation.isPending}>Record Payment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <InvoicePdfPreview
        open={!!previewOpen}
        onOpenChange={(open) => !open && setPreviewOpen(null)}
        invoice={previewOpen}
      />
    </PageShell>
  )
}
