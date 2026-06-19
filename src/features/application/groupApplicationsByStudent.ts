import type { Application } from '@/types'
import { BRAND } from '@/lib/constants'

export interface StudentApplicationGroup {
  studentId: string
  studentRef: string
  studentName: string
  email: string
  mobile: string
  applicationCount: number
  docStatus: Application['docStatus']
  intCountry: string
  intake: string
  intCourse: string
  applyLevel: string
  passportNo?: string
  dateOfBirth?: string
  branch: string
  partnerId?: string
  partnerName?: string
  assignedBy: string
  assignedTo: string
  status: string
  isPartner?: boolean
  createdAt: string
  updatedAt: string
  applications: Application[]
}

export function groupApplicationsByStudent(applications: Application[]): StudentApplicationGroup[] {
  const byStudent = new Map<string, Application[]>()

  for (const application of applications) {
    const existing = byStudent.get(application.studentId) ?? []
    existing.push(application)
    byStudent.set(application.studentId, existing)
  }

  return Array.from(byStudent.values()).map((apps) => {
    const sorted = [...apps].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    const latest = sorted[0]
    const createdAt = sorted.reduce(
      (earliest, app) => (app.createdAt < earliest ? app.createdAt : earliest),
      sorted[0].createdAt,
    )

    return {
      studentId: latest.studentId,
      studentRef: latest.studentRef,
      studentName: latest.studentName,
      email: latest.email,
      mobile: latest.mobile,
      applicationCount: sorted.length,
      docStatus: sorted.some((app) => app.docStatus === 'Pending') ? 'Pending' : latest.docStatus,
      intCountry: latest.intCountry,
      intake: latest.intake,
      intCourse: latest.intCourse,
      applyLevel: latest.applyLevel,
      passportNo: latest.passportNo,
      dateOfBirth: latest.dateOfBirth,
      branch: latest.branch,
      partnerId: latest.partnerId,
      partnerName: latest.partnerName,
      assignedBy: latest.assignedBy,
      assignedTo: latest.assignedTo,
      status: latest.status,
      isPartner: latest.isPartner,
      createdAt,
      updatedAt: latest.updatedAt,
      applications: sorted,
    }
  })
}

export function filterApplicationsByScope(
  applications: Application[],
  scope: string,
): Application[] {
  switch (scope) {
    case 'partner':
      return applications.filter((app) => app.isPartner || app.partnerId)
    case BRAND.directScopeKey:
      return applications.filter((app) => !app.isPartner && !app.partnerId)
    case 'assigned':
      return applications.filter((app) => Boolean(app.assignedTo?.trim()))
    case 'unassigned':
      return applications.filter((app) => !app.assignedTo?.trim())
    case 'pending':
      return applications.filter((app) => app.docStatus === 'Pending')
    case 'submitted':
      return applications.filter((app) => app.status === 'Application Submitted')
    case 'finalized':
      return applications.filter((app) => app.status === 'Finalized')
    case 'offer':
      return applications.filter((app) => app.status === 'Offer Received')
    default:
      return applications
  }
}

export function filterStudentGroupsByScope(
  groups: StudentApplicationGroup[],
  scope: string,
): StudentApplicationGroup[] {
  switch (scope) {
    case 'partner':
      return groups.filter((group) => group.isPartner || group.partnerId)
    case BRAND.directScopeKey:
      return groups.filter((group) => !group.isPartner && !group.partnerId)
    case 'pending':
      return groups.filter((group) => group.docStatus === 'Pending')
    case 'submitted':
      return groups.filter((group) =>
        group.applications.some((app) => app.status === 'Application Submitted'),
      )
    case 'finalized':
      return groups.filter((group) =>
        group.applications.some((app) => app.status === 'Finalized'),
      )
    case 'offer':
      return groups.filter((group) =>
        group.applications.some((app) => app.status === 'Offer Received'),
      )
    default:
      return groups
  }
}

export function getApplicationRowClass(application: Application): string | undefined {
  if (application.status === 'Finalized') return 'bg-green-50/80'
  if (application.status === 'Application Submitted') return 'bg-yellow-50/80'
  return undefined
}

export function getStudentGroupRowClass(group: StudentApplicationGroup): string | undefined {
  if (group.applications.some((app) => app.status === 'Finalized')) return 'bg-green-50/80'
  if (group.applications.some((app) => app.status === 'Application Submitted')) {
    return 'bg-yellow-50/80'
  }
  return undefined
}
