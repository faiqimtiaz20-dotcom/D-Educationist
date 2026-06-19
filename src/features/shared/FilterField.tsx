import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface FilterFieldProps {
  label: string
  className?: string
  children: React.ReactNode
}

export function FilterField({ label, className, children }: FilterFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label className="text-xs text-gray-500">{label}</Label>
      {children}
    </div>
  )
}

interface FilterSelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: { label: string; value: string }[]
  placeholder?: string
  className?: string
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'All',
  className,
}: FilterSelectProps) {
  return (
    <FilterField label={label} className={className}>
      <Select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
    </FilterField>
  )
}

interface FilterInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  className?: string
}

export function FilterInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  className,
}: FilterInputProps) {
  return (
    <FilterField label={label} className={className}>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </FilterField>
  )
}
