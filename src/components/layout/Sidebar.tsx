import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BrandLogo } from '@/components/brand/BrandLogo'
import type { NavItem } from '@/lib/constants'
import { getNavIcon } from '@/lib/nav-icons'
import type { Portal } from '@/types'
import { useUIStore } from '@/stores/uiStore'

interface SidebarProps {
  navItems: NavItem[]
  portal: Portal
  collapsible?: boolean
}

export function Sidebar({ navItems, portal, collapsible = true }: SidebarProps) {
  const location = useLocation()
  const {
    sidebarCollapsed,
    mobileMenuOpen,
    setMobileMenuOpen,
    toggleSidebar,
  } = useUIStore()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const isActive = (path?: string) => (path ? location.pathname === path : false)
  const isChildActive = (item: NavItem) =>
    item.children?.some((child) => location.pathname === child.path) ?? false

  const toggleExpanded = (label: string) => {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  const sidebarContent = (
    <div className="flex h-full flex-col bg-sidebar text-white dark:bg-[#0c1929]">
      <div
        className={cn(
          'flex h-14 items-center border-b border-white/10 px-4 laptop:h-12 laptop:px-3',
          sidebarCollapsed && 'justify-center px-2',
        )}
      >
        {!sidebarCollapsed ? (
          <BrandLogo variant="dark" className="min-w-0 flex-1" />
        ) : (
          <BrandLogo variant="dark" showText={false} collapsed className="mx-auto" />
        )}
        <button
          type="button"
          className="ml-auto rounded-md p-1.5 text-white/70 hover:bg-sidebar-hover hover:text-white lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close menu"
        >
          <X className="size-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 laptop:px-1.5 laptop:py-2">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = getNavIcon(item.icon)
            const hasChildren = Boolean(item.children?.length)
            const open = expanded[item.label] ?? isChildActive(item)
            const active = isActive(item.path) || isChildActive(item)

            if (hasChildren) {
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => toggleExpanded(item.label)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-sidebar-hover laptop:gap-2 laptop:px-2 laptop:py-2 laptop:text-xs',
                      active && 'bg-sidebar-hover text-accent',
                      sidebarCollapsed && 'justify-center px-2',
                    )}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon className="size-4 shrink-0" />
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronDown
                          className={cn('size-4 transition-transform', open && 'rotate-180')}
                        />
                      </>
                    )}
                  </button>
                  {open && !sidebarCollapsed && (
                    <ul className="ml-4 mt-0.5 space-y-0.5 border-l border-white/10 pl-3">
                      {item.children!.map((child) => (
                        <li key={child.path}>
                          <Link
                            to={child.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              'block rounded-md px-3 py-2 text-sm text-white/80 transition-colors hover:bg-sidebar-hover hover:text-white laptop:px-2 laptop:py-1.5 laptop:text-xs',
                              isActive(child.path) && 'bg-primary/40 text-white',
                            )}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            }

            return (
              <li key={item.label}>
                <Link
                  to={item.path ?? `/${portal}/dashboard`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-sidebar-hover laptop:gap-2 laptop:px-2 laptop:py-2 laptop:text-xs',
                    active && 'bg-sidebar-hover text-accent',
                    sidebarCollapsed && 'justify-center px-2',
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="size-4 shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {collapsible && (
        <div className="hidden border-t border-white/10 p-2 lg:block">
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex w-full items-center justify-center rounded-md p-2 text-white/70 transition-colors hover:bg-sidebar-hover hover:text-white"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden shrink-0 transition-all duration-300 lg:block',
          sidebarCollapsed ? 'w-16' : 'w-56 2xl:w-64',
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu overlay"
          />
          <aside className="absolute left-0 top-0 h-full w-72 shadow-xl">{sidebarContent}</aside>
        </div>
      )}
    </>
  )
}
