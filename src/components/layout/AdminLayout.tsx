import { ADMIN_NAV } from '@/lib/constants'
import { PortalLayoutShell } from '@/components/layout/PortalLayoutShell'

export function AdminLayout() {
  return <PortalLayoutShell navItems={ADMIN_NAV} portal="admin" />
}
