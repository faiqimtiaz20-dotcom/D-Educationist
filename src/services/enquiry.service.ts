import { api, type ListParams } from './api'
import type { Enquiry, PaginatedResponse } from '@/types'

export type CreateEnquiryDto = Omit<Enquiry, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateEnquiryDto = Partial<CreateEnquiryDto>

export const enquiryService = {
  getAll: async (params?: ListParams) => {
    const { data } = await api.get<PaginatedResponse<Enquiry>>('/enquiries', { params })
    return data
  },

  getById: async (id: string) => {
    const { data } = await api.get<Enquiry>(`/enquiries/${id}`)
    return data
  },

  create: async (payload: CreateEnquiryDto) => {
    const { data } = await api.post<Enquiry>('/enquiries', payload)
    return data
  },

  update: async (id: string, payload: UpdateEnquiryDto) => {
    const { data } = await api.patch<Enquiry>(`/enquiries/${id}`, payload)
    return data
  },

  delete: async (ids: string[]) => {
    const { data } = await api.delete<{ deleted: number }>('/enquiries', { data: { ids } })
    return data
  },
}
