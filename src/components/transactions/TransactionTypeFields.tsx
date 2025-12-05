// import type { UseFormReturn } from 'react-hook-form'
// import {
//     FormControl,
//     FormField,
//     FormItem,
//     FormLabel,
//     FormMessage,
// } from '@/components/ui/form'
// import { Combobox } from '@/components/ui/combobox'
// import type { BusinessEntityType } from '@/utils/enums/trasaction.enum'
// import {
//     CUSTOMER_TRANSACTION_TYPES,
//     PAYMENT_TYPES,
//     VENDOR_TRANSACTION_TYPES,
// } from '@/constance/transactionContances'
// import type { TransactionFormValues } from '@/schema/transactionFormSchema'
// import { getTransactionTypeOptions } from './utils/transactionHelpers'

// interface TransactionTypeFieldsProps {
//     form: UseFormReturn<TransactionFormValues>
//     selectedBusinessEntity: BusinessEntityType | null
//     transactionType: string
// }

// export const TransactionTypeFields = ({
//     form,
//     selectedBusinessEntity,
//     transactionType,
// }: TransactionTypeFieldsProps) => {

//     // watch entityTypeId to know when Vendor/Customer is selected
//     const entityTypeId = form.watch('entityTypeId')

//     return (
//         <div className='flex items-end gap-4'>
//             {selectedBusinessEntity && entityTypeId && (
//                 <FormField
//                     control={form.control}
//                     name='transactionType'
//                     render={({ field }) => (
//                         <FormItem className='flex-1'>
//                             <FormLabel>Transaction Type</FormLabel>
//                             <FormControl>
//                                 <Combobox
//                                     options={getTransactionTypeOptions(
//                                         selectedBusinessEntity,
//                                         VENDOR_TRANSACTION_TYPES,
//                                         CUSTOMER_TRANSACTION_TYPES
//                                     )}
//                                     className='w-full'
//                                     value={field.value}
//                                     onSelect={field.onChange}
//                                 />
//                             </FormControl>
//                             <FormMessage />
//                         </FormItem>
//                     )}
//                 />
//             )}

//             {selectedBusinessEntity && entityTypeId && transactionType && (
//                 <FormField
//                     control={form.control}
//                     name='paymentType'
//                     render={({ field }) => (
//                         <FormItem className='flex-1'>
//                             <FormLabel>Payment Type</FormLabel>
//                             <FormControl>
//                                 <Combobox
//                                     options={PAYMENT_TYPES}
//                                     placeholder='Select payment type...'
//                                     className='w-full'
//                                     value={field.value}
//                                     onSelect={field.onChange}
//                                 />
//                             </FormControl>
//                             <FormMessage />
//                         </FormItem>
//                     )}
//                 />
//             )}
//         </div>
//     )
// }



import type { UseFormReturn } from 'react-hook-form'
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Combobox } from '@/components/ui/combobox'
import type { TransactionFormValues } from '@/schema/transactionFormSchema'
import { TRANSACTION_TYPES } from '@/constance/transactionContances'

interface TransactionTypeFieldProps {
    form: UseFormReturn<TransactionFormValues>
    onTransactionTypeChange: (value: string) => void
}

export const TransactionTypeField = ({
    form,
    onTransactionTypeChange,
}: TransactionTypeFieldProps) => {
    return (
        <FormField
            control={form.control}
            name='transactionType'
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Transaction Type</FormLabel>
                    <FormControl>
                        <Combobox
                            options={TRANSACTION_TYPES}
                            placeholder='Select transaction type...'
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