import { Badge, badgeVariants } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { VariantProps } from 'class-variance-authority'

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  // Enquiry
  'New Enquiry': 'info',
  'Under Review': 'warning',
  'Counselling Scheduled': 'info',
  'Counselling Completed': 'success',
  'Follow-up Required': 'warning',
  Interested: 'success',
  Drop: 'danger',
  // Student
  'New Student': 'info',
  'Documents Pending': 'warning',
  'On Hold': 'warning',
  'No Status': 'outline',
  // Application
  'Application Started': 'info',
  'Application Submitted': 'info',
  'Documents Verified': 'success',
  'Application Under Review': 'warning',
  'Offer Received': 'success',
  'Fee Paid': 'success',
  Finalized: 'success',
  // Visa
  'Visa Application In Progress': 'warning',
  'Visa Granted': 'success',
  'Visa Approved': 'success',
  'Visa Rejected': 'danger',
  'Visa Withdraw': 'outline',
  // Invoice / payment
  Pending: 'warning',
  'Partial Paid': 'warning',
  'Fully Paid': 'success',
  // Doc status
  Completed: 'success',
  // Task
  pending: 'warning',
  completed: 'success',
}

interface StatusBadgeProps {
  status: string
  className?: string
  compact?: boolean
}

export function StatusBadge({ status, className, compact }: StatusBadgeProps) {
  const variant = STATUS_VARIANTS[status] ?? 'default'
  return (
    <Badge
      variant={variant}
      className={cn(compact && 'whitespace-nowrap px-1.5 py-0 text-xs', className)}
    >
      {status}
    </Badge>
  )
}
