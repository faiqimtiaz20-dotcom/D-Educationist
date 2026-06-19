import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { STUDENT_NAV } from '@/lib/constants'
import { getNavIcon } from '@/lib/nav-icons'

export function MobileNav() {
  const location = useLocation()
  const primaryItems = STUDENT_NAV.slice(0, 5)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] dark:border-gray-700 dark:bg-gray-900 lg:hidden">
      <ul className="flex items-stretch justify-around">
        {primaryItems.map((item) => {
          const Icon = getNavIcon(item.icon)
          const active = item.path ? location.pathname === item.path : false

          return (
            <li key={item.label} className="flex-1">
              <Link
                to={item.path ?? '/student/dashboard'}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-colors',
                  active ? 'text-accent' : 'text-gray-500',
                )}
              >
                <Icon className={cn('size-5', active && 'text-accent')} />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
