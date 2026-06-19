import { api, type ListParams } from './api'
import type { CalendarEvent, PaginatedResponse } from '@/types'

export type CreateCalendarEventDto = Omit<CalendarEvent, 'id'>
export type UpdateCalendarEventDto = Partial<CreateCalendarEventDto>

export const calendarService = {
  getAll: async (params?: ListParams) => {
    const { data } = await api.get<PaginatedResponse<CalendarEvent>>('/calendar-events', {
      params,
    })
    return data
  },

  getById: async (id: string) => {
    const { data } = await api.get<CalendarEvent>(`/calendar-events/${id}`)
    return data
  },

  create: async (payload: CreateCalendarEventDto) => {
    const { data } = await api.post<CalendarEvent>('/calendar-events', payload)
    return data
  },

  update: async (id: string, payload: UpdateCalendarEventDto) => {
    const { data } = await api.patch<CalendarEvent>(`/calendar-events/${id}`, payload)
    return data
  },

  delete: async (ids: string[]) => {
    const { data } = await api.delete<{ deleted: number }>('/calendar-events', { data: { ids } })
    return data
  },
}
