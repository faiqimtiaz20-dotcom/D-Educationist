import {
  BRANCHES,
  SOURCES,
  ENQUIRY_STATUSES,
  STUDENT_STATUSES,
  APPLY_LEVELS,
  COUNTRIES,
  CURRENCIES,
  SERVICE_TYPES,
  MASTER_CATEGORIES,
  STORAGE_PREFIX,
} from '@/lib/constants'

export interface MasterRecord {
  id: string
  name: string
}

const MASTER_STORAGE_PREFIX = `${STORAGE_PREFIX}-masters-`

function seedForCategory(key: string): MasterRecord[] {
  const seeds: Record<string, string[]> = {
    branch: [...BRANCHES],
    source: [...SOURCES],
    'enquiry-status': [...ENQUIRY_STATUSES],
    'student-status': [...STUDENT_STATUSES],
    partners: ['Ahmed Raza', 'Global Edu Partners', 'Study Abroad Hub', 'Campus Connect'],
    staff: ['Counsellor A', 'Counsellor B', 'Calling Team', 'Visa Team', 'Operational Head', 'Admin User'],
    country: [...COUNTRIES],
    'apply-level': [...APPLY_LEVELS],
    level: [...APPLY_LEVELS, 'Certificate', 'Foundation'],
    currency: [...CURRENCIES],
    'invoice-service-type': [...SERVICE_TYPES],
    associates: ['Associate North', 'Associate South'],
    roles: ['Admin', 'Counsellor', 'Calling Team', 'Partner'],
    announcement: ["Welcome to D' Educationist", 'Holiday Notice'],
    academic: ['10th', '12th', 'Graduation', 'Post Graduation', 'PHD'],
    'application-status': ['Application Started', 'Application Submitted', 'Offer Received'],
    'visa-status': ['Visa Application In Progress', 'Visa Granted', 'Visa Rejected'],
    'email-template': ['Welcome Email', 'Follow-up Email', 'Document Reminder'],
    'sms-template': ['Appointment Reminder'],
    'learning-resources': ['IELTS Guide', 'SOP Tips', 'Visa Checklist'],
    'application-checklist': ['Passport', 'Transcripts', 'IELTS', 'SOP', 'Resume'],
    'visa-checklist': ['Passport', 'COE', 'Financial Docs', 'Medical', 'Insurance'],
    'partner-doc-checklist': ['Agreement', 'GST Certificate'],
    'partner-commission': ['Standard Commission'],
    'company-config': ["D' Educationist"],
    'invoice-config': ['Default Invoice Config'],
    backup: ['Daily Backup', 'Weekly Backup'],
    'contact-list': ['Support', 'Sales', 'Accounts'],
    courses: ['MBA', 'MCOM', 'Computer Science'],
    'email-automation': [],
  }

  const names = seeds[key]
  if (names !== undefined) {
    return names.map((name, i) => ({ id: `${key}-${i + 1}`, name }))
  }

  const cat = MASTER_CATEGORIES.find((c) => c.key === key)
  const count = Math.min(cat?.count ?? 3, 5)
  return Array.from({ length: count }, (_, i) => ({
    id: `${key}-${i + 1}`,
    name: `${cat?.label ?? key} Item ${i + 1}`,
  }))
}

export function loadMasterRecords(category: string): MasterRecord[] {
  const stored = localStorage.getItem(`${MASTER_STORAGE_PREFIX}${category}`)
  if (stored) {
    try {
      return JSON.parse(stored) as MasterRecord[]
    } catch {
      /* fall through */
    }
  }
  const seeded = seedForCategory(category)
  localStorage.setItem(`${MASTER_STORAGE_PREFIX}${category}`, JSON.stringify(seeded))
  return seeded
}

export function saveMasterRecords(category: string, records: MasterRecord[]) {
  localStorage.setItem(`${MASTER_STORAGE_PREFIX}${category}`, JSON.stringify(records))
}

export function createMasterRecord(category: string, name: string): MasterRecord {
  const records = loadMasterRecords(category)
  const record: MasterRecord = { id: `${category}-${Date.now()}`, name }
  const next = [...records, record]
  saveMasterRecords(category, next)
  return record
}

export function updateMasterRecord(category: string, id: string, name: string): MasterRecord | null {
  const records = loadMasterRecords(category)
  const idx = records.findIndex((r) => r.id === id)
  if (idx === -1) return null
  const updated = { ...records[idx], name }
  const next = [...records]
  next[idx] = updated
  saveMasterRecords(category, next)
  return updated
}

export function deleteMasterRecord(category: string, id: string): boolean {
  const records = loadMasterRecords(category)
  const next = records.filter((r) => r.id !== id)
  if (next.length === records.length) return false
  saveMasterRecords(category, next)
  return true
}
