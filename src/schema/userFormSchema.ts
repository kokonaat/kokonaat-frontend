import type { TFunction } from 'i18next'
import { z } from 'zod'

export const createUserFormSchema = (t: TFunction) =>
    z
        .object({
            name: z.string().min(1, t('userForm.nameRequired')),
            loginUsername: z.string().optional(),
            phoneNumber: z.string().min(1, t('userForm.phoneRequired')),
            password: z.string().transform((pwd) => pwd.trim()),
            role: z.string().min(1, t('userForm.roleRequired')),
            confirmPassword: z.string().transform((pwd) => pwd.trim()),
            moduleKeys: z.array(z.string()),
            isEdit: z.boolean(),
        })
        .superRefine((data, ctx) => {
            if (!data.isEdit) {
                if (!data.loginUsername || data.loginUsername.trim().length < 2) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t('userForm.loginUsernameRequired'),
                        path: ['loginUsername'],
                    })
                }
                if (!data.password) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t('userForm.passwordRequired'),
                        path: ['password'],
                    })
                } else if (data.password.length < 6) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t('userForm.passwordMinLength'),
                        path: ['password'],
                    })
                }
                if (data.password !== data.confirmPassword) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t('userForm.passwordsMismatch'),
                        path: ['confirmPassword'],
                    })
                }
            }
        })

export type UserForm = z.infer<ReturnType<typeof createUserFormSchema>>

export const resetPasswordFormSchema = (t: TFunction) =>
    z
        .object({
            newPassword: z.string().min(6, t('userForm.passwordMinLength')),
            confirmPassword: z.string().min(6, t('userForm.passwordMinLength')),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
            message: t('userForm.passwordsMismatch'),
            path: ['confirmPassword'],
        })

export type ResetPasswordForm = z.infer<ReturnType<typeof resetPasswordFormSchema>>
