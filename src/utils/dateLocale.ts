import { enUS, bn } from 'date-fns/locale'
import type { Locale as DateFnsLocale } from 'date-fns'
import i18n from '@/i18n'

export function getDateLocale(): DateFnsLocale {
  return i18n.language === 'bn' ? bn : enUS
}
