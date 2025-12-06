import type { UseFormReturn } from 'react-hook-form'
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import type { TransactionFormValues } from '@/schema/transactionFormSchema'
import type { BusinessEntityType } from '@/utils/enums/trasaction.enum'

interface PaymentFieldsProps {
    form: UseFormReturn<TransactionFormValues>
    selectedBusinessEntity: BusinessEntityType | null
    transactionType: string
    calculatedPending: number
}

export const PaymentFields = ({
    form,
    selectedBusinessEntity,
    transactionType,
    calculatedPending,
}: PaymentFieldsProps) => {
    const showPaymentFields =
        transactionType === 'PURCHASE' || transactionType === 'SALE'

    if (!selectedBusinessEntity || !showPaymentFields) {
        return null
    }

    return (
        <>
            <div className='flex justify-end'>
                <FormField
                    control={form.control}
                    name='advancePaid'
                    render={({ field }) => (
                        <FormItem className='max-w-52'>
                            <FormLabel>Advance Paid</FormLabel>
                            <FormControl>
                                <Input
                                    type='number'
                                    {...field}
                                    placeholder='0.00'
                                    min={0}
                                    value={field.value ?? ''}
                                    onChange={(e) => {
                                        const val = e.target.value
                                        field.onChange(val === '' ? '' : Number(val))
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className='flex justify-end'>
                <FormField
                    control={form.control}
                    name='paid'
                    render={({ field }) => (
                        <FormItem className='max-w-52'>
                            <FormLabel>Paid</FormLabel>
                            <FormControl>
                                <Input
                                    type='number'
                                    {...field}
                                    placeholder='0.00'
                                    min={0}
                                    value={field.value ?? ''}
                                    onChange={(e) => {
                                        const val = e.target.value
                                        field.onChange(val === '' ? '' : Number(val))
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className='flex justify-end'>
                <FormField
                    control={form.control}
                    name='pending'
                    render={({ field }) => (
                        <FormItem className='max-w-52'>
                            <FormLabel>Pending</FormLabel>
                            <FormControl>
                                <Input
                                    type='number'
                                    {...field}
                                    placeholder='0.00'
                                    min={0}
                                    value={field.value ?? calculatedPending}
                                    onChange={(e) => {
                                        const val = e.target.value
                                        field.onChange(val === '' ? '' : Number(val))
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </>
    )
}