import { useAuthStore } from '@/stores/authStore'
import { getPortalPrefix } from '@/lib/constants'
import type { Portal } from '@/types'

export interface PortalPageProps {
  portal?: Portal
  partnerId?: string
}

export function usePortalContext(overrides?: PortalPageProps) {
  const user = useAuthStore((s) => s.user)
  const portal = overrides?.portal ?? user?.role ?? 'admin'
  const partnerId =
    overrides?.partnerId ?? (portal === 'partner' ? user?.partnerId : undefined)
  const prefix = getPortalPrefix(portal)

  return {
    portal,
    partnerId,
    prefix,
    user,
    isAdmin: portal === 'admin',
    isPartner: portal === 'partner',
    isStudent: portal === 'student',
  }
}
