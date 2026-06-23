import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { getCookie } from '@/lib/cookies'

import enCommon from '@/locales/en/common.json'
import enNav from '@/locales/en/nav.json'
import enAuth from '@/locales/en/auth.json'
import enDashboard from '@/locales/en/dashboard.json'
import enTransactions from '@/locales/en/transactions.json'
import enCustomers from '@/locales/en/customers.json'
import enVendors from '@/locales/en/vendors.json'
import enInventory from '@/locales/en/inventory.json'
import enExpense from '@/locales/en/expense.json'
import enUom from '@/locales/en/uom.json'
import enReports from '@/locales/en/reports.json'
import enUsers from '@/locales/en/users.json'
import enShops from '@/locales/en/shops.json'
import enPlans from '@/locales/en/plans.json'
import enValidation from '@/locales/en/validation.json'
import enToast from '@/locales/en/toast.json'
import enExport from '@/locales/en/export.json'
import enEnums from '@/locales/en/enums.json'

import bnCommon from '@/locales/bn/common.json'
import bnNav from '@/locales/bn/nav.json'
import bnAuth from '@/locales/bn/auth.json'
import bnDashboard from '@/locales/bn/dashboard.json'
import bnTransactions from '@/locales/bn/transactions.json'
import bnCustomers from '@/locales/bn/customers.json'
import bnVendors from '@/locales/bn/vendors.json'
import bnInventory from '@/locales/bn/inventory.json'
import bnExpense from '@/locales/bn/expense.json'
import bnUom from '@/locales/bn/uom.json'
import bnReports from '@/locales/bn/reports.json'
import bnUsers from '@/locales/bn/users.json'
import bnShops from '@/locales/bn/shops.json'
import bnPlans from '@/locales/bn/plans.json'
import bnValidation from '@/locales/bn/validation.json'
import bnToast from '@/locales/bn/toast.json'
import bnExport from '@/locales/bn/export.json'
import bnEnums from '@/locales/bn/enums.json'

export const SUPPORTED_LOCALES = ['en', 'bn'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en'
export const LANG_COOKIE_NAME = 'lang'
export const LANG_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

const resources = {
  en: {
    common: enCommon,
    nav: enNav,
    auth: enAuth,
    dashboard: enDashboard,
    transactions: enTransactions,
    customers: enCustomers,
    vendors: enVendors,
    inventory: enInventory,
    expense: enExpense,
    uom: enUom,
    reports: enReports,
    users: enUsers,
    shops: enShops,
    plans: enPlans,
    validation: enValidation,
    toast: enToast,
    export: enExport,
    enums: enEnums,
  },
  bn: {
    common: bnCommon,
    nav: bnNav,
    auth: bnAuth,
    dashboard: bnDashboard,
    transactions: bnTransactions,
    customers: bnCustomers,
    vendors: bnVendors,
    inventory: bnInventory,
    expense: bnExpense,
    uom: bnUom,
    reports: bnReports,
    users: bnUsers,
    shops: bnShops,
    plans: bnPlans,
    validation: bnValidation,
    toast: bnToast,
    export: bnExport,
    enums: bnEnums,
  },
}

const savedLocale = getCookie(LANG_COOKIE_NAME) as Locale | undefined

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLocale ?? DEFAULT_LOCALE,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: [...SUPPORTED_LOCALES],
    defaultNS: 'common',
    ns: [
      'common',
      'nav',
      'auth',
      'dashboard',
      'transactions',
      'customers',
      'vendors',
      'inventory',
      'expense',
      'uom',
      'reports',
      'users',
      'shops',
      'plans',
      'validation',
      'toast',
      'export',
      'enums',
    ],
    returnEmptyString: false,
    interpolation: { escapeValue: false },
    detection: {
      order: ['cookie', 'localStorage', 'navigator'],
      lookupCookie: LANG_COOKIE_NAME,
      caches: ['cookie'],
    },
  })

export default i18n
