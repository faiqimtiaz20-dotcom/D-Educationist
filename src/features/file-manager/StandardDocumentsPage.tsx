import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { Upload, Trash2 } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { DataTable } from '@/components/data-display/DataTable'
import { FormSection } from '@/components/forms/FormSection'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import type { StandardDocument } from '@/types'
import { format } from 'date-fns'

const INITIAL_DOCS: StandardDocument[] = [
  { id: 'sd1', name: 'Passport Copy Template', fileName: 'passport-template.pdf', createdAt: '2026-01-15T00:00:00Z', updatedAt: '2026-01-15T00:00:00Z' },
  { id: 'sd2', name: 'Academic Transcript Format', fileName: 'transcript-format.pdf', createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'sd3', name: 'Visa Checklist', fileName: 'visa-checklist.pdf', createdAt: '2026-03-10T00:00:00Z', updatedAt: '2026-03-10T00:00:00Z' },
]

async function fetchDocs(): Promise<StandardDocument[]> {
  await new Promise((r) => setTimeout(r, 300))
  return INITIAL_DOCS
}

export function StandardDocumentsPage() {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['standard-documents'],
    queryFn: fetchDocs,
  })

  const addMutation = useMutation({
    mutationFn: async (payload: { name: string; fileName: string }) => {
      await new Promise((r) => setTimeout(r, 300))
      const doc: StandardDocument = {
        id: `sd${Date.now()}`,
        name: payload.name,
        fileName: payload.fileName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      INITIAL_DOCS.unshift(doc)
      return doc
    },
    onSuccess: () => {
      toast.success('Document added')
      setName('')
      setFile(null)
      queryClient.invalidateQueries({ queryKey: ['standard-documents'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await new Promise((r) => setTimeout(r, 300))
      const idx = INITIAL_DOCS.findIndex((d) => d.id === id)
      if (idx >= 0) INITIAL_DOCS.splice(idx, 1)
    },
    onSuccess: () => {
      toast.success('Document deleted')
      queryClient.invalidateQueries({ queryKey: ['standard-documents'] })
    },
  })

  const columns: ColumnDef<StandardDocument>[] = [
    { accessorKey: 'name', header: 'Document Name' },
    { accessorKey: 'fileName', header: 'File' },
    {
      accessorKey: 'createdAt',
      header: 'Uploaded',
      cell: ({ row }) => format(new Date(row.original.createdAt), 'dd MMM yyyy'),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-danger"
          onClick={() => deleteMutation.mutate(row.original.id)}
        >
          <Trash2 className="size-4" />
        </Button>
      ),
    },
  ]

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !file) {
      toast.error('Name and file are required')
      return
    }
    addMutation.mutate({ name, fileName: file.name })
  }

  return (
    <PageShell
      title="Standard Documents"
      breadcrumbs={[
        { label: 'File Manager', href: '/admin/files/standard' },
        { label: 'Standard Document' },
      ]}
    >
      <FormSection title="Add Standard Document">
        <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Document Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Passport Copy" />
          </div>
          <div className="space-y-1.5">
            <Label>Upload File *</Label>
            <Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} accept=".pdf,.doc,.docx,.jpg,.png" />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={addMutation.isPending}>
              <Upload className="size-4" />
              Upload Document
            </Button>
          </div>
        </form>
      </FormSection>

      {!isLoading && (
        <DataTable data={docs} columns={columns} searchPlaceholder="Search documents..." className="mt-6" />
      )}
    </PageShell>
  )
}
