import type { Portal } from '@/types'

export const BRAND = {
  name: "D' Educationist",
  tagline: 'Global Education Partner',
  logo: '/logo.webp',
  staffLabel: "D' Educationist (Operational Head)",
  emailDomain: 'deducationist.com',
  idPrefix: 'DE',
  studentIdSeries: 'DE/S/26',
  directScopeKey: 'de',
  directApplicationLabel: 'DE Application',
  directTabLabel: 'DE',
}

export const STORAGE_PREFIX = 'de-crm'

export function formatStudentId(sequence: number): string {
  return `${BRAND.studentIdSeries}/${String(sequence).padStart(5, '0')}`
}

export function generateStudentId(): string {
  return formatStudentId(Math.floor(Math.random() * 90000) + 10000)
}

export function formatMiscInvoiceId(): string {
  return `${BRAND.idPrefix}/INV/${Date.now()}`
}

export const LOGIN_FEATURES = [
  { title: 'Study Abroad Guidance', desc: 'Get expert support for admissions, applications, and university selection.' },
  { title: 'Visa & Documentation Support', desc: 'Simplified visa processing with personalized assistance every step.' },
  { title: 'Global Opportunities', desc: 'Access partner universities and programs across multiple countries.' },
  { title: 'Student Success Focused', desc: 'Dedicated support to help students achieve their academic goals.' },
]

export const ENQUIRY_STATUSES = ['New Enquiry', 'Under Review', 'Counselling Scheduled', 'Counselling Completed', 'Follow-up Required', 'Interested', 'Drop']
export const STUDENT_STATUSES = ['New Student', 'Documents Pending', 'On Hold', 'No Status']
export const APPLICATION_STATUSES = ['Application Started', 'Application Submitted', 'Documents Verified', 'Application Under Review', 'Offer Received', 'Fee Paid', 'Finalized']
export const APPLICATION_KANBAN_STATUSES = [
  'Application Started',
  'Application Submitted',
  'Application Under Review',
  'Offer Received',
  'Finalized',
]
export const VISA_STATUSES = ['Visa Application In Progress', 'Visa Granted', 'Visa Approved', 'Visa Rejected', 'Visa Withdraw']
export const SOURCES = ['Walking', 'Facebook', 'Registration Form', 'SMS', 'Marketing', 'Education fair']
export const BRANCHES = ['Head Office', 'Lahore', 'Karachi', 'Islamabad']
export const COMMISSION_CONTRACTS = [
  'Standard Commission',
  'Tiered Commission',
  'Fixed Amount',
  'Partner Rate',
]

export const COUNTRIES = ['Australia', 'Canada', 'UK', 'USA', 'Germany', 'Malaysia', 'Turkey', 'China', 'UAE']
export const APPLY_LEVELS = ['Post Graduation', 'Under Graduation', 'PHD', 'Diploma']
export const PROFICIENCY_TESTS = ['IELTS', 'TOEFL', 'PTE', 'GRE', 'GMAT', 'SAT', 'Duolingo', 'Others']
export const SERVICE_TYPES = ['Admission', 'Application Process Fee', 'Visa Fees', 'Counselling']
export const CURRENCIES = ['PKR', 'USD', 'GBP', 'EUR', 'CAD', 'AED', 'AUD']

export interface NavItem {
  label: string
  path?: string
  icon: string
  children?: { label: string; path: string }[]
}

export const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: 'LayoutDashboard' },
  { label: 'Calendar', path: '/admin/calendar', icon: 'Calendar' },
  { label: 'Enquiry', icon: 'MessageSquare', children: [
    { label: 'Add Enquiry', path: '/admin/enquiry/add' },
    { label: 'View Enquiry', path: '/admin/enquiry' },
  ]},
  { label: 'Student', icon: 'Users', children: [
    { label: 'Add Student', path: '/admin/student/add' },
    { label: 'View Student', path: '/admin/student' },
  ]},
  { label: 'Application', path: '/admin/application', icon: 'FileText' },
  { label: 'Visa', path: '/admin/visa', icon: 'Globe' },
  { label: 'Defer / Enrolled', icon: 'GraduationCap', children: [
    { label: 'Defer Student', path: '/admin/defer' },
    { label: 'Enrolled Student', path: '/admin/enrolled' },
  ]},
  { label: 'Accounts', icon: 'Wallet', children: [
    { label: 'Student Invoices', path: '/admin/accounts/student-invoices' },
    { label: 'Partner Claim Invoices', path: '/admin/accounts/partner-invoices' },
  ]},
  { label: 'University Comm.', path: '/admin/university-commission', icon: 'Building2' },
  { label: 'Reports', path: '/admin/reports', icon: 'BarChart3' },
  { label: 'File Manager', icon: 'FolderOpen', children: [
    { label: 'Standard Document', path: '/admin/files/standard' },
    { label: 'Student Document', path: '/admin/files/students' },
  ]},
  { label: "Master's", path: '/admin/masters', icon: 'Settings' },
  { label: 'Integrations', path: '/admin/integrations', icon: 'Plug' },
  { label: 'Marketing', path: '/admin/marketing', icon: 'Megaphone' },
]

