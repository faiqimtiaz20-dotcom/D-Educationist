import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FolderOpen, FileText } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { FilterPanel } from '@/components/filters/FilterPanel'
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton'
import { FilterInput } from '@/features/shared/FilterField'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { studentService } from '@/services'
import { BRAND } from '@/lib/constants'
import type { Student } from '@/types'
import { type PortalPageProps, usePortalContext } from '@/features/shared/portal'

export function StudentDocumentsPage(props: PortalPageProps = {}) {
  const { prefix, partnerId, isPartner, isAdmin } = usePortalContext(props)
  const [tab, setTab] = useState(isPartner ? 'partner' : 'all')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['student-documents', partnerId],
    queryFn: () =>
      studentService.getAll({
        pageSize: 200,
        partnerId: isPartner ? partnerId : undefined,
      }),
  })

  const students = useMemo(() => {
    let items = data?.data ?? []
    if (tab === 'partner') items = items.filter((s) => s.partnerId)
    if (tab === BRAND.directScopeKey) items = items.filter((s) => !s.partnerId)
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(
        (s) =>
          s.firstName.toLowerCase().includes(q) ||
          s.lastName.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q),
      )
    }
    return items
  }, [data, tab, search])

  return (
    <PageShell
      title={isPartner ? 'Student Documents' : 'Student Documents'}
      breadcrumbs={
        isPartner
          ? [{ label: 'Documents' }]
          : [
              { label: 'File Manager', href: `${prefix}/files/standard` },
              { label: 'Student Document' },
            ]
      }
    >
      {isAdmin ? (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="partner">Partner</TabsTrigger>
            <TabsTrigger value={BRAND.directScopeKey}>{BRAND.directTabLabel}</TabsTrigger>
          </TabsList>
          <TabsContent value={tab}>
            <DocumentsGrid
              students={students}
              isLoading={isLoading}
              search={search}
              setSearch={setSearch}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <DocumentsGrid
          students={students}
          isLoading={isLoading}
          search={search}
          setSearch={setSearch}
        />
      )}
    </PageShell>
  )
}

function DocumentsGrid({
  students,
  isLoading,
  search,
  setSearch,
}: {
  students: Student[]
  isLoading: boolean
  search: string
  setSearch: (v: string) => void
}) {
  return (
    <>
      <FilterPanel className="mt-2">
        <FilterInput
          label="Search Student"
          value={search}
          onChange={setSearch}
          placeholder="Name or student ID..."
        />
      </FilterPanel>

      {isLoading ? (
        <LoadingSkeleton variant="card" rows={6} className="mt-4" />
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {students.map((student) => (
            <StudentDocCard key={student.id} student={student} />
          ))}
          {students.length === 0 && (
            <p className="col-span-full py-8 text-center text-gray-500">No students found.</p>
          )}
        </div>
      )}
    </>
  )
}

function StudentDocCard({ student }: { student: Student }) {
  const docCount = student.docStatus === 'Completed' ? 12 : 5
  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-md">
      <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
        <div className="relative">
          <FolderOpen className="size-12 text-primary" />
          <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
            {docCount}
          </span>
        </div>
        <div>
          <p className="font-medium text-gray-900">
            {student.firstName} {student.lastName}
          </p>
          <p className="text-xs text-gray-500">{student.studentId}</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <FileText className="size-3" />
          {student.docStatus === 'Completed' ? 'All docs uploaded' : 'Docs pending'}
        </div>
        {student.partnerName && (
          <p className="text-xs text-primary">{student.partnerName}</p>
        )}
      </CardContent>
    </Card>
  )
}
