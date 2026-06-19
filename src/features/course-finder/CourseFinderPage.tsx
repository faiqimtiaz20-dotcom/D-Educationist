import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { Search } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { DataTable } from '@/components/data-display/DataTable'
import { FilterPanel } from '@/components/filters/FilterPanel'
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton'
import { FilterSelect, FilterInput } from '@/features/shared/FilterField'
import { Button } from '@/components/ui/button'
import { courseService } from '@/services'
import type { Course } from '@/services/course.service'
import { COUNTRIES, APPLY_LEVELS } from '@/lib/constants'

const INTAKES = ['Jan-2026', 'Apr-2026', 'Jul-2026', 'Nov-2026', 'Sep-2026']

export function CourseFinderPage() {
  const [country, setCountry] = useState('')
  const [level, setLevel] = useState('')
  const [course, setCourse] = useState('')
  const [intake, setIntake] = useState('')
  const [searched, setSearched] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['courses', country, level, course, intake],
    queryFn: () =>
      courseService.getAll({
        pageSize: 200,
        country: country || undefined,
        level: level || undefined,
        course: course || undefined,
        intake: intake || undefined,
      }),
    enabled: searched,
  })

  const results = data?.data ?? []

  const columns: ColumnDef<Course>[] = [
    { accessorKey: 'country', header: 'Country' },
    { accessorKey: 'university', header: 'University' },
    { accessorKey: 'course', header: 'Course' },
    { accessorKey: 'level', header: 'Level' },
    { accessorKey: 'intake', header: 'Intake' },
    { accessorKey: 'duration', header: 'Duration' },
    { accessorKey: 'tuition', header: 'Tuition' },
  ]

  const handleSearch = () => setSearched(true)

  return (
    <PageShell title="Course Finder" breadcrumbs={[{ label: 'Course Finder' }]}>
      <FilterPanel defaultOpen>
        <FilterSelect
          label="Country"
          value={country}
          onChange={setCountry}
          options={COUNTRIES.map((c) => ({ label: c, value: c }))}
        />
        <FilterSelect
          label="Apply Level"
          value={level}
          onChange={setLevel}
          options={APPLY_LEVELS.map((l) => ({ label: l, value: l }))}
        />
        <FilterInput label="Course Name" value={course} onChange={setCourse} placeholder="MBA, MCOM..." />
        <FilterSelect
          label="Intake"
          value={intake}
          onChange={setIntake}
          options={INTAKES.map((i) => ({ label: i, value: i }))}
        />
        <div className="flex items-end">
          <Button onClick={handleSearch} className="w-full">
            <Search className="size-4" />
            Search Courses
          </Button>
        </div>
      </FilterPanel>

      {!searched ? (
        <div className="mt-8 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-600 dark:bg-gray-800/50">
          <Search className="mx-auto size-10 text-gray-300 dark:text-gray-600" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">Use filters above and click Search to find courses.</p>
        </div>
      ) : isLoading ? (
        <LoadingSkeleton className="mt-4" />
      ) : (
        <>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{results.length} courses found</p>
          <DataTable
            data={results}
            columns={columns}
            searchPlaceholder="Filter results..."
            className="mt-2"
            pageSize={15}
          />
        </>
      )}
    </PageShell>
  )
}
