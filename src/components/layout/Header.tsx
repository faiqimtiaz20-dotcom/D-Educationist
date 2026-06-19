import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  BookOpen,
  CheckSquare,
  Globe,
  LogOut,
  Menu,
  Megaphone,
  Search,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { useTranslation } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlobalSearchModal } from '@/components/search/GlobalSearchModal'
import { NotificationDrawer } from '@/components/notifications/NotificationDrawer'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface HeaderProps {
  showSearch?: boolean
  showQuickActions?: boolean
}

export function Header({ showSearch = true, showQuickActions = true }: HeaderProps) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen)
  const unreadCount = useNotificationStore((s) => s.unreadCount())
  const { locale, changeLocale, t } = useTranslation()
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (showSearch) setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [showSearch])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4 shadow-sm laptop:h-12 laptop:gap-2 laptop:px-3 dark:border-gray-700 dark:bg-gray-900">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </Button>

        <div className="hidden min-w-0 sm:block">
          <BrandLogo
            variant="light"
            showText
            imgClassName="h-7 max-w-[2rem]"
            className="gap-2"
          />
          {user?.role === 'partner' && (
            <span className="mt-0.5 block text-[10px] font-medium text-accent">Partner Portal</span>
          )}
        </div>

        {showSearch && (
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="relative mx-auto hidden max-w-md flex-1 items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-left text-sm text-gray-500 transition-colors hover:border-primary/30 md:flex dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
          >
            <Search className="size-4 shrink-0" />
            <span className="flex-1">{t('search')} students, enquiries...</span>
            <kbd className="hidden rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[10px] lg:inline dark:border-gray-600 dark:bg-gray-700">
              Ctrl+K
            </kbd>
          </button>
        )}

        <div className="ml-auto flex items-center gap-1">
          {showQuickActions && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="hidden text-gray-600 sm:inline-flex dark:text-gray-300"
                onClick={() => navigate(`/${user?.role ?? 'admin'}/tasks`)}
              >
                <CheckSquare className="size-4" />
                <span className="hidden lg:inline">Tasks</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="hidden text-gray-600 sm:inline-flex dark:text-gray-300"
                onClick={() => navigate(`/${user?.role ?? 'admin'}/course-finder`)}
              >
                <BookOpen className="size-4" />
                <span className="hidden lg:inline">Course Finder</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="hidden text-gray-600 sm:inline-flex dark:text-gray-300"
                onClick={() =>
                  navigate(
                    user?.role === 'student'
                      ? '/student/announcements'
                      : user?.role === 'partner'
                        ? '/partner/dashboard'
                        : '/admin/marketing',
                  )
                }
              >
                <Megaphone className="size-4" />
                <span className="hidden lg:inline">Announcements</span>
              </Button>
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 text-gray-600 dark:text-gray-300">
                <Globe className="size-4" />
                <span className="hidden text-xs uppercase sm:inline">{locale}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => changeLocale('en')}>English</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLocale('hi')}>हिन्दी</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />

          <Button
            variant="ghost"
            size="sm"
            className="relative text-gray-600 dark:text-gray-300"
            aria-label={t('notifications')}
            onClick={() => setNotifOpen(true)}
          >
            <Bell className="size-4" />
            {unreadCount > 0 && (
              <Badge
                variant="danger"
                className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full p-0 text-[10px]"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800',
                )}
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
                </span>
                <span className="hidden max-w-[120px] truncate font-medium text-gray-700 md:inline dark:text-gray-200">
                  {user?.name ?? 'User'}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-0.5">
                  <span>{user?.name}</span>
                  <span className="text-xs font-normal text-gray-500">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {user?.role === 'student' && (
                <DropdownMenuItem onClick={() => navigate('/student/profile')}>
                  <User className="size-4" />
                  Profile
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-danger focus:text-danger">
                <LogOut className="size-4" />
                {t('logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <GlobalSearchModal open={searchOpen} onOpenChange={setSearchOpen} />
      <NotificationDrawer open={notifOpen} onOpenChange={setNotifOpen} />
    </>
  )
}
