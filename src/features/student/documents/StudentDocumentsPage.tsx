import { useState } from 'react'
import { toast } from 'sonner'
import { PageShell } from '@/components/layout/PageShell'
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DocumentUploader } from '@/components/upload/DocumentUploader'
import { ProgressRing } from '@/components/data-display/ProgressRing'
import { useStudentPortal } from '@/features/shared/useStudentPortal'

const DOCUMENT_TYPES = [
  { id: 'passport', label: 'Passport Copy', required: true },
  { id: 'transcript', label: 'Academic Transcripts', required: true },
  { id: 'ielts', label: 'IELTS / PTE Score', required: true },
  { id: 'sop', label: 'Statement of Purpose', required: true },
  { id: 'resume', label: 'Resume / CV', required: false },
  { id: 'financial', label: 'Financial Documents', required: true },
  { id: 'offer', label: 'Offer Letter', required: false },
]

export default function StudentDocumentsPage() {
  const { student, isLoading } = useStudentPortal()
  const [uploads, setUploads] = useState<Record<string, { uploaded: boolean; fileName?: string }>>({
    passport: { uploaded: true, fileName: 'passport.pdf' },
    transcript: { uploaded: true, fileName: 'transcripts.pdf' },
    ielts: { uploaded: false },
    sop: { uploaded: false },
    resume: { uploaded: true, fileName: 'resume.pdf' },
    financial: { uploaded: false },
    offer: { uploaded: false },
  })

  const completedCount = DOCUMENT_TYPES.filter((d) => uploads[d.id]?.uploaded).length
  const percent = Math.round((completedCount / DOCUMENT_TYPES.length) * 100)

  const handleUpload = (docId: string, file: File) => {
    setUploads((prev) => ({
      ...prev,
      [docId]: { uploaded: true, fileName: file.name },
    }))
    toast.success(`${file.name} uploaded successfully`)
  }

  if (isLoading) {
    return (
      <PageShell title="Documents">
        <LoadingSkeleton variant="card" rows={5} />
      </PageShell>
    )
  }

  return (
    <PageShell title="Documents" className="pb-20 lg:pb-6">
      <div className="flex items-center gap-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <ProgressRing percent={percent} label="complete" />
        <div className="flex-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">Checklist Progress</p>
          <p className="text-lg font-semibold dark:text-gray-100">
            {completedCount} of {DOCUMENT_TYPES.length} documents uploaded
          </p>
          {student && (
            <p className="mt-1 text-xs text-gray-400">
              Status: {student.docStatus} · {student.studentId}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {DOCUMENT_TYPES.map((doc) => {
          const state = uploads[doc.id] ?? { uploaded: false }
          return (
            <Card key={doc.id} className="dark:border-gray-700 dark:bg-gray-800">
              <CardContent className="p-4">
                <DocumentUploader
                  label={doc.label}
                  required={doc.required}
                  uploaded={state.uploaded}
                  fileName={state.fileName}
                  onUpload={(file) => handleUpload(doc.id, file)}
                />
                {state.uploaded && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 w-full text-xs"
                    onClick={() => toast.info(`Preview: ${state.fileName}`)}
                  >
                    View uploaded file
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </PageShell>
  )
}
