import { Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import type { NavItem } from '@/lib/constants'
import type { Portal } from '@/types'
import { useUIStore } from '@/stores/uiStore'

interface PortalLayoutShellProps {
  navItems: NavItem[]
  portal: Portal
  showQuickActions?: boolean
  mainClassName?: string
  footer?: React.ReactNode
}

export function PortalLayoutShell({
  navItems,
  portal,
  showQuickActions = true,
  mainClassName,
  footer,
}: PortalLayoutShellProps) {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed)

  return (
    <div className="h-screen overflow-hidden bg-content dark:bg-slate-900">
      <Sidebar navItems={navItems} portal={portal} />
      <div
        className={cn(
          'flex h-screen min-w-0 flex-col overflow-hidden transition-[padding] duration-300',
          sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-56 2xl:pl-64',
        )}
      >
        <Header showQuickActions={showQuickActions} />
        <main className={cn('min-h-0 flex-1 overflow-y-auto', mainClassName)}>
          <Outlet />
        </main>
        {footer}
      </div>
    </div>
  )
}
