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
import { useTransactionTypeOptions } from '@/hooks/useTranslatedOptions'
import type { TransactionFormValues } from '@/schema/transactionFormSchema'

interface TransactionTypeFieldProps {
    form: UseFormReturn<TransactionFormValues>
    onTransactionTypeChange: (value: string) => void
}

export const TransactionTypeField = ({
    form,
    onTransactionTypeChange,
}: TransactionTypeFieldProps) => {
    const { t } = useTranslation('transactions')
    const transactionTypeOptions = useTransactionTypeOptions()

    return (
        <FormField
            control={form.control}
            name='transactionType'
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{t('form.transactionType')}</FormLabel>
                    <FormControl>
                        <Combobox
                            options={transactionTypeOptions}
                            placeholder={t('form.transactionTypePlaceholder')}
                            className='w-full'
                            value={field.value}
                            onSelect={(val) => {
                                field.onChange(val)
                                onTransactionTypeChange(val)
                            }}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
