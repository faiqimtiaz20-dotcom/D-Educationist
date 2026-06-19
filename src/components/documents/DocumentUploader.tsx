import { useCallback, useRef, useState } from 'react'
import { Upload, FileText, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { StudentDocument } from '@/mocks/data/activities'

type DocumentStatus = StudentDocument['status']

const STATUS_VARIANTS: Record<DocumentStatus, 'warning' | 'info' | 'success' | 'danger'> = {
  Pending: 'warning',
  Uploaded: 'info',
  Verified: 'success',
  Rejected: 'danger',
}

interface DocumentUploaderProps {
  label: string
  status: DocumentStatus
  fileName?: string
  onUpload?: (file: File) => void
  className?: string
}

export function DocumentUploader({
  label,
  status,
  fileName,
  onUpload,
  className,
}: DocumentUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [previewName, setPreviewName] = useState<string | undefined>(fileName)

  const canUpload = status === 'Pending' || status === 'Rejected'

  const simulateUpload = useCallback(
    (file: File) => {
      setPreviewName(file.name)
      setUploading(true)
      setProgress(0)

      const interval = window.setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            window.clearInterval(interval)
            setUploading(false)
            onUpload?.(file)
            return 100
          }
          return prev + 10
        })
      }, 120)
    },
    [onUpload],
  )

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0]
      if (!file || !canUpload || uploading) return
      simulateUpload(file)
    },
    [canUpload, uploading, simulateUpload],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles],
  )

  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white p-4', className)}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-gray-900">{label}</p>
          {previewName && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
              <FileText className="size-3" />
              {previewName}
            </p>
          )}
        </div>
        <Badge variant={STATUS_VARIANTS[status]}>{status}</Badge>
      </div>

      {canUpload && (
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 transition-colors',
            dragOver ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50',
            uploading && 'pointer-events-none opacity-70',
          )}
        >
          <Upload className="mb-2 size-8 text-gray-400" />
          <p className="text-sm font-medium text-gray-700">Drag & drop or click to upload</p>
          <p className="mt-1 text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {uploading && (
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs text-gray-500">
            <span>Uploading…</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-primary transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {!canUpload && previewName && !uploading && (
        <div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm">
          <span className="truncate text-gray-600">{previewName}</span>
          {status === 'Rejected' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 shrink-0 text-xs"
              onClick={() => inputRef.current?.click()}
            >
              <X className="mr-1 size-3" />
              Re-upload
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
