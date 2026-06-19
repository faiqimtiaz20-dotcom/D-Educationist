import { useState } from 'react'
import { MessageSquarePlus } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { addNote, activityStore } from '@/mocks/data/activities'
import type { NoteEntry } from '@/mocks/data/activities'
import { format } from 'date-fns'

interface NotesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityType: NoteEntry['entityType']
  entityId: string
  title: string
}

export function NotesDialog({
  open,
  onOpenChange,
  entityType,
  entityId,
  title,
}: NotesDialogProps) {
  const [text, setText] = useState('')

  const notes = activityStore.notes.filter(
    (n) => n.entityType === entityType && n.entityId === entityId,
  )

  const handleSave = () => {
    if (!text.trim()) return
    addNote(entityType, entityId, text.trim())
    toast.success('Note saved')
    setText('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquarePlus className="size-5 text-white/90" />
            Notes — {title}
          </DialogTitle>
          <DialogDescription>Add or view notes for this record.</DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          {notes.length > 0 && (
            <ul className="max-h-40 space-y-2 overflow-y-auto text-sm">
              {notes.map((note) => (
                <li key={note.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <p>{note.text}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {note.user} · {format(new Date(note.createdAt), 'dd MMM yyyy HH:mm')}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <Textarea
            placeholder="Enter notes..."
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!text.trim()}>
            Save Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
