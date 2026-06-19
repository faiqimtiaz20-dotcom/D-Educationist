import { cn } from '@/lib/utils'
import { BRAND } from '@/lib/constants'

interface BrandLogoProps {
  className?: string
  imgClassName?: string
  showText?: boolean
  collapsed?: boolean
  variant?: 'light' | 'dark'
}

export function BrandLogo({
  className,
  imgClassName,
  showText = true,
  collapsed = false,
  variant = 'dark',
}: BrandLogoProps) {
  return (
    <div className={cn('flex min-w-0 items-center gap-2.5', className)}>
      <img
        src={BRAND.logo}
        alt={BRAND.name}
        className={cn(
          'shrink-0 rounded-sm object-contain',
          collapsed ? 'h-8 w-8' : 'h-9 w-auto max-w-[2.75rem]',
          imgClassName,
        )}
      />
      {showText && !collapsed && (
        <div className="min-w-0">
          <p
            className={cn(
              'truncate text-sm font-bold tracking-wide',
              variant === 'dark' ? 'text-white' : 'text-primary',
            )}
          >
            {BRAND.name}
          </p>
          <p
            className={cn(
              'truncate text-[10px]',
              variant === 'dark' ? 'text-white/60' : 'text-gray-500',
            )}
          >
            {BRAND.tagline}
          </p>
        </div>
      )}
    </div>
  )
}
