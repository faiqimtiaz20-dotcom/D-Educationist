import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FilterSelect } from '@/features/shared/FilterField'
import { BRANCHES, COUNTRIES } from '@/lib/constants'

const STAFF = [
  { label: 'All Staff', value: '' },
  { label: 'Counsellor A', value: 'Counsellor A' },
  { label: 'Calling Team', value: 'Calling Team' },
  { label: 'Counselling', value: 'Counselling' },
]

const INTAKES = ['Jan-2026', 'Apr-2026', 'Jul-2026', 'Nov-2026', 'Jan-2027']

interface DashboardFiltersBarProps {
  branch: string
  staff: string
  country: string
  intake: string
  dateFrom: string
  dateTo: string
  onBranchChange: (value: string) => void
  onStaffChange: (value: string) => void
  onCountryChange: (value: string) => void
  onIntakeChange: (value: string) => void
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
  onReset: () => void
}

export function DashboardFiltersBar({
  branch,
  staff,
  country,
  intake,
  dateFrom,
  dateTo,
  onBranchChange,
  onStaffChange,
  onCountryChange,
  onIntakeChange,
  onDateFromChange,
  onDateToChange,
  onReset,
}: DashboardFiltersBarProps) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-gray-200/80 shadow-sm laptop:p-3">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <SlidersHorizontal className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 laptop:text-xs">Filters</p>
            <p className="text-xs text-gray-500">Refine dashboard metrics</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onReset} className="shrink-0">
          <RotateCcw className="size-3.5" />
          Reset
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
        <FilterSelect
          label="Branch"
          value={branch}
          onChange={onBranchChange}
          options={BRANCHES.map((b) => ({ label: b, value: b }))}
        />
        <FilterSelect label="User / Staff" value={staff} onChange={onStaffChange} options={STAFF} />
        <FilterSelect
          label="Country"
          value={country}
          onChange={onCountryChange}
          options={COUNTRIES.map((c) => ({ label: c, value: c }))}
        />
        <FilterSelect
          label="Intake"
          value={intake}
          onChange={onIntakeChange}
          options={INTAKES.map((i) => ({ label: i, value: i }))}
        />
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500">Date From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 text-sm transition-colors focus:border-primary/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 laptop:h-8 laptop:text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500">Date To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 text-sm transition-colors focus:border-primary/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 laptop:h-8 laptop:text-xs"
          />
        </div>
      </div>
    </div>
  )
}
