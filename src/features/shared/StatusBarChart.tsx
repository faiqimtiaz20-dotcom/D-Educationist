import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatusBarChartProps {
  title: string
  data: { name: string; count: number }[]
  color?: string
  className?: string
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-gray-200/80 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur-sm">
      <p className="font-medium text-gray-900">{label}</p>
      <p className="mt-0.5 text-gray-500">{payload[0].value} records</p>
    </div>
  )
}

export function StatusBarChart({ title, data, color = '#1e3a5f', className }: StatusBarChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1)

  return (
    <Card className={cn('overflow-hidden border-0 ring-1 ring-gray-200/80 shadow-sm', className)}>
      <CardHeader className="border-b border-gray-100 pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-52 w-full laptop:h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: -18, bottom: 36 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                angle={-30}
                textAnchor="end"
                interval={0}
                height={50}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: `${color}15` }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={36}>
                {data.map((entry, index) => (
                  <Cell
                    key={`${entry.name}-${index}`}
                    fill={color}
                    fillOpacity={0.35 + (entry.count / maxCount) * 0.65}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function countByField<T>(
  items: T[],
  field: keyof T,
  order?: string[],
): { name: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const item of items) {
    const key = String(item[field] ?? 'Unknown')
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  const entries = Array.from(counts.entries()).map(([name, count]) => ({ name, count }))
  if (order) {
    return order
      .filter((s) => counts.has(s))
      .map((name) => ({ name, count: counts.get(name)! }))
      .concat(entries.filter((e) => !order.includes(e.name)))
  }
  return entries.sort((a, b) => b.count - a.count)
}
