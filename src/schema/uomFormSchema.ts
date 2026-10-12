import type { TFunction } from 'i18next'
import { z } from 'zod'

export const createUomFormSchema = (t: TFunction) =>
  z.object({
    name: z.string().min(1, t('uomForm.nameRequired')),
    description: z.string().optional(),
    baseQuantity: z.number().min(1).optional().nullable(),
    baseUomId: z.string().optional().nullable(),
  }).refine(
    (data) => {
      if (data.baseQuantity != null && !data.baseUomId) return false
      if (data.baseUomId && data.baseQuantity == null) return false
      return true
    },
    { message: t('uomForm.conversionBothRequired'), path: ['baseUomId'] },
  )

export type UomFormValues = z.infer<ReturnType<typeof createUomFormSchema>>
