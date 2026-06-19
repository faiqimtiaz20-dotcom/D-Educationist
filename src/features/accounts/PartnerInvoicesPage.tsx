import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { PageShell } from '@/components/layout/PageShell'
import { DataTable } from '@/components/data-display/DataTable'
import { FilterPanel } from '@/components/filters/FilterPanel'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton'
import { FilterSelect } from '@/features/shared/FilterField'
import { invoiceService } from '@/services'
import { formatCurrency } from '@/lib/utils'
import type { PartnerInvoice } from '@/types'
import { format } from 'date-fns'
import { type PortalPageProps, usePortalContext } from '@/features/shared/portal'

export function PartnerInvoicesPage(props: PortalPageProps = {}) {
  const { prefix, partnerId, isPartner } = usePortalContext(props)
  const [statusFilter, setStatusFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['partner-invoices', statusFilter, partnerId],
    queryFn: () =>
      invoiceService.getAllPartnerInvoices({
        pageSize: 100,
        status: statusFilter || undefined,
        partnerId,
      }),
  })

  const invoices = data?.data ?? []

  const summary = useMemo(() => ({
    totalCommission: invoices.reduce((s, i) => s + i.totalCommission, 0),
    received: invoices.reduce((s, i) => s + i.receivedCommission, 0),
    pending: invoices.reduce((s, i) => s + i.pendingCommission, 0),
    count: invoices.length,
  }), [invoices])

  const columns: ColumnDef<PartnerInvoice>[] = [
    { accessorKey: 'invoiceNo', header: 'Invoice No.' },
    { accessorKey: 'studentCount', header: 'Students' },
    {
      accessorKey: 'netCommission',
      header: 'Net Commission',
      cell: ({ row }) => `${row.original.currency} ${row.original.netCommission.toLocaleString()}`,
    },
    {
      accessorKey: 'totalCommission',
      header: 'Total Commission',
      cell: ({ row }) => `${row.original.currency} ${row.original.totalCommission.toLocaleString()}`,
    },
    {
      accessorKey: 'receivedCommission',
      header: 'Received',
      cell: ({ row }) => `${row.original.currency} ${row.original.receivedCommission.toLocaleString()}`,
    },
    {
      accessorKey: 'pendingCommission',
      header: 'Pending',
      cell: ({ row }) => `${row.original.currency} ${row.original.pendingCommission.toLocaleString()}`,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} compact />,
    },
    { accessorKey: 'createdBy', header: 'Created By' },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => format(new Date(row.original.createdAt), 'dd MMM yyyy'),
    },
  ]

  return (
    <PageShell
      title={isPartner ? 'My Invoices' : 'Partner Claim Invoices'}
      breadcrumbs={
        isPartner
          ? [{ label: 'Invoices' }]
          : [
              { label: 'Accounts', href: `${prefix}/accounts/student-invoices` },
              { label: 'Partner Claim Invoices' },
            ]
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Total Invoices</p>
          <p className="text-2xl font-bold">{summary.count}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Total Commission</p>
          <p className="text-2xl font-bold">{formatCurrency(summary.totalCommission)}</p>
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
        <DataTable
          data={invoices}
          columns={columns}
          searchPlaceholder="Search partner invoices..."
          className="mt-4"
        />
      )}
    </PageShell>
  )
}
