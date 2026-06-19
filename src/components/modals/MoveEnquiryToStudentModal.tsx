import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Building2, Loader2, User } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { BRANCHES } from '@/lib/constants'
import { enquiryService } from '@/services'
import type { Enquiry } from '@/types'

const STAFF_OPTIONS = [
  'Counsellor A',
  'Counsellor B',
  'Calling Team',
  'Visa Team',
  'Operational Head',
  'Admin User',
] as const

interface MoveEnquiryToStudentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  enquiry: Enquiry | null
  prefix: string
  onMoved?: () => void
}

function IconSelect({
  id,
  icon: Icon,
  value,
  onChange,
  placeholder,
  options,
}: {
  id: string
  icon: typeof Building2
  value: string
  onChange: (value: string) => void
  placeholder: string
  options: readonly string[]
}) {
  return (
    <div className="flex overflow-hidden rounded-md border border-gray-300 bg-white shadow-sm">
      <span className="flex items-center border-r border-gray-200 bg-gray-100 px-3 text-gray-400">
        <Icon className="size-4" />
      </span>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 min-w-0 flex-1 appearance-none bg-white px-3 pr-8 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

export function MoveEnquiryToStudentModal({
  open,
  onOpenChange,
  enquiry,
  prefix,
  onMoved,
}: MoveEnquiryToStudentModalProps) {
  const navigate = useNavigate()
  const [branch, setBranch] = useState('')
  const [staff, setStaff] = useState('')

  useEffect(() => {
    if (!enquiry || !open) return
    setBranch(enquiry.branch || '')
    setStaff(enquiry.assignedTo || '')
  }, [enquiry, open])

  const moveMutation = useMutation({
    mutationFn: async () => {
      if (!enquiry) return
      if (!branch || !staff) {
        throw new Error('Please select branch and staff')
      }
      await enquiryService.update(enquiry.id, { branch, assignedTo: staff })
    },
    onSuccess: () => {
      if (!enquiry) return
      const params = new URLSearchParams({
        enquiry: enquiry.id,
        branch,
        staff,
      })
      toast.success('Opening student registration form')
      onOpenChange(false)
      onMoved?.()
      navigate(`${prefix}/student/add?${params.toString()}`)
    },
    onError: (error: Error) => toast.error(error.message || 'Failed to move enquiry'),
  })

  if (!enquiry) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Move Enquiry To Student</DialogTitle>
        </DialogHeader>

        <DialogBody className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="move-branch" className="text-xs text-gray-600">
              Branch
            </Label>
            <IconSelect
              id="move-branch"
              icon={Building2}
              value={branch}
              onChange={setBranch}
              placeholder="Select Branch"
              options={BRANCHES}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="move-staff" className="text-xs text-gray-600">
              Staff
            </Label>
            <IconSelect
              id="move-staff"
              icon={User}
              value={staff}
              onChange={setStaff}
              placeholder="Select Staff"
              options={STAFF_OPTIONS}
            />
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={moveMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => moveMutation.mutate()}
            disabled={moveMutation.isPending}
          >
            {moveMutation.isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Moving...
              </>
            ) : (
              'Move To Student'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
