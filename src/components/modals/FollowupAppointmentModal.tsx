import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {
  Ban,
  Calendar,
  Clock,
  Flag,
  List,
  Mail,
  Phone,
  Radio,
  User,
} from 'lucide-react'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { enquiryService, studentService } from '@/services'
import { APPLY_LEVELS, COUNTRIES, SOURCES, BRAND } from '@/lib/constants'
import {
  addAppointment,
  addComment,
  addFollowup,
  getAppointments,
  getComments,
  getFollowups,
  type FollowupEntityType,
} from '@/mocks/data/followupStore'
import { logActivity } from '@/mocks/data/activities'
import type { Enquiry, Student } from '@/types'

type FollowupEntity = Student | Enquiry

interface FollowupAppointmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityType: FollowupEntityType
  entity: FollowupEntity | null
  profileHref: string
  statusOptions: string[]
  dropStatus?: string
  onSaved?: () => void
}

type TabKey = 'followups' | 'appointments' | 'comments'

export function FollowupAppointmentModal({
  open,
  onOpenChange,
  entityType,
  entity,
  profileHref,
  statusOptions,
  dropStatus = 'On Hold',
  onSaved,
}: FollowupAppointmentModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('followups')
  const [refreshKey, setRefreshKey] = useState(0)

  const [interestedCountry, setInterestedCountry] = useState('')
  const [intake, setIntake] = useState('')
  const [applyLevel, setApplyLevel] = useState('')
  const [source, setSource] = useState('')
  const [status, setStatus] = useState('')

  const [nextDate, setNextDate] = useState('')
  const [nextTime, setNextTime] = useState('')
  const [remarks, setRemarks] = useState('')
  const [commentText, setCommentText] = useState('')

  useEffect(() => {
    if (!entity || !open) return
    setInterestedCountry(entity.interestedCountry ?? '')
    setIntake(entity.intake ?? '')
    setApplyLevel(entity.applyLevel ?? '')
    setSource(entity.source ?? '')
    setStatus(entity.status ?? '')
    setNextDate('')
    setNextTime('')
    setRemarks('')
    setCommentText('')
    setActiveTab('followups')
  }, [entity, open])

  const followups = entity ? getFollowups(entityType, entity.id) : []
  const appointments = entity ? getAppointments(entityType, entity.id) : []
  const comments = entity ? getComments(entityType, entity.id) : []

  const updateService = entityType === 'student' ? studentService : enquiryService
  const activityType = entityType === 'student' ? 'student' : 'enquiry'

  // refreshKey forces re-read from store after save
  void refreshKey

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!entity) return

      const profilePatch = {
        interestedCountry,
        intake,
        applyLevel,
        source,
        status,
      }

      if (activeTab === 'followups') {
        if (!nextDate || !nextTime || !remarks.trim()) {
          throw new Error('Please fill follow-up date, time, and remarks')
        }
        await updateService.update(entity.id, {
          ...profilePatch,
          followUp: { date: nextDate, time: nextTime, remarks: remarks.trim() },
        })
        addFollowup(entityType, entity.id, {
          action: 'Follow-up',
          createdBy: entity.assignedTo || BRAND.name,
          remarks: remarks.trim(),
          stage: status,
          attempt: followups.length + 1,
          nextDate,
          nextTime,
        })
        logActivity(activityType, entity.id, 'Follow-up scheduled', remarks.trim())
      } else if (activeTab === 'appointments') {
        if (!nextDate || !nextTime || !remarks.trim()) {
          throw new Error('Please fill appointment date, time, and remarks')
        }
        await updateService.update(entity.id, {
          ...profilePatch,
          appointment: { date: nextDate, time: nextTime, remarks: remarks.trim() },
        })
        addAppointment(entityType, entity.id, {
          action: 'Appointment',
          createdBy: entity.assignedTo || BRAND.name,
          remarks: remarks.trim(),
          stage: status,
          attempt: appointments.length + 1,
          nextDate,
          nextTime,
        })
        logActivity(activityType, entity.id, 'Appointment scheduled', remarks.trim())
      } else {
        if (!commentText.trim()) {
          throw new Error('Please enter a comment')
        }
        await updateService.update(entity.id, profilePatch)
        addComment(entityType, entity.id, commentText.trim(), entity.assignedTo || BRAND.name)
        logActivity(activityType, entity.id, 'Comment added', commentText.trim().slice(0, 80))
      }
    },
    onSuccess: () => {
      toast.success('Saved successfully')
      setNextDate('')
      setNextTime('')
      setRemarks('')
      setCommentText('')
      setRefreshKey((k) => k + 1)
      onSaved?.()
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to save'),
  })

  const dropMutation = useMutation({
    mutationFn: () => {
      if (!entity) return Promise.resolve()
      const patch =
        entityType === 'student'
          ? { status: dropStatus, remark: 'Dropped from follow-up' }
          : { status: dropStatus }
      return updateService.update(entity.id, patch)
    },
    onSuccess: () => {
      toast.success(entityType === 'student' ? 'Student marked as dropped' : 'Enquiry marked as dropped')
      logActivity(activityType, entity!.id, `${entityType} dropped`, `Marked ${dropStatus} from follow-up modal`)
      onSaved?.()
      onOpenChange(false)
    },
    onError: () => toast.error('Failed to update record'),
  })

  if (!entity) return null

  const fullName = `${entity.firstName} ${entity.lastName}`

  const historyTable = (
    rows: { id: string; action: string; createdBy: string; remarks: string; stage: string; attempt: number; nextDate?: string; nextTime?: string; createdAt: string }[],
  ) => (
    <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-xs">
        <thead className="bg-gray-50 text-left text-[10px] uppercase text-gray-500">
          <tr>
            <th className="px-2 py-1.5">S.No.</th>
            <th className="px-2 py-1.5">Action</th>
            <th className="px-2 py-1.5">Created By</th>
            <th className="px-2 py-1.5">Remarks</th>
            <th className="px-2 py-1.5">Stage</th>
            <th className="px-2 py-1.5">Attempt</th>
            <th className="px-2 py-1.5">Next Followup</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-2 py-6 text-center text-[11px] text-gray-400">
                No data available in table
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={row.id} className="border-t border-gray-100">
                <td className="px-2 py-1.5">{i + 1}</td>
                <td className="px-2 py-1.5">{row.action}</td>
                <td className="px-2 py-1.5">{row.createdBy}</td>
                <td className="max-w-[200px] truncate px-2 py-1.5" title={row.remarks}>{row.remarks}</td>
                <td className="px-2 py-1.5">{row.stage}</td>
                <td className="px-2 py-1.5">{row.attempt}</td>
                <td className="whitespace-nowrap px-2 py-1.5">
                  {row.nextDate
                    ? `${format(new Date(row.nextDate), 'dd/MM/yyyy')}${row.nextTime ? ` ${row.nextTime}` : ''}`
                    : '—'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )

  const commentsTable = (
    <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-xs">
        <thead className="bg-gray-50 text-left text-[10px] uppercase text-gray-500">
          <tr>
            <th className="px-2 py-1.5">S.No.</th>
            <th className="px-2 py-1.5">Comment</th>
            <th className="px-2 py-1.5">Created By</th>
            <th className="px-2 py-1.5">Date</th>
          </tr>
        </thead>
        <tbody>
          {comments.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-2 py-6 text-center text-[11px] text-gray-400">
                No data available in table
              </td>
            </tr>
          ) : (
            comments.map((row, i) => (
              <tr key={row.id} className="border-t border-gray-100">
                <td className="px-2 py-1.5">{i + 1}</td>
                <td className="px-2 py-1.5">{row.text}</td>
                <td className="px-2 py-1.5">{row.createdBy}</td>
                <td className="whitespace-nowrap px-2 py-1.5">
                  {format(new Date(row.createdAt), 'dd/MM/yyyy, hh:mm a')}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="2xl" className="text-xs">
        <DialogHeader
          actions={
            <Button variant="outline" size="sm" className="h-7 gap-1.5 border-white/30 bg-white/10 px-2.5 text-xs text-white hover:bg-white/20" asChild>
              <Link to={profileHref} onClick={() => onOpenChange(false)}>
                <User className="size-3.5" />
                Go To Profile
              </Link>
            </Button>
          }
        >
          <DialogTitle>Followup / Appointment</DialogTitle>
        </DialogHeader>

        <DialogBody className="space-y-3">
          <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-3">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-1.5 rounded-md border bg-white px-2.5 py-1.5 text-xs">
                <User className="size-3.5 shrink-0 text-primary" />
                <span className="truncate font-medium">{fullName}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-md border bg-white px-2.5 py-1.5 text-xs">
                <Mail className="size-3.5 shrink-0 text-primary" />
                <span className="truncate">{entity.email}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-md border bg-white px-2.5 py-1.5 text-xs">
                <Phone className="size-3.5 shrink-0 text-primary" />
                <span className="truncate">{entity.mobile}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-md border bg-white px-2.5 py-1.5 text-xs">
                <Flag className="size-3.5 shrink-0 text-primary" />
                <Select
                  value={interestedCountry}
                  onChange={(e) => setInterestedCountry(e.target.value)}
                  className="h-6 border-0 bg-transparent p-0 text-xs shadow-none focus:ring-0"
                >
                  <option value="">Select Country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </div>
              <div className="flex items-center gap-1.5 rounded-md border bg-white px-2.5 py-1.5 text-xs">
                <Calendar className="size-3.5 shrink-0 text-primary" />
                <Input
                  value={intake}
                  onChange={(e) => setIntake(e.target.value)}
                  placeholder="Intake"
                  className="h-6 border-0 bg-transparent p-0 text-xs shadow-none focus-visible:ring-0"
                />
              </div>
              <div className="flex items-center gap-1.5 rounded-md border bg-white px-2.5 py-1.5 text-xs">
                <List className="size-3.5 shrink-0 text-primary" />
                <Select
                  value={applyLevel}
                  onChange={(e) => setApplyLevel(e.target.value)}
                  className="h-6 border-0 bg-transparent p-0 text-xs shadow-none focus:ring-0"
                >
                  <option value="">Select Level</option>
                  {APPLY_LEVELS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </Select>
              </div>
              <div className="flex items-center gap-1.5 rounded-md border bg-white px-2.5 py-1.5 text-xs">
                <Radio className="size-3.5 shrink-0 text-primary" />
                <Select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="h-6 border-0 bg-transparent p-0 text-xs shadow-none focus:ring-0"
                >
                  <option value="">Select Source</option>
                  {SOURCES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </div>
              <div className="flex items-center gap-1.5 rounded-md border bg-white px-2.5 py-1.5 text-xs">
                <Radio className="size-3.5 shrink-0 text-primary" />
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-6 border-0 bg-transparent p-0 text-xs shadow-none focus:ring-0"
                >
                  <option value="">Select Status</option>
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <TabsList className="h-8">
                <TabsTrigger value="followups" className="px-2.5 py-1 text-xs">Followups ({followups.length})</TabsTrigger>
                <TabsTrigger value="appointments" className="px-2.5 py-1 text-xs">Appointments ({appointments.length})</TabsTrigger>
                <TabsTrigger value="comments" className="px-2.5 py-1 text-xs">Comment ({comments.length})</TabsTrigger>
              </TabsList>
              <Button
                variant="destructive"
                size="sm"
                className="h-7 gap-1 px-2.5 text-xs"
                onClick={() => dropMutation.mutate()}
                disabled={dropMutation.isPending}
              >
                <Ban className="size-3.5" />
                Drop
              </Button>
            </div>

            <TabsContent value="followups" className="mt-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label className="text-xs">Next Followup Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="date"
                      value={nextDate}
                      onChange={(e) => setNextDate(e.target.value)}
                      className="h-8 pl-8 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Next Followup Time *</Label>
                  <div className="relative">
                    <Clock className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="time"
                      value={nextTime}
                      onChange={(e) => setNextTime(e.target.value)}
                      className="h-8 pl-8 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1 sm:col-span-3">
                  <Label className="text-xs">Remarks *</Label>
                  <Textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={2}
                    placeholder="Enter follow-up remarks..."
                    className="min-h-[60px] text-xs"
                  />
                </div>
              </div>
              {historyTable(followups)}
            </TabsContent>

            <TabsContent value="appointments" className="mt-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label className="text-xs">Appointment Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="date"
                      value={nextDate}
                      onChange={(e) => setNextDate(e.target.value)}
                      className="h-8 pl-8 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Appointment Time *</Label>
                  <div className="relative">
                    <Clock className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="time"
                      value={nextTime}
                      onChange={(e) => setNextTime(e.target.value)}
                      className="h-8 pl-8 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1 sm:col-span-3">
                  <Label className="text-xs">Remarks *</Label>
                  <Textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={2}
                    placeholder="Enter appointment remarks..."
                    className="min-h-[60px] text-xs"
                  />
                </div>
              </div>
              {historyTable(appointments)}
            </TabsContent>

            <TabsContent value="comments" className="mt-3">
              <div className="space-y-1">
                <Label className="text-xs">Comment *</Label>
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                  placeholder="Add internal comment about this student..."
                  className="min-h-[72px] text-xs"
                />
              </div>
              {commentsTable}
            </TabsContent>
          </Tabs>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" size="sm" className="h-7 px-3 text-xs" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" className="h-7 px-3 text-xs" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
