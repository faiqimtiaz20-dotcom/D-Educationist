import { api, type ListParams } from './api'
import type { PaginatedResponse, Student } from '@/types'

export type CreateStudentDto = Omit<Student, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateStudentDto = Partial<CreateStudentDto>

export const studentService = {
  getAll: async (params?: ListParams) => {
    const { data } = await api.get<PaginatedResponse<Student>>('/students', { params })
    return data
  },

  getById: async (id: string) => {
    const { data } = await api.get<Student>(`/students/${id}`)
    return data
  },

  create: async (payload: CreateStudentDto) => {
    const { data } = await api.post<Student>('/students', payload)
    return data
  },

  update: async (id: string, payload: UpdateStudentDto) => {
    const { data } = await api.patch<Student>(`/students/${id}`, payload)
    return data
  },

  delete: async (ids: string[]) => {
    const { data } = await api.delete<{ deleted: number }>('/students', { data: { ids } })
    return data
  },
}
