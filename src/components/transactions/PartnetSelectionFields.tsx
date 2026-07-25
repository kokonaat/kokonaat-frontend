import { useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { UserPlus } from 'lucide-react'
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Combobox } from '@/components/ui/combobox'
import { useTranslation } from '@/hooks/useTranslation'
import { usePartnerTypeOptions } from '@/hooks/useTranslatedOptions'
import { BusinessEntityType } from '@/constance/transactionConstances'
import type { ComboboxOptionInterface } from '@/interface/transactionInterface'
import type { TransactionFormValues } from '@/schema/transactionFormSchema'
import { QuickCreateEntityDialog } from './QuickCreateEntityDialog'

interface PartnerSelectionFieldsProps {
    form: UseFormReturn<TransactionFormValues>
    transactionType: string
    selectedBusinessEntity: BusinessEntityType | null
    entityOptions: ComboboxOptionInterface[]
    isLoading: boolean
    onBusinessEntitySelect: (value: string) => void
    onEntitySearch: (query: string) => void
    showPartnerTypeSelector: boolean
    shopId: string
    onEntityCreated: (entity: { id: string; name: string }) => void
}

export const PartnerSelectionFields = ({
    form,
    transactionType,
    selectedBusinessEntity,
    entityOptions,
    isLoading,
    onBusinessEntitySelect,
    onEntitySearch,
    showPartnerTypeSelector,
    shopId,
    onEntityCreated,
}: PartnerSelectionFieldsProps) => {
    const { t } = useTranslation('transactions')
    const partnerTypeOptions = usePartnerTypeOptions()
    const [showCreateDialog, setShowCreateDialog] = useState(false)

    if (!transactionType) return null

    const entityLabel =
        selectedBusinessEntity === BusinessEntityType.VENDOR
            ? t('form.vendor')
            : t('form.customer')

    const entityPlaceholder =
        selectedBusinessEntity === BusinessEntityType.VENDOR
            ? t('form.vendorPlaceholder')
            : t('form.customerPlaceholder')

    return (
        <>
            <div className='flex items-end gap-4'>
                {showPartnerTypeSelector && (
                    <FormField
                        control={form.control}
                        name='partnerType'
                        render={({ field }) => (
                            <FormItem className='flex-1'>
                                <FormLabel>{t('form.partnerType')}</FormLabel>
                                <FormControl>
                                    <Combobox
                                        options={partnerTypeOptions}
                                        placeholder={t('form.partnerTypePlaceholder')}
                                        className='w-full'
                                        value={field.value}
                                        onSelect={(val) => {
                                            field.onChange(val)
                                            onBusinessEntitySelect(val)
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                {selectedBusinessEntity && (
                    <FormField
                        control={form.control}
                        name='entityTypeId'
                        render={({ field }) => (
                            <FormItem className='flex-1'>
                                <FormLabel className='flex items-center justify-between'>
                                    <span>{entityLabel}</span>
                                    <button
                                        type='button'
                                        onClick={() => setShowCreateDialog(true)}
                                        className='flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 font-normal'
                                    >
                                        <UserPlus className='h-3 w-3' />
                                        {t('quickCreate.newButton')}
                                    </button>
                                </FormLabel>
                                <FormControl>
                                    <Combobox
                                        options={entityOptions}
                                        placeholder={entityPlaceholder}
                                        className='w-full'
                                        value={field.value}
                                        onSelect={field.onChange}
                                        onSearch={onEntitySearch}
                                        loading={isLoading}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
            </div>

            {selectedBusinessEntity && (
                <QuickCreateEntityDialog
                    open={showCreateDialog}
                    onOpenChange={setShowCreateDialog}
                    entityType={selectedBusinessEntity}
                    shopId={shopId}
                    onCreated={(entity) => {
                        onEntityCreated(entity)
                        setShowCreateDialog(false)
                    }}
                />
            )}
        </>
    )
}
