import type { TFunction } from 'i18next'
import { z } from 'zod'

export const createUserFormSchema = (t: TFunction) =>
    z
        .object({
            username: z.string().min(1, t('userForm.usernameRequired')),
            phoneNumber: z.string().min(1, t('userForm.phoneRequired')),
            password: z.string().transform((pwd) => pwd.trim()),
            role: z.string().min(1, t('userForm.roleRequired')),
            confirmPassword: z.string().transform((pwd) => pwd.trim()),
            isEdit: z.boolean(),
        })
        .refine(
            (data) => {
                if (data.isEdit && !data.password) return true
                return data.password.length > 0
            },
            {
                message: t('userForm.passwordRequired'),
                path: ['password'],
            },
        )
        .refine(
            ({ isEdit, password }) => {
                if (isEdit && !password) return true
                return password.length >= 6
            },
            {
                message: t('userForm.passwordMinLength'),
                path: ['password'],
            },
        )
        .refine(
            ({ isEdit, password, confirmPassword }) => {
                if (isEdit && !password) return true
                return password === confirmPassword
            },
            {
                message: t('userForm.passwordsMismatch'),
                path: ['confirmPassword'],
            },
        )

export type UserForm = z.infer<ReturnType<typeof createUserFormSchema>>
