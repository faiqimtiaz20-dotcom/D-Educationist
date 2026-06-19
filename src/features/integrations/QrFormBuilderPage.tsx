import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus, Trash2, QrCode, ArrowLeft } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

interface FormField {
  id: string
  label: string
  type: 'text' | 'email' | 'tel' | 'select'
  required: boolean
  options?: string
}

const DEFAULT_FIELDS: FormField[] = [
  { id: 'f1', label: 'Full Name', type: 'text', required: true },
  { id: 'f2', label: 'Email', type: 'email', required: true },
  { id: 'f3', label: 'Mobile', type: 'tel', required: true },
  { id: 'f4', label: 'Interested Country', type: 'select', required: true, options: 'Australia,Canada,UK' },
]

function MockQrPreview({ formName, fields }: { formName: string; fields: FormField[] }) {
  const pattern = useMemo(() => {
    const seed = formName.length + fields.length
    return Array.from({ length: 49 }, (_, i) => ((seed * (i + 7)) % 3) > 0)
  }, [formName, fields])

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="grid grid-cols-7 gap-0.5 rounded-lg border-4 border-gray-900 bg-white p-3 dark:border-gray-100">
        {pattern.map((filled, i) => (
          <div
            key={i}
            className={filled ? 'size-4 bg-gray-900 dark:bg-gray-100' : 'size-4 bg-white dark:bg-gray-800'}
          />
        ))}
      </div>
      <p className="text-center text-xs text-gray-500 dark:text-gray-400">
        Mock QR for &quot;{formName || 'Untitled Form'}&quot;
      </p>
      <p className="text-[10px] text-gray-400">{fields.length} fields · Scan to open enquiry form</p>
    </div>
  )
}

export function QrFormBuilderPage() {
  const [formName, setFormName] = useState('Study Abroad Enquiry')
  const [assignTo, setAssignTo] = useState('Counsellor A')
  const [fields, setFields] = useState<FormField[]>(DEFAULT_FIELDS)

  const addField = () => {
    setFields((prev) => [
      ...prev,
      { id: `f${Date.now()}`, label: 'New Field', type: 'text', required: false },
    ])
  }

  const updateField = (id: string, patch: Partial<FormField>) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  }

  const removeField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id))
  }

  const handleSave = () => {
    toast.success('QR form saved')
  }

  return (
    <PageShell
      title="Dynamic QR Form Builder"
      breadcrumbs={[
        { label: 'Integrations', href: '/admin/integrations' },
        { label: 'QR Form Builder' },
      ]}
      action={
        <Button variant="outline" asChild>
          <Link to="/admin/integrations">
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="dark:border-gray-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-base">Form Settings</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Form Name</Label>
                <Input value={formName} onChange={(e) => setFormName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Auto-assign To</Label>
                <Input value={assignTo} onChange={(e) => setAssignTo(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:border-gray-700 dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Form Fields</CardTitle>
              <Button size="sm" variant="outline" onClick={addField}>
                <Plus className="size-4" />
                Add Field
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field) => (
                <div
                  key={field.id}
                  className="grid gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-600 sm:grid-cols-2"
                >
                  <div className="space-y-1.5">
                    <Label>Label</Label>
                    <Input
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Type</Label>
                    <Select
                      value={field.type}
                      onChange={(e) =>
                        updateField(field.id, { type: e.target.value as FormField['type'] })
                      }
                    >
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="tel">Phone</option>
                      <option value="select">Select</option>
                    </Select>
                  </div>
                  {field.type === 'select' && (
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label>Options (comma-separated)</Label>
                      <Input
                        value={field.options ?? ''}
                        onChange={(e) => updateField(field.id, { options: e.target.value })}
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between sm:col-span-2">
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={field.required}
                        onCheckedChange={(v) => updateField(field.id, { required: Boolean(v) })}
                      />
                      Required
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-danger"
                      onClick={() => removeField(field.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Button onClick={handleSave}>Save & Generate QR</Button>
        </div>

        <Card className="dark:border-gray-700 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <QrCode className="size-5" />
              QR Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MockQrPreview formName={formName} fields={fields} />
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}

export default QrFormBuilderPage
