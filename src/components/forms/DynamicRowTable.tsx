import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DynamicRowTableProps<T> {
  rows: T[]
  onChange: (rows: T[]) => void
  createEmptyRow: () => T
  renderRow: (row: T, index: number, update: (patch: Partial<T>) => void) => React.ReactNode
  columns: { key: string; label: string; className?: string }[]
  addLabel?: string
  minRows?: number
  className?: string
}

export function DynamicRowTable<T extends { id?: string }>({
  rows,
  onChange,
  createEmptyRow,
  renderRow,
  columns,
  addLabel = 'Add Row',
  minRows = 0,
  className,
}: DynamicRowTableProps<T>) {
  const updateRow = (index: number, patch: Partial<T>) => {
    const next = rows.map((row, i) => (i === index ? { ...row, ...patch } : row))
    onChange(next)
  }

  const addRow = () => {
    onChange([...rows, createEmptyRow()])
  }

  const removeRow = (index: number) => {
    if (rows.length <= minRows) return
    onChange(rows.filter((_, i) => i !== index))
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      'px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500',
                      col.className,
                    )}
                  >
                    {col.label}
                  </th>
                ))}
                <th className="w-12 px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="px-3 py-6 text-center text-gray-500"
                  >
                    No rows added yet.
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr key={row.id ?? index} className="border-b border-gray-100 last:border-0">
                    {renderRow(row, index, (patch) => updateRow(index, patch))}
                    <td className="px-3 py-2 align-top">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-danger hover:text-danger"
                        onClick={() => removeRow(index)}
                        disabled={rows.length <= minRows}
                        aria-label="Remove row"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={addRow}>
        <Plus className="size-4" />
        {addLabel}
      </Button>
    </div>
  )
}
