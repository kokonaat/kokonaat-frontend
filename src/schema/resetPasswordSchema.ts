import type { TFunction } from 'i18next'
import { z } from 'zod'

export const createResetPasswordSchema = (t: TFunction) =>
  z
    .object({
      token: z.string().min(1, t('resetPassword.tokenRequired')),
      newPassword: z.string().min(6, t('resetPassword.newPasswordMinLength')),
      confirmPassword: z.string().min(6, t('resetPassword.confirmPasswordMinLength')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('resetPassword.passwordsMismatch'),
      path: ['confirmPassword'],
    })

export type ResetPasswordFormValues = z.infer<
  ReturnType<typeof createResetPasswordSchema>
>
