import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { FormSection } from '@/components/forms/FormSection'
import { PhoneInput } from '@/components/forms/PhoneInput'
import { DynamicRowTable } from '@/components/forms/DynamicRowTable'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { studentService, enquiryService } from '@/services'
import {
  BRANCHES,
  COUNTRIES,
  APPLY_LEVELS,
  SOURCES,
  STUDENT_STATUSES,
  PROFICIENCY_TESTS,
  generateStudentId,
} from '@/lib/constants'
import { type PortalPageProps, usePortalContext } from '@/features/shared/portal'

const studentSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  mobile: z.string().min(10),
  alternateNo: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  maritalStatus: z.string().optional(),
  address: z.string().optional(),
  highestQualification: z.string().optional(),
  interestedCourse: z.string().min(1),
  interestedCountry: z.string().min(1),
  intake: z.string().min(1),
  applyLevel: z.string().min(1),
  source: z.string().min(1),
  status: z.string(),
  remark: z.string().optional(),
  passportNo: z.string().optional(),
  passportIssue: z.string().optional(),
  passportExpiry: z.string().optional(),
  branch: z.string().min(1),
  assignedBy: z.string().min(1),
  assignedTo: z.string().min(1),
  partnerName: z.string().optional(),
  followUpDate: z.string().optional(),
  followUpTime: z.string().optional(),
  appointmentDate: z.string().optional(),
  appointmentTime: z.string().optional(),
})

type StudentFormValues = z.infer<typeof studentSchema>

const emptyAcademic = (): AcademicRecord & { id: string } => ({
  id: crypto.randomUUID(),
  qualification: '',
  subjects: '',
  college: '',
  percentage: '',
  backlogs: '',
  yearOfPassing: '',
})

const emptyWork = (): WorkExperience & { id: string } => ({
  id: crypto.randomUUID(),
  companyName: '',
  position: '',
  startDate: '',
  endDate: '',
  totalExperience: '',
})

import type { AcademicRecord, ProficiencyTest, WorkExperience } from '@/types'

