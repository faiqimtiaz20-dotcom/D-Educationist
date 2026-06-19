import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Plus, Megaphone, Mail, MessageSquare } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { FormSection } from '@/components/forms/FormSection'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'
import { COUNTRIES, ENQUIRY_STATUSES, BRAND } from '@/lib/constants'

interface Campaign {
  id: string
  name: string
  channel: string
  status: string
  startDate: string
  endDate: string
  description: string
  audienceCountry?: string
  audienceStatus?: string
}

interface CampaignForm {
  name: string
  channel: string
  startDate: string
  endDate: string
  description: string
  audienceCountry: string
  audienceStatus: string
}

interface TemplateForm {
  subject: string
  body: string
}

const EMAIL_VARS = '{{firstName}}, {{lastName}}, {{email}}, {{country}}, {{course}}'
const SMS_VARS = '{{firstName}}, {{mobile}}, {{appointmentDate}}'

const INITIAL: Campaign[] = [
  {
    id: 'c1',
    name: 'Summer Intake 2026',
    channel: 'Facebook',
    status: 'Active',
    startDate: '2026-05-01',
    endDate: '2026-08-31',
    description: 'Promote summer intake across Australia and Canada.',
    audienceCountry: 'Australia',
    audienceStatus: 'Interested',
  },
  {
    id: 'c2',
    name: 'Education Fair Lahore',
    channel: 'Education fair',
    status: 'Scheduled',
    startDate: '2026-07-15',
    endDate: '2026-07-17',
    description: 'Booth at Lahore education fair.',
    audienceCountry: 'Canada',
    audienceStatus: 'New Enquiry',
  },
]

export function MarketingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL)
  const [showForm, setShowForm] = useState(false)
  const [emailTemplate, setEmailTemplate] = useState<TemplateForm>({
    subject: `Welcome to ${BRAND.name} — {{firstName}}`,
    body: `Dear {{firstName}} {{lastName}},\n\nThank you for your interest in studying in {{country}}. Our counsellor will contact you at {{email}} shortly.\n\nBest regards,\n${BRAND.name} Team`,
  })
  const [smsTemplate, setSmsTemplate] = useState<TemplateForm>({
    subject: '',
    body: 'Hi {{firstName}}, your appointment is on {{appointmentDate}}. Reply STOP to opt out.',
  })

  const { register, handleSubmit, reset } = useForm<CampaignForm>({
    defaultValues: { channel: 'Facebook', audienceCountry: '', audienceStatus: '' },
  })

  const onSubmit = (values: CampaignForm) => {
    const campaign: Campaign = {
      id: `c${Date.now()}`,
      ...values,
      status: 'Draft',
    }
    setCampaigns((prev) => [campaign, ...prev])
    toast.success('Campaign created')
    reset()
    setShowForm(false)
  }

  const saveEmailTemplate = () => toast.success('Email template saved')
  const saveSmsTemplate = () => toast.success('SMS template saved')

  return (
    <PageShell title="Marketing" breadcrumbs={[{ label: 'Marketing' }]}>
      <Tabs defaultValue="campaigns">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="email">Email Template</TabsTrigger>
          <TabsTrigger value="sms">SMS Template</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns">
          <div className="mb-4 flex justify-end">
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="size-4" />
              Create Campaign
            </Button>
          </div>

          {showForm && (
            <FormSection title="New Campaign" className="mb-6">
              <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Campaign Name *</Label>
                  <Input {...register('name', { required: true })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Channel</Label>
                  <Select {...register('channel')}>
                    <option value="Facebook">Facebook</option>
                    <option value="SMS">SMS</option>
                    <option value="Email">Email</option>
                    <option value="Education fair">Education fair</option>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Start Date</Label>
                  <Input type="date" {...register('startDate', { required: true })} />
                </div>
                <div className="space-y-1.5">
                  <Label>End Date</Label>
                  <Input type="date" {...register('endDate', { required: true })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Audience — Country</Label>
                  <Select {...register('audienceCountry')}>
                    <option value="">All countries</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Audience — Enquiry Status</Label>
                  <Select {...register('audienceStatus')}>
                    <option value="">All statuses</option>
                    {ENQUIRY_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Description</Label>
                  <Textarea {...register('description')} rows={3} />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit">Save Campaign</Button>
                </div>
              </form>
            </FormSection>
          )}

          <div className="space-y-3">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="dark:border-gray-700 dark:bg-gray-800">
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Megaphone className="size-5" />
                    </div>
                    <div>
                      <p className="font-medium dark:text-gray-100">{campaign.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {campaign.channel} · {campaign.description}
                      </p>
                      <p className="text-xs text-gray-400">
                        Audience: {campaign.audienceCountry || 'All'} · {campaign.audienceStatus || 'All statuses'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {format(new Date(campaign.startDate), 'dd MMM yyyy')} — {format(new Date(campaign.endDate), 'dd MMM yyyy')}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={campaign.status} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="email">
          <FormSection title="Email Template Editor">
            <p className="mb-4 text-xs text-gray-500">
              Use variables: {EMAIL_VARS}
            </p>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-2">
                  <Mail className="size-4" />
                  Subject
                </Label>
                <Input
                  value={emailTemplate.subject}
                  onChange={(e) => setEmailTemplate((t) => ({ ...t, subject: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Body</Label>
                <Textarea
                  rows={10}
                  value={emailTemplate.body}
                  onChange={(e) => setEmailTemplate((t) => ({ ...t, body: e.target.value }))}
                  className="font-mono text-sm"
                />
              </div>
              <Button onClick={saveEmailTemplate}>Save Email Template</Button>
            </div>
          </FormSection>
        </TabsContent>

        <TabsContent value="sms">
          <FormSection title="SMS Template Editor">
            <p className="mb-4 text-xs text-gray-500">
              Use variables: {SMS_VARS}
            </p>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-2">
                  <MessageSquare className="size-4" />
                  Message (max 160 chars recommended)
                </Label>
                <Textarea
                  rows={4}
                  value={smsTemplate.body}
                  onChange={(e) => setSmsTemplate((t) => ({ ...t, body: e.target.value }))}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-400">{smsTemplate.body.length} characters</p>
              </div>
              <Button onClick={saveSmsTemplate}>Save SMS Template</Button>
            </div>
          </FormSection>
        </TabsContent>
      </Tabs>
    </PageShell>
  )
}
