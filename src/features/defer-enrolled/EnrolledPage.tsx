import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { PageShell } from '@/components/layout/PageShell'
import { DataTable } from '@/components/data-display/DataTable'
import { FilterPanel } from '@/components/filters/FilterPanel'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton'
import { FilterSelect } from '@/features/shared/FilterField'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { enrolledService } from '@/services'
import { BRANCHES, BRAND } from '@/lib/constants'
import type { EnrolledRecord } from '@/types'
import { format } from 'date-fns'
import { type PortalPageProps, usePortalContext } from '@/features/shared/portal'

export function EnrolledPage(props: PortalPageProps = {}) {
  const { prefix, partnerId, isAdmin, isPartner } = usePortalContext(props)
  const [tab, setTab] = useState(isPartner ? 'partner' : BRAND.directScopeKey)
  const [branchFilter, setBranchFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['enrolled', tab, partnerId],
    queryFn: () =>
      enrolledService.getAll({
        pageSize: 100,
        isPartner: isPartner ? true : tab === 'partner' ? true : false,
        partnerId,
      }),
  })

  const enrolled = useMemo(() => {
    let items = data?.data ?? []
    if (branchFilter) items = items.filter((e) => e.branch === branchFilter)
    return items
  }, [data, branchFilter])

  const columns: ColumnDef<EnrolledRecord>[] = [
    { accessorKey: 'studentRef', header: 'Student ID' },
    { accessorKey: 'studentName', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'mobile', header: 'Mobile' },
    { accessorKey: 'appliedCountry', header: 'Country' },
    { accessorKey: 'appliedUniversity', header: 'University' },
    { accessorKey: 'course', header: 'Course' },
    { accessorKey: 'intake', header: 'Intake' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} compact />,
    },
    { accessorKey: 'source', header: 'Source' },
    { accessorKey: 'branch', header: 'Branch' },
    ...(isAdmin
      ? [{
          accessorKey: 'partnerName',
          header: 'Partner',
          cell: ({ row }: { row: { original: EnrolledRecord } }) => row.original.partnerName ?? '—',
        } as ColumnDef<EnrolledRecord>]
      : []),
    {
      accessorKey: 'createdAt',
      header: 'Enrolled On',
      cell: ({ row }) => format(new Date(row.original.createdAt), 'dd MMM yyyy'),
    },
  ]

  const table = (
    <>
      <FilterPanel className="mt-2">
        <FilterSelect
          label="Branch"
          value={branchFilter}
          onChange={setBranchFilter}
          options={BRANCHES.map((b) => ({ label: b, value: b }))}
        />
      </FilterPanel>

      {isLoading ? (
        <LoadingSkeleton className="mt-4" />
      ) : (
        <DataTable
          data={enrolled}
          columns={columns}
          searchPlaceholder="Search enrolled students..."
          className="mt-4"
          mobileRender={(row) => (
            <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <p className="font-medium">{row.studentName}</p>
                <StatusBadge status={row.status} />
              </div>
              <p className="text-sm text-gray-500">{row.appliedUniversity}</p>
              <p className="text-sm">{row.course} · {row.appliedCountry}</p>
            </div>
          )}
        />
      )}
    </>
  )

  return (
    <PageShell
      title="Enrolled Student"
      breadcrumbs={[
        { label: 'Defer / Enrolled', href: `${prefix}/defer` },
        { label: 'Enrolled Student' },
      ]}
    >
      {isAdmin ? (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value={BRAND.directScopeKey}>{BRAND.directTabLabel}</TabsTrigger>
            <TabsTrigger value="partner">Partner</TabsTrigger>
          </TabsList>
          <TabsContent value={tab}>{table}</TabsContent>
        </Tabs>
      ) : (
        table
      )}
    </PageShell>
  )
}
