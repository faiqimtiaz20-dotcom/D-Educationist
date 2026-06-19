import { Calendar, Clock } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton'
import { Card, CardContent } from '@/components/ui/card'
import { useStudentPortal } from '@/features/shared/useStudentPortal'
import { format } from 'date-fns'

export default function StudentAppointmentsPage() {
  const { student, isLoading } = useStudentPortal()

  const appointments = [
    student?.appointment?.date
      ? {
          id: '1',
          title: 'Counselling Session',
          date: student.appointment.date,
          time: student.appointment.time ?? '10:00',
          remarks: student.appointment.remarks ?? 'Discuss application progress',
          type: 'upcoming' as const,
        }
      : null,
    student?.followUp?.date
      ? {
          id: '2',
          title: 'Follow-up Call',
          date: student.followUp.date,
          time: student.followUp.time ?? '14:00',
          remarks: student.followUp.remarks ?? 'Document review follow-up',
          type: 'scheduled' as const,
        }
      : null,
    {
      id: '3',
      title: 'Initial Consultation',
      date: '2026-05-15',
      time: '11:00',
      remarks: 'First counselling session completed',
      type: 'past' as const,
    },
  ].filter(Boolean) as Array<{
    id: string
    title: string
    date: string
    time: string
    remarks: string
    type: 'upcoming' | 'scheduled' | 'past'
  }>

  if (isLoading) {
    return (
      <PageShell title="Appointments">
        <LoadingSkeleton variant="card" rows={3} />
      </PageShell>
    )
  }

  return (
    <PageShell title="Appointments" className="pb-20 lg:pb-6">
      {appointments.length === 0 ? (
        <p className="text-sm text-gray-500">No appointments scheduled.</p>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <Card key={appt.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="size-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium">{appt.title}</p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
                          appt.type === 'past'
                            ? 'bg-gray-100 text-gray-500'
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {appt.type}
                      </span>
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="size-3.5" />
                      {format(new Date(appt.date), 'dd MMM yyyy')} at {appt.time}
                    </p>
                    <p className="mt-2 text-sm text-gray-600">{appt.remarks}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  )
}
