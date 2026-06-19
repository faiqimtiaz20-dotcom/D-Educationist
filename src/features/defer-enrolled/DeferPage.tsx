import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { Upload, RotateCcw } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { DataTable } from '@/components/data-display/DataTable'
import { FilterPanel } from '@/components/filters/FilterPanel'
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton'
import { FilterSelect } from '@/features/shared/FilterField'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { deferService } from '@/services'
import { BRANCHES, BRAND } from '@/lib/constants'
import type { DeferRecord } from '@/types'
import { format } from 'date-fns'
import { type PortalPageProps, usePortalContext } from '@/features/shared/portal'

export function DeferPage(props: PortalPageProps = {}) {
  const { prefix, partnerId, isAdmin, isPartner } = usePortalContext(props)
  const queryClient = useQueryClient()
  const [tab, setTab] = useState(isPartner ? 'partner' : BRAND.directScopeKey)
  const [branchFilter, setBranchFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['defers', tab, partnerId],
    queryFn: () =>
      deferService.getAll({
        pageSize: 100,
        isPartner: isPartner ? true : tab === 'partner' ? true : false,
        partnerId,
      }),
  })

  const revertMutation = useMutation({
    mutationFn: (ids: string[]) => deferService.delete(ids),
    onSuccess: () => {
      toast.success('Student reverted from defer')
      queryClient.invalidateQueries({ queryKey: ['defers'] })
    },
    onError: () => toast.error('Failed to revert'),
  })

  const defers = useMemo(() => {
    let items = data?.data ?? []
    if (branchFilter) items = items.filter((d) => d.branch === branchFilter)
    return items
  }, [data, branchFilter])

  const columns: ColumnDef<DeferRecord>[] = [
    { accessorKey: 'studentRef', header: 'Student ID' },
    { accessorKey: 'studentName', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'mobile', header: 'Mobile' },
    { accessorKey: 'deferIntake', header: 'Defer Intake' },
    { accessorKey: 'deferReason', header: 'Reason' },
    { accessorKey: 'interestedCourse', header: 'Course' },
    { accessorKey: 'interestedCountries', header: 'Countries' },
    { accessorKey: 'branch', header: 'Branch' },
    ...(isAdmin
      ? [{
          accessorKey: 'partnerName',
          header: 'Partner',
          cell: ({ row }: { row: { original: DeferRecord } }) => row.original.partnerName ?? '—',
        } as ColumnDef<DeferRecord>]
      : []),
    {
      accessorKey: 'createdAt',
      header: 'Deferred On',
      cell: ({ row }) => format(new Date(row.original.createdAt), 'dd MMM yyyy'),
    },
    ...(isAdmin
      ? [{
          id: 'coe',
          header: 'COE Upload',
          cell: () => (
            <div className="flex items-center gap-2">
              <Input type="file" className="h-8 max-w-36 text-xs" accept=".pdf,.jpg,.png" />
              <Button variant="outline" size="sm" className="h-8" onClick={() => toast.success('COE uploaded')}>
                <Upload className="size-3" />
              </Button>
            </div>
          ),
        } as ColumnDef<DeferRecord>]
      : []),
    ...(isAdmin
      ? [{
          id: 'actions',
          header: 'Actions',
          cell: ({ row }: { row: { original: DeferRecord } }) => (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => revertMutation.mutate([row.original.id])}
            >
              <RotateCcw className="size-3" />
              Revert
            </Button>
          ),
        } as ColumnDef<DeferRecord>]
      : []),
  ]

  return (
    <PageShell
      title="Defer Student"
      breadcrumbs={[
        { label: 'Defer / Enrolled', href: `${prefix}/defer` },
        { label: 'Defer Student' },
      ]}
    >
      {isAdmin ? (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value={BRAND.directScopeKey}>{BRAND.directTabLabel}</TabsTrigger>
            <TabsTrigger value="partner">Partner</TabsTrigger>
          </TabsList>
          <TabsContent value={tab}>
            <DeferTableContent
              branchFilter={branchFilter}
              setBranchFilter={setBranchFilter}
              defers={defers}
              columns={columns}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <DeferTableContent
          branchFilter={branchFilter}
          setBranchFilter={setBranchFilter}
          defers={defers}
          columns={columns}
          isLoading={isLoading}
        />
      )}
    </PageShell>
  )
}

function DeferTableContent({
  branchFilter,
  setBranchFilter,
  defers,
  columns,
  isLoading,
}: {
  branchFilter: string
  setBranchFilter: (v: string) => void
  defers: DeferRecord[]
  columns: ColumnDef<DeferRecord>[]
  isLoading: boolean
}) {
  return (
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
          data={defers}
          columns={columns}
          searchPlaceholder="Search defer records..."
          className="mt-4"
          mobileRender={(row) => (
            <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-4">
              <p className="font-medium">{row.studentName}</p>
              <p className="text-sm text-gray-500">Defer to {row.deferIntake}</p>
              <p className="text-sm">{row.deferReason}</p>
            </div>
          )}
        />
      )}
    </>
  )
}
