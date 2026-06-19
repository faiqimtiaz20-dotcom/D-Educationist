import { useState } from 'react'
import { Upload } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ImportUniversityModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImported?: () => void
}

export function ImportUniversityModal({
  open,
  onOpenChange,
  onImported,
}: ImportUniversityModalProps) {
  const [fileName, setFileName] = useState('')

  const handleImport = () => {
    if (!fileName) {
      toast.error('Please choose a file to import')
      return
    }
    toast.success('University import queued (demo)')
    onOpenChange(false)
    onImported?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Import University</DialogTitle>
          <DialogDescription>Upload an Excel or CSV file with university master records.</DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-3">
          <div className="space-y-1.5">
            <Label>Import File</Label>
            <Input
              type="file"
              accept=".csv,.xls,.xlsx"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="gap-1.5" onClick={handleImport}>
            <Upload className="size-4" />
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
