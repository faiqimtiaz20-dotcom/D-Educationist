import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Save, User, BookOpen, Briefcase } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton'
import { FormSection } from '@/components/forms/FormSection'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useStudentPortal } from '@/features/shared/useStudentPortal'
import { studentService } from '@/services'

export default function StudentProfilePage() {
  const queryClient = useQueryClient()
  const { student, isLoading } = useStudentPortal()
  const [form, setForm] = useState<Record<string, string>>({})

  const values = {
    firstName: form.firstName ?? student?.firstName ?? '',
    lastName: form.lastName ?? student?.lastName ?? '',
    email: form.email ?? student?.email ?? '',
    mobile: form.mobile ?? student?.mobile ?? '',
    dateOfBirth: form.dateOfBirth ?? student?.dateOfBirth ?? '',
    nationality: form.nationality ?? student?.nationality ?? '',
    address: form.address ?? student?.address ?? '',
    interestedCourse: form.interestedCourse ?? student?.interestedCourse ?? '',
    interestedCountry: form.interestedCountry ?? student?.interestedCountry ?? '',
    intake: form.intake ?? student?.intake ?? '',
    passportNo: form.passportNo ?? student?.passportNo ?? '',
  }

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const mutation = useMutation({
    mutationFn: () =>
      studentService.update(student!.id, {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        mobile: values.mobile,
        dateOfBirth: values.dateOfBirth || undefined,
        nationality: values.nationality || undefined,
        address: values.address || undefined,
        interestedCourse: values.interestedCourse,
        interestedCountry: values.interestedCountry,
        intake: values.intake,
        passportNo: values.passportNo || undefined,
      }),
    onSuccess: () => {
      toast.success('Profile updated successfully')
      queryClient.invalidateQueries({ queryKey: ['student-portal-profile'] })
    },
    onError: () => toast.error('Failed to update profile'),
  })

  if (isLoading) {
    return (
      <PageShell title="My Profile">
        <LoadingSkeleton variant="card" rows={6} />
      </PageShell>
    )
  }

  if (!student) {
    return (
      <PageShell title="My Profile">
        <p className="text-sm text-gray-500">Student profile not found.</p>
      </PageShell>
    )
  }

  return (
    <PageShell
      title="My Profile"
      className="pb-20 lg:pb-6"
      action={
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          <Save className="size-4" />
          Save Changes
        </Button>
      }
    >
      <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-lg font-semibold">{student.firstName} {student.lastName}</p>
        <p className="text-sm text-gray-500">{student.studentId}</p>
      </div>

      <Tabs defaultValue="personal">
        <TabsList className="flex-wrap">
          <TabsTrigger value="personal"><User className="mr-1 size-4" />Personal</TabsTrigger>
          <TabsTrigger value="academic"><BookOpen className="mr-1 size-4" />Academic</TabsTrigger>
          <TabsTrigger value="passport"><Briefcase className="mr-1 size-4" />Passport</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <FormSection title="Personal Information">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>First Name</Label>
                <Input value={values.firstName} onChange={(e) => updateField('firstName', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Last Name</Label>
                <Input value={values.lastName} onChange={(e) => updateField('lastName', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={values.email} onChange={(e) => updateField('email', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Mobile</Label>
                <Input value={values.mobile} onChange={(e) => updateField('mobile', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Date of Birth</Label>
                <Input type="date" value={values.dateOfBirth} onChange={(e) => updateField('dateOfBirth', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Nationality</Label>
                <Input value={values.nationality} onChange={(e) => updateField('nationality', e.target.value)} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Address</Label>
                <Input value={values.address} onChange={(e) => updateField('address', e.target.value)} />
              </div>
            </div>
          </FormSection>
        </TabsContent>

        <TabsContent value="academic">
          <FormSection title="Study Preferences">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Interested Course</Label>
                <Input value={values.interestedCourse} onChange={(e) => updateField('interestedCourse', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Interested Country</Label>
                <Input value={values.interestedCountry} onChange={(e) => updateField('interestedCountry', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Intake</Label>
                <Input value={values.intake} onChange={(e) => updateField('intake', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Apply Level</Label>
                <Input value={student.applyLevel ?? ''} disabled />
              </div>
            </div>
          </FormSection>
          {student.academics && student.academics.length > 0 && (
            <FormSection title="Academic Records" className="mt-4">
              <div className="space-y-3">
                {student.academics.map((record, i) => (
                  <div key={i} className="rounded-lg border border-gray-100 p-3 text-sm">
                    <p className="font-medium">{record.qualification}</p>
                    <p className="text-gray-500">{record.college} · {record.percentage}%</p>
                  </div>
                ))}
              </div>
            </FormSection>
          )}
        </TabsContent>

        <TabsContent value="passport">
          <FormSection title="Passport Details">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Passport Number</Label>
                <Input value={values.passportNo} onChange={(e) => updateField('passportNo', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Issue Date</Label>
                <Input type="date" value={student.passportIssue ?? ''} disabled />
              </div>
              <div className="space-y-1.5">
                <Label>Expiry Date</Label>
                <Input type="date" value={student.passportExpiry ?? ''} disabled />
              </div>
            </div>
          </FormSection>
        </TabsContent>
      </Tabs>
    </PageShell>
  )
}
