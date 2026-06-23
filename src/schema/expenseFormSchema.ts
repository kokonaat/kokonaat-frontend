import type { TFunction } from 'i18next'
import { z } from 'zod'

export const expenseTypesArray = [
  'DAILY_EXPENSE',
  'MONTHLY_SALARY',
  'MONTHLY_RENT',
  'MONTHLY_UTILITIES',
  'MONTHLY_OTHER',
  'OTHER',
] as const

export const createExpenseFormSchema = (t: TFunction) =>
  z.object({
    id: z.string().optional(),
    title: z.string().min(1, t('expenseForm.titleRequired')),
    type: z.enum(expenseTypesArray),
    amount: z.number().min(0.01, t('expenseForm.amountMin')),
    remarks: z.string().min(1, t('expenseForm.remarksRequired')),
    shopId: z.string().min(1, t('expenseForm.shopIdRequired')),
  })

export type ExpenseFormType = z.infer<ReturnType<typeof createExpenseFormSchema>>
