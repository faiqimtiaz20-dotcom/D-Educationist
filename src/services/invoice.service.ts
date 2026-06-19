import { api, type ListParams } from './api'
import type { Invoice, PaginatedResponse, PartnerInvoice, UniversityCommission } from '@/types'

export type CreateInvoiceDto = Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateInvoiceDto = Partial<CreateInvoiceDto>
export type CreatePartnerInvoiceDto = Omit<PartnerInvoice, 'id' | 'createdAt' | 'updatedAt'>
export type UpdatePartnerInvoiceDto = Partial<CreatePartnerInvoiceDto>
export type CreateUniversityCommissionDto = Omit<UniversityCommission, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateUniversityCommissionDto = Partial<CreateUniversityCommissionDto>

export const invoiceService = {
  getAll: async (params?: ListParams) => {
    const { data } = await api.get<PaginatedResponse<Invoice>>('/invoices', { params })
    return data
  },

  getById: async (id: string) => {
    const { data } = await api.get<Invoice>(`/invoices/${id}`)
    return data
  },

  create: async (payload: CreateInvoiceDto) => {
    const { data } = await api.post<Invoice>('/invoices', payload)
    return data
  },

  update: async (id: string, payload: UpdateInvoiceDto) => {
    const { data } = await api.patch<Invoice>(`/invoices/${id}`, payload)
    return data
  },

  delete: async (ids: string[]) => {
    const { data } = await api.delete<{ deleted: number }>('/invoices', { data: { ids } })
    return data
  },

  getAllPartnerInvoices: async (params?: ListParams) => {
    const { data } = await api.get<PaginatedResponse<PartnerInvoice>>('/partner-invoices', { params })
    return data
  },

  getPartnerInvoiceById: async (id: string) => {
    const { data } = await api.get<PartnerInvoice>(`/partner-invoices/${id}`)
    return data
  },

  createPartnerInvoice: async (payload: CreatePartnerInvoiceDto) => {
    const { data } = await api.post<PartnerInvoice>('/partner-invoices', payload)
    return data
  },

  updatePartnerInvoice: async (id: string, payload: UpdatePartnerInvoiceDto) => {
    const { data } = await api.patch<PartnerInvoice>(`/partner-invoices/${id}`, payload)
    return data
  },

  deletePartnerInvoices: async (ids: string[]) => {
    const { data } = await api.delete<{ deleted: number }>('/partner-invoices', { data: { ids } })
    return data
  },

  getAllUniversityCommission: async (params?: ListParams) => {
    const { data } = await api.get<PaginatedResponse<UniversityCommission>>(
      '/university-commission',
      { params },
    )
    return data
  },

  getUniversityCommissionById: async (id: string) => {
    const { data } = await api.get<UniversityCommission>(`/university-commission/${id}`)
    return data
  },

  createUniversityCommission: async (payload: CreateUniversityCommissionDto) => {
    const { data } = await api.post<UniversityCommission>('/university-commission', payload)
    return data
  },

  updateUniversityCommission: async (id: string, payload: UpdateUniversityCommissionDto) => {
    const { data } = await api.patch<UniversityCommission>(`/university-commission/${id}`, payload)
    return data
  },

  deleteUniversityCommission: async (ids: string[]) => {
    const { data } = await api.delete<{ deleted: number }>('/university-commission', {
      data: { ids },
    })
    return data
  },
}
