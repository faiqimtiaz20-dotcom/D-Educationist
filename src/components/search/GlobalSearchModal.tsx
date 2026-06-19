import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, User, MessageSquare, FileText } from 'lucide-react'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useQuery } from '@tanstack/react-query'
import { enquiryService, studentService, applicationService } from '@/services'
import { useAuthStore } from '@/stores/authStore'
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton'

interface GlobalSearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GlobalSearchModal({ open, onOpenChange }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.user?.role ?? 'admin')
  const prefix = `/${role}`

  const { data: enquiries, isLoading: l1 } = useQuery({
    queryKey: ['search-enquiries', query],
    queryFn: () => enquiryService.getAll({ search: query, pageSize: 5 }),
    enabled: open && query.length >= 2,
  })
  const { data: students, isLoading: l2 } = useQuery({
    queryKey: ['search-students', query],
    queryFn: () => studentService.getAll({ search: query, pageSize: 5 }),
    enabled: open && query.length >= 2,
  })
  const { data: applications, isLoading: l3 } = useQuery({
    queryKey: ['search-apps', query],
    queryFn: () => applicationService.getAll({ search: query, pageSize: 5 }),
    enabled: open && query.length >= 2,
  })

  const loading = l1 || l2 || l3
  const hasResults =
    (enquiries?.data.length ?? 0) + (students?.data.length ?? 0) + (applications?.data.length ?? 0) > 0

  const go = (path: string) => {
    navigate(path)
    onOpenChange(false)
    setQuery('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Global Search</DialogTitle>
          <DialogDescription>Search students, enquiries, and applications</DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search students, enquiries..."
              className="pl-9"
              autoFocus
            />
          </div>

          {query.length < 2 ? (
            <p className="text-sm text-gray-500">Type at least 2 characters to search.</p>
          ) : loading ? (
            <LoadingSkeleton />
          ) : !hasResults ? (
            <p className="text-sm text-gray-500">No results found.</p>
          ) : (
            <div className="max-h-72 space-y-4 overflow-y-auto">
              {(enquiries?.data.length ?? 0) > 0 && (
                <section>
                  <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <MessageSquare className="size-3.5" /> Enquiries
                  </h4>
                  <ul className="space-y-1">
                    {enquiries!.data.map((e) => (
                      <li key={e.id}>
                        <button
                          type="button"
                          className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-primary/5"
                          onClick={() => go(`${prefix}/enquiry/${e.id}`)}
                        >
                          {e.firstName} {e.lastName} — {e.email}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {(students?.data.length ?? 0) > 0 && (
                <section>
                  <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <User className="size-3.5" /> Students
                  </h4>
                  <ul className="space-y-1">
                    {students!.data.map((s) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-primary/5"
                          onClick={() => go(`${prefix}/student/${s.id}`)}
                        >
                          {s.firstName} {s.lastName} — {s.studentId}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {(applications?.data.length ?? 0) > 0 && (
                <section>
                  <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <FileText className="size-3.5" /> Applications
                  </h4>
                  <ul className="space-y-1">
                    {applications!.data.map((a) => (
                      <li key={a.id}>
                        <button
                          type="button"
                          className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-primary/5"
                          onClick={() => go(`${prefix}/application`)}
                        >
                          {a.studentName} — {a.university}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
