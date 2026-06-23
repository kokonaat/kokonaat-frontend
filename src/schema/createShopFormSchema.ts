import type { TFunction } from 'i18next'
import z from 'zod'

export const createShopFormSchema = (t: TFunction) =>
    z.object({
        name: z
            .string()
            .min(1, t('createShopForm.shopNameRequired'))
            .max(50, t('createShopForm.shopNameMaxLength')),
        address: z
            .string()
            .min(1, t('createShopForm.addressRequired'))
            .optional()
            .or(z.literal('')),
    })

export type CreateShopFormValues = z.infer<ReturnType<typeof createShopFormSchema>>
