import { lazy, Suspense, type ComponentType } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { PartnerLayout } from '@/components/layout/PartnerLayout'
import { StudentLayout } from '@/components/layout/StudentLayout'

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}

function lazyPage(factory: () => Promise<{ default: ComponentType }>) {
  const Component = lazy(factory)
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  )
}

const LoginPage = () => lazyPage(() => import('@/features/auth/LoginPage'))
const ForgotPasswordPage = () => lazyPage(() => import('@/features/auth/ForgotPasswordPage'))
const NotFoundPage = () => lazyPage(() => import('@/features/shared/NotFoundPage'))

// Admin pages
const AdminDashboardPage = () => lazyPage(() => import('@/features/admin/dashboard/DashboardPage'))
const AdminCalendarPage = () => lazyPage(() => import('@/features/admin/calendar/CalendarPage'))
const AdminAddEnquiryPage = () => lazyPage(() => import('@/features/admin/enquiry/AddEnquiryPage'))
const AdminViewEnquiryPage = () => lazyPage(() => import('@/features/admin/enquiry/ViewEnquiryPage'))
const AdminEnquiryDetailPage = () => lazyPage(() => import('@/features/admin/enquiry/EnquiryDetailPage'))
const AdminAddStudentPage = () => lazyPage(() => import('@/features/admin/student/AddStudentPage'))
const AdminViewStudentPage = () => lazyPage(() => import('@/features/admin/student/ViewStudentPage'))
const AdminStudentDetailPage = () => lazyPage(() => import('@/features/admin/student/StudentDetailPage'))
const AdminApplicationsPage = () => lazyPage(() => import('@/features/admin/application/ApplicationsPage'))
const AdminVisaPage = () => lazyPage(() => import('@/features/admin/visa/VisaPage'))
const AdminDeferPage = () => lazyPage(() => import('@/features/admin/defer-enrolled/DeferPage'))
const AdminEnrolledPage = () => lazyPage(() => import('@/features/admin/defer-enrolled/EnrolledPage'))
const AdminStudentInvoicesPage = () => lazyPage(() => import('@/features/admin/accounts/StudentInvoicesPage'))
const AdminPartnerInvoicesPage = () => lazyPage(() => import('@/features/admin/accounts/PartnerInvoicesPage'))
const AdminUniversityCommissionPage = () => lazyPage(() => import('@/features/admin/university-commission/UniversityCommissionPage'))
const AdminReportsHubPage = () => lazyPage(() => import('@/features/admin/reports/ReportsHubPage'))
const AdminReportDetailPage = () => lazyPage(() => import('@/features/admin/reports/ReportDetailPage'))
const AdminStandardDocumentsPage = () => lazyPage(() => import('@/features/admin/file-manager/StandardDocumentsPage'))
const AdminStudentDocumentsPage = () => lazyPage(() => import('@/features/admin/file-manager/StudentDocumentsPage'))
const AdminMastersPage = () => lazyPage(() => import('@/features/admin/masters/MastersPage'))
const AdminIntegrationsPage = () => lazyPage(() => import('@/features/admin/integrations/IntegrationsPage'))
const AdminQrFormBuilderPage = () => lazyPage(() => import('@/features/admin/integrations/QrFormBuilderPage'))
const AdminMarketingPage = () => lazyPage(() => import('@/features/admin/marketing/MarketingPage'))
const AdminTasksPage = () => lazyPage(() => import('@/features/admin/tasks/TasksPage'))
const AdminCourseFinderPage = () => lazyPage(() => import('@/features/admin/course-finder/CourseFinderPage'))

// Partner pages
const PartnerDashboardPage = () => lazyPage(() => import('@/features/partner/dashboard/PartnerDashboardPage'))
const PartnerAddEnquiryPage = () => lazyPage(() => import('@/features/partner/enquiry/AddEnquiryPage'))
const PartnerViewEnquiryPage = () => lazyPage(() => import('@/features/partner/enquiry/ViewEnquiryPage'))
const PartnerEnquiryDetailPage = () => lazyPage(() => import('@/features/partner/enquiry/EnquiryDetailPage'))
const PartnerAddStudentPage = () => lazyPage(() => import('@/features/partner/student/AddStudentPage'))
const PartnerViewStudentPage = () => lazyPage(() => import('@/features/partner/student/ViewStudentPage'))
const PartnerStudentDetailPage = () => lazyPage(() => import('@/features/partner/student/StudentDetailPage'))
const PartnerApplicationsPage = () => lazyPage(() => import('@/features/partner/application/PartnerApplicationsPage'))
const PartnerVisaPage = () => lazyPage(() => import('@/features/partner/visa/PartnerVisaPage'))
const PartnerDeferPage = () => lazyPage(() => import('@/features/partner/defer-enrolled/PartnerDeferPage'))
const PartnerEnrolledPage = () => lazyPage(() => import('@/features/partner/defer-enrolled/PartnerEnrolledPage'))
const PartnerInvoicesPage = () => lazyPage(() => import('@/features/partner/invoices/PartnerInvoicesPage'))
const PartnerFilesPage = () => lazyPage(() => import('@/features/partner/files/PartnerFilesPage'))
const PartnerReportsPage = () => lazyPage(() => import('@/features/partner/reports/PartnerReportsPage'))
const PartnerReportDetailPage = () => lazyPage(() => import('@/features/partner/reports/PartnerReportDetailPage'))

