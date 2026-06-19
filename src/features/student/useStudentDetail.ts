import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  applicationService,
  enrolledService,
  invoiceService,
  studentService,
  visaService,
} from '@/services'

export function useStudentDetail(studentId: string | undefined) {
  const studentQuery = useQuery({
    queryKey: ['student', studentId],
    queryFn: () => studentService.getById(studentId!),
    enabled: !!studentId,
  })

  const applicationsQuery = useQuery({
    queryKey: ['student-apps', studentId],
    queryFn: () => applicationService.getAll({ pageSize: 100 }),
    enabled: !!studentId,
  })

  const visasQuery = useQuery({
    queryKey: ['student-visas', studentId],
    queryFn: () => visaService.getAll({ pageSize: 100 }),
    enabled: !!studentId,
  })

  const invoicesQuery = useQuery({
    queryKey: ['student-invoices', studentId],
    queryFn: () => invoiceService.getAll({ pageSize: 100 }),
    enabled: !!studentId,
  })

  const enrolledQuery = useQuery({
    queryKey: ['student-enrolled', studentId],
    queryFn: () => enrolledService.getAll({ pageSize: 100 }),
    enabled: !!studentId,
  })

  const applications = useMemo(
    () => (applicationsQuery.data?.data ?? []).filter((a) => a.studentId === studentId),
    [applicationsQuery.data, studentId],
  )

  const visas = useMemo(
    () => (visasQuery.data?.data ?? []).filter((v) => v.studentId === studentId),
    [visasQuery.data, studentId],
  )

  const invoices = useMemo(
    () => (invoicesQuery.data?.data ?? []).filter((i) => i.studentId === studentId),
    [invoicesQuery.data, studentId],
  )

  const enrolled = useMemo(
    () => (enrolledQuery.data?.data ?? []).filter((e) => e.studentId === studentId),
    [enrolledQuery.data, studentId],
  )

  const isLoading =
    studentQuery.isLoading ||
    applicationsQuery.isLoading ||
    visasQuery.isLoading ||
    invoicesQuery.isLoading

  const journeyStage = useMemo(() => {
    if (enrolled.length > 0) return 4
    if (visas.length > 0) return 3
    if (applications.length > 0) return 2
    return 1
  }, [applications.length, visas.length, enrolled.length])

  return {
    student: studentQuery.data,
    applications,
    visas,
    invoices,
    enrolled,
    journeyStage,
    isLoading,
    isError: studentQuery.isError,
  }
}
