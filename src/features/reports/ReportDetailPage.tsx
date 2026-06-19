import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { Download, FileSpreadsheet } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { DataTable } from '@/components/data-display/DataTable'
import { FilterPanel } from '@/components/filters/FilterPanel'
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton'
import { FilterSelect, FilterInput } from '@/features/shared/FilterField'
import { Button } from '@/components/ui/button'
import {
  enquiryService,
  studentService,
  applicationService,
  visaService,
  deferService,
  enrolledService,
  invoiceService,
} from '@/services'
import { REPORTS, BRANCHES, COUNTRIES } from '@/lib/constants'
import { type PortalPageProps, usePortalContext } from '@/features/shared/portal'

function buildServiceMap(partnerId?: string) {
  const partnerParams = partnerId ? { pageSize: 200, partnerId } : { pageSize: 200 }
  return {
    enquiry: () => enquiryService.getAll(partnerParams).then((r) => ({ data: r.data as Record<string, unknown>[] })),
    student: () => studentService.getAll(partnerParams).then((r) => ({ data: r.data as Record<string, unknown>[] })),
    followup: () => enquiryService.getAll(partnerParams).then((r) => ({ data: r.data.filter((e) => e.followUp) as Record<string, unknown>[] })),
    appointment: () => enquiryService.getAll(partnerParams).then((r) => ({ data: r.data.filter((e) => e.appointment) as Record<string, unknown>[] })),
    assigned: () => studentService.getAll(partnerParams).then((r) => ({ data: r.data as Record<string, unknown>[] })),
    partner: () => studentService.getAll(partnerParams).then((r) => ({ data: r.data.filter((s) => s.partnerId) as Record<string, unknown>[] })),
    associate: () => studentService.getAll(partnerParams).then((r) => ({ data: r.data as Record<string, unknown>[] })),
    application: () => applicationService.getAll({ ...partnerParams, isPartner: partnerId ? true : undefined }).then((r) => ({ data: r.data as Record<string, unknown>[] })),
    visa: () => visaService.getAll({ ...partnerParams, isPartner: partnerId ? true : undefined }).then((r) => ({ data: r.data as Record<string, unknown>[] })),
    'global-intake': () => studentService.getAll(partnerParams).then((r) => ({ data: r.data as Record<string, unknown>[] })),
    defer: () => deferService.getAll({ ...partnerParams, isPartner: partnerId ? true : undefined }).then((r) => ({ data: r.data as Record<string, unknown>[] })),
    enrolled: () => enrolledService.getAll({ ...partnerParams, isPartner: partnerId ? true : undefined }).then((r) => ({ data: r.data as Record<string, unknown>[] })),
    university: () => applicationService.getAll(partnerParams).then((r) => ({ data: r.data as Record<string, unknown>[] })),
    'student-invoice': () => invoiceService.getAll(partnerParams).then((r) => ({ data: r.data as Record<string, unknown>[] })),
    'partner-invoice': () => invoiceService.getAllPartnerInvoices(partnerParams).then((r) => ({ data: r.data as Record<string, unknown>[] })),
    'payment-collection': () => invoiceService.getAll(partnerParams).then((r) => ({ data: r.data.filter((i) => i.paidAmount > 0) as Record<string, unknown>[] })),
    task: () => Promise.resolve({ data: [] as Record<string, unknown>[] }),
  } satisfies Record<string, () => Promise<{ data: Record<string, unknown>[] }>>
}

export function ReportDetailPage(props: PortalPageProps = {}) {
  const { prefix, partnerId } = usePortalContext(props)
  const serviceMap = buildServiceMap(partnerId)
  const { slug = '' } = useParams()
  const report = REPORTS.find((r) => r.slug === slug)
  const [branch, setBranch] = useState('')
  const [country, setCountry] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [search, setSearch] = useState('')

  const fetchFn = serviceMap[slug as keyof typeof serviceMap]

  const { data, isLoading } = useQuery({
    queryKey: ['report', slug, branch, country, dateFrom, partnerId],
    queryFn: fetchFn ?? (() => Promise.resolve({ data: [] })),
    enabled: !!fetchFn,
  })

  const filtered = useMemo(() => {
    let items = data?.data ?? []
    if (branch) items = items.filter((i) => i.branch === branch)
    if (country) {
      items = items.filter(
        (i) =>
          i.interestedCountry === country ||
          i.appliedCountry === country ||
          i.intCountry === country,
      )
    }
    if (dateFrom) items = items.filter((i) => String(i.createdAt ?? '') >= dateFrom)
    if (search) {
      const q = search.toLowerCase()
      items = items.filter((i) =>
        Object.values(i).some((v) => String(v ?? '').toLowerCase().includes(q)),
      )
    }
    return items
  }, [data, branch, country, dateFrom, search])

  const columns: ColumnDef<Record<string, unknown>>[] = useMemo(() => {
    if (filtered.length === 0) return [{ accessorKey: 'id', header: 'ID' }]
    const keys = Object.keys(filtered[0]).filter((k) => !['followUp', 'appointment', 'academics'].includes(k)).slice(0, 10)
    return keys.map((key) => ({
      accessorKey: key,
      header: key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
      cell: ({ row }) => {
        const val = row.original[key]
        if (val == null) return '—'
        if (typeof val === 'object') return JSON.stringify(val)
        return String(val)
      },
    }))
  }, [filtered])

  const exportReport = (format: 'csv' | 'pdf') => {
    toast.success(`Exporting ${report?.title ?? slug} as ${format.toUpperCase()}`)
  }

  if (!report) {
    return (
      <PageShell title="Report Not Found" breadcrumbs={[{ label: 'Reports', href: `${prefix}/reports` }]}>
        <p className="text-gray-500">Report not found. <Link to={`${prefix}/reports`} className="text-primary">Back to Reports</Link></p>
      </PageShell>
    )
  }

  return (
    <PageShell
      title={report.title}
      breadcrumbs={[
        { label: 'Reports', href: `${prefix}/reports` },
        { label: report.title },
      ]}
      action={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportReport('csv')}>
            <FileSpreadsheet className="size-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => exportReport('pdf')}>
            <Download className="size-4" />
            Export PDF
          </Button>
        </div>
      }
    >
      <FilterPanel defaultOpen>
        <FilterSelect
          label="Branch"
          value={branch}
          onChange={setBranch}
          options={BRANCHES.map((b) => ({ label: b, value: b }))}
        />
        <FilterSelect
          label="Country"
          value={country}
          onChange={setCountry}
          options={COUNTRIES.map((c) => ({ label: c, value: c }))}
        />
        <FilterInput label="Date From" value={dateFrom} onChange={setDateFrom} type="date" />
        <FilterInput label="Search" value={search} onChange={setSearch} placeholder="Search report..." />
      </FilterPanel>

      <p className="mt-4 text-sm text-gray-500">{report.description} — {filtered.length} records</p>

      {isLoading ? (
        <LoadingSkeleton className="mt-4" />
      ) : (
        <DataTable
          data={filtered}
          columns={columns}
          searchPlaceholder="Filter results..."
          className="mt-4"
          pageSize={15}
        />
      )}
    </PageShell>
  )
}
