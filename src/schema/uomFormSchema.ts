import type { TFunction } from 'i18next'
import { z } from 'zod'

export const createUomFormSchema = (t: TFunction) =>
  z.object({
    name: z.string().min(1, t('uomForm.nameRequired')),
    description: z.string().optional(),
  })

export type UomFormValues = z.infer<ReturnType<typeof createUomFormSchema>>
