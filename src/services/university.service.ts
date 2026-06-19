import { api, type ListParams } from './api'
import type { PaginatedResponse } from '@/types'

export interface UniversityEntry {
  country: string
  count: number
}

export const universityService = {
  getAll: async (params?: ListParams) => {
    const { data } = await api.get<PaginatedResponse<UniversityEntry>>('/universities', { params })
    return data
  },

  getByCountry: async (country: string) => {
    const { data } = await api.get<UniversityEntry>(`/universities/${encodeURIComponent(country)}`)
    return data
  },

  create: async (payload: UniversityEntry) => {
    const { data } = await api.post<UniversityEntry>('/universities', payload)
    return data
  },

  update: async (country: string, payload: Partial<UniversityEntry>) => {
    const { data } = await api.patch<UniversityEntry>(
      `/universities/${encodeURIComponent(country)}`,
      payload,
    )
    return data
  },

  delete: async (countries: string[]) => {
    const { data } = await api.delete<{ deleted: number }>('/universities', {
      data: { ids: countries },
    })
    return data
  },
}
