import { api, type ListParams } from './api'
import type { EnrolledRecord, PaginatedResponse } from '@/types'

export type CreateEnrolledDto = Omit<EnrolledRecord, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateEnrolledDto = Partial<CreateEnrolledDto>

export const enrolledService = {
  getAll: async (params?: ListParams) => {
    const { data } = await api.get<PaginatedResponse<EnrolledRecord>>('/enrolled', { params })
    return data
  },

  getById: async (id: string) => {
    const { data } = await api.get<EnrolledRecord>(`/enrolled/${id}`)
    return data
  },

  create: async (payload: CreateEnrolledDto) => {
    const { data } = await api.post<EnrolledRecord>('/enrolled', payload)
    return data
  },

  update: async (id: string, payload: UpdateEnrolledDto) => {
    const { data } = await api.patch<EnrolledRecord>(`/enrolled/${id}`, payload)
    return data
  },

  delete: async (ids: string[]) => {
    const { data } = await api.delete<{ deleted: number }>('/enrolled', { data: { ids } })
    return data
  },
}
