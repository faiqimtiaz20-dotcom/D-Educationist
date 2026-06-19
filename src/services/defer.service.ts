import { api, type ListParams } from './api'
import type { DeferRecord, PaginatedResponse } from '@/types'

export type CreateDeferDto = Omit<DeferRecord, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateDeferDto = Partial<CreateDeferDto>

export const deferService = {
  getAll: async (params?: ListParams) => {
    const { data } = await api.get<PaginatedResponse<DeferRecord>>('/defers', { params })
    return data
  },

  getById: async (id: string) => {
    const { data } = await api.get<DeferRecord>(`/defers/${id}`)
    return data
  },

  create: async (payload: CreateDeferDto) => {
    const { data } = await api.post<DeferRecord>('/defers', payload)
    return data
  },

  update: async (id: string, payload: UpdateDeferDto) => {
    const { data } = await api.patch<DeferRecord>(`/defers/${id}`, payload)
    return data
  },

  delete: async (ids: string[]) => {
    const { data } = await api.delete<{ deleted: number }>('/defers', { data: { ids } })
    return data
  },
}
