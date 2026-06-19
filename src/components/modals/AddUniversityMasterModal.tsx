import { useEffect, useId, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Loader2, Pin, Plus } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { COMMISSION_CONTRACTS } from '@/lib/constants'
import { universityMasterService } from '@/services'
import type { UniversityMaster } from '@/types'

interface UniversityFormRow {
  id: string
  country: string
  name: string
  commissionContract: string
  agreementExpiry: string
  agreementFileName: string
  logoFileName: string
}

interface AddUniversityMasterModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  countries: string[]
  defaultCountry?: string
  university?: UniversityMaster | null
  onSaved?: () => void
}

function createRow(defaultCountry = ''): UniversityFormRow {
  return {
    id: crypto.randomUUID(),
    country: defaultCountry,
    name: '',
    commissionContract: '',
    agreementExpiry: '',
    agreementFileName: '',
    logoFileName: '',
  }
}

function rowFromUniversity(university: UniversityMaster): UniversityFormRow {
  return {
    id: university.id,
    country: university.country,
    name: university.name,
    commissionContract: university.commissionContract,
    agreementExpiry: university.agreementExpiry ?? '',
    agreementFileName: university.agreementFileName ?? '',
    logoFileName: university.logoFileName ?? '',
  }
}

function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <Label className="text-xs font-normal text-gray-700">
      {children} <span className="text-danger">*</span>
    </Label>
  )
}

function FileUploadField({
  inputId,
  accept,
  fileName,
  onChange,
}: {
  inputId: string
  accept?: string
  fileName: string
  onChange: (file?: File) => void
}) {
  return (
    <div className="flex h-9 overflow-hidden rounded border border-gray-300 bg-white text-sm">
      <label
        htmlFor={inputId}
        className="flex shrink-0 cursor-pointer items-center border-r border-gray-300 bg-gray-50 px-3 text-gray-700 hover:bg-gray-100"
      >
        Choose file
      </label>
      <span className="flex min-w-0 flex-1 items-center truncate px-3 text-gray-500">
        {fileName || 'No file chosen'}
      </span>
      <input
        id={inputId}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => onChange(e.target.files?.[0])}
      />
    </div>
  )
}

export function AddUniversityMasterModal({
  open,
  onOpenChange,
  countries,
  defaultCountry = '',
  university = null,
  onSaved,
}: AddUniversityMasterModalProps) {
  const isEdit = !!university
  const baseId = useId()
  const [rows, setRows] = useState<UniversityFormRow[]>([createRow(defaultCountry)])

  useEffect(() => {
    if (!open) return
    if (university) {
      setRows([rowFromUniversity(university)])
      return
    }
    setRows([createRow(defaultCountry)])
  }, [open, university, defaultCountry])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const validRows = rows.filter((row) => row.country && row.name && row.commissionContract)
      if (validRows.length === 0) {
        throw new Error('Please fill required fields')
      }
      for (const row of validRows) {
        if (!row.agreementExpiry.trim()) {
          throw new Error('Agreement expiry is required')
        }
      }

      if (isEdit && university) {
        const row = validRows[0]
        await universityMasterService.update(university.id, {
          country: row.country,
          name: row.name,
          commissionContract: row.commissionContract,
          agreementExpiry: row.agreementExpiry,
          agreementFileName: row.agreementFileName || null,
          logoFileName: row.logoFileName || null,
        })
        return
      }

      await Promise.all(
        validRows.map((row) =>
          universityMasterService.create({
            country: row.country,
            name: row.name,
            commissionContract: row.commissionContract,
            agreementExpiry: row.agreementExpiry,
            agreementFileName: row.agreementFileName || null,
            logoFileName: row.logoFileName || null,
            campuses: [],
          }),
        ),
      )
    },
    onSuccess: () => {
      toast.success(isEdit ? 'University updated successfully' : 'University saved successfully')
      onOpenChange(false)
      onSaved?.()
    },
    onError: (error: Error) =>
      toast.error(error.message || `Failed to ${isEdit ? 'update' : 'save'} university`),
  })

  const updateRow = (id: string, patch: Partial<UniversityFormRow>) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  const handleFileChange = (
    id: string,
    field: 'agreementFileName' | 'logoFileName',
    file?: File,
  ) => {
    updateRow(id, { [field]: file?.name ?? '' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit University' : 'Add University'}</DialogTitle>
        </DialogHeader>

        <DialogBody className="space-y-5">
          <ModalNotice icon={Pin}>
            Agreement Document Allowed: Each file must be PDF, DOC, XLS, JPG/PNG and under 5MB.
            University Logo Allowed: Each file must be JPG/PNG and under 5MB.
          </ModalNotice>

          {rows.map((row, index) => (
            <div
              key={row.id}
              className={index > 0 ? 'space-y-3 border-t border-dashed border-gray-200 pt-4' : 'space-y-3'}
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <div className="space-y-1">
                  <RequiredLabel>Country</RequiredLabel>
                  <Select
                    value={row.country}
                    onChange={(e) => updateRow(row.id, { country: e.target.value })}
                    className="h-9 text-sm"
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-1">
                  <RequiredLabel>University Name</RequiredLabel>
                  <Input
                    value={row.name}
                    onChange={(e) => updateRow(row.id, { name: e.target.value })}
                    placeholder="University Name"
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <RequiredLabel>Commission Contract</RequiredLabel>
                  <Select
                    value={row.commissionContract}
                    onChange={(e) => updateRow(row.id, { commissionContract: e.target.value })}
                    className="h-9 text-sm"
                  >
                    <option value="">Commission Contract</option>
                    {COMMISSION_CONTRACTS.map((contract) => (
                      <option key={contract} value={contract}>
                        {contract}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-1">
                  <RequiredLabel>Agreement Expiry</RequiredLabel>
                  <Input
                    value={row.agreementExpiry}
                    onChange={(e) => updateRow(row.id, { agreementExpiry: e.target.value })}
                    placeholder="Agreement Expiry"
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-normal text-gray-700">Agreement Doc</Label>
                  <FileUploadField
                    inputId={`${baseId}-agreement-${row.id}`}
                    fileName={row.agreementFileName}
                    onChange={(file) => handleFileChange(row.id, 'agreementFileName', file)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-end gap-2">
                <div className="w-full space-y-1 sm:w-auto sm:min-w-[20rem]">
                  <Label className="text-xs font-normal text-gray-700">University Logo</Label>
                  <FileUploadField
                    inputId={`${baseId}-logo-${row.id}`}
                    accept="image/jpeg,image/png,image/jpg"
                    fileName={row.logoFileName}
                    onChange={(file) => handleFileChange(row.id, 'logoFileName', file)}
                  />
                </div>
                {!isEdit && index === rows.length - 1 && (
                  <Button
                    type="button"
                    size="sm"
                    className="size-9 shrink-0 p-0"
                    onClick={() => setRows((current) => [...current, createRow(defaultCountry)])}
                    aria-label="Add another university"
                  >
                    <Plus className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
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
          <Button type="button" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Saving...
              </>
            ) : isEdit ? (
              'Update'
            ) : (
              'Save'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
