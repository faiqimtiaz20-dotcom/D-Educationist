import { api, type ListParams } from './api'
import type { PaginatedResponse, VisaRecord } from '@/types'

export type CreateVisaDto = Omit<VisaRecord, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateVisaDto = Partial<CreateVisaDto>

export const visaService = {
  getAll: async (params?: ListParams) => {
    const { data } = await api.get<PaginatedResponse<VisaRecord>>('/visas', { params })
    return data
  },

  getById: async (id: string) => {
    const { data } = await api.get<VisaRecord>(`/visas/${id}`)
    return data
  },

  create: async (payload: CreateVisaDto) => {
    const { data } = await api.post<VisaRecord>('/visas', payload)
    return data
  },

  update: async (id: string, payload: UpdateVisaDto) => {
    const { data } = await api.patch<VisaRecord>(`/visas/${id}`, payload)
    return data
  },

  delete: async (ids: string[]) => {
    const { data } = await api.delete<{ deleted: number }>('/visas', { data: { ids } })
    return data
  },
}
