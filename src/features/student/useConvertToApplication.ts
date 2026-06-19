import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { applicationService } from '@/services'
import { logActivity } from '@/mocks/data/activities'
import type { Student } from '@/types'

function buildApplicationFromStudent(student: Student) {
  return {
    studentId: student.id,
    studentRef: student.studentId,
    studentName: `${student.firstName} ${student.lastName}`.trim(),
    email: student.email,
    mobile: student.mobile,
    applicationCount: 1,
    docStatus: student.docStatus,
    intCountry: student.interestedCountry,
    intake: student.intake,
    intCourse: student.interestedCourse,
    applyLevel: student.applyLevel,
    passportNo: student.passportNo,
    dateOfBirth: student.dateOfBirth,
    branch: student.branch,
    partnerId: student.partnerId,
    partnerName: student.partnerName,
    status: 'Application Started',
    assignedBy: student.assignedBy,
    assignedTo: student.assignedTo,
    isPartner: !!student.partnerId,
  }
}

export function useConvertToApplication(prefix: string) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (student: Student) =>
      applicationService.create(buildApplicationFromStudent(student)),
    onSuccess: (_application, student) => {
      logActivity(
        'student',
        student.id,
        'Converted to application',
        `${student.firstName} ${student.lastName} moved to applications`,
      )
      toast.success('Student converted to application')
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['students'] })
      navigate(`${prefix}/application?student=${student.id}`)
    },
    onError: () => toast.error('Failed to convert student to application'),
  })
}
