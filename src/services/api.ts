import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(async (config) => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return config
})

export interface ListParams {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  partnerId?: string
  isPartner?: boolean
}
