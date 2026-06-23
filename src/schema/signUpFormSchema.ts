import type { TFunction } from 'i18next'
import z from 'zod'

export const createSignUpFormSchema = (t: TFunction) =>
  z
    .object({
      name: z.string().min(3, t('signUp.nameMinLength')),
      email: z
        .string()
        .min(1, t('signUp.emailRequired'))
        .email(t('signUp.emailInvalid')),
      phone: z.string().optional(),
      password: z.string().min(6, t('signUp.passwordMinLength')),
      confirmPassword: z.string().min(6, t('signUp.confirmPasswordMinLength')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('signUp.passwordsMismatch'),
      path: ['confirmPassword'],
    })

export type SignUpFormValues = z.infer<ReturnType<typeof createSignUpFormSchema>>
