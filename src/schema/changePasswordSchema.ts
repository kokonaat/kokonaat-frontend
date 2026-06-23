import type { TFunction } from 'i18next'
import { z } from 'zod'

export const createChangePasswordSchema = (t: TFunction) =>
  z
    .object({
      oldPassword: z.string().min(6, t('changePassword.oldPasswordMinLength')),
      newPassword: z.string().min(6, t('changePassword.newPasswordMinLength')),
      confirmNewPassword: z
        .string()
        .min(6, t('changePassword.confirmPasswordMinLength')),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: t('changePassword.passwordsMismatch'),
      path: ['confirmNewPassword'],
    })

export type ChangePasswordFormValues = z.infer<
  ReturnType<typeof createChangePasswordSchema>
>