// Student pages
const StudentDashboardPage = () => lazyPage(() => import('@/features/student/dashboard/StudentDashboardPage'))
const StudentProfilePage = () => lazyPage(() => import('@/features/student/profile/StudentProfilePage'))
const StudentApplicationsPage = () => lazyPage(() => import('@/features/student/applications/StudentApplicationsPage'))
const StudentVisaPage = () => lazyPage(() => import('@/features/student/visa/StudentVisaPage'))
const StudentDocumentsPage = () => lazyPage(() => import('@/features/student/documents/StudentDocumentsPage'))
const StudentInvoicesPage = () => lazyPage(() => import('@/features/student/invoices/StudentInvoicesPage'))
const StudentAppointmentsPage = () => lazyPage(() => import('@/features/student/appointments/StudentAppointmentsPage'))
const StudentResourcesPage = () => lazyPage(() => import('@/features/student/resources/StudentResourcesPage'))
const StudentAnnouncementsPage = () => lazyPage(() => import('@/features/student/announcements/StudentAnnouncementsPage'))
const StudentMessagesPage = () => lazyPage(() => import('@/features/student/messages/StudentMessagesPage'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    element: <AuthGuard allowedRoles={['admin']} />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <AdminDashboardPage /> },
          { path: 'calendar', element: <AdminCalendarPage /> },
          { path: 'enquiry/add', element: <AdminAddEnquiryPage /> },
          { path: 'enquiry/:id', element: <AdminEnquiryDetailPage /> },
          { path: 'enquiry', element: <AdminViewEnquiryPage /> },
          { path: 'student/add', element: <AdminAddStudentPage /> },
          { path: 'student/:id', element: <AdminStudentDetailPage /> },
          { path: 'student', element: <AdminViewStudentPage /> },
          { path: 'application', element: <AdminApplicationsPage /> },
          { path: 'visa', element: <AdminVisaPage /> },
          { path: 'defer', element: <AdminDeferPage /> },
          { path: 'enrolled', element: <AdminEnrolledPage /> },
          { path: 'accounts/student-invoices', element: <AdminStudentInvoicesPage /> },
          { path: 'accounts/partner-invoices', element: <AdminPartnerInvoicesPage /> },
          { path: 'university-commission', element: <AdminUniversityCommissionPage /> },
          { path: 'reports', element: <AdminReportsHubPage /> },
          { path: 'reports/:slug', element: <AdminReportDetailPage /> },
          { path: 'files/standard', element: <AdminStandardDocumentsPage /> },
          { path: 'files/students', element: <AdminStudentDocumentsPage /> },
          { path: 'masters', element: <AdminMastersPage /> },
          { path: 'integrations', element: <AdminIntegrationsPage /> },
          { path: 'integrations/qr-form', element: <AdminQrFormBuilderPage /> },
          { path: 'marketing', element: <AdminMarketingPage /> },
          { path: 'tasks', element: <AdminTasksPage /> },
          { path: 'course-finder', element: <AdminCourseFinderPage /> },
        ],
      },
    ],
  },
  {
    element: <AuthGuard allowedRoles={['partner']} />,
    children: [
      {
        path: '/partner',
        element: <PartnerLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <PartnerDashboardPage /> },
          { path: 'enquiry/add', element: <PartnerAddEnquiryPage /> },
          { path: 'enquiry/:id', element: <PartnerEnquiryDetailPage /> },
          { path: 'enquiry', element: <PartnerViewEnquiryPage /> },
          { path: 'student/add', element: <PartnerAddStudentPage /> },
          { path: 'student/:id', element: <PartnerStudentDetailPage /> },
          { path: 'student', element: <PartnerViewStudentPage /> },
          { path: 'application', element: <PartnerApplicationsPage /> },
          { path: 'visa', element: <PartnerVisaPage /> },
          { path: 'defer', element: <PartnerDeferPage /> },
          { path: 'enrolled', element: <PartnerEnrolledPage /> },
          { path: 'invoices', element: <PartnerInvoicesPage /> },
          { path: 'files', element: <PartnerFilesPage /> },
          { path: 'reports', element: <PartnerReportsPage /> },
          { path: 'reports/:slug', element: <PartnerReportDetailPage /> },
        ],
      },
    ],
  },
  {
    element: <AuthGuard allowedRoles={['student']} />,
    children: [
      {
        path: '/student',
        element: <StudentLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <StudentDashboardPage /> },
          { path: 'profile', element: <StudentProfilePage /> },
          { path: 'applications', element: <StudentApplicationsPage /> },
          { path: 'visa', element: <StudentVisaPage /> },
          { path: 'documents', element: <StudentDocumentsPage /> },
          { path: 'invoices', element: <StudentInvoicesPage /> },
          { path: 'appointments', element: <StudentAppointmentsPage /> },
          { path: 'resources', element: <StudentResourcesPage /> },
          { path: 'announcements', element: <StudentAnnouncementsPage /> },
          { path: 'messages', element: <StudentMessagesPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
