import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Input } from '@/components/ui/input'
import PasswordInput from '@/components/password-input'
import { toast } from 'sonner'
import { AxiosError } from 'axios'
import { SelectDropdown } from '@/components/select-dropdown'
import { useCreateUser, useUserRoles } from '@/hooks/useUser'
import { useShopStore } from '@/stores/shopStore'
import { createUserFormSchema, type UserForm } from '@/schema/userFormSchema'
import type { UserListItem } from '@/interface/userInterface'
import { useTranslation } from '@/hooks/useTranslation'

type UserActionDialogProps = {
    currentRow?: UserListItem
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function UsersActionDialog({
    currentRow,
    open,
    onOpenChange,
}: UserActionDialogProps) {
    const { t } = useTranslation('users')
    const { t: tValidation } = useTranslation('validation')
    const { t: tToast } = useTranslation('toast')
    const isEdit = !!currentRow
    const shopId = useShopStore((s) => s.currentShopId)
    const { data: roles, isLoading: isRolesLoading } = useUserRoles()
    const { mutate: createUser, isPending } = useCreateUser()

    const schema = useMemo(() => createUserFormSchema(tValidation), [tValidation])

    const form = useForm<UserForm>({
        resolver: zodResolver(schema),
        defaultValues: isEdit
            ? {
                ...currentRow,
                password: '',
                confirmPassword: '',
                isEdit,
            }
            : {
                username: '',
                role: '',
                phoneNumber: '',
                password: '',
                confirmPassword: '',
                isEdit,
            },
    })

    const onSubmit = (values: UserForm) => {
        if (!shopId) return
        const payload = {
            name: values.username,
            phone: values.phoneNumber,
            password: values.password,
            shopId,
            roleId: values.role,
        }

        createUser(payload, {
            onSuccess: () => {
                form.reset()
                onOpenChange(false)
                toast.success(tToast('user.created'))
            },
            onError: (err: unknown) => {
                let message = tToast('user.createFailed')

                if (err instanceof AxiosError) {
                    message = err.response?.data?.message || message
                } else if (err instanceof Error) {
                    message = err.message
                }

                toast.error(message)
            },
        })
    }

    const isPasswordTouched = !!form.formState.dirtyFields.password

    return (
        <Dialog
            open={open}
            onOpenChange={(state) => {
                form.reset()
                onOpenChange(state)
            }}
        >
            <DialogContent className='sm:max-w-lg'>
                <DialogHeader className='text-start'>
                    <DialogTitle>{isEdit ? t('addEditDialog.titleEdit') : t('addEditDialog.titleAdd')}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? t('addEditDialog.descriptionEdit') : t('addEditDialog.descriptionAdd')}
                    </DialogDescription>
                </DialogHeader>
                <div className='h-105 w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
                    <Form {...form}>
                        <form
                            id='user-form'
                            onSubmit={form.handleSubmit(onSubmit)}
                            className='space-y-4 px-0.5'
                        >
                            <FormField
                                control={form.control}
                                name='username'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                        <FormLabel className='col-span-2 text-end'>
                                            {t('addEditDialog.username')}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={t('addEditDialog.placeholders.username')}
                                                className='col-span-4'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='phoneNumber'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                        <FormLabel className='col-span-2 text-end'>
                                            {t('addEditDialog.phoneNumber')}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={t('addEditDialog.placeholders.phone')}
                                                className='col-span-4'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='role'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                        <FormLabel className='col-span-2 text-end'>{t('addEditDialog.role')}</FormLabel>
                                        <FormControl>
                                            {isRolesLoading ? (
                                                <p className="col-span-4 text-sm text-muted-foreground">
                                                    {t('addEditDialog.loadingRoles')}
                                                </p>
                                            ) : (
                                                <SelectDropdown
                                                    defaultValue={field.value}
                                                    onValueChange={field.onChange}
                                                    placeholder={t('addEditDialog.rolePlaceholder')}
                                                    className="col-span-4"
                                                    items={
                                                        roles?.map((r: { name: string; id: string }) => ({
                                                            label: r.name,
                                                            value: r.id,
                                                        })) ?? []
                                                    }
                                                />
                                            )}
                                        </FormControl>
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='password'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                        <FormLabel className='col-span-2 text-end'>
                                            {t('addEditDialog.password')}
                                        </FormLabel>
                                        <FormControl>
                                            <PasswordInput
                                                placeholder={t('addEditDialog.placeholders.password')}
                                                className='col-span-4'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='confirmPassword'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                        <FormLabel className='col-span-2 text-end'>
                                            {t('addEditDialog.confirmPassword')}
                                        </FormLabel>
                                        <FormControl>
                                            <PasswordInput
                                                disabled={!isPasswordTouched}
                                                placeholder={t('addEditDialog.placeholders.password')}
                                                className='col-span-4'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </div>
                <DialogFooter>
                    <Button type="submit" form="user-form" disabled={isPending}>
                        {isPending ? t('buttons.saving') : t('buttons.saveChanges')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
