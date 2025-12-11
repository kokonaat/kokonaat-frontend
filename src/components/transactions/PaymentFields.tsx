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
    const showPaymentFields =
        transactionType === 'PURCHASE' || transactionType === 'SALE'

    if (!selectedBusinessEntity || !showPaymentFields) {
        return null
    }

    return (
        <>
            <div className="flex justify-end gap-4">
                {/* total */}
                <FormItem className='flex-1 max-w-52'>
                    <FormLabel>Total</FormLabel>
                    <FormControl>
                        <Input
                            type='number'
                            value={total}
                            readOnly
                            className='cursor-not-allowed bg-gray-100'
                        />
                    </FormControl>
                </FormItem>

                {/* advance paid */}
                <FormField
                    control={form.control}
                    name='advancePaid'
                    render={({ field }) => (
                        <FormItem className='flex-1 max-w-52'>
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

                {/* paid */}
                <FormField
                    control={form.control}
                    name='paid'
                    render={({ field }) => (
                        <FormItem className='flex-1 max-w-52'>
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

                {/* pending */}
                <FormField
                    control={form.control}
                    name='pending'
                    render={({ field }) => (
                        <FormItem className='flex-1 max-w-52'>
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