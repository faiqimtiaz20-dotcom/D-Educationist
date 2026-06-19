import { Trash2, UserPlus, Download, Mail, MessageSquare, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BulkActionBarProps {
  count: number
  onAssign?: () => void
  onDelete?: () => void
  onExport?: () => void
  onEmail?: () => void
  onSms?: () => void
  onWhatsapp?: () => void
  className?: string
}

export function BulkActionBar({
  count,
  onAssign,
  onDelete,
  onExport,
  onEmail,
  onSms,
  onWhatsapp,
  className,
}: BulkActionBarProps) {
  if (count === 0) return null

  return (
    <div
      className={cn(
        'sticky top-0 z-10 flex flex-wrap items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2',
        className,
      )}
    >
      <span className="text-sm font-medium text-primary">{count} selected</span>
      {onAssign && (
        <Button variant="outline" size="sm" onClick={onAssign}>
          <UserPlus className="size-4" />
          Assign Staff
        </Button>
      )}
      {onExport && (
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="size-4" />
          Export
        </Button>
      )}
      {onEmail && (
        <Button variant="outline" size="sm" onClick={onEmail}>
          <Mail className="size-4" />
          Email
        </Button>
      )}
      {onSms && (
        <Button variant="outline" size="sm" onClick={onSms}>
          <Phone className="size-4" />
          SMS
        </Button>
      )}
      {onWhatsapp && (
        <Button variant="outline" size="sm" onClick={onWhatsapp}>
          <MessageSquare className="size-4" />
          WhatsApp
        </Button>
      )}
      {onDelete && (
        <Button variant="outline" size="sm" className="text-danger hover:text-danger" onClick={onDelete}>
          <Trash2 className="size-4" />
          Delete
        </Button>
      )}
    </div>
  )
}
