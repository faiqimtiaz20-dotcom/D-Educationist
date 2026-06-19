import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Wallet } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { Card, CardContent } from '@/components/ui/card'
import { useStudentPortal } from '@/features/shared/useStudentPortal'
import { invoiceService } from '@/services'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'

export default function StudentInvoicesPage() {
  const { studentInternalId, isLoading: profileLoading } = useStudentPortal()

  const { data, isLoading } = useQuery({
    queryKey: ['student-invoices', studentInternalId],
    queryFn: () => invoiceService.getAll({ pageSize: 50 }),
    enabled: Boolean(studentInternalId),
  })

  const invoices = useMemo(
    () => (data?.data ?? []).filter((i) => i.studentId === studentInternalId),
    [data, studentInternalId],
  )

  const summary = useMemo(
    () => ({
      total: invoices.reduce((s, i) => s + i.grandTotal, 0),
      paid: invoices.reduce((s, i) => s + i.paidAmount, 0),
      pending: invoices.reduce((s, i) => s + i.pendingAmount, 0),
    }),
    [invoices],
  )

  if (profileLoading || isLoading) {
    return (
      <PageShell title="Invoices">
        <LoadingSkeleton variant="card" rows={3} />
      </PageShell>
    )
  }

  return (
    <PageShell title="Invoices" className="pb-20 lg:pb-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-xl font-bold">{formatCurrency(summary.total)}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Paid</p>
          <p className="text-xl font-bold text-success">{formatCurrency(summary.paid)}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-xl font-bold text-warning">{formatCurrency(summary.pending)}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {invoices.length === 0 ? (
          <p className="text-sm text-gray-500">No invoices found.</p>
        ) : (
          invoices.map((inv) => (
            <Card key={inv.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <Wallet className="mt-0.5 size-5 text-primary" />
                    <div>
                      <p className="font-medium">{inv.serviceType}</p>
                      <p className="text-xs text-gray-500">{inv.invoiceId}</p>
                    </div>
                  </div>
                  <StatusBadge status={inv.status} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Grand Total</p>
                    <p className="font-semibold">{inv.currency} {inv.grandTotal.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Pending</p>
                    <p className="font-semibold text-warning">{formatCurrency(inv.pendingAmount, inv.currency)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500">Due Date</p>
                    <p>{format(new Date(inv.dueDate), 'dd MMM yyyy')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </PageShell>
  )
}
