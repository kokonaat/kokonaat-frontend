import type { TFunction } from 'i18next'
import z from 'zod'

export const createVendorFormSchema = (t: TFunction) =>
  z.object({
    name: z.string().min(1, t('vendorForm.nameRequired')),
    phone: z.string().min(1, t('vendorForm.phoneRequired')),
    email: z
      .union([z.string().email(), z.string().length(0)])
      .optional()
      .nullable(),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    isB2B: z.boolean().optional(),
    contactPerson: z.string().optional().nullable(),
    contactPersonPhone: z.string().optional().nullable(),
  })

export type VendorFormValues = z.infer<ReturnType<typeof createVendorFormSchema>>
