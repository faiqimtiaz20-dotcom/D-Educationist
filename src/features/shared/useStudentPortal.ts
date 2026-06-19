import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { studentService } from '@/services'

export function useStudentPortal() {
  const user = useAuthStore((s) => s.user)

  const { data: student, isLoading } = useQuery({
    queryKey: ['student-portal-profile', user?.studentId, user?.email],
    queryFn: async () => {
      const res = await studentService.getAll({ pageSize: 500 })
      return (
        res.data.find((s) => s.studentId === user?.studentId) ??
        res.data.find((s) => s.email === user?.email)
      )
    },
    enabled: Boolean(user),
  })

  return {
    user,
    student,
    studentRef: student?.studentId,
    studentInternalId: student?.id,
    isLoading,
  }
}
