import type { TFunction } from 'i18next'
import { z } from 'zod'

export const createInventoryFormSchema = (t: TFunction) =>
  z.object({
    name: z.string().min(1, t('inventoryForm.nameRequired')),
    description: z
      .string()
      .min(1, { message: t('inventoryForm.descriptionRequired') }),
    quantity: z.number().min(0, t('inventoryForm.quantityMin')),
    lastPrice: z.number().min(0, t('inventoryForm.lastPriceMin')),
    unitOfMeasurementId: z.string().min(1, t('inventoryForm.uomRequired')),
  })

export type InventoryFormValues = z.infer<ReturnType<typeof createInventoryFormSchema>>
