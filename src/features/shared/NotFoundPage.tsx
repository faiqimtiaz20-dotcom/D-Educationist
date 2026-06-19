import { Link } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import { getPortalPrefix } from '@/lib/constants'

export default function NotFoundPage() {
  const user = useAuthStore((state) => state.user)
  const homeHref = user ? `${getPortalPrefix(user.role)}/dashboard` : '/login'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-content px-4 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
        <FileQuestion className="size-10" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">404</h1>
        <p className="text-gray-500">The page you are looking for does not exist.</p>
      </div>
      <Button asChild>
        <Link to={homeHref}>Go back home</Link>
      </Button>
    </div>
  )
}
