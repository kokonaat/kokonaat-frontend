import type { UseFormReturn } from 'react-hook-form'
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useTranslation } from '@/hooks/useTranslation'
import type { TransactionFormValues } from '@/schema/transactionFormSchema'
import type { BusinessEntityType } from '@/constance/transactionConstances'

interface PaymentFieldsProps {
    form: UseFormReturn<TransactionFormValues>
    selectedBusinessEntity: BusinessEntityType | null
    transactionType: string
    calculatedPending: number
    total: number
}

export const PaymentFields = ({
    form,
    selectedBusinessEntity,
    transactionType,
    calculatedPending,
    total,
}: PaymentFieldsProps) => {
    const { t } = useTranslation('transactions')
    const showPaymentFields =
        transactionType === 'PURCHASE' || transactionType === 'SALE'

    if (!selectedBusinessEntity || !showPaymentFields) {
        return null
    }

    return (
        <>
            <div className="flex justify-end gap-4">
                <FormItem className='flex-1 max-w-52'>
                    <FormLabel>{t('form.total')}</FormLabel>
                    <FormControl>
                        <Input
                            type='number'
                            value={total}
                            readOnly
                            className='cursor-not-allowed bg-gray-100'
                        />
                    </FormControl>
                </FormItem>

                <FormField
                    control={form.control}
                    name='paid'
                    render={({ field }) => (
                        <FormItem className='flex-1 max-w-52'>
                            <FormLabel>{t('form.paid')}</FormLabel>
                            <FormControl>
                                <Input
                                    type='number'
                                    {...field}
                                    placeholder={t('form.paidPlaceholder')}
                                    min={0}
                                    value={field.value === 0 ? '' : field.value ?? ''}
                                    onChange={(e) => {
                                        const val = e.target.value
                                        field.onChange(val === '' ? '' : parseFloat(val))
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormItem className='flex-1 max-w-52'>
                    <FormLabel>{t('form.pending')}</FormLabel>
                    <FormControl>
                        <Input
                            type='number'
                            value={calculatedPending}
                            readOnly
                            className='cursor-not-allowed bg-gray-100'
                        />
                    </FormControl>
                </FormItem>
            </div>
        </>
    )
}
