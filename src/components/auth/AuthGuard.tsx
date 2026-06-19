import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { getPortalPrefix } from '@/lib/constants'
import type { Role } from '@/types'

interface AuthGuardProps {
  allowedRoles: Role[]
}

export function AuthGuard({ allowedRoles }: AuthGuardProps) {
  const user = useAuthStore((state) => state.user)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={`${getPortalPrefix(user.role)}/dashboard`} replace />
  }

  return <Outlet />
}
