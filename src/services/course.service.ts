import { api } from './api'
import type { PaginatedResponse } from '@/types'

export interface Course {
  id: string
  country: string
  university: string
  course: string
  level: string
  intake: string
  duration: string
  tuition: string
}

export interface CourseListParams {
  page?: number
  pageSize?: number
  search?: string
  country?: string
  level?: string
  course?: string
  intake?: string
}

export const courseService = {
  getAll: async (params?: CourseListParams) => {
    const { data } = await api.get<PaginatedResponse<Course>>('/courses', { params })
    return data
  },
}
