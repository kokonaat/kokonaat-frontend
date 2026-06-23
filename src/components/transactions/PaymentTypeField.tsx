import type { UseFormReturn } from 'react-hook-form'
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Combobox } from '@/components/ui/combobox'
import { useTranslation } from '@/hooks/useTranslation'
import { usePaymentTypeOptions } from '@/hooks/useTranslatedOptions'
import type { TransactionFormValues } from '@/schema/transactionFormSchema'

interface PaymentTypeFieldProps {
    form: UseFormReturn<TransactionFormValues>
}

export const PaymentTypeField = ({ form }: PaymentTypeFieldProps) => {
    const { t } = useTranslation('transactions')
    const paymentTypeOptions = usePaymentTypeOptions()

    return (
        <FormField
            control={form.control}
            name='paymentType'
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{t('form.paymentType')}</FormLabel>
                    <FormControl>
                        <Combobox
                            options={paymentTypeOptions}
                            placeholder={t('form.paymentTypePlaceholder')}
                            className='w-full'
                            value={field.value}
                            onSelect={field.onChange}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
