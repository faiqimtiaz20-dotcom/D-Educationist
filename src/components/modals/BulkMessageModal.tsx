import { useState } from 'react'
import { Mail, MessageSquare, Phone } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

export type BulkMessageChannel = 'email' | 'sms' | 'whatsapp'

interface BulkMessageModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  channel: BulkMessageChannel
  recipientCount: number
  onSend?: (payload: { subject?: string; message: string }) => void
}

const CHANNEL_META: Record<
  BulkMessageChannel,
  { icon: typeof Mail; label: string; description: string }
> = {
  email: {
    icon: Mail,
    label: 'Bulk Email',
    description: 'Send an email to all selected recipients.',
  },
  sms: {
    icon: Phone,
    label: 'Bulk SMS',
    description: 'Send an SMS to all selected recipients.',
  },
  whatsapp: {
    icon: MessageSquare,
    label: 'Bulk WhatsApp',
    description: 'Send a WhatsApp message to all selected recipients.',
  },
}

export function BulkMessageModal({
  open,
  onOpenChange,
  channel,
  recipientCount,
  onSend,
}: BulkMessageModalProps) {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const meta = CHANNEL_META[channel]
  const Icon = meta.icon

  const handleSend = () => {
    if (!message.trim()) return
    onSend?.({ subject: channel === 'email' ? subject : undefined, message: message.trim() })
    toast.success(`${meta.label} queued for ${recipientCount} recipient(s)`)
    setSubject('')
    setMessage('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="size-5 text-white/90" />
            {meta.label}
          </DialogTitle>
          <DialogDescription>
            {meta.description} ({recipientCount} selected)
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          {channel === 'email' && (
            <div className="space-y-1.5">
              <Label htmlFor="bulk-subject">Subject</Label>
              <Input
                id="bulk-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="bulk-message">Message</Label>
            <Textarea
              id="bulk-message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
            />
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={!message.trim()}>
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
