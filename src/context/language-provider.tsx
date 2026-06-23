import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation as useI18nextTranslation } from 'react-i18next'
import { getCookie, setCookie } from '@/lib/cookies'
import {
  DEFAULT_LOCALE,
  LANG_COOKIE_MAX_AGE,
  LANG_COOKIE_NAME,
  type Locale,
  SUPPORTED_LOCALES,
} from '@/i18n'

type LanguageProviderState = {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const initialState: LanguageProviderState = {
  locale: DEFAULT_LOCALE,
  setLocale: () => null,
}

const LanguageContext = createContext<LanguageProviderState>(initialState)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useI18nextTranslation()
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = getCookie(LANG_COOKIE_NAME) as Locale | undefined
    return saved && SUPPORTED_LOCALES.includes(saved) ? saved : DEFAULT_LOCALE
  })

  const setLocale = (nextLocale: Locale) => {
    setCookie(LANG_COOKIE_NAME, nextLocale, LANG_COOKIE_MAX_AGE)
    setLocaleState(nextLocale)
    void i18n.changeLanguage(nextLocale)
  }

  useEffect(() => {
    const root = document.documentElement
    root.lang = locale
    root.classList.toggle('font-bengali', locale === 'bn')
  }, [locale])

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      if (SUPPORTED_LOCALES.includes(lng as Locale)) {
        setLocaleState(lng as Locale)
      }
    }
    i18n.on('languageChanged', handleLanguageChanged)
    return () => {
      i18n.off('languageChanged', handleLanguageChanged)
    }
  }, [i18n])

  const contextValue = useMemo(
    () => ({ locale, setLocale }),
    [locale]
  )

  return (
    <LanguageContext value={contextValue}>{children}</LanguageContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
