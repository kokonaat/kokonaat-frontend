import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { BusinessEntityType } from '@/constance/transactionConstances'
import { useCreateCustomer } from '@/hooks/useCustomer'
import { useCreateVendor } from '@/hooks/useVendor'
import { useTranslation } from '@/hooks/useTranslation'

const QUICK_CREATE_FORM_ID = 'quick-create-entity-form'

const schema = z.object({
    name: z.string().min(1),
    phone: z.string().min(1),
    address: z.string().min(1),
})

type FormValues = z.infer<typeof schema>

interface QuickCreateEntityDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    entityType: BusinessEntityType
    shopId: string
    onCreated: (entity: { id: string; name: string }) => void
}

export const QuickCreateEntityDialog = ({
    open,
    onOpenChange,
    entityType,
    shopId,
    onCreated,
}: QuickCreateEntityDialogProps) => {
    const { t } = useTranslation('transactions')
    const { t: tToast } = useTranslation('toast')
    const isVendor = entityType === BusinessEntityType.VENDOR

    const { mutate: createCustomer, isPending: isCreatingCustomer } = useCreateCustomer(shopId)
    const { mutate: createVendor, isPending: isCreatingVendor } = useCreateVendor(shopId)
    const isPending = isCreatingCustomer || isCreatingVendor

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { name: '', phone: '', address: '' },
    })

    const handleClose = (isOpen: boolean) => {
        if (!isOpen) form.reset()
        onOpenChange(isOpen)
    }

    const handleError = (error: unknown) => {
        if (axios.isAxiosError(error)) {
            toast.error(error.response?.data?.message || error.message)
        } else if (error instanceof Error) {
            toast.error(error.message)
        } else {
            toast.error(tToast('common.somethingWrong'))
        }
    }

    const handleSubmit = (values: FormValues) => {
        const data = { name: values.name, phone: values.phone, address: values.address, isB2B: false }

        if (isVendor) {
            createVendor(data, {
                onSuccess: (result) => {
                    toast.success(tToast('vendor.created'))
                    onCreated({ id: result.id, name: result.name })
                    form.reset()
                    onOpenChange(false)
                },
                onError: handleError,
            })
        } else {
            createCustomer(data, {
                onSuccess: (result) => {
                    toast.success(tToast('customer.created'))
                    onCreated({ id: result.id, name: result.name })
                    form.reset()
                    onOpenChange(false)
                },
                onError: handleError,
            })
        }
    }

    return (
        <Sheet open={open} onOpenChange={handleClose}>
            <SheetContent className='flex flex-col'>
                <SheetHeader className='text-start'>
                    <SheetTitle>
                        {isVendor ? t('quickCreate.vendorTitle') : t('quickCreate.customerTitle')}
                    </SheetTitle>
                    <SheetDescription>
                        {isVendor ? t('quickCreate.vendorDescription') : t('quickCreate.customerDescription')}
                    </SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form
                        id={QUICK_CREATE_FORM_ID}
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className='flex-1 space-y-6 overflow-y-auto px-4'
                    >
                        <FormField
                            control={form.control}
                            name='name'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('quickCreate.name')}</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder={t('quickCreate.namePlaceholder')} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='phone'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('quickCreate.phone')}</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder={t('quickCreate.phonePlaceholder')} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='address'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('quickCreate.address')}</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder={t('quickCreate.addressPlaceholder')} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>

                <SheetFooter className='gap-2'>
                    <Button
                        variant='outline'
                        onClick={() => handleClose(false)}
                    >
                        {t('buttons.close')}
                    </Button>
                    <Button form={QUICK_CREATE_FORM_ID} type='submit' disabled={isPending}>
                        {isPending ? t('buttons.saving') : t('buttons.saveChanges')}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
