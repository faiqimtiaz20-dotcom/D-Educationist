import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

interface GlobalSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function GlobalSearch({
  value,
  onChange,
  placeholder = 'Search...',
  className,
}: GlobalSearchProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  )
}
