import { FileText } from 'lucide-react'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { BRAND } from '@/lib/constants'
import type { Invoice } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'

interface InvoicePdfPreviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: Invoice | null
}

export function InvoicePdfPreview({ open, onOpenChange, invoice }: InvoicePdfPreviewProps) {
  if (!invoice) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-5 text-white/90" />
            Invoice Preview — {invoice.invoiceId}
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-inner">
            <div className="border-b border-gray-200 pb-4 text-center">
              <img src={BRAND.logo} alt={BRAND.name} className="mx-auto mb-2 h-12 object-contain" />
              <p className="text-lg font-bold text-primary">{BRAND.name}</p>
              <p className="text-xs text-gray-500">{BRAND.tagline}</p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Bill To</p>
                <p className="font-medium">{invoice.name}</p>
                <p className="text-gray-600">{invoice.email}</p>
                <p className="text-gray-600">{invoice.mobile}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500">Invoice #</p>
                <p className="font-medium">{invoice.invoiceId}</p>
                <p className="mt-2 text-gray-500">Due Date</p>
                <p>{format(new Date(invoice.dueDate), 'dd MMM yyyy')}</p>
              </div>
            </div>

            <table className="mt-6 w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="pb-2">Service</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-2">{invoice.serviceType}</td>
                  <td className="py-2 text-right">{formatCurrency(invoice.totalAmount, invoice.currency)}</td>
                </tr>
                {invoice.discount > 0 && (
                  <tr className="border-b border-gray-100 text-gray-600">
                    <td className="py-2">Discount</td>
                    <td className="py-2 text-right">-{formatCurrency(invoice.discount, invoice.currency)}</td>
                  </tr>
                )}
                <tr className="border-b border-gray-100 text-gray-600">
                  <td className="py-2">Tax ({invoice.taxPercent}%)</td>
                  <td className="py-2 text-right">{formatCurrency(invoice.taxAmount, invoice.currency)}</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between font-bold">
                <span>Grand Total</span>
                <span>{formatCurrency(invoice.grandTotal, invoice.currency)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Paid</span>
                <span>{formatCurrency(invoice.paidAmount, invoice.currency)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Pending</span>
                <span>{formatCurrency(invoice.pendingAmount, invoice.currency)}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
              <StatusBadge status={invoice.status} />
              <p className="text-xs text-gray-500">Created by {invoice.createdBy}</p>
            </div>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
