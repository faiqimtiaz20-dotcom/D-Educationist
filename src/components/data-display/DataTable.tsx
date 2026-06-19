import { useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type VisibilityState,
} from '@tanstack/react-table'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { MobileCardList } from '@/components/data-display/MobileCardList'
import { ColumnVisibilityMenu } from '@/components/data-display/ColumnVisibilityMenu'

interface DataTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData, unknown>[]
  searchPlaceholder?: string
  searchKey?: string
  enableRowSelection?: boolean
  enableColumnVisibility?: boolean
  pageSize?: number
  mobileRender?: (row: TData) => React.ReactNode
  className?: string
  onRowSelectionChange?: (rows: TData[]) => void
  compact?: boolean
  getRowClassName?: (row: TData) => string | undefined
}

export function DataTable<TData>({
  data,
  columns,
  searchPlaceholder = 'Search...',
  searchKey,
  enableRowSelection = false,
  enableColumnVisibility = true,
  pageSize = 10,
  mobileRender,
  className,
  onRowSelectionChange,
  compact = true,
  getRowClassName,
}: DataTableProps<TData>) {
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const tableColumns = useMemo(() => {
    if (!enableRowSelection) return columns

    const selectColumn: ColumnDef<TData, unknown> = {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    }

    return [selectColumn, ...columns]
  }, [columns, enableRowSelection])

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      globalFilter,
      rowSelection,
      columnVisibility,
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      const next = typeof updater === 'function' ? updater(rowSelection) : updater
      setRowSelection(next)
      if (onRowSelectionChange) {
        const selected = Object.keys(next)
          .map((key) => data[Number(key)])
          .filter(Boolean)
        onRowSelectionChange(selected)
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      if (!filterValue) return true
      const query = String(filterValue).toLowerCase()
      if (searchKey) {
        const value = row.getValue(searchKey)
        return String(value ?? '').toLowerCase().includes(query)
      }
      return Object.values(row.original as Record<string, unknown>).some((value) =>
        String(value ?? '').toLowerCase().includes(query),
      )
    },
    initialState: {
      pagination: { pageSize },
    },
  })

  const rows = table.getRowModel().rows

  return (
    <div className={cn('space-y-4 laptop:space-y-3', className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between laptop:gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400 laptop:left-2.5 laptop:size-3.5" />
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9 laptop:h-8 laptop:pl-8 laptop:text-xs"
          />
        </div>
        {enableColumnVisibility && <ColumnVisibilityMenu table={table} />}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm laptop:text-xs">
            <thead className="border-b border-gray-200 bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={cn(
                        'text-left font-semibold uppercase tracking-wide text-gray-500',
                        compact
                          ? 'whitespace-nowrap px-2 py-1.5 text-xs laptop:px-1.5 laptop:py-1 laptop:text-[11px]'
                          : 'px-4 py-3 text-xs laptop:px-3 laptop:py-2',
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={table.getVisibleLeafColumns().length || 1}
                    className={cn(
                      'text-center text-gray-500',
                      compact ? 'px-2 py-6 laptop:px-1.5 laptop:py-4' : 'px-4 py-8 laptop:px-3 laptop:py-6',
                    )}
                  >
                    No results found.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      'border-b border-gray-100 transition-colors hover:bg-gray-50',
                      getRowClassName?.(row.original),
                    )}
                    data-state={row.getIsSelected() ? 'selected' : undefined}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={cn(
                          'text-gray-700',
                          compact ? 'whitespace-nowrap px-2 py-1.5 laptop:px-1.5 laptop:py-1' : 'px-4 py-3 laptop:px-3 laptop:py-2',
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile card list */}
      {mobileRender && (
        <div className="md:hidden">
          <MobileCardList
            items={rows.map((row) => row.original)}
            renderItem={mobileRender}
            emptyMessage="No results found."
          />
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500 laptop:text-xs">
          {enableRowSelection && (
            <span className="mr-2">
              {table.getFilteredSelectedRowModel().rows.length} of{' '}
              {table.getFilteredRowModel().rows.length} selected
            </span>
          )}
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
