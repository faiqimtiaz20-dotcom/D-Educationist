import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_PREFIX } from '@/lib/constants'

export interface AppNotification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'danger'
  read: boolean
  createdAt: string
  link?: string
}

const INITIAL: AppNotification[] = [
  { id: '1', title: 'Missed Follow-up', message: '8 enquiry follow-ups are overdue', type: 'warning', read: false, createdAt: new Date().toISOString(), link: '/admin/enquiry' },
  { id: '2', title: 'Documents Pending', message: '3 students have pending documents', type: 'danger', read: false, createdAt: new Date().toISOString(), link: '/admin/student' },
  { id: '3', title: 'Invoice Due', message: '2 student invoices due this week', type: 'info', read: false, createdAt: new Date().toISOString(), link: '/admin/accounts/student-invoices' },
  { id: '4', title: 'Visa Update', message: 'Visa granted for Hassan Ali', type: 'success', read: true, createdAt: new Date().toISOString(), link: '/admin/visa' },
]

interface NotificationState {
  notifications: AppNotification[]
  markRead: (id: string) => void
  markAllRead: () => void
  add: (n: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => void
  unreadCount: () => number
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: INITIAL,
      markRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
      markAllRead: () =>
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      add: (n) =>
        set((s) => ({
          notifications: [
            { ...n, id: crypto.randomUUID(), read: false, createdAt: new Date().toISOString() },
            ...s.notifications,
          ],
        })),
      unreadCount: () => get().notifications.filter((n) => !n.read).length,
    }),
    { name: `${STORAGE_PREFIX}-notifications` },
  ),
)
