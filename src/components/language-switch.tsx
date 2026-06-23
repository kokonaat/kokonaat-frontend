import { Check, Languages } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/language-provider'
import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Locale } from '@/i18n'

const LOCALE_OPTIONS: { value: Locale; labelKey: string }[] = [
  { value: 'en', labelKey: 'language.english' },
  { value: 'bn', labelKey: 'language.bengali' },
]

export function LanguageSwitch() {
  const { locale, setLocale } = useLanguage()
  const { t } = useTranslation('common')

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='scale-95 rounded-full'>
          <Languages className='size-[1.2rem]' />
          <span className='sr-only'>{t('language.toggle')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {LOCALE_OPTIONS.map(({ value, labelKey }) => (
          <DropdownMenuItem key={value} onClick={() => setLocale(value)}>
            {t(labelKey)}
            <Check
              size={14}
              className={cn('ms-auto', locale !== value && 'hidden')}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
