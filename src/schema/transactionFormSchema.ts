import type { TFunction } from 'i18next'
import { z } from 'zod'

const inventoryRequiredTypes = ['PURCHASE', 'SALE']

export const createTransactionFormSchema = (t: TFunction) => {
  const zNumberOrZero = z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === 'string' && val.trim() === '') return 0
      return Number(val)
    })
    .pipe(z.number().min(0, { message: t('transactionForm.valueMinZero') }))

  const zAmountOrNull = z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (val === null || (typeof val === 'string' && val.trim() === '')) return null
      return Number(val)
    })
    .pipe(z.nullable(z.number()))

  return z
    .object({
      partnerType: z.string().min(1, t('transactionForm.partnerTypeRequired')),
      entityTypeId: z.string().min(1, t('transactionForm.entityTypeRequired')),
      transactionType: z.string().min(1, t('transactionForm.transactionTypeRequired')),
      transactionAmount: zAmountOrNull
        .refine((val) => val === null || val > 0, {
          message: t('transactionForm.amountPositive'),
        })
        .nullable()
        .optional(),
      paymentType: z.string().min(1, t('transactionForm.paymentTypeRequired')),
      remarks: z.string().optional(),
      paid: zNumberOrZero,
      inventories: z
        .array(
          z.object({
            inventoryId: z.string().min(1, t('transactionForm.inventoryRequired')),
            quantity: zNumberOrZero.refine((val) => val > 0, {
              message: t('transactionForm.quantityGreaterThanZero'),
            }),
            unitOfMeasurementId: z.string().min(1, t('transactionForm.uomRequired')),
            price: zNumberOrZero.refine((val) => val > 0, {
              message: t('transactionForm.priceGreaterThanZero'),
            }),
          })
        )
        .default([]),
    })
    .refine(
      (data) => {
        if (
          data.transactionType &&
          inventoryRequiredTypes.includes(data.transactionType)
        ) {
          if (data.inventories.length === 0) {
            return false
          }
          return data.inventories.every(
            (item) => item.inventoryId.length > 0 && item.quantity > 0 && item.price > 0
          )
        }
        return true
      },
      {
        path: ['inventories'],
        message: t('transactionForm.inventoryItemRequired'),
      }
    )
    .refine(
      (data) => {
        if (data.transactionType === 'SALE') {
          return data.inventories.every((item) => item.quantity > 0)
        }
        return true
      },
      { path: ['inventories'], message: t('transactionForm.invalidSaleQuantity') }
    )
    .refine(
      (data) => {
        if (
          data.transactionType &&
          !inventoryRequiredTypes.includes(data.transactionType)
        ) {
          return (
            data.transactionAmount !== null &&
            data.transactionAmount !== undefined &&
            data.transactionAmount > 0
          )
        }
        return true
      },
      {
        path: ['transactionAmount'],
        message: t('transactionForm.transactionAmountRequired'),
      }
    )
}

export type TransactionFormValues = z.infer<
  ReturnType<typeof createTransactionFormSchema>
>
