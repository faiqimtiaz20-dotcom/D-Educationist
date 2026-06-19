import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  ExternalLink,
  Flag,
  Loader2,
  Mail,
  Phone,
  RotateCcw,
  Trash2,
  User,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { COUNTRIES } from '@/lib/constants'
import { applicationService, courseService } from '@/services'
import { logActivity } from '@/mocks/data/activities'
import type { Application } from '@/types'
import type { StudentApplicationGroup } from '@/features/application/groupApplicationsByStudent'

const INTAKES = ['Jan-2026', 'Apr-2026', 'Jul-2026', 'Sep-2026', 'Nov-2026', 'Feb-2027']
const ASSOCIATES = ['Apply Board', 'KC Overseas', 'Associate North', 'Associate South']

interface UniversityRow {
  id: string
  university: string
  course: string
  intake: string
  deadlineDate: string
  associate: string
}

interface AddUniversityApplicationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: StudentApplicationGroup | null
  application?: Application | null
  prefix: string
  onSaved?: () => void
}

function applicationToStudentContext(application: Application): StudentApplicationGroup {
  return {
    studentId: application.studentId,
    studentRef: application.studentRef,
    studentName: application.studentName,
    email: application.email,
    mobile: application.mobile,
    applicationCount: application.applicationCount,
    docStatus: application.docStatus,
    intCountry: application.intCountry,
    intake: application.intake,
    intCourse: application.intCourse,
    applyLevel: application.applyLevel,
    passportNo: application.passportNo,
    dateOfBirth: application.dateOfBirth,
    branch: application.branch,
    partnerId: application.partnerId,
    partnerName: application.partnerName,
    assignedBy: application.assignedBy,
    assignedTo: application.assignedTo,
    status: application.status,
    isPartner: application.isPartner,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
    applications: [application],
  }
}

function rowFromApplication(application: Application): UniversityRow {
  return {
    id: application.id,
    university: application.university ?? '',
    course: application.intCourse,
    intake: application.intake,
    deadlineDate: application.deadlineDate ?? '',
    associate: application.associate ?? '',
  }
}

function createRow(student?: StudentApplicationGroup | null): UniversityRow {
  return {
    id: crypto.randomUUID(),
    university: '',
    course: student?.intCourse ?? '',
    intake: student?.intake ?? '',
    deadlineDate: '',
    associate: '',
  }
}

