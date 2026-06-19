import { Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface FilterPanelProps {
  title?: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

export function FilterPanel({
  title = 'Filters',
  children,
  defaultOpen = false,
  className,
}: FilterPanelProps) {
  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white', className)}>
      <Accordion
        type="single"
        collapsible
        defaultValue={defaultOpen ? 'filters' : undefined}
      >
        <AccordionItem value="filters" className="border-0">
          <AccordionTrigger className="px-4 hover:no-underline laptop:px-3 laptop:py-2 laptop:text-sm">
            <span className="flex items-center gap-2">
              <Filter className="size-4 text-primary" />
              {title}
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 laptop:px-3 laptop:pb-3">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 laptop:gap-3">
              {children}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
