import { api } from './api'
import type { DashboardStats } from '@/mocks/data/store'

export interface DashboardFilters {
  partnerId?: string
  branch?: string
}

export const dashboardService = {
  getStats: async (params?: DashboardFilters) => {
    const { data } = await api.get<DashboardStats>('/dashboard/stats', { params })
    return data
  },
}