export function AddStudentPage(props: PortalPageProps = {}) {
  const { prefix, isPartner, user, partnerId } = usePortalContext(props)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const enquiryId = searchParams.get('enquiry')
  const branchParam = searchParams.get('branch')
  const staffParam = searchParams.get('staff')
  const [countryCode, setCountryCode] = useState('+92')
  const [mobileNumber, setMobileNumber] = useState('')
  const [academics, setAcademics] = useState<(AcademicRecord & { id: string })[]>([emptyAcademic()])
  const [workExperience, setWorkExperience] = useState<(WorkExperience & { id: string })[]>([])
  const [selectedTests, setSelectedTests] = useState<Record<string, ProficiencyTest>>({})

  const { register, handleSubmit, setValue } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      status: 'New Student',
      branch: 'Head Office',
      assignedBy: 'Operational Head',
      assignedTo: 'Counsellor A',
      source: 'Walking',
    },
  })

  const { data: enquiry } = useQuery({
    queryKey: ['enquiry', enquiryId],
    queryFn: () => enquiryService.getById(enquiryId!),
    enabled: !!enquiryId,
  })

  useEffect(() => {
    if (!enquiry) return

    setValue('firstName', enquiry.firstName)
    setValue('lastName', enquiry.lastName)
    setValue('email', enquiry.email)
    setValue('alternateNo', enquiry.alternateNo ?? '')
    setValue('dateOfBirth', enquiry.dateOfBirth ?? '')
    setValue('gender', enquiry.gender ?? '')
    setValue('nationality', enquiry.nationality ?? '')
    setValue('maritalStatus', enquiry.maritalStatus ?? '')
    setValue('address', enquiry.address ?? '')
    setValue('highestQualification', enquiry.highestQualification ?? '')
    setValue('interestedCourse', enquiry.interestedCourse ?? '')
    setValue('interestedCountry', enquiry.interestedCountry ?? '')
    setValue('intake', enquiry.intake ?? '')
    setValue('applyLevel', enquiry.applyLevel ?? '')
    setValue('source', enquiry.source ?? '')
    setValue('remark', enquiry.remark ?? '')
    setValue('branch', branchParam || enquiry.branch)
    setValue('assignedTo', staffParam || enquiry.assignedTo)
    setValue('partnerName', enquiry.partnerName ?? '')
    setValue('followUpDate', enquiry.followUp?.date ?? '')
    setValue('followUpTime', enquiry.followUp?.time ?? '')
    setValue('appointmentDate', enquiry.appointment?.date ?? '')
    setValue('appointmentTime', enquiry.appointment?.time ?? '')

    if (enquiry.mobile.startsWith('+92')) {
      setCountryCode('+92')
      setMobileNumber(enquiry.mobile.replace(/^\+92\s*/, ''))
    } else {
      setMobileNumber(enquiry.mobile)
    }
  }, [enquiry, branchParam, staffParam, setValue])

  const mutation = useMutation({
    mutationFn: studentService.create,
    onSuccess: () => {
      toast.success('Student created successfully')
      navigate(`${prefix}/student`)
    },
    onError: () => toast.error('Failed to create student'),
  })

  const toggleTest = (type: string, checked: boolean) => {
    setSelectedTests((prev) => {
      const next = { ...prev }
      if (checked) {
        next[type] = { type, overall: '', listening: '', reading: '', writing: '', speaking: '', testDate: '' }
      } else {
        delete next[type]
      }
      return next
    })
  }

  const updateTest = (type: string, patch: Partial<ProficiencyTest>) => {
    setSelectedTests((prev) => ({ ...prev, [type]: { ...prev[type], ...patch } }))
  }

  const onSubmit = (values: StudentFormValues) => {
    mutation.mutate({
      studentId: generateStudentId(),
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      mobile: `${countryCode} ${mobileNumber}`,
      alternateNo: values.alternateNo,
      dateOfBirth: values.dateOfBirth,
      gender: values.gender,
      nationality: values.nationality,
      maritalStatus: values.maritalStatus,
      address: values.address,
      highestQualification: values.highestQualification,
      interestedCourse: values.interestedCourse,
      interestedCountry: values.interestedCountry,
      intake: values.intake,
      applyLevel: values.applyLevel,
      source: values.source,
      status: values.status,
      docStatus: 'Pending',
      remark: values.remark,
      passportNo: values.passportNo,
      passportIssue: values.passportIssue,
      passportExpiry: values.passportExpiry,
      branch: values.branch,
      assignedBy: values.assignedBy,
      assignedTo: values.assignedTo,
      partnerId: isPartner ? partnerId : undefined,
      partnerName: isPartner ? user?.name : values.partnerName,
      followUp: values.followUpDate
        ? { date: values.followUpDate, time: values.followUpTime }
        : undefined,
      appointment: values.appointmentDate
        ? { date: values.appointmentDate, time: values.appointmentTime }
        : undefined,
      academics: academics.filter((a) => a.qualification),
      proficiencyTests: Object.values(selectedTests),
      workExperience: workExperience.filter((w) => w.companyName),
    })
  }

  return (
    <PageShell
      title="Add Student"
      breadcrumbs={[
        { label: 'Student', href: `${prefix}/student` },
        { label: 'Add Student' },
      ]}
      action={
        <Button onClick={handleSubmit(onSubmit)} disabled={mutation.isPending}>
          <Save className="size-4" />
          Save Student
        </Button>
      }
    >
      <Tabs defaultValue="personal">
        <TabsList className="flex-wrap">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="proficiency">Proficiency</TabsTrigger>
          <TabsTrigger value="work">Work Experience</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <FormSection title="Personal Details">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>First Name *</Label>
                    <Input {...register('firstName')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Last Name *</Label>
                    <Input {...register('lastName')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email *</Label>
                    <Input type="email" {...register('email')} />
                  </div>
                  <PhoneInput
                    countryCode={countryCode}
                    number={mobileNumber}
                    onCountryCodeChange={setCountryCode}
                    onNumberChange={(n) => { setMobileNumber(n); setValue('mobile', n) }}
                    required
                  />
                  <div className="space-y-1.5">
                    <Label>Date of Birth</Label>
                    <Input type="date" {...register('dateOfBirth')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Gender</Label>
                    <Select {...register('gender')}>
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Passport No.</Label>
                    <Input {...register('passportNo')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Passport Issue Date</Label>
                    <Input type="date" {...register('passportIssue')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Passport Expiry</Label>
                    <Input type="date" {...register('passportExpiry')} />
                  </div>
                </div>
              </FormSection>

              <FormSection title="Study Preferences">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Highest Qualification</Label>
                    <Input {...register('highestQualification')} placeholder="e.g. Master of Commerce" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Interested Course *</Label>
                    <Input {...register('interestedCourse')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Interested Country *</Label>
                    <Select {...register('interestedCountry')}>
                      <option value="">Select</option>
                      {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Intake *</Label>
                    <Input {...register('intake')} placeholder="e.g. Nov-2026" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Apply Level *</Label>
                    <Select {...register('applyLevel')}>
                      {APPLY_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Source *</Label>
                    <Select {...register('source')}>
                      {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </Select>
                  </div>
                </div>
              </FormSection>

              <FormSection title="Assignment & Status">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <Select {...register('status')}>
                      {STUDENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Branch *</Label>
                    <Select {...register('branch')} disabled={isPartner}>
                      {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                    </Select>
                  </div>
                  {!isPartner && (
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label>Partner</Label>
                      <Input {...register('partnerName')} placeholder="e.g. Ahmed Raza" />
                    </div>
                  )}
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Remarks</Label>
                    <textarea
                      {...register('remark')}
                      rows={3}
                      placeholder="Internal notes about this student..."
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                </div>
              </FormSection>
            </div>
            <div className="space-y-6">
              <FormSection title="Follow-up">
                <div className="space-y-4">
                  <Input type="date" {...register('followUpDate')} />
                  <Input type="time" {...register('followUpTime')} />
                </div>
              </FormSection>
              <FormSection title="Appointment">
                <div className="space-y-4">
                  <Input type="date" {...register('appointmentDate')} />
                  <Input type="time" {...register('appointmentTime')} />
                </div>
              </FormSection>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="academic">
          <FormSection title="Academic Records">
            <DynamicRowTable
              rows={academics}
              onChange={setAcademics}
              createEmptyRow={emptyAcademic}
              addLabel="Add Academic Record"
              columns={[
                { key: 'qualification', label: 'Qualification' },
                { key: 'subjects', label: 'Subjects' },
                { key: 'college', label: 'College' },
                { key: 'percentage', label: '%' },
                { key: 'backlogs', label: 'Backlogs' },
                { key: 'year', label: 'Year' },
              ]}
              renderRow={(row, _i, update) => (
                <>
                  <td className="px-3 py-2"><Input value={row.qualification} onChange={(e) => update({ qualification: e.target.value })} className="h-8" /></td>
                  <td className="px-3 py-2"><Input value={row.subjects} onChange={(e) => update({ subjects: e.target.value })} className="h-8" /></td>
                  <td className="px-3 py-2"><Input value={row.college} onChange={(e) => update({ college: e.target.value })} className="h-8" /></td>
                  <td className="px-3 py-2"><Input value={row.percentage} onChange={(e) => update({ percentage: e.target.value })} className="h-8" /></td>
                  <td className="px-3 py-2"><Input value={row.backlogs} onChange={(e) => update({ backlogs: e.target.value })} className="h-8" /></td>
                  <td className="px-3 py-2"><Input value={row.yearOfPassing} onChange={(e) => update({ yearOfPassing: e.target.value })} className="h-8" /></td>
                </>
              )}
            />
          </FormSection>
        </TabsContent>

        <TabsContent value="proficiency">
          <FormSection title="Proficiency Tests">
            <div className="space-y-6">
              {PROFICIENCY_TESTS.map((test) => {
                const active = !!selectedTests[test]
                return (
                  <div key={test} className="rounded-lg border border-gray-200 p-4">
                    <label className="flex items-center gap-2 font-medium">
                      <Checkbox
                        checked={active}
                        onCheckedChange={(c) => toggleTest(test, !!c)}
                      />
                      {test}
                    </label>
                    {active && (
                      <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                        {(['overall', 'listening', 'reading', 'writing', 'speaking'] as const).map((field) => (
                          <div key={field} className="space-y-1">
                            <Label className="capitalize text-xs">{field}</Label>
                            <Input
                              value={selectedTests[test]?.[field] ?? ''}
                              onChange={(e) => updateTest(test, { [field]: e.target.value })}
                              className="h-8"
                            />
                          </div>
                        ))}
                        <div className="space-y-1">
                          <Label className="text-xs">Test Date</Label>
                          <Input
                            type="date"
                            value={selectedTests[test]?.testDate ?? ''}
                            onChange={(e) => updateTest(test, { testDate: e.target.value })}
                            className="h-8"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </FormSection>
        </TabsContent>

        <TabsContent value="work">
          <FormSection title="Work Experience">
            <DynamicRowTable
              rows={workExperience}
              onChange={setWorkExperience}
              createEmptyRow={emptyWork}
              addLabel="Add Work Experience"
              columns={[
                { key: 'company', label: 'Company' },
                { key: 'position', label: 'Position' },
                { key: 'start', label: 'Start Date' },
                { key: 'end', label: 'End Date' },
                { key: 'exp', label: 'Total Exp.' },
              ]}
              renderRow={(row, _i, update) => (
                <>
                  <td className="px-3 py-2"><Input value={row.companyName} onChange={(e) => update({ companyName: e.target.value })} className="h-8" /></td>
                  <td className="px-3 py-2"><Input value={row.position} onChange={(e) => update({ position: e.target.value })} className="h-8" /></td>
                  <td className="px-3 py-2"><Input type="date" value={row.startDate} onChange={(e) => update({ startDate: e.target.value })} className="h-8" /></td>
                  <td className="px-3 py-2"><Input type="date" value={row.endDate} onChange={(e) => update({ endDate: e.target.value })} className="h-8" /></td>
                  <td className="px-3 py-2"><Input value={row.totalExperience} onChange={(e) => update({ totalExperience: e.target.value })} className="h-8" /></td>
                </>
              )}
            />
          </FormSection>
        </TabsContent>
      </Tabs>
    </PageShell>
  )
}
