import { useMemo, useState } from 'react'
import { format } from 'date-fns'
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
import {
  activityStore,
  addNote,
  type NoteEntry,
} from '@/mocks/data/activities'

interface NotesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityType: NoteEntry['entityType']
  entityId: string
  title?: string
}

export function NotesDialog({
  open,
  onOpenChange,
  entityType,
  entityId,
  title = 'Notes',
}: NotesDialogProps) {
  const [text, setText] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const notes = useMemo(
    () =>
      activityStore.notes.filter(
        (n) => n.entityType === entityType && n.entityId === entityId,
      ),
    [entityType, entityId, refreshKey, open],
  )

  const handleSave = () => {
    const trimmed = text.trim()
    if (!trimmed) {
      toast.error('Please enter a note')
      return
    }
    addNote(entityType, entityId, trimmed)
    setText('')
    setRefreshKey((k) => k + 1)
    toast.success('Note added')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>View and add notes for this record.</DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {notes.length === 0 ? (
              <p className="text-sm text-gray-500">No notes yet.</p>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <p className="text-sm text-gray-800">{note.text}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {note.user} · {format(new Date(note.createdAt), 'dd MMM yyyy HH:mm')}
                  </p>
                </div>
              ))
            )}
          </div>

          <Textarea
            placeholder="Add a new note…"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleSave}>Save Note</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
