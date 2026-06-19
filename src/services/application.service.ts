import { api, type ListParams } from './api'
import type { Application, PaginatedResponse } from '@/types'

export type CreateApplicationDto = Omit<Application, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateApplicationDto = Partial<CreateApplicationDto>

export const applicationService = {
  getAll: async (params?: ListParams) => {
    const { data } = await api.get<PaginatedResponse<Application>>('/applications', { params })
    return data
  },

  getById: async (id: string) => {
    const { data } = await api.get<Application>(`/applications/${id}`)
    return data
  },

  create: async (payload: CreateApplicationDto) => {
    const { data } = await api.post<Application>('/applications', payload)
    return data
  },

  update: async (id: string, payload: UpdateApplicationDto) => {
    const { data } = await api.patch<Application>(`/applications/${id}`, payload)
    return data
  },

  delete: async (ids: string[]) => {
    const { data } = await api.delete<{ deleted: number }>('/applications', { data: { ids } })
    return data
  },
}