export const PARTNER_NAV: NavItem[] = [
  { label: 'Dashboard', path: '/partner/dashboard', icon: 'LayoutDashboard' },
  { label: 'Enquiry', icon: 'MessageSquare', children: [
    { label: 'Add Enquiry', path: '/partner/enquiry/add' },
    { label: 'View Enquiry', path: '/partner/enquiry' },
  ]},
  { label: 'Student', icon: 'Users', children: [
    { label: 'Add Student', path: '/partner/student/add' },
    { label: 'View Student', path: '/partner/student' },
  ]},
  { label: 'Application', path: '/partner/application', icon: 'FileText' },
  { label: 'Visa', path: '/partner/visa', icon: 'Globe' },
  { label: 'Defer / Enrolled', icon: 'GraduationCap', children: [
    { label: 'Defer', path: '/partner/defer' },
    { label: 'Enrolled', path: '/partner/enrolled' },
  ]},
  { label: 'Invoices', path: '/partner/invoices', icon: 'Wallet' },
  { label: 'Documents', path: '/partner/files', icon: 'FolderOpen' },
  { label: 'Reports', path: '/partner/reports', icon: 'BarChart3' },
]

export const STUDENT_NAV: NavItem[] = [
  { label: 'Dashboard', path: '/student/dashboard', icon: 'LayoutDashboard' },
  { label: 'Profile', path: '/student/profile', icon: 'User' },
  { label: 'Applications', path: '/student/applications', icon: 'FileText' },
  { label: 'Visa', path: '/student/visa', icon: 'Globe' },
  { label: 'Documents', path: '/student/documents', icon: 'FolderOpen' },
  { label: 'Invoices', path: '/student/invoices', icon: 'Wallet' },
  { label: 'Appointments', path: '/student/appointments', icon: 'Calendar' },
  { label: 'Resources', path: '/student/resources', icon: 'BookOpen' },
  { label: 'Announcements', path: '/student/announcements', icon: 'Megaphone' },
  { label: 'Messages', path: '/student/messages', icon: 'MessageSquare' },
]

export const REPORTS = [
  { slug: 'enquiry', title: 'Enquiry Report', description: 'Retrieve and analyze all enquiries', icon: 'MessageSquare' },
  { slug: 'student', title: 'Student Report', description: 'View complete student details', icon: 'Users' },
  { slug: 'followup', title: 'Followup Report', description: 'View complete followup details', icon: 'Phone' },
  { slug: 'appointment', title: 'Appointment Report', description: 'View complete appointment details', icon: 'Calendar' },
  { slug: 'assigned', title: 'Assigned Report', description: 'View complete assigned details', icon: 'UserCheck' },
  { slug: 'partner', title: 'Partner Report', description: 'View complete partner details', icon: 'Handshake' },
  { slug: 'associate', title: 'Associate Report', description: 'View complete associate details', icon: 'UsersRound' },
  { slug: 'application', title: 'Application Report', description: 'View complete application details', icon: 'FileText' },
  { slug: 'visa', title: 'Visa Report', description: 'View complete visa details', icon: 'Globe' },
  { slug: 'global-intake', title: 'Global Intake Report', description: 'Retrieve details of all intake wise', icon: 'CalendarRange' },
  { slug: 'defer', title: 'Defer Report', description: 'View complete defer details', icon: 'Clock' },
  { slug: 'enrolled', title: 'Enrolled Report', description: 'View complete enrolled details', icon: 'GraduationCap' },
  { slug: 'university', title: 'University Report', description: 'View complete university details', icon: 'Building2' },
  { slug: 'student-invoice', title: 'Student Invoice', description: 'View student invoice details', icon: 'Receipt' },
  { slug: 'partner-invoice', title: 'Partner Invoice', description: 'View partner invoice details', icon: 'FileSpreadsheet' },
  { slug: 'payment-collection', title: 'Payment Collection', description: 'View payment collection details', icon: 'Banknote' },
  { slug: 'task', title: 'Task Report', description: 'View complete task details', icon: 'CheckSquare' },
]

