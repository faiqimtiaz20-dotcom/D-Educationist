import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Plug, CheckCircle2, Settings2 } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { INTEGRATIONS } from '@/lib/constants'
import {
  getIntegrationConfig,
  saveIntegrationConfig,
  loadIntegrations,
  INTEGRATION_FIELDS,
  type IntegrationConfig,
} from '@/lib/integrationStore'

export function IntegrationsPage() {
  const navigate = useNavigate()
  const [configs, setConfigs] = useState(loadIntegrations())
  const [configId, setConfigId] = useState<string | null>(null)
  const [formFields, setFormFields] = useState<Record<string, string>>({})
  const [formConnected, setFormConnected] = useState(false)

  useEffect(() => {
    if (!configId) return
    const config = getIntegrationConfig(configId)
    setFormFields(config.fields)
    setFormConnected(config.connected)
  }, [configId])

  const refresh = () => setConfigs(loadIntegrations())

  const openConfig = (id: string) => {
    if (id === 'qr-form') {
      navigate('/admin/integrations/qr-form')
      return
    }
    setConfigId(id)
  }

  const handleSave = () => {
    if (!configId) return
    const config: IntegrationConfig = { connected: formConnected, fields: formFields }
    saveIntegrationConfig(configId, config)
    refresh()
    toast.success('Configuration saved')
    setConfigId(null)
  }

  const activeIntegration = INTEGRATIONS.find((i) => i.id === configId)
  const fieldDefs = configId ? INTEGRATION_FIELDS[configId] ?? [] : []

  return (
    <PageShell title="Integrations" breadcrumbs={[{ label: 'Integrations' }]}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {INTEGRATIONS.map((integration) => {
          const config = configs[integration.id] ?? getIntegrationConfig(integration.id)
          const isConnected = config.connected
          return (
            <Card key={integration.id} className="flex flex-col dark:border-gray-700 dark:bg-gray-800">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Plug className="size-5" />
                  </div>
                  <Badge variant={isConnected ? 'success' : 'outline'}>
                    {isConnected ? 'Connected' : 'Not Connected'}
                  </Badge>
                </div>
                <CardTitle className="text-base dark:text-gray-100">{integration.title}</CardTitle>
              </CardHeader>
              <CardContent className="mt-auto space-y-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">{integration.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => openConfig(integration.id)}
                >
                  <Settings2 className="size-4" />
                  Configure
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={!!configId} onOpenChange={() => setConfigId(null)}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Configure {activeIntegration?.title}</DialogTitle>
            <DialogDescription>
              Enter credentials and settings. Saved locally for this demo.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            {fieldDefs.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label>{field.label}</Label>
                <Input
                  type={field.type ?? 'text'}
                  placeholder={field.placeholder}
                  value={formFields[field.key] ?? ''}
                  onChange={(e) =>
                    setFormFields((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                />
              </div>
            ))}
            {fieldDefs.length === 0 && (
              <p className="text-sm text-gray-500">No additional fields for this integration.</p>
            )}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formConnected}
                onChange={(e) => setFormConnected(e.target.checked)}
                className="size-4 rounded border-gray-300"
              />
              <span className="flex items-center gap-1">
                <CheckCircle2 className="size-4 text-success" />
                Mark as connected
              </span>
            </label>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigId(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Configuration</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
