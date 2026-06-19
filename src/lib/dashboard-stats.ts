export interface DashboardStats {
  enquiries: { total: number; new: number; followUp: number; interested: number }
  students: { total: number; documentsPending: number; onHold: number }
  applications: { total: number; underReview: number; offerReceived: number; finalized: number }
  visas: { total: number; inProgress: number; granted: number; rejected: number }
  defers: { total: number }
  enrolled: { total: number }
  invoices: {
    total: number
    pending: number
    partialPaid: number
    fullyPaid: number
    totalPendingAmount: number
  }
  partnerInvoices: { total: number; pendingCommission: number }
  universityCommission: { total: number; pendingCommission: number }
  partners: { total: number }
}

export const EMPTY_DASHBOARD_STATS: DashboardStats = {
  enquiries: { total: 0, new: 0, followUp: 0, interested: 0 },
  students: { total: 0, documentsPending: 0, onHold: 0 },
  applications: { total: 0, underReview: 0, offerReceived: 0, finalized: 0 },
  visas: { total: 0, inProgress: 0, granted: 0, rejected: 0 },
  defers: { total: 0 },
  enrolled: { total: 0 },
  invoices: {
    total: 0,
    pending: 0,
    partialPaid: 0,
    fullyPaid: 0,
    totalPendingAmount: 0,
  },
  partnerInvoices: { total: 0, pendingCommission: 0 },
  universityCommission: { total: 0, pendingCommission: 0 },
  partners: { total: 0 },
}

function isDashboardStats(data: unknown): data is DashboardStats {
  if (!data || typeof data !== 'object') return false
  const stats = data as DashboardStats
  return typeof stats.enquiries?.total === 'number' && typeof stats.students?.total === 'number'
}

export function normalizeDashboardStats(data: unknown): DashboardStats {
  return isDashboardStats(data) ? data : EMPTY_DASHBOARD_STATS
}
