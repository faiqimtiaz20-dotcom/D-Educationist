import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Info, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ModalNotice } from '@/components/ui/modal-notice'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  addApplicationComment,
  getApplicationComments,
} from '@/mocks/data/applicationCommentStore'
import { logActivity } from '@/mocks/data/activities'
import { BRAND } from '@/lib/constants'
import type { Application } from '@/types'

interface ApplicationCommentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  application: Application | null
  onSaved?: () => void
}

export function ApplicationCommentModal({
  open,
  onOpenChange,
  application,
  onSaved,
}: ApplicationCommentModalProps) {
  const [comment, setComment] = useState('')
  const [attachmentName, setAttachmentName] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!open) return
    setComment('')
    setAttachmentName('')
  }, [open, application?.id])

  void refreshKey
  const comments = application ? getApplicationComments(application.id) : []

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!application) return
      if (!comment.trim()) throw new Error('Please enter a comment')
      addApplicationComment(
        application.id,
        comment.trim(),
        attachmentName || undefined,
        application.assignedTo || BRAND.name,
      )
      logActivity(
        'student',
        application.studentId,
        'Application comment added',
        comment.trim().slice(0, 80),
      )
    },
    onSuccess: () => {
      toast.success('Comment added')
      setComment('')
      setAttachmentName('')
      setRefreshKey((value) => value + 1)
      onSaved?.()
    },
    onError: (error: Error) => toast.error(error.message || 'Failed to add comment'),
  })

  if (!application) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>Application Comment</DialogTitle>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-600">
              Comment <span className="text-danger">*</span>
            </Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none text-sm"
            />
          </div>

          <ModalNotice icon={Info}>
            Allowed: pdf, xls, xlsx, doc, docx, jpeg, jpg, png (max 5 MB).
          </ModalNotice>

          <div className="space-y-1.5">
            <Label className="text-xs text-gray-600">Upload File</Label>
            <Input
              type="file"
              accept=".pdf,.xls,.xlsx,.doc,.docx,.jpeg,.jpg,.png"
              className="text-sm"
              onChange={(e) => {
                const file = e.target.files?.[0]
                setAttachmentName(file?.name ?? '')
              }}
            />
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-left text-[11px] uppercase text-gray-500">
                <tr>
                  <th className="px-3 py-2">S.No.</th>
                  <th className="px-3 py-2">Created Date</th>
                  <th className="px-3 py-2">Comment</th>
                  <th className="px-3 py-2">Attachment</th>
                  <th className="px-3 py-2">Commented By</th>
                </tr>
              </thead>
              <tbody>
                {comments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-gray-400">
                      No data available in table
                    </td>
                  </tr>
                ) : (
                  comments.map((row, index) => (
                    <tr key={row.id} className="border-t border-gray-100">
                      <td className="px-3 py-2">{index + 1}</td>
                      <td className="whitespace-nowrap px-3 py-2">
                        {format(new Date(row.createdAt), 'dd/MM/yyyy, hh:mm a')}
                      </td>
                      <td className="max-w-xs px-3 py-2">{row.comment}</td>
                      <td className="px-3 py-2">
                        {row.attachmentName ? (
                          <span className="text-primary">{row.attachmentName}</span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-3 py-2">{row.createdBy}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saveMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Saving...
              </>
            ) : (
              'Add Comment'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
