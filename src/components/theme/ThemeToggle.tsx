import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useThemeStore } from '@/stores/themeStore'
import { useTranslation } from '@/lib/i18n'

export function ThemeToggle() {
  const { theme, toggle } = useThemeStore()
  const { t } = useTranslation()

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-gray-600 dark:text-gray-300"
      onClick={toggle}
      aria-label={theme === 'dark' ? t('lightMode') : t('darkMode')}
    >
      {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}
