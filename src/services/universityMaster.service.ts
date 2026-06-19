import { api, type ListParams } from './api'
import type { PaginatedResponse, UniversityMaster } from '@/types'

export type CreateUniversityMasterDto = Omit<UniversityMaster, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateUniversityMasterDto = Partial<CreateUniversityMasterDto>

export interface UniversityMasterListParams extends ListParams {
  country?: string
}

export const universityMasterService = {
  getAll: async (params?: UniversityMasterListParams) => {
    const { data } = await api.get<PaginatedResponse<UniversityMaster>>('/university-masters', {
      params,
    })
    return data
  },

  getById: async (id: string) => {
    const { data } = await api.get<UniversityMaster>(`/university-masters/${id}`)
    return data
  },

  create: async (payload: CreateUniversityMasterDto) => {
    const { data } = await api.post<UniversityMaster>('/university-masters', payload)
    return data
  },

  update: async (id: string, payload: UpdateUniversityMasterDto) => {
    const { data } = await api.patch<UniversityMaster>(`/university-masters/${id}`, payload)
    return data
  },

  delete: async (ids: string[]) => {
    const { data } = await api.delete<{ deleted: number }>('/university-masters', {
      data: { ids },
    })
    return data
  },

  addCampus: async (universityId: string, campus: { name: string; city?: string }) => {
    const { data } = await api.post<UniversityMaster>(
      `/university-masters/${universityId}/campuses`,
      campus,
    )
    return data
  },
}
