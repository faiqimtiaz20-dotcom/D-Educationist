import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { universityMasterService } from '@/services'

interface AddCampusModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
}

export function AddCampusModal({ open, onOpenChange, onSaved }: AddCampusModalProps) {
  const [universityId, setUniversityId] = useState('')
  const [campusName, setCampusName] = useState('')
  const [city, setCity] = useState('')

  const { data } = useQuery({
    queryKey: ['university-masters-all'],
    queryFn: () => universityMasterService.getAll({ pageSize: 500 }),
    enabled: open,
  })

  const universities = data?.data ?? []

  useEffect(() => {
    if (!open) return
    setUniversityId('')
    setCampusName('')
    setCity('')
  }, [open])

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!universityId) throw new Error('Please select a university')
      if (!campusName.trim()) throw new Error('Please enter campus name')
      await universityMasterService.addCampus(universityId, {
        name: campusName.trim(),
        city: city.trim() || undefined,
      })
    },
    onSuccess: () => {
      toast.success('Campus added successfully')
      onOpenChange(false)
      onSaved?.()
    },
    onError: (error: Error) => toast.error(error.message || 'Failed to add campus'),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Add Campus</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="space-y-1.5">
            <Label>University</Label>
            <Select
              value={universityId}
              onChange={(e) => setUniversityId(e.target.value)}
              className="h-9"
            >
              <option value="">Select University</option>
              {universities.map((university) => (
                <option key={university.id} value={university.id}>
                  {university.name} ({university.country})
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Campus Name</Label>
            <Input
              value={campusName}
              onChange={(e) => setCampusName(e.target.value)}
              placeholder="Campus name"
            />
          </div>
          <div className="space-y-1.5">
            <Label>City</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
