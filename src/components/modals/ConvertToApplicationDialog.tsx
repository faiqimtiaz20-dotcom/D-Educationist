import { AlertCircle, Loader2 } from 'lucide-react'
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

interface ConvertToApplicationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  loading?: boolean
  onConfirm: () => void
}

export function ConvertToApplicationDialog({
  open,
  onOpenChange,
  loading = false,
  onConfirm,
}: ConvertToApplicationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>You want to convert this Student to Application?</DialogDescription>
        </DialogHeader>

        <DialogBody className="flex flex-col items-center py-2 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <AlertCircle className="size-8" strokeWidth={1.5} />
          </div>
        </DialogBody>

        <DialogFooter className="sm:justify-center">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button type="button" onClick={onConfirm} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Converting...
              </>
            ) : (
              'Yes, Convert it!'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
