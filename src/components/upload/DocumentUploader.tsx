import { Upload, CheckCircle2, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DocumentUploaderProps {
  label: string
  required?: boolean
  uploaded?: boolean
  fileName?: string
  onUpload: (file: File) => void
  className?: string
}

export function DocumentUploader({
  label,
  required = false,
  uploaded = false,
  fileName,
  onUpload,
  className,
}: DocumentUploaderProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-start gap-3">
        {uploaded ? (
          <CheckCircle2 className="size-5 shrink-0 text-success" />
        ) : (
          <FileText className="size-5 shrink-0 text-gray-400 dark:text-gray-500" />
        )}
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {required ? 'Required' : 'Optional'}
            {uploaded ? ` · ${fileName ?? 'Uploaded'}` : ' · Pending'}
          </p>
        </div>
      </div>

      <label
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors',
          uploaded
            ? 'border-success/30 bg-success/5 dark:bg-success/10'
            : 'border-gray-200 hover:border-primary/50 hover:bg-primary/5 dark:border-gray-600 dark:hover:bg-primary/10',
        )}
      >
        <Upload className="size-5 text-gray-400" />
        <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {uploaded ? 'Replace file' : 'Tap to upload PDF, JPG, PNG'}
        </span>
        <input
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onUpload(file)
          }}
        />
      </label>
    </div>
  )
}
