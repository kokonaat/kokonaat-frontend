import { useMemo } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import type { ComboboxOptionInterface } from '@/interface/transactionInterface'

export function useTransactionTypeOptions(): ComboboxOptionInterface[] {
  const { t } = useTranslation('enums')
  return useMemo(
    () =>
      ['SALE', 'PURCHASE', 'PAYMENT', 'RECEIVABLE', 'COMMISSION'].map(
        (value) => ({
          value,
          label: t(`transactionType.${value}`),
        })
      ),
    [t]
  )
}

export function usePaymentTypeOptions(): ComboboxOptionInterface[] {
  const { t } = useTranslation('enums')
  return useMemo(
    () =>
      [
        'CASH',
        'BANK_TRANSFER',
        'MOBILE_PAYMENT',
        'CREDIT_CARD',
        'DEBIT_CARD',
      ].map((value) => ({
        value,
        label: t(`paymentType.${value}`),
      })),
    [t]
  )
}

export function useExpenseTypeOptions(): ComboboxOptionInterface[] {
  const { t } = useTranslation('enums')
  return useMemo(
    () =>
      [
        'DAILY_EXPENSE',
        'MONTHLY_SALARY',
        'MONTHLY_RENT',
        'MONTHLY_UTILITIES',
        'MONTHLY_OTHER',
        'OTHER',
      ].map((value) => ({
        value,
        label: t(`expenseType.${value}`),
      })),
    [t]
  )
}

export function useReportTypeOptions(): { value: string; label: string }[] {
  const { t } = useTranslation('enums')
  return useMemo(
    () =>
      [
        'CUSTOMER_LEDGER',
        'VENDOR_LEDGER',
        'TRANSACTION_REPORT',
        'STOCK_REPORT',
        'STOCK_TRACK_REPORT',
        'EXPENSE_REPORT',
        'BALANCE_SHEET',
      ].map((value) => ({
        value,
        label: t(`reportType.${value}`),
      })),
    [t]
  )
}

export function usePartnerTypeOptions(): ComboboxOptionInterface[] {
  const { t } = useTranslation('enums')
  return useMemo(
    () =>
      ['VENDOR', 'CUSTOMER'].map((value) => ({
        value,
        label: t(`partnerType.${value}`),
      })),
    [t]
  )
}
