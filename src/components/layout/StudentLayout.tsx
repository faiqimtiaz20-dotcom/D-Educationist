import { STUDENT_NAV } from '@/lib/constants'
import { MobileNav } from '@/components/layout/MobileNav'
import { PortalLayoutShell } from '@/components/layout/PortalLayoutShell'

export function StudentLayout() {
  return (
    <PortalLayoutShell
      navItems={STUDENT_NAV}
      portal="student"
      showQuickActions={false}
      mainClassName="pb-16 lg:pb-0"
      footer={<MobileNav />}
    />
  )
}
