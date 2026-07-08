import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AxiosError } from 'axios'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import PasswordInput from '@/components/password-input'
import { useResetEmployeePassword } from '@/hooks/useUser'
import { useShopStore } from '@/stores/shopStore'
import { resetPasswordFormSchema, type ResetPasswordForm } from '@/schema/userFormSchema'
import type { UserListItem } from '@/interface/userInterface'
import { useTranslation } from '@/hooks/useTranslation'

type UserResetPasswordDialogProps = {
    currentRow: UserListItem
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function UserResetPasswordDialog({
    currentRow,
    open,
    onOpenChange,
}: UserResetPasswordDialogProps) {
    const { t } = useTranslation('users')
    const { t: tValidation } = useTranslation('validation')
    const { t: tToast } = useTranslation('toast')
    const shopId = useShopStore((s) => s.currentShopId)
    const { mutate: resetPassword, isPending } = useResetEmployeePassword()

    const form = useForm<ResetPasswordForm>({
        resolver: zodResolver(resetPasswordFormSchema(tValidation)),
        defaultValues: {
            newPassword: '',
            confirmPassword: '',
        },
    })

    const onSubmit = (values: ResetPasswordForm) => {
        if (!shopId) return

        resetPassword(
            {
                userId: currentRow.id,
                shopId,
                newPassword: values.newPassword,
                confirmPassword: values.confirmPassword,
            },
            {
                onSuccess: () => {
                    form.reset()
                    onOpenChange(false)
                    toast.success(tToast('user.passwordReset'))
                },
                onError: (err: unknown) => {
                    let message = tToast('user.passwordResetFailed')
                    if (err instanceof AxiosError) {
                        message = err.response?.data?.message || message
                    }
                    toast.error(message)
                },
            },
        )
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(state) => {
                form.reset()
                onOpenChange(state)
            }}
        >
            <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                    <DialogTitle>{t('resetPasswordDialog.title')}</DialogTitle>
                    <DialogDescription>
                        {t('resetPasswordDialog.description', { name: currentRow.name })}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        id='reset-password-form'
                        onSubmit={form.handleSubmit(onSubmit)}
                        className='space-y-4'
                    >
                        <FormField
                            control={form.control}
                            name='newPassword'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('resetPasswordDialog.newPassword')}</FormLabel>
                                    <FormControl>
                                        <PasswordInput {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='confirmPassword'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('resetPasswordDialog.confirmPassword')}</FormLabel>
                                    <FormControl>
                                        <PasswordInput {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
                <DialogFooter>
                    <Button type='submit' form='reset-password-form' disabled={isPending}>
                        {isPending ? t('buttons.saving') : t('resetPasswordDialog.submit')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
