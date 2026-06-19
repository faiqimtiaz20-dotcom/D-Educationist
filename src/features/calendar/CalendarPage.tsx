import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import type { DateClickArg, EventDropArg, EventResizeDoneArg } from '@fullcalendar/interaction'
import type { EventClickArg, EventInput } from '@fullcalendar/core'
import { toast } from 'sonner'
import { PageShell } from '@/components/layout/PageShell'
import { FilterPanel } from '@/components/filters/FilterPanel'
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton'
import { FilterSelect } from '@/features/shared/FilterField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { calendarService } from '@/services'
import { BRANCHES } from '@/lib/constants'
import type { CalendarEvent } from '@/types'

const EVENT_COLORS: Record<string, { bg: string; label: string }> = {
  'enquiry-followup': { bg: '#3b82f6', label: 'Enquiry Follow-up' },
  'enquiry-appointment': { bg: '#60a5fa', label: 'Enquiry Appointment' },
  'student-followup': { bg: '#22c55e', label: 'Student Follow-up' },
  'student-appointment': { bg: '#4ade80', label: 'Student Appointment' },
  'application-followup': { bg: '#f97316', label: 'Application Follow-up' },
  'application-appointment': { bg: '#fb923c', label: 'Application Appointment' },
  'application-due': { bg: '#ef4444', label: 'Application Due' },
  'visa-followup': { bg: '#8b5cf6', label: 'Visa Follow-up' },
  'visa-appointment': { bg: '#a78bfa', label: 'Visa Appointment' },
  'invoice-due': { bg: '#eab308', label: 'Invoice Due' },
}

const STAFF = [
  { label: 'All Staff', value: '' },
  { label: 'Staff 1', value: '1' },
  { label: 'Staff 2', value: '2' },
]

interface EventFormState {
  title: string
  start: string
  end: string
  category: CalendarEvent['category']
  eventType: CalendarEvent['eventType']
  branch: string
}

const defaultForm = (start: string): EventFormState => ({
  title: '',
  start,
  end: start,
  category: 'enquiry',
  eventType: 'followup',
  branch: BRANCHES[0],
})

function toCalendarEvents(events: CalendarEvent[]): EventInput[] {
  return events.map((ev) => {
    const key = `${ev.category}-${ev.eventType}`
    const color = EVENT_COLORS[key]?.bg ?? '#1e3a5f'
    return {
      id: ev.id,
      title: ev.title,
      start: ev.start,
      end: ev.end,
      backgroundColor: color,
      borderColor: color,
      extendedProps: ev,
    }
  })
}

export function CalendarPage() {
  const queryClient = useQueryClient()
  const [branch, setBranch] = useState('')
  const [staff, setStaff] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<EventFormState>(defaultForm(new Date().toISOString().slice(0, 16)))

  const { data, isLoading } = useQuery({
    queryKey: ['calendar-events', branch, staff],
    queryFn: () => calendarService.getAll({ pageSize: 200 }),
  })

  const createMutation = useMutation({
    mutationFn: calendarService.create,
    onSuccess: () => {
      toast.success('Event created')
      setDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
    },
    onError: () => toast.error('Failed to create event'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CalendarEvent> }) =>
      calendarService.update(id, payload),
    onSuccess: () => {
      toast.success('Event updated')
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
    },
    onError: () => toast.error('Failed to update event'),
  })

  const filteredEvents = useMemo(() => {
    let events = data?.data ?? []
    if (branch) events = events.filter((e) => e.branch === branch)
    if (staff) events = events.filter((e) => e.staffId === staff)
    return toCalendarEvents(events)
  }, [data, branch, staff])

  const openCreate = (start: string) => {
    setEditingId(null)
    setForm(defaultForm(start))
    setDialogOpen(true)
  }

  const openEdit = (event: CalendarEvent) => {
    setEditingId(event.id)
    setForm({
      title: event.title,
      start: event.start.slice(0, 16),
      end: (event.end ?? event.start).slice(0, 16),
      category: event.category,
      eventType: event.eventType,
      branch: event.branch ?? BRANCHES[0],
    })
    setDialogOpen(true)
  }

  const handleDateClick = (info: DateClickArg) => {
    openCreate(info.dateStr)
  }

  const handleEventClick = (info: EventClickArg) => {
    const event = info.event.extendedProps as CalendarEvent
    openEdit({ ...event, id: info.event.id })
  }

  const handleEventDrop = (info: EventDropArg) => {
    if (!info.event.start) return
    updateMutation.mutate({
      id: info.event.id,
      payload: {
        start: info.event.start.toISOString(),
        end: info.event.end?.toISOString(),
      },
    })
  }

  const handleEventResize = (info: EventResizeDoneArg) => {
    if (!info.event.start) return
    updateMutation.mutate({
      id: info.event.id,
      payload: {
        start: info.event.start.toISOString(),
        end: info.event.end?.toISOString(),
      },
    })
  }

  const handleSubmit = () => {
    if (!form.title.trim()) return
    const payload = {
      title: form.title.trim(),
      start: new Date(form.start).toISOString(),
      end: form.end ? new Date(form.end).toISOString() : undefined,
      category: form.category,
      eventType: form.eventType,
      branch: form.branch,
    }
    if (editingId) {
      updateMutation.mutate({ id: editingId, payload })
      setDialogOpen(false)
    } else {
      createMutation.mutate(payload)
    }
  }

  return (
    <PageShell
      title="Calendar"
      breadcrumbs={[{ label: 'Calendar' }]}
    >
      <FilterPanel>
        <FilterSelect
          label="Branch"
          value={branch}
          onChange={setBranch}
          options={BRANCHES.map((b) => ({ label: b, value: b }))}
        />
        <FilterSelect label="Staff" value={staff} onChange={setStaff} options={STAFF} />
      </FilterPanel>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row">
        <aside className="w-full shrink-0 rounded-lg border border-gray-200 bg-white p-4 lg:w-56">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Event Legend</h3>
          <ul className="space-y-2">
            {Object.values(EVENT_COLORS).map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-xs text-gray-600">
                <span
                  className="size-3 shrink-0 rounded-sm"
                  style={{ backgroundColor: item.bg }}
                />
                {item.label}
              </li>
            ))}
          </ul>
        </aside>

        <div className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white p-4">
          {isLoading ? (
            <LoadingSkeleton variant="card" rows={3} />
          ) : (
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
              }}
              events={filteredEvents}
              height="auto"
              eventDisplay="block"
              dayMaxEvents={3}
              nowIndicator
              editable
              selectable
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
              eventResize={handleEventResize}
            />
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Event' : 'Create Event'}</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Event title"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Start</Label>
                <Input
                  type="datetime-local"
                  value={form.start}
                  onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>End</Label>
                <Input
                  type="datetime-local"
                  value={form.end}
                  onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value as CalendarEvent['category'] }))
                  }
                >
                  <option value="enquiry">Enquiry</option>
                  <option value="student">Student</option>
                  <option value="application">Application</option>
                  <option value="visa">Visa</option>
                  <option value="invoice">Invoice</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select
                  value={form.eventType}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, eventType: e.target.value as CalendarEvent['eventType'] }))
                  }
                >
                  <option value="followup">Follow-up</option>
                  <option value="appointment">Appointment</option>
                  <option value="due">Due</option>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Branch</Label>
              <Select
                value={form.branch}
                onChange={(e) => setForm((f) => ({ ...f, branch: e.target.value }))}
              >
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </Select>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!form.title.trim() || createMutation.isPending || updateMutation.isPending}
            >
              {editingId ? 'Save Changes' : 'Create Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
