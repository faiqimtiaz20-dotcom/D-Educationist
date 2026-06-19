export const DASHBOARD_ACCENTS = {
  blue: { bg: 'from-blue-500/10 to-blue-500/5', icon: 'bg-blue-500/15 text-blue-600', bar: 'bg-blue-500' },
  green: { bg: 'from-emerald-500/10 to-emerald-500/5', icon: 'bg-emerald-500/15 text-emerald-600', bar: 'bg-emerald-500' },
  orange: { bg: 'from-orange-500/10 to-orange-500/5', icon: 'bg-orange-500/15 text-orange-600', bar: 'bg-orange-500' },
  purple: { bg: 'from-violet-500/10 to-violet-500/5', icon: 'bg-violet-500/15 text-violet-600', bar: 'bg-violet-500' },
  amber: { bg: 'from-amber-500/10 to-amber-500/5', icon: 'bg-amber-500/15 text-amber-600', bar: 'bg-amber-500' },
  rose: { bg: 'from-rose-500/10 to-rose-500/5', icon: 'bg-rose-500/15 text-rose-600', bar: 'bg-rose-500' },
  cyan: { bg: 'from-cyan-500/10 to-cyan-500/5', icon: 'bg-cyan-500/15 text-cyan-600', bar: 'bg-cyan-500' },
  pink: { bg: 'from-pink-500/10 to-pink-500/5', icon: 'bg-pink-500/15 text-pink-600', bar: 'bg-pink-500' },
  primary: { bg: 'from-primary/10 to-primary/5', icon: 'bg-primary/15 text-primary', bar: 'bg-primary' },
} as const

export type DashboardAccent = keyof typeof DASHBOARD_ACCENTS
