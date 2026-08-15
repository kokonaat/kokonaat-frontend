import type { UseFormReturn, FieldArrayWithId } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { fmtAmount } from '@/lib/utils'
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import { useTranslation } from '@/hooks/useTranslation'
import { usePaymentTypeOptions } from '@/hooks/useTranslatedOptions'
import type { TransactionFormValues } from '@/schema/transactionFormSchema'
import type { BusinessEntityType } from '@/constance/transactionConstances'

interface PaymentFieldsProps {
    form: UseFormReturn<TransactionFormValues>
    fields: FieldArrayWithId<TransactionFormValues, 'payments', 'id'>[]
    onAppend: () => void
    onRemove: (index: number) => void
    selectedBusinessEntity: BusinessEntityType | null
    transactionType: string
    total: number
    entityBalance?: number
}

export const PaymentFields = ({
    form,
    fields,
    onAppend,
    onRemove,
    selectedBusinessEntity,
    transactionType,
    total,
    entityBalance,
}: PaymentFieldsProps) => {
    const { t } = useTranslation('transactions')
    const paymentTypeOptions = usePaymentTypeOptions()

    const showPaymentFields =
        transactionType === 'PURCHASE' || transactionType === 'SALE' ||
        transactionType === 'PAYMENT' || transactionType === 'RECEIVABLE'

    if (!selectedBusinessEntity || !showPaymentFields) return null

    const payments = form.watch('payments') || []
    const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    const currentUnpaid = Math.max(0, total - totalPaid)
    const overpayment = Math.max(0, totalPaid - total)
    const adjustedOutstanding = Math.max(0, (Number(entityBalance) || 0) - overpayment)
    const pending = currentUnpaid + adjustedOutstanding

    return (
        <div className='space-y-3'>
            <div className='flex items-center justify-between'>
                <p className='text-xs text-muted-foreground font-medium'>{t('form.payment')}</p>
                <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    className='h-7 text-xs gap-1'
                    onClick={onAppend}
                >
                    <Plus className='h-3 w-3' />
                    {t('form.addPaymentMethod')}
                </Button>
            </div>

            <div className='space-y-2'>
                {fields.map((field, index) => (
                    <div key={field.id} className='flex flex-wrap items-end gap-2 sm:flex-nowrap'>
                        <FormField
                            control={form.control}
                            name={`payments.${index}.paymentType`}
                            render={({ field: f }) => (
                                <FormItem className='w-full sm:flex-1'>
                                    {index === 0 && <FormLabel>{t('form.paymentType')}</FormLabel>}
                                    <FormControl>
                                        <Combobox
                                            options={paymentTypeOptions}
                                            placeholder={t('form.paymentTypePlaceholder')}
                                            className='w-full'
                                            value={f.value}
                                            onSelect={f.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name={`payments.${index}.remarks`}
                            render={({ field: f }) => (
                                <FormItem className='w-full sm:flex-1'>
                                    {index === 0 && <FormLabel>{t('form.paymentRemarks')}</FormLabel>}
                                    <FormControl>
                                        <Input
                                            placeholder={t('form.paymentRemarks')}
                                            value={f.value ?? ''}
                                            onChange={f.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name={`payments.${index}.amount`}
                            render={({ field: f }) => (
                                <FormItem className='w-full sm:w-32'>
                                    {index === 0 && <FormLabel>{t('form.paid')}</FormLabel>}
                                    <FormControl>
                                        <Input
                                            type='number'
                                            min={0}
                                            step='0.01'
                                            placeholder='0'
                                            value={f.value === 0 ? '' : (f.value ?? '')}
                                            onChange={(e) => {
                                                const val = e.target.value
                                                f.onChange(val === '' ? 0 : parseFloat(val))
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive self-end'
                            disabled={fields.length === 1}
                            onClick={() => onRemove(index)}
                        >
                            <Trash2 className='h-4 w-4' />
                        </Button>
                    </div>
                ))}
            </div>

            <div className='flex justify-end items-end gap-6 pt-2 border-t'>
                {entityBalance !== undefined && Number(entityBalance) > 0 && (
                    <div className='text-right'>
                        <p className='text-xs text-muted-foreground mb-0.5'>
                            {t('form.totalReceivable')}
                        </p>
                        <p className='text-sm font-semibold tabular-nums text-red-500'>
                            {fmtAmount(entityBalance, { min: 2, max: 2 })}
                        </p>
                    </div>
                )}
                <div className='text-right'>
                    <p className='text-xs text-muted-foreground mb-0.5'>{t('form.total')}</p>
                    <p className='text-sm font-semibold tabular-nums'>{fmtAmount(total, { min: 2, max: 2 })}</p>
                </div>
                <div className='text-right'>
                    <p className='text-xs text-muted-foreground mb-0.5'>{t('form.paid')}</p>
                    <p className='text-sm font-semibold tabular-nums'>{fmtAmount(totalPaid, { min: 2, max: 2 })}</p>
                </div>
                <div className='text-right'>
                    <p className='text-xs text-muted-foreground mb-0.5'>{t('form.pending')}</p>
                    <p className={`text-sm font-semibold tabular-nums ${pending > 0 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                        {fmtAmount(pending, { min: 2, max: 2 })}
                    </p>
                </div>
            </div>
        </div>
    )
}
