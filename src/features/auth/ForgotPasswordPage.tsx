import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BrandLogo } from '@/components/brand/BrandLogo'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!email.trim()) {
      toast.error('Please enter your email address')
      return
    }

    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setLoading(false)
    setSubmitted(true)
    toast.success('Password reset link sent to your email')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-content px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <BrandLogo variant="light" imgClassName="h-10 max-w-[3.25rem]" />
        </div>

        <div className="mb-6 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Mail className="size-6" />
        </div>

        <h1 className="text-xl font-bold text-gray-900">Forgot password?</h1>
        <p className="mt-2 text-sm text-gray-500">
          {submitted
            ? 'Check your inbox for a password reset link. If you do not see it, check your spam folder.'
            : 'Enter the email associated with your account and we will send you a reset link.'}
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Sending...
                </>
              ) : (
                'Send reset link'
              )}
            </Button>
          </form>
        ) : (
          <Button asChild className="mt-6 w-full" variant="outline">
            <Link to="/login">Back to login</Link>
          </Button>
        )}

        {!submitted && (
          <Button asChild variant="ghost" className="mt-4 w-full" size="sm">
            <Link to="/login">
              <ArrowLeft className="size-4" />
              Back to login
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
