import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Portal, User } from '@/types'
import { MOCK_USERS, STORAGE_PREFIX } from '@/lib/constants'

interface AuthState {
  user: User | null
  login: (username: string, password: string, portal: Portal) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: async (username, password, portal) => {
        await new Promise((r) => setTimeout(r, 400))
        const mock = MOCK_USERS[portal]
        if (!mock || password !== mock.password) {
          throw new Error('Invalid credentials')
        }
        set({ user: { ...mock.user, name: username.trim() || mock.user.name } })
      },
      logout: () => set({ user: null }),
    }),
    { name: `${STORAGE_PREFIX}-auth` },
  ),
)