function CountrySelect({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex overflow-hidden rounded-md border border-gray-300 bg-white shadow-sm">
      <span className="flex items-center border-r border-gray-200 bg-gray-100 px-3 text-gray-400">
        <Flag className="size-4" />
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 min-w-0 flex-1 appearance-none bg-white px-3 pr-8 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <option value="">Select Country</option>
        {COUNTRIES.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>
    </div>
  )
}

export function AddUniversityApplicationModal({
  open,
  onOpenChange,
  student,
  application = null,
  prefix,
  onSaved,
}: AddUniversityApplicationModalProps) {
  const isEdit = !!application
  const displayStudent = student ?? (application ? applicationToStudentContext(application) : null)

  const [country, setCountry] = useState('')
  const [rows, setRows] = useState<UniversityRow[]>([createRow()])

  const { data: courseData, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses', country],
    queryFn: () => courseService.getAll({ pageSize: 500, country }),
    enabled: open && !!country,
  })

  const courses = courseData?.data ?? []

  const universities = useMemo(() => {
    const names = new Set(courses.map((course) => course.university))
    for (const row of rows) {
      if (row.university) names.add(row.university)
    }
    return [...names].sort((a, b) => a.localeCompare(b))
  }, [courses, rows])

  useEffect(() => {
    if (!open) return

    if (application) {
      setCountry(application.intCountry || '')
      setRows([rowFromApplication(application)])
      return
    }

    if (student) {
      setCountry(student.intCountry || '')
      setRows([createRow(student)])
    }
  }, [application, student, open])

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!displayStudent) return
      if (!country) throw new Error('Please select a country')

      const validRows = rows.filter((row) => row.university)
      if (validRows.length === 0) throw new Error('Please select at least one university')

      for (const row of validRows) {
        if (!row.course.trim()) throw new Error('Please enter course for each university')
        if (!row.intake.trim()) throw new Error('Please select intake for each university')
      }

      if (isEdit && application) {
        const row = validRows[0]
        await applicationService.update(application.id, {
          intCountry: country,
          university: row.university,
          intCourse: row.course,
          intake: row.intake,
          associate: row.associate || undefined,
          deadlineDate: row.deadlineDate || undefined,
        })
        return
      }

      if (!student) return

      const newTotal = student.applicationCount + validRows.length
      await Promise.all(
        validRows.map((row) =>
          applicationService.create({
            studentId: student.studentId,
            studentRef: student.studentRef,
            studentName: student.studentName,
            email: student.email,
            mobile: student.mobile,
            applicationCount: newTotal,
            docStatus: student.docStatus,
            intCountry: country,
            intake: row.intake,
            intCourse: row.course,
            applyLevel: student.applyLevel,
            passportNo: student.passportNo,
            dateOfBirth: student.dateOfBirth,
            branch: student.branch,
            partnerId: student.partnerId,
            partnerName: student.partnerName,
            status: 'Application Started',
            university: row.university,
            associate: row.associate || undefined,
            deadlineDate: row.deadlineDate || undefined,
            assignedBy: student.assignedBy,
            assignedTo: student.assignedTo,
            isPartner: student.isPartner,
          }),
        ),
      )
    },
    onSuccess: () => {
      if (!displayStudent) return
      logActivity(
        'student',
        displayStudent.studentId,
        isEdit ? 'University application updated' : 'University application added',
        isEdit
          ? `Application updated for ${displayStudent.studentName}`
          : `New application(s) created for ${displayStudent.studentName}`,
      )
      toast.success(isEdit ? 'Application updated successfully' : 'Application saved successfully')
      onOpenChange(false)
      onSaved?.()
    },
    onError: (error: Error) =>
      toast.error(error.message || `Failed to ${isEdit ? 'update' : 'save'} application`),
  })

  const handleReset = () => {
    if (isEdit && application) {
      setCountry(application.intCountry || '')
      setRows([rowFromApplication(application)])
      return
    }
    setCountry('')
    setRows([createRow(student)])
  }

  const updateRow = (id: string, patch: Partial<UniversityRow>) => {
    setRows((current) =>
      current.map((row) => {
        if (row.id !== id) return row
        const next = { ...row, ...patch }
        if (patch.university && patch.university !== row.university) {
          const match = courses.find((course) => course.university === patch.university)
          if (match) {
            next.course = match.course
            next.intake = match.intake || next.intake
          }
        }
        return next
      }),
    )
  }

  const removeRow = (id: string) => {
    if (isEdit) return
    setRows((current) => {
      if (current.length === 1) return [createRow(student)]
      return current.filter((row) => row.id !== id)
    })
  }

  const addRow = () => {
    if (isEdit) return
    setRows((current) => [...current, createRow(student)])
  }

  if (!displayStudent) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit University Application' : 'Add University Application'}
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm">
            <span className="inline-flex items-center gap-1.5 font-medium text-gray-800">
              <User className="size-4 text-primary" />
              {displayStudent.studentName}
            </span>
            <span className="text-gray-300">|</span>
            <span className="inline-flex items-center gap-1.5 text-gray-600">
              <Phone className="size-4 text-primary" />
              {displayStudent.mobile}
            </span>
            <span className="text-gray-300">|</span>
            <span className="inline-flex items-center gap-1.5 text-gray-600">
              <Mail className="size-4 text-primary" />
              {displayStudent.email}
            </span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-[14rem] flex-1 space-y-1.5">
              <Label className="text-xs text-gray-600">
                Country <span className="text-danger">*</span>
              </Label>
              <CountrySelect value={country} onChange={setCountry} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="destructive" size="sm" onClick={handleReset}>
                <RotateCcw className="size-4" />
                Reset
              </Button>
              <Button type="button" variant="success" size="sm" asChild>
                <Link to={`${prefix}/course-finder`} onClick={() => onOpenChange(false)}>
                  <ExternalLink className="size-4" />
                  Apply Through Course Finder
                </Link>
              </Button>
            </div>
          </div>

          {country ? (
            <div className="space-y-3">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="relative space-y-3 rounded-lg border border-dashed border-gray-300 bg-gray-50/40 p-4 pr-12"
                >
                  {!isEdit && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute right-2 top-2 size-7 p-0"
                      onClick={() => removeRow(row.id)}
                      aria-label="Remove university application"
                    >
                      <X className="size-3.5" />
                    </Button>
                  )}

                  <select
                    value={row.university}
                    onChange={(e) => updateRow(row.id, { university: e.target.value })}
                    disabled={coursesLoading}
                    className="flex h-9 w-full appearance-none rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-60"
                  >
                    <option value="">
                      {coursesLoading ? 'Loading universities...' : 'Select University'}
                    </option>
                    {universities.map((university) => (
                      <option key={university} value={university}>
                        {university}
                      </option>
                    ))}
                  </select>

                  {row.university ? (
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-end">
                      <div className="min-w-[10rem] shrink-0">
                        <p className="mb-1 text-xs text-gray-500">University</p>
                        <p className="text-sm font-semibold text-success">{row.university}</p>
                      </div>
                      <div className="grid flex-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-1">
                          <Label className="text-[11px] text-gray-500">Course</Label>
                          <Input
                            value={row.course}
                            onChange={(e) => updateRow(row.id, { course: e.target.value })}
                            placeholder="Course"
                            className="h-9 text-sm"
                            list={`courses-${row.id}`}
                          />
                          <datalist id={`courses-${row.id}`}>
                            {courses
                              .filter((course) => course.university === row.university)
                              .map((course) => (
                                <option key={course.id} value={course.course} />
                              ))}
                          </datalist>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px] text-gray-500">Intake</Label>
                          <select
                            value={row.intake}
                            onChange={(e) => updateRow(row.id, { intake: e.target.value })}
                            className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                          >
                            <option value="">Intake</option>
                            {INTAKES.map((intake) => (
                              <option key={intake} value={intake}>
                                {intake}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px] text-gray-500">Select Deadline Date</Label>
                          <Input
                            type="date"
                            value={row.deadlineDate}
                            onChange={(e) => updateRow(row.id, { deadlineDate: e.target.value })}
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px] text-gray-500">Select Associate</Label>
                          <select
                            value={row.associate}
                            onChange={(e) => updateRow(row.id, { associate: e.target.value })}
                            className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                          >
                            <option value="">Select Associate</option>
                            {ASSOCIATES.map((associate) => (
                              <option key={associate} value={associate}>
                                {associate}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {!isEdit && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="size-9 shrink-0 p-0 text-danger hover:bg-danger/10"
                          onClick={() => removeRow(row.id)}
                          aria-label="Delete application row"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  ) : null}
                </div>
              ))}
              {!isEdit && (
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto p-0 text-sm text-primary hover:text-primary/80"
                  onClick={addRow}
                >
                  + Add University
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
              Select a country to choose universities
            </div>
          )}
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saveMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="animate-spin" />
                {isEdit ? 'Updating...' : 'Saving...'}
              </>
            ) : isEdit ? (
              'Update Application'
            ) : (
              'Save Application'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
