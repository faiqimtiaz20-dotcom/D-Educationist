import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Eye, EyeOff, Globe, GraduationCap, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BRAND, getPortalPrefix, LOGIN_FEATURES, STORAGE_PREFIX } from '@/lib/constants'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { useAuthStore } from '@/stores/authStore'
import type { Portal } from '@/types'

const PORTAL_TABS: { value: Portal; label: string }[] = [
  { value: 'admin', label: 'CRM Login' },
  { value: 'partner', label: 'Partner Login' },
  { value: 'student', label: 'Student Login' },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const [portal, setPortal] = useState<Portal>('admin')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!username.trim() || !password) {
      toast.error('Please enter username and password')
      return
    }

    setLoading(true)
    try {
      await login(username.trim(), password, portal)
      if (rememberMe) {
        localStorage.setItem(`${STORAGE_PREFIX}-remember-portal`, portal)
      } else {
        localStorage.removeItem(`${STORAGE_PREFIX}-remember-portal`)
      }
      toast.success('Welcome back!')
      navigate(`${getPortalPrefix(portal)}/dashboard`, { replace: true })
    } catch {
      toast.error('Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel — brand, features, illustration */}
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-sidebar p-10 text-white lg:flex xl:w-[42%]">
        <div className="relative z-10">
          <BrandLogo variant="dark" imgClassName="h-11 max-w-[3.5rem]" />
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="mb-6 text-2xl font-semibold leading-snug">
              Your trusted partner for
              <br />
              global education
            </h2>
            <ul className="space-y-4">
              {LOGIN_FEATURES.map((feature) => (
                <li key={feature.title} className="flex gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-white">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{feature.title}</p>
                    <p className="text-xs leading-relaxed text-white/65">{feature.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 text-center text-white/80">
              <div className="flex size-24 items-center justify-center rounded-full bg-white/10">
                <Globe className="size-12 text-accent" />
              </div>
              <GraduationCap className="size-8 text-white/40" />
              <p className="text-xs text-white/50">CRM illustration placeholder</p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/40">
          &copy; {new Date().getFullYear()} {BRAND.name}. All rights reserved.
        </p>

        <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 size-64 rounded-full bg-accent/10" />
      </div>

      {/* Right panel — login form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <BrandLogo variant="light" imgClassName="h-10 max-w-[3.25rem]" />
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Sign in</h1>
            <p className="mt-1 text-sm text-gray-500">Access your portal to manage enquiries and students</p>
          </div>

          <Tabs
            value={portal}
            onValueChange={(value) => setPortal(value as Portal)}
            className="w-full"
          >
            <TabsList className="mb-2 grid w-full grid-cols-3">
              {PORTAL_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {PORTAL_TABS.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`username-${tab.value}`}>Username</Label>
                    <Input
                      id={`username-${tab.value}`}
                      type="text"
                      placeholder="Enter your username"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`password-${tab.value}`}>Password</Label>
                    <div className="relative">
                      <Input
                        id={`password-${tab.value}`}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex cursor-pointer items-center gap-2">
                      <Checkbox
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked === true)}
                        disabled={loading}
                      />
                      <span className="text-sm text-gray-600">Remember me</span>
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Login'
                    )}
                  </Button>
                </form>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  )
}
