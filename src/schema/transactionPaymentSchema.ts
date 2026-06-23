import type { TFunction } from 'i18next'
import { z } from 'zod'

export const createTransactionPaymentSchema = (t: TFunction) =>
  z.object({
    amount: z
      .number({ message: t('transactionPayment.amountRequired') })
      .positive(t('transactionPayment.amountPositive')),
    paymentType: z.string().min(1, t('transactionPayment.paymentTypeRequired')),
    remarks: z.string().optional(),
  })

export type TransactionPaymentFormValues = z.infer<
  ReturnType<typeof createTransactionPaymentSchema>
>
