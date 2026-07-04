import { useEffect, useMemo } from 'react'
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
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import PasswordInput from '@/components/password-input'
import { toast } from 'sonner'
import { AxiosError } from 'axios'
import { SelectDropdown } from '@/components/select-dropdown'
import {
    useAssignableRoles,
    useCreateUser,
    useEmployeePermissions,
    useUpdateEmployee,
} from '@/hooks/useUser'
import { useShopStore } from '@/stores/shopStore'
import { createUserFormSchema, type UserForm } from '@/schema/userFormSchema'
import type { UserListItem } from '@/interface/userInterface'
import { useTranslation } from '@/hooks/useTranslation'
import {
    ASSIGNABLE_MODULE_KEYS,
    buildEmployeeEmailPreview,
    DEFAULT_MODULES_BY_ROLE,
    type ModuleKey,
} from '@/lib/module-permissions'

type UserActionDialogProps = {
    currentRow?: UserListItem
    open: boolean
    onOpenChange: (open: boolean) => void
}

function getRoleLabel(name: string, t: (key: string) => string) {
    const key = `roles.${name}`
    const translated = t(key)
    return translated === key ? name.replace(/_/g, ' ') : translated
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
    const shopSlug = useShopStore((s) => s.currentShopSlug)
    const { data: roles, isLoading: isRolesLoading, isError: isRolesError } = useAssignableRoles(open)
    const { mutate: createUser, isPending: isCreating } = useCreateUser()
    const { mutate: updateEmployee, isPending: isUpdating } = useUpdateEmployee()
    const { data: employeePermissions } = useEmployeePermissions(
        currentRow?.id,
        shopId ?? undefined,
    )

    const schema = useMemo(() => createUserFormSchema(tValidation), [tValidation])

    const form = useForm<UserForm>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            loginUsername: '',
            phoneNumber: '',
            password: '',
            confirmPassword: '',
            role: '',
            moduleKeys: [],
            isEdit,
        },
    })

    useEffect(() => {
        if (!open) return

        if (isEdit && currentRow) {
            form.reset({
                name: currentRow.name,
                loginUsername: currentRow.email?.split('@')[0] ?? '',
                phoneNumber: currentRow.phone,
                password: '',
                confirmPassword: '',
                role: employeePermissions?.roleId ?? currentRow.shopWiseUserRoles[0]?.role?.id ?? '',
                moduleKeys: employeePermissions?.moduleKeys ?? [],
                isEdit: true,
            })
            return
        }

        form.reset({
            name: '',
            loginUsername: '',
            phoneNumber: '',
            password: '',
            confirmPassword: '',
            role: '',
            moduleKeys: [],
            isEdit: false,
        })
    }, [open, isEdit, currentRow, employeePermissions, form])

    const selectedRoleId = form.watch('role')
    const loginUsername = form.watch('loginUsername')
    const emailPreview = buildEmployeeEmailPreview(loginUsername ?? '', shopSlug)

    useEffect(() => {
        if (isEdit || !selectedRoleId || !roles) return
        const role = roles.find((r: { id: string }) => r.id === selectedRoleId)
        if (!role) return
        const defaults = DEFAULT_MODULES_BY_ROLE[role.name] ?? []
        form.setValue('moduleKeys', defaults)
    }, [selectedRoleId, roles, isEdit, form])

    const onSubmit = (values: UserForm) => {
        if (!shopId) return

        if (isEdit && currentRow) {
            updateEmployee(
                {
                    userId: currentRow.id,
                    shopId,
                    name: values.name,
                    phone: values.phoneNumber,
                    roleId: values.role,
                    moduleKeys: values.moduleKeys,
                },
                {
                    onSuccess: () => {
                        form.reset()
                        onOpenChange(false)
                        toast.success(tToast('user.updated'))
                    },
                    onError: (err: unknown) => {
                        toast.error(getErrorMessage(err, tToast('user.updateFailed')))
                    },
                },
            )
            return
        }

        createUser(
            {
                name: values.name,
                username: values.loginUsername ?? '',
                phone: values.phoneNumber,
                password: values.password,
                shopId,
                roleId: values.role,
                moduleKeys: values.moduleKeys,
            },
            {
                onSuccess: () => {
                    form.reset()
                    onOpenChange(false)
                    toast.success(tToast('user.created'))
                },
                onError: (err: unknown) => {
                    toast.error(getErrorMessage(err, tToast('user.createFailed')))
                },
            },
        )
    }

    const toggleModule = (key: ModuleKey, checked: boolean) => {
        const current = form.getValues('moduleKeys')
        form.setValue(
            'moduleKeys',
            checked ? [...new Set([...current, key])] : current.filter((k) => k !== key),
        )
    }

    const isPending = isCreating || isUpdating

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
                    <DialogTitle>
                        {isEdit ? t('addEditDialog.titleEdit') : t('addEditDialog.titleAdd')}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? t('addEditDialog.descriptionEdit')
                            : t('addEditDialog.descriptionAdd')}
                    </DialogDescription>
                </DialogHeader>
                <div className='max-h-[28rem] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
                    <Form {...form}>
                        <form
                            id='user-form'
                            onSubmit={form.handleSubmit(onSubmit)}
                            className='space-y-4 px-0.5'
                        >
                            <FormField
                                control={form.control}
                                name='name'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('addEditDialog.displayName')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={t('addEditDialog.placeholders.displayName')}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {!isEdit && (
                                <FormField
                                    control={form.control}
                                    name='loginUsername'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('addEditDialog.loginUsername')}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={t('addEditDialog.placeholders.username')}
                                                    {...field}
                                                />
                                            </FormControl>
                                            {emailPreview ? (
                                                <FormDescription>
                                                    {t('addEditDialog.emailPreview', { email: emailPreview })}
                                                </FormDescription>
                                            ) : null}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {isEdit && currentRow?.email && (
                                <div className='space-y-1'>
                                    <p className='text-sm font-medium'>{t('addEditDialog.loginEmail')}</p>
                                    <p className='text-muted-foreground text-sm'>{currentRow.email}</p>
                                </div>
                            )}

                            <FormField
                                control={form.control}
                                name='phoneNumber'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('addEditDialog.phoneNumber')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={t('addEditDialog.placeholders.phone')}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name='role'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('addEditDialog.role')}</FormLabel>
                                        <FormControl>
                                                <SelectDropdown
                                                    key={roles?.map((r: { id: string }) => r.id).join('-') ?? 'loading'}
                                                    isControlled
                                                    defaultValue={field.value || undefined}
                                                    onValueChange={field.onChange}
                                                    placeholder={t('addEditDialog.rolePlaceholder')}
                                                    isPending={isRolesLoading}
                                                    items={
                                                        roles?.map((r: { name: string; id: string }) => ({
                                                            label: getRoleLabel(r.name, t),
                                                            value: r.id,
                                                        })) ?? []
                                                    }
                                                />
                                        </FormControl>
                                        <FormMessage />
                                        {isRolesError && (
                                            <p className='text-destructive text-sm'>
                                                {t('addEditDialog.rolesLoadFailed')}
                                            </p>
                                        )}
                                        {!isRolesLoading && !isRolesError && roles?.length === 0 && (
                                            <p className='text-muted-foreground text-sm'>
                                                {t('addEditDialog.noRolesAvailable')}
                                            </p>
                                        )}
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name='moduleKeys'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('addEditDialog.modules')}</FormLabel>
                                        <div className='grid grid-cols-2 gap-2'>
                                            {ASSIGNABLE_MODULE_KEYS.map((key) => (
                                                <label
                                                    key={key}
                                                    className='flex items-center gap-2 text-sm'
                                                >
                                                    <Checkbox
                                                        checked={field.value.includes(key)}
                                                        onCheckedChange={(checked) =>
                                                            toggleModule(key, !!checked)
                                                        }
                                                    />
                                                    {t(`modules.${key}`)}
                                                </label>
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {!isEdit && (
                                <>
                                    <FormField
                                        control={form.control}
                                        name='password'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('addEditDialog.password')}</FormLabel>
                                                <FormControl>
                                                    <PasswordInput
                                                        placeholder={t('addEditDialog.placeholders.password')}
                                                        {...field}
                                                    />
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
                                                <FormLabel>{t('addEditDialog.confirmPassword')}</FormLabel>
                                                <FormControl>
                                                    <PasswordInput
                                                        placeholder={t('addEditDialog.placeholders.password')}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}
                        </form>
                    </Form>
                </div>
                <DialogFooter>
                    <Button type='submit' form='user-form' disabled={isPending}>
                        {isPending ? t('buttons.saving') : t('buttons.saveChanges')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function getErrorMessage(err: unknown, fallback: string) {
    if (err instanceof AxiosError) {
        return err.response?.data?.message || fallback
    }
    if (err instanceof Error) {
        return err.message
    }
    return fallback
}
