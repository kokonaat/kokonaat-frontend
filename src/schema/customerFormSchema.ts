import type { TFunction } from 'i18next'
import z from 'zod'

export const createCustomerFormSchema = (t: TFunction) =>
  z.object({
    name: z.string().min(1, t('customerForm.nameRequired')),
    phone: z.string().min(1, t('customerForm.phoneRequired')),
    email: z
      .union([z.string().email(), z.string().length(0)])
      .optional()
      .nullable(),
    address: z.string().min(1, t('customerForm.addressRequired')),
    city: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    isB2B: z.boolean().optional(),
    contactPerson: z.string().optional().nullable(),
    contactPersonPhone: z.string().optional().nullable(),
  })

export type CustomerFormValues = z.infer<ReturnType<typeof createCustomerFormSchema>>
