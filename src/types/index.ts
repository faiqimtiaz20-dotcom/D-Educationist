export type Portal = 'admin' | 'partner' | 'student'
export type Role = Portal

export interface User {
  id: string
  name: string
  role: Role
  email: string
  branch?: string
  partnerId?: string
  studentId?: string
}

export interface Timestamps {
  createdAt: string
  updatedAt: string
}

export interface Assignment {
  assignedBy: string
  assignedTo: string
}

export interface FollowUp {
  date?: string
  time?: string
  remarks?: string
}

export interface Appointment {
  date?: string
  time?: string
  remarks?: string
}

export interface Enquiry extends Timestamps, Assignment {
  id: string
  firstName: string
  lastName: string
  email: string
  mobile: string
  alternateNo?: string
  dateOfBirth?: string
  gender?: string
  nationality?: string
  maritalStatus?: string
  address?: string
  highestQualification?: string
  interestedCourse?: string
  testGiven?: string
  interestedCountry?: string
  intake?: string
  applyLevel?: string
  source?: string
  status: string
  remark?: string
  branch: string
  partnerId?: string
  partnerName?: string
  followUp?: FollowUp
  appointment?: Appointment
}

export interface AcademicRecord {
  qualification: string
  subjects: string
  college: string
  percentage: string
  backlogs: string
  yearOfPassing: string
}

export interface ProficiencyTest {
  type: string
  overall?: string
  listening?: string
  reading?: string
  writing?: string
  speaking?: string
  testDate?: string
}

export interface WorkExperience {
  companyName: string
  position: string
  startDate: string
  endDate: string
  totalExperience: string
}

export interface Student extends Timestamps, Assignment {
  id: string
  studentId: string
  firstName: string
  lastName: string
  email: string
  mobile: string
  alternateNo?: string
  dateOfBirth?: string
  gender?: string
  nationality?: string
  maritalStatus?: string
  address?: string
  highestQualification?: string
  interestedCourse?: string
  interestedCountry?: string
  intake?: string
  applyLevel?: string
  source?: string
  status: string
  docStatus: 'Pending' | 'Completed'
  remark?: string
  passportNo?: string
  passportIssue?: string
  passportExpiry?: string
  branch: string
  partnerId?: string
  partnerName?: string
  followUp?: FollowUp
  appointment?: Appointment
  academics?: AcademicRecord[]
  proficiencyTests?: ProficiencyTest[]
  workExperience?: WorkExperience[]
}

export interface Application extends Timestamps, Assignment {
  id: string
  studentId: string
  studentRef: string
  studentName: string
  email: string
  mobile: string
  applicationCount: number
  docStatus: 'Pending' | 'Completed'
  intCountry: string
  intake: string
  intCourse: string
  applyLevel: string
  passportNo?: string
  dateOfBirth?: string
  branch: string
  partnerId?: string
  partnerName?: string
  status: string
  university?: string
  associate?: string
  deadlineDate?: string
  isPartner?: boolean
}

export interface VisaRecord extends Timestamps, Assignment {
  id: string
  studentId: string
  studentRef: string
  studentName: string
  email: string
  mobile: string
  docStatus: 'Pending' | 'Completed'
  appliedCountry: string
  university: string
  visaStatus: string
  course: string
  intake: string
  passportNo?: string
  branch: string
  partnerId?: string
  partnerName?: string
  isPartner?: boolean
}

export interface DeferRecord extends Timestamps, Assignment {
  id: string
  studentId: string
  studentRef: string
  studentName: string
  email: string
  mobile: string
  deferIntake: string
  deferReason: string
  interestedCourse?: string
  interestedCountries?: string
  applyLevel?: string
  source?: string
  intake?: string
  branch: string
  partnerId?: string
  partnerName?: string
  isPartner?: boolean
}

export interface EnrolledRecord extends Timestamps, Assignment {
  id: string
  studentId: string
  studentRef: string
  studentName: string
  email: string
  mobile: string
  appliedCountry: string
  appliedUniversity: string
  course: string
  intake: string
  status: string
  source?: string
  branch: string
  partnerId?: string
  partnerName?: string
  isPartner?: boolean
}

export interface Invoice extends Timestamps {
  id: string
  invoiceId: string
  studentId: string
  name: string
  email: string
  mobile: string
  totalAmount: number
  discount: number
  afterDiscount: number
  taxPercent: number
  taxType: string
  taxAmount: number
  grandTotal: number
  paidAmount: number
  pendingAmount: number
  dueDate: string
  status: 'Pending' | 'Fully Paid' | 'Partial Paid'
  serviceType: string
  currency: string
  createdBy: string
  partnerId?: string
}

export interface PartnerInvoice extends Timestamps {
  id: string
  invoiceNo: string
  studentCount: number
  netCommission: number
  currency: string
  taxPercent: number
  taxAmount: number
  totalCommission: number
  receivedCommission: number
  pendingCommission: number
  status: 'Pending' | 'Partial Paid' | 'Fully Paid'
  createdBy: string
  partnerId: string
}

export interface UniversityCommission extends Timestamps {
  id: string
  invoiceNo: string
  country: string
  university: string
  studentCount: number
  totalCommission: number
  receivedCommission: number
  pendingCommission: number
  status: 'Pending' | 'Partial Paid' | 'Fully Paid'
  createdBy: string
  commissionType: string
  commissionSubType: string
}

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end?: string
  category: 'enquiry' | 'student' | 'application' | 'visa' | 'invoice'
  eventType: 'followup' | 'appointment' | 'due'
  staffId?: string
  branch?: string
}

export interface ReportDefinition {
  slug: string
  title: string
  description: string
  icon: string
}

export interface Integration {
  id: string
  title: string
  description: string
  connected: boolean
}

export interface MasterCategory {
  key: string
  label: string
  count: number
}

export interface StandardDocument extends Timestamps {
  id: string
  name: string
  fileName: string
}

export interface TaskItem extends Timestamps {
  id: string
  title: string
  description?: string
  dueDate: string
  assignedTo: string
  status: 'pending' | 'completed'
  priority: 'low' | 'medium' | 'high'
}

export interface UniversityCampus {
  id: string
  name: string
  city?: string
}

export interface UniversityMaster extends Timestamps {
  id: string
  country: string
  name: string
  commissionContract: string
  agreementExpiry?: string | null
  agreementFileName?: string | null
  logoFileName?: string | null
  campuses: UniversityCampus[]
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
