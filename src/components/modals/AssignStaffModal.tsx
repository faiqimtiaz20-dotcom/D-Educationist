import { useState } from 'react'
import { UserCheck } from 'lucide-react'
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
import { Select } from '@/components/ui/select'

const STAFF_OPTIONS = ['Counsellor A', 'Counsellor B', 'Calling Team', 'Visa Team'] as const

interface AssignStaffModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAssign: (staff: string) => void
  title?: string
  description?: string
}

export function AssignStaffModal({
  open,
  onOpenChange,
  onAssign,
  title = 'Assign Staff',
  description = 'Select a team member to assign to the selected record(s).',
}: AssignStaffModalProps) {
  const [staff, setStaff] = useState<string>(STAFF_OPTIONS[0])

  const handleAssign = () => {
    onAssign(staff)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="size-5 text-white/90" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-2">
          <Label htmlFor="staff-select">Assign to</Label>
          <Select
            id="staff-select"
            value={staff}
            onChange={(e) => setStaff(e.target.value)}
          >
            {STAFF_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign}>Assign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
