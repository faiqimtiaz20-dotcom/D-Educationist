import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { IconTooltip } from '@/components/ui/icon-tooltip'
import { getPortalPrefix } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageShellProps {
  title: string
  breadcrumbs?: BreadcrumbItem[]
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  showBack?: boolean
  backHref?: string
}

function resolveBackHref(
  breadcrumbs: BreadcrumbItem[] | undefined,
  backHref: string | undefined,
): string | undefined {
  if (backHref) return backHref
  if (!breadcrumbs?.length) return undefined

  for (let index = breadcrumbs.length - 2; index >= 0; index -= 1) {
    if (breadcrumbs[index]?.href) return breadcrumbs[index].href
  }

  if (breadcrumbs.length === 1 && breadcrumbs[0]?.href) {
    return breadcrumbs[0].href
  }

  return undefined
}

export function PageShell({
  title,
  breadcrumbs,
  action,
  children,
  className,
  showBack = true,
  backHref,
}: PageShellProps) {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const resolvedBackHref = resolveBackHref(breadcrumbs, backHref)

  function handleBack() {
    if (resolvedBackHref) {
      navigate(resolvedBackHref)
      return
    }

    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    if (user) {
      navigate(`${getPortalPrefix(user.role)}/dashboard`)
    }
  }

  return (
    <div className={cn('flex flex-col gap-4 p-4 md:p-6 laptop:gap-3 laptop:p-3', className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {showBack && (
            <IconTooltip label="Back">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-0.5 size-9 shrink-0 px-0"
                onClick={handleBack}
                aria-label="Go back"
              >
                <ArrowLeft className="size-4" />
              </Button>
            </IconTooltip>
          )}
          <div className="min-w-0">
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="mb-2 flex flex-wrap items-center gap-1 text-xs text-gray-500">
                {breadcrumbs.map((crumb, index) => (
                  <span key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                    {index > 0 && <ChevronRight className="size-3" />}
                    {crumb.href ? (
                      <Link to={crumb.href} className="hover:text-primary">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-gray-700">{crumb.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            )}
            <h1 className="text-xl font-bold text-gray-900 md:text-2xl laptop:text-lg">{title}</h1>
          </div>
        </div>
        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  )
}
