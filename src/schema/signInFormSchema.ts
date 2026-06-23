import type { TFunction } from 'i18next'
import z from 'zod'

export const createSignInFormSchema = (t: TFunction) =>
  z.object({
    email: z
      .string()
      .min(1, t('signIn.emailRequired'))
      .email(t('signIn.emailInvalid')),
    password: z
      .string()
      .min(1, t('signIn.passwordRequired'))
      .min(6, t('signIn.passwordMinLength')),
  })

export type SignInFormValues = z.infer<ReturnType<typeof createSignInFormSchema>>
