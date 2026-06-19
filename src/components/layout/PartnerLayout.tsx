import { PARTNER_NAV } from '@/lib/constants'
import { PortalLayoutShell } from '@/components/layout/PortalLayoutShell'

export function PartnerLayout() {
  return <PortalLayoutShell navItems={PARTNER_NAV} portal="partner" />
}
