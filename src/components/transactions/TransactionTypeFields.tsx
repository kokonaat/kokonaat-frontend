import type { UseFormReturn } from 'react-hook-form'
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Combobox } from '@/components/ui/combobox'
import type { BusinessEntityType } from '@/utils/enums/trasaction.enum'
import {
    CUSTOMER_TRANSACTION_TYPES,
    PAYMENT_TYPES,
    VENDOR_TRANSACTION_TYPES,
} from '@/constance/transactionContances'
import type { TransactionFormValues } from '@/schema/transactionFormSchema'
import { getTransactionTypeOptions } from './utils/transactionHelpers'

interface TransactionTypeFieldsProps {
    form: UseFormReturn<TransactionFormValues>
    selectedBusinessEntity: BusinessEntityType | null
    transactionType: string
}

export const TransactionTypeFields = ({
    form,
    selectedBusinessEntity,
    transactionType,
}: TransactionTypeFieldsProps) => {
    return (
        <div className='flex items-end gap-4'>
            {selectedBusinessEntity && (
                <FormField
                    control={form.control}
                    name='transactionType'
                    render={({ field }) => (
                        <FormItem className='flex-1'>
                            <FormLabel>Transaction Type</FormLabel>
                            <FormControl>
                                <Combobox
                                    options={getTransactionTypeOptions(
                                        selectedBusinessEntity,
                                        VENDOR_TRANSACTION_TYPES,
                                        CUSTOMER_TRANSACTION_TYPES
                                    )}
                                    className='w-full'
                                    value={field.value}
                                    onSelect={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            {selectedBusinessEntity && transactionType && (
                <FormField
                    control={form.control}
                    name='paymentType'
                    render={({ field }) => (
                        <FormItem className='flex-1'>
                            <FormLabel>Payment Type</FormLabel>
                            <FormControl>
                                <Combobox
                                    options={PAYMENT_TYPES}
                                    placeholder='Select payment type...'
                                    className='w-full'
                                    value={field.value}
                                    onSelect={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}
        </div>
    )
}