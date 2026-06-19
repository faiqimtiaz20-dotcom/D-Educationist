import { useCallback, useState, useEffect } from 'react'
import { STORAGE_PREFIX } from '@/lib/constants'

export type Locale = 'en' | 'hi'

const messages: Record<Locale, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard',
    enquiry: 'Enquiry',
    student: 'Student',
    application: 'Application',
    visa: 'Visa',
    save: 'Save',
    cancel: 'Cancel',
    search: 'Search',
    logout: 'Logout',
    notifications: 'Notifications',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    enquiry: 'पूछताछ',
    student: 'छात्र',
    application: 'आवेदन',
    visa: 'वीज़ा',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    search: 'खोजें',
    logout: 'लॉग आउट',
    notifications: 'सूचनाएं',
    darkMode: 'डार्क मोड',
    lightMode: 'लाइट मोड',
  },
}

const STORAGE_KEY = `${STORAGE_PREFIX}-locale`
const LOCALE_CHANGE_EVENT = `${STORAGE_PREFIX}-locale-change`

export function getLocale(): Locale {
  return (localStorage.getItem(STORAGE_KEY) as Locale) || 'en'
}

export function setLocale(locale: Locale) {
  localStorage.setItem(STORAGE_KEY, locale)
}

export function t(key: string, locale?: Locale): string {
  const loc = locale ?? getLocale()
  return messages[loc][key] ?? messages.en[key] ?? key
}

export function useTranslation() {
  const [locale, setLoc] = useState<Locale>(getLocale())

  useEffect(() => {
    const handler = () => setLoc(getLocale())
    window.addEventListener(LOCALE_CHANGE_EVENT, handler)
    return () => window.removeEventListener(LOCALE_CHANGE_EVENT, handler)
  }, [])

  const changeLocale = useCallback((l: Locale) => {
    setLocale(l)
    setLoc(l)
    window.dispatchEvent(new Event(LOCALE_CHANGE_EVENT))
  }, [])

  const translate = useCallback((key: string) => t(key, locale), [locale])

  return { locale, changeLocale, t: translate }
}
