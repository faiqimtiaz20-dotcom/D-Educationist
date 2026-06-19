import { api } from './api'
import { normalizeDashboardStats, type DashboardStats } from '@/lib/dashboard-stats'

export interface DashboardFilters {
  partnerId?: string
  branch?: string
}

export const dashboardService = {
  getStats: async (params?: DashboardFilters): Promise<DashboardStats> => {
    try {
      const { data } = await api.get<unknown>('/dashboard/stats', { params })
      return normalizeDashboardStats(data)
    } catch {
      return normalizeDashboardStats(null)
    }
  },
}
