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

interface AmountFieldProps {
    form: UseFormReturn<TransactionFormValues>
}

export const AmountField = ({ form }: AmountFieldProps) => {
    const { t } = useTranslation('transactions')

    return (
        <div className='flex justify-end'>
            <FormField
                control={form.control}
                name='transactionAmount'
                render={({ field }) => (
                    <FormItem className='max-w-52'>
                        <FormLabel>{t('form.amount')}</FormLabel>
                        <FormControl>
                            <Input
                                type='number'
                                {...field}
                                placeholder={t('form.amountPlaceholder')}
                                min={0}
                                value={field.value ?? ''}
                                onChange={(e) =>
                                    field.onChange(
                                        e.target.value ? Number(e.target.value) : null
                                    )
                                }
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    )
}
