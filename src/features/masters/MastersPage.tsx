import { useCallback, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { DataTable } from '@/components/data-display/DataTable'
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { universityService } from '@/services'
import { MASTER_CATEGORIES } from '@/lib/constants'
import { UniversityMasterSection } from '@/features/masters/UniversityMasterSection'
import {
  loadMasterRecords,
  createMasterRecord,
  updateMasterRecord,
  deleteMasterRecord,
  type MasterRecord,
} from '@/lib/masterStore'

export function MastersPage() {
  const queryClient = useQueryClient()
  const [category, setCategory] = useState('university')
  const [editItem, setEditItem] = useState<MasterRecord | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [formName, setFormName] = useState('')

  const isUniversity = category === 'university'

  const { data: universityData } = useQuery({
    queryKey: ['masters-universities'],
    queryFn: () => universityService.getAll({ pageSize: 100 }),
    enabled: isUniversity,
  })

  const { data: genericData, isLoading: genericLoading } = useQuery({
    queryKey: ['masters-generic', category],
    queryFn: () => loadMasterRecords(category),
    enabled: !isUniversity,
  })

  const invalidateGeneric = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['masters-generic', category] })
  }, [queryClient, category])

  const handleGenericCreate = () => {
    if (!formName.trim()) return
    createMasterRecord(category, formName.trim())
    toast.success('Record created')
    setCreateOpen(false)
    setFormName('')
    invalidateGeneric()
  }

  const handleGenericUpdate = () => {
    if (!editItem || !formName.trim()) return
    updateMasterRecord(category, editItem.id, formName.trim())
    toast.success('Record updated')
    setEditItem(null)
    setFormName('')
    invalidateGeneric()
  }

  const handleGenericDelete = (id: string) => {
    deleteMasterRecord(category, id)
    toast.success('Record deleted')
    invalidateGeneric()
  }

  const genericRecords = genericData ?? []
  const universityCount = universityData?.total ?? MASTER_CATEGORIES.find((c) => c.key === 'university')?.count ?? 0

  const genericColumns: ColumnDef<MasterRecord>[] = [
    { accessorKey: 'name', header: 'Name' },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditItem(row.original)
              setFormName(row.original.name)
            }}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-danger"
            onClick={() => handleGenericDelete(row.original.id)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ]

  const selectedLabel = useMemo(
    () => MASTER_CATEGORIES.find((c) => c.key === category)?.label ?? category,
    [category],
  )

  const openCreate = () => {
    setFormName('')
    setCreateOpen(true)
  }

  return (
    <PageShell
      title="Master's"
      breadcrumbs={[{ label: "Master's" }]}
      action={
        !isUniversity ? (
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Add Record
          </Button>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4 lg:flex-row">
        <aside className="w-full shrink-0 rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 lg:w-64">
          <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <h3 className="text-sm font-semibold dark:text-gray-100">Categories</h3>
          </div>
          <ul className="max-h-[60vh] overflow-y-auto p-2">
            {MASTER_CATEGORIES.map((cat) => (
              <li key={cat.key}>
                <button
                  type="button"
                  onClick={() => setCategory(cat.key)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors',
                    category === cat.key
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700',
                  )}
                >
                  <span className="truncate">{cat.label}</span>
                  <span
                    className={cn(
                      'ml-2 shrink-0 text-xs',
                      category === cat.key ? 'text-white/70' : 'text-gray-400',
                    )}
                  >
                    {cat.key === 'university'
                      ? universityCount
                      : cat.key === category && !isUniversity
                        ? genericRecords.length
                        : cat.count}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="min-w-0 flex-1">
          {isUniversity ? (
            <UniversityMasterSection />
          ) : (
            <>
              <h2 className="mb-4 text-lg font-semibold dark:text-gray-100">{selectedLabel}</h2>
              {genericLoading ? (
                <LoadingSkeleton />
              ) : (
                <DataTable
                  data={genericRecords}
                  columns={genericColumns}
                  searchPlaceholder="Search..."
                  searchKey="name"
                />
              )}
            </>
          )}
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Add {selectedLabel}</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-1.5">
            <Label>Name</Label>
            <Input value={formName} onChange={(e) => setFormName(e.target.value)} />
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenericCreate} disabled={!formName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editItem}
        onOpenChange={() => {
          setEditItem(null)
          setFormName('')
        }}
      >
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Edit — {editItem?.name}</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-1.5">
            <Label>Name</Label>
            <Input value={formName} onChange={(e) => setFormName(e.target.value)} />
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>
              Cancel
            </Button>
            <Button onClick={handleGenericUpdate} disabled={!formName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
