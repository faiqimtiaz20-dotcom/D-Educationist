import { STORAGE_PREFIX } from '@/lib/constants'

const STORAGE_KEY = `${STORAGE_PREFIX}-integrations`

export interface IntegrationConfig {
  connected: boolean
  fields: Record<string, string>
}

export type IntegrationStore = Record<string, IntegrationConfig>

export function loadIntegrations(): IntegrationStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as IntegrationStore) : {}
  } catch {
    return {}
  }
}

export function saveIntegrations(store: IntegrationStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function getIntegrationConfig(id: string): IntegrationConfig {
  const store = loadIntegrations()
  return store[id] ?? { connected: false, fields: {} }
}

export function saveIntegrationConfig(id: string, config: IntegrationConfig) {
  const store = loadIntegrations()
  store[id] = config
  saveIntegrations(store)
}

export interface IntegrationFieldDef {
  key: string
  label: string
  type?: 'text' | 'password' | 'url'
  placeholder?: string
}

export const INTEGRATION_FIELDS: Record<string, IntegrationFieldDef[]> = {
  'whatsapp-meta': [
    { key: 'phoneNumberId', label: 'Phone Number ID' },
    { key: 'accessToken', label: 'Access Token', type: 'password' },
    { key: 'webhookVerifyToken', label: 'Webhook Verify Token', type: 'password' },
  ],
  whatsapp: [
    { key: 'apiKey', label: 'API Key', type: 'password' },
    { key: 'senderId', label: 'Sender ID' },
  ],
  facebook: [
    { key: 'pageId', label: 'Facebook Page ID' },
    { key: 'accessToken', label: 'Access Token', type: 'password' },
    { key: 'googleSheetUrl', label: 'Google Sheet URL', type: 'url' },
  ],
  smtp: [
    { key: 'host', label: 'SMTP Host', placeholder: 'smtp.gmail.com' },
    { key: 'port', label: 'Port', placeholder: '587' },
    { key: 'username', label: 'Username' },
    { key: 'password', label: 'Password', type: 'password' },
    { key: 'fromEmail', label: 'From Email' },
  ],
  'bulk-email': [
    { key: 'apiUrl', label: 'API URL', type: 'url' },
    { key: 'apiKey', label: 'API Key', type: 'password' },
  ],
  sms: [
    { key: 'provider', label: 'SMS Provider' },
    { key: 'apiKey', label: 'API Key', type: 'password' },
    { key: 'senderId', label: 'Sender ID' },
  ],
  webhook: [
    { key: 'webhookUrl', label: 'Webhook URL', type: 'url' },
    { key: 'secret', label: 'Signing Secret', type: 'password' },
  ],
  dialer: [
    { key: 'dialerUrl', label: 'Dialer API URL', type: 'url' },
    { key: 'apiKey', label: 'API Key', type: 'password' },
    { key: 'extension', label: 'Extension' },
  ],
  'qr-form': [
    { key: 'formName', label: 'Default Form Name' },
    { key: 'assignTo', label: 'Auto-assign To' },
  ],
}
