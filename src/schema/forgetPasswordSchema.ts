import type { TFunction } from 'i18next'
import { z } from 'zod'

export const createForgetPasswordSchema = (t: TFunction) =>
  z.object({
    email: z
      .string()
      .min(1, t('forgetPassword.emailRequired'))
      .email(t('forgetPassword.emailInvalid')),
  })

export type ForgetPasswordFormValues = z.infer<
  ReturnType<typeof createForgetPasswordSchema>
>
