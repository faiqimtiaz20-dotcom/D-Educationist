import type { Column, Table } from '@tanstack/react-table'
import { List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function getColumnLabel<TData>(column: Column<TData, unknown>): string {
  const meta = column.columnDef.meta as { label?: string } | undefined
  if (meta?.label) return meta.label

  const header = column.columnDef.header
  if (typeof header === 'string') return header

  const accessorKey = (column.columnDef as { accessorKey?: string }).accessorKey
  const source = accessorKey ?? column.id

  return source
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim()
}

interface ColumnVisibilityMenuProps<TData> {
  table: Table<TData>
}

export function ColumnVisibilityMenu<TData>({ table }: ColumnVisibilityMenuProps<TData>) {
  const hideableColumns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanHide() && column.id !== 'select')

  if (hideableColumns.length === 0) return null

  const showAll = () => {
    hideableColumns.forEach((column) => column.toggleVisibility(true))
  }

  const showNone = () => {
    hideableColumns.forEach((column) => column.toggleVisibility(false))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2 laptop:h-8 laptop:gap-1.5" aria-label="Show or hide columns">
          <List className="size-4" />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-0">
        <div className="max-h-80 overflow-y-auto py-1">
          {hideableColumns.map((column) => (
            <label
              key={column.id}
              className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
            >
              <Checkbox
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                aria-label={`Toggle ${getColumnLabel(column)} column`}
              />
              <span className="truncate">{getColumnLabel(column)}</span>
            </label>
          ))}
        </div>
        <div className="flex border-t border-gray-200 px-3 py-2 text-sm">
          <button type="button" className="text-primary hover:underline" onClick={showAll}>
            Show all
          </button>
          <span className="mx-2 text-gray-300">|</span>
          <button type="button" className="text-primary hover:underline" onClick={showNone}>
            Show none
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
