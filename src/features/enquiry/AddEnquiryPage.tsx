import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { FormSection } from '@/components/forms/FormSection'
import { PhoneInput } from '@/components/forms/PhoneInput'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { enquiryService } from '@/services'
import {
  BRAND,
  BRANCHES,
  COUNTRIES,
  APPLY_LEVELS,
  SOURCES,
  ENQUIRY_STATUSES,
} from '@/lib/constants'
import { type PortalPageProps, usePortalContext } from '@/features/shared/portal'

const enquirySchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email required'),
  mobile: z.string().min(10, 'Mobile number required'),
  alternateNo: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  maritalStatus: z.string().optional(),
  address: z.string().optional(),
  highestQualification: z.string().optional(),
  interestedCourse: z.string().min(1, 'Course is required'),
  testGiven: z.string().optional(),
  interestedCountry: z.string().min(1, 'Country is required'),
  intake: z.string().min(1, 'Intake is required'),
  applyLevel: z.string().min(1, 'Apply level is required'),
  source: z.string().min(1, 'Source is required'),
  status: z.string(),
  remark: z.string().optional(),
  branch: z.string().min(1, 'Branch is required'),
  assignedBy: z.string().min(1, 'Assigned by is required'),
  assignedTo: z.string().min(1, 'Assigned to is required'),
  partnerName: z.string().optional(),
  followUpDate: z.string().optional(),
  followUpTime: z.string().optional(),
  followUpRemarks: z.string().optional(),
  appointmentDate: z.string().optional(),
  appointmentTime: z.string().optional(),
  appointmentRemarks: z.string().optional(),
})

type EnquiryFormValues = z.infer<typeof enquirySchema>

export function AddEnquiryPage(props: PortalPageProps = {}) {
  const { prefix, isPartner, user, partnerId } = usePortalContext(props)
  const navigate = useNavigate()
  const [countryCode, setCountryCode] = useState('+92')
  const [mobileNumber, setMobileNumber] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EnquiryFormValues>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      status: 'New Enquiry',
      branch: 'Head Office',
      assignedBy: BRAND.staffLabel,
      assignedTo: 'Counsellor A',
      source: 'Walking',
    },
  })

  const mutation = useMutation({
    mutationFn: enquiryService.create,
    onSuccess: () => {
      toast.success('Enquiry created successfully')
      navigate(`${prefix}/enquiry`)
    },
    onError: () => toast.error('Failed to create enquiry'),
  })

  const onSubmit = (values: EnquiryFormValues) => {
    mutation.mutate({
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
      testGiven: values.testGiven,
      interestedCountry: values.interestedCountry,
      intake: values.intake,
      applyLevel: values.applyLevel,
      source: values.source,
      status: values.status,
      remark: values.remark,
      branch: values.branch,
      assignedBy: values.assignedBy,
      assignedTo: values.assignedTo,
      partnerId: isPartner ? partnerId : undefined,
      partnerName: isPartner ? user?.name : values.partnerName,
      followUp:
        values.followUpDate || values.followUpTime || values.followUpRemarks
          ? {
              date: values.followUpDate,
              time: values.followUpTime,
              remarks: values.followUpRemarks,
            }
          : undefined,
      appointment:
        values.appointmentDate || values.appointmentTime || values.appointmentRemarks
          ? {
              date: values.appointmentDate,
              time: values.appointmentTime,
              remarks: values.appointmentRemarks,
            }
          : undefined,
    })
  }

  return (
    <PageShell
      title="Add Enquiry"
      breadcrumbs={[
        { label: 'Enquiry', href: `${prefix}/enquiry` },
        { label: 'Add Enquiry' },
      ]}
      action={
        <Button onClick={handleSubmit(onSubmit)} disabled={mutation.isPending}>
          <Save className="size-4" />
          Save Enquiry
        </Button>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <FormSection title="Personal Details">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>First Name *</Label>
                <Input {...register('firstName')} />
                {errors.firstName && (
                  <p className="text-xs text-danger">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Last Name *</Label>
                <Input {...register('lastName')} />
                {errors.lastName && (
                  <p className="text-xs text-danger">{errors.lastName.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input type="email" {...register('email')} />
                {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
              </div>
              <PhoneInput
                countryCode={countryCode}
                number={mobileNumber}
                onCountryCodeChange={setCountryCode}
                onNumberChange={(n) => {
                  setMobileNumber(n)
                  setValue('mobile', n)
                }}
                required
              />
              <div className="space-y-1.5">
                <Label>Alternate No.</Label>
                <Input {...register('alternateNo')} />
              </div>
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
                  <option value="Other">Other</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Nationality</Label>
                <Input {...register('nationality')} />
              </div>
              <div className="space-y-1.5">
                <Label>Marital Status</Label>
                <Select {...register('maritalStatus')}>
                  <option value="">Select</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Address</Label>
                <Textarea {...register('address')} rows={2} />
              </div>
            </div>
          </FormSection>

          <FormSection title="Other Details">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Highest Qualification</Label>
                <Input {...register('highestQualification')} />
              </div>
              <div className="space-y-1.5">
                <Label>Interested Course *</Label>
                <Input {...register('interestedCourse')} />
                {errors.interestedCourse && (
                  <p className="text-xs text-danger">{errors.interestedCourse.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Test Given</Label>
                <Input {...register('testGiven')} placeholder="IELTS, PTE, etc." />
              </div>
              <div className="space-y-1.5">
                <Label>Interested Country *</Label>
                <Select {...register('interestedCountry')}>
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
                {errors.interestedCountry && (
                  <p className="text-xs text-danger">{errors.interestedCountry.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Intake *</Label>
                <Input {...register('intake')} placeholder="Nov-2026" />
                {errors.intake && <p className="text-xs text-danger">{errors.intake.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Apply Level *</Label>
                <Select {...register('applyLevel')}>
                  <option value="">Select level</option>
                  {APPLY_LEVELS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Source *</Label>
                <Select {...register('source')}>
                  {SOURCES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select {...register('status')}>
                  {ENQUIRY_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Branch *</Label>
                <Select {...register('branch')} disabled={isPartner}>
                  {BRANCHES.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </Select>
              </div>
              {!isPartner && (
                <>
                  <div className="space-y-1.5">
                    <Label>Assigned By *</Label>
                    <Input {...register('assignedBy')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Assigned To *</Label>
                    <Input {...register('assignedTo')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Partner Name</Label>
                    <Input {...register('partnerName')} />
                  </div>
                </>
              )}
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Remark</Label>
                <Textarea {...register('remark')} rows={2} />
              </div>
            </div>
          </FormSection>
        </div>

        <div className="space-y-6">
          <FormSection title="Follow-up">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Follow-up Date</Label>
                <Input type="date" {...register('followUpDate')} />
              </div>
              <div className="space-y-1.5">
                <Label>Follow-up Time</Label>
                <Input type="time" {...register('followUpTime')} />
              </div>
              <div className="space-y-1.5">
                <Label>Remarks</Label>
                <Textarea {...register('followUpRemarks')} rows={3} />
              </div>
            </div>
          </FormSection>

          <FormSection title="Appointment">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Appointment Date</Label>
                <Input type="date" {...register('appointmentDate')} />
              </div>
              <div className="space-y-1.5">
                <Label>Appointment Time</Label>
                <Input type="time" {...register('appointmentTime')} />
              </div>
              <div className="space-y-1.5">
                <Label>Remarks</Label>
                <Textarea {...register('appointmentRemarks')} rows={3} />
              </div>
            </div>
          </FormSection>
        </div>
      </form>
    </PageShell>
  )
}