export const INTEGRATIONS = [
  { id: 'whatsapp-meta', title: 'WhatsApp (Meta API)', description: 'Seamlessly integrate WhatsApp with Meta Cloud API for enhanced communication.' },
  { id: 'whatsapp', title: 'WhatsApp Integration', description: 'Connect WhatsApp API and track Total, Sent & Balance messages in real-time.' },
  { id: 'facebook', title: 'Facebook Lead Integration', description: 'Facebook Lead Integration through Meta & Google Sheet.' },
  { id: 'smtp', title: 'SMTP Email Integration', description: 'Effortlessly connect SMTP for smooth, automated email sending and delivery.' },
  { id: 'bulk-email', title: 'Bulk Email Integration API', description: 'Effortlessly connect SMTP for smooth, automated email sending and delivery.' },
  { id: 'sms', title: 'SMS Integration', description: 'Integrate SMS to automate alerts and boost customer engagement instantly.' },
  { id: 'webhook', title: 'Webhook Integration', description: 'Get real-time enquiries from Website, Landing Pages & Google Forms.' },
  { id: 'dialer', title: 'Dialer Integration', description: 'Integrate Dialer to automate alerts and boost customer engagement instantly.' },
  { id: 'qr-form', title: 'Dynamic QR Form', description: 'Create unlimited QR forms and collect enquiries and assign of particular users automatically.' },
]

export const MASTER_CATEGORIES = [
  { key: 'announcement', label: 'Announcement', count: 2 },
  { key: 'academic', label: 'Academic', count: 8 },
  { key: 'application-checklist', label: 'Application Check List', count: 22 },
  { key: 'application-status', label: 'Application Status', count: 629 },
  { key: 'apply-level', label: 'Apply Level', count: 1 },
  { key: 'associates', label: 'Associates', count: 2 },
  { key: 'backup', label: 'Backup', count: 7 },
  { key: 'branch', label: 'Branch', count: 3 },
  { key: 'company-config', label: 'Company Config', count: 1 },
  { key: 'contact-list', label: 'Contact List', count: 8 },
  { key: 'country', label: 'Country', count: 37 },
  { key: 'level', label: 'Level (Course Finder)', count: 17 },
  { key: 'courses', label: 'Courses', count: 87625 },
  { key: 'currency', label: 'Currency', count: 24 },
  { key: 'email-automation', label: 'Email Automation', count: 0 },
  { key: 'email-template', label: 'Email Template', count: 3 },
  { key: 'enquiry-status', label: 'Enquiry Status', count: 18 },
  { key: 'invoice-config', label: 'Invoice Configuration', count: 1 },
  { key: 'invoice-service-type', label: 'Invoice Service Type', count: 4 },
  { key: 'learning-resources', label: 'Learning Resources', count: 8 },
  { key: 'partners', label: 'Partners', count: 4 },
  { key: 'partner-commission', label: 'Partner Commission Structure', count: 1 },
  { key: 'partner-doc-checklist', label: 'Partner Doc. Checklist', count: 2 },
  { key: 'roles', label: 'Roles', count: 4 },
  { key: 'sms-template', label: 'SMS Template', count: 1 },
  { key: 'source', label: 'Source', count: 13 },
  { key: 'staff', label: 'Staff', count: 6 },
  { key: 'student-status', label: 'Student Status', count: 18 },
  { key: 'university', label: 'University / Colleges', count: 1997 },
  { key: 'visa-checklist', label: 'Visa Check List', count: 5 },
  { key: 'visa-status', label: 'Visa Status', count: 748 },
]

export const MOCK_USERS: Record<string, { password: string; user: { id: string; name: string; role: Portal; email: string; branch?: string; partnerId?: string; studentId?: string } }> = {
  admin: { password: 'admin123', user: { id: '1', name: 'Admin', role: 'admin', email: 'admin@deducationist.com', branch: 'Head Office' } },
  partner: { password: 'partner123', user: { id: '2', name: 'Ahmed Raza', role: 'partner', email: 'partner@deducationist.com', partnerId: 'p1' } },
  student: { password: 'student123', user: { id: '3', name: 'Hassan Ali', role: 'student', email: 'hassan.ali@email.com', studentId: 'DE/S/26/00500' } },
}

export function getPortalPrefix(portal: Portal) {
  return `/${portal}`
}
