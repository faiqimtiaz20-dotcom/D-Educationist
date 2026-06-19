import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  mobileMenuOpen: boolean
  setSidebarOpen: (open: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setMobileMenuOpen: (open: boolean) => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}))
