import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { cn } from '@/lib/utils'

const COUNTRY_CODES = [
  { code: '+92', label: 'PK (+92)' },
  { code: '+91', label: 'IN (+91)' },
  { code: '+1', label: 'US (+1)' },
  { code: '+44', label: 'UK (+44)' },
  { code: '+61', label: 'AU (+61)' },
  { code: '+1', label: 'CA (+1)' },
  { code: '+971', label: 'AE (+971)' },
  { code: '+65', label: 'SG (+65)' },
  { code: '+49', label: 'DE (+49)' },
]

interface PhoneInputProps {
  countryCode: string
  number: string
  onCountryCodeChange: (code: string) => void
  onNumberChange: (number: string) => void
  label?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export function PhoneInput({
  countryCode,
  number,
  onCountryCodeChange,
  onNumberChange,
  label = 'Mobile',
  required,
  disabled,
  className,
}: PhoneInputProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label>
        {label}
        {required && <span className="text-danger"> *</span>}
      </Label>
      <div className="flex gap-2">
        <Select
          value={countryCode}
          onChange={(e) => onCountryCodeChange(e.target.value)}
          disabled={disabled}
          className="w-32 shrink-0"
        >
          {COUNTRY_CODES.map((item) => (
            <option key={`${item.code}-${item.label}`} value={item.code}>
              {item.label}
            </option>
          ))}
        </Select>
        <Input
          type="tel"
          value={number}
          onChange={(e) => onNumberChange(e.target.value.replace(/[^\d]/g, ''))}
          placeholder="Enter mobile number"
          disabled={disabled}
          required={required}
          className="flex-1"
        />
      </div>
    </div>
  )
}
