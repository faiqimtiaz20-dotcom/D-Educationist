import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { DataTable } from '@/components/data-display/DataTable'
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton'
import { AddCampusModal } from '@/components/modals/AddCampusModal'
import { AddUniversityMasterModal } from '@/components/modals/AddUniversityMasterModal'
import { ImportUniversityModal } from '@/components/modals/ImportUniversityModal'
import { ViewUniversityDetailsModal } from '@/components/modals/ViewUniversityDetailsModal'
import { Button } from '@/components/ui/button'
import { universityService } from '@/services'
import type { UniversityEntry } from '@/services/university.service'

export function UniversityMasterSection() {
  const queryClient = useQueryClient()
  const [detailsCountry, setDetailsCountry] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [campusOpen, setCampusOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['masters-universities'],
    queryFn: () => universityService.getAll({ pageSize: 100 }),
  })

  const countries = useMemo(
    () => (data?.data ?? []).map((entry) => entry.country).sort((a, b) => a.localeCompare(b)),
    [data],
  )

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['masters-universities'] })
    queryClient.invalidateQueries({ queryKey: ['university-masters'] })
    queryClient.invalidateQueries({ queryKey: ['university-masters-all'] })
  }

  const columns: ColumnDef<UniversityEntry>[] = [
    { accessorKey: 'country', header: 'Country' },
    {
      accessorKey: 'count',
      header: 'No. of Universities',
      cell: ({ row }) => row.original.count.toLocaleString(),
    },
    {
      id: 'details',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs"
          onClick={() => setDetailsCountry(row.original.country)}
        >
          View Details
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold dark:text-gray-100">University</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setCampusOpen(true)}>
            <Plus className="size-4" />
            Add Campus
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" />
            Add University
          </Button>
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
            <Plus className="size-4" />
            Import University
          </Button>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <DataTable
          data={data?.data ?? []}
          columns={columns}
          searchPlaceholder="Country"
          searchKey="country"
          pageSize={10}
        />
      )}

      <ViewUniversityDetailsModal
        open={!!detailsCountry}
        onOpenChange={(open) => !open && setDetailsCountry(null)}
        country={detailsCountry}
        countries={countries}
        onChanged={invalidate}
      />

      <AddUniversityMasterModal
        open={addOpen}
        onOpenChange={setAddOpen}
        countries={countries}
        defaultCountry={detailsCountry ?? ''}
        onSaved={invalidate}
      />

      <AddCampusModal open={campusOpen} onOpenChange={setCampusOpen} onSaved={invalidate} />

      <ImportUniversityModal open={importOpen} onOpenChange={setImportOpen} onImported={invalidate} />
    </div>
  )
}
