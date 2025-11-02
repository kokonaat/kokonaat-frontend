import { useState } from 'react'
import type { Resolver } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { BusinessEntityType } from '@/utils/enums/trasaction.enum'
import { transactionFormSchema } from '@/schema/transactionFormSchema'
import type { TransactionFormValues } from '@/schema/transactionFormSchema'
import { DEFAULT_VALUES } from '@/constance/transactionContances'

export const useTransactionForm = () => {
    const [selectedBusinessEntity, setSelectedBusinessEntity] =
        useState<BusinessEntityType | null>(null)
    const [entitySearchQuery, setEntitySearchQuery] = useState('')
    const [inventorySearchQuery, setInventorySearchQuery] = useState('')
    const [inventoryInputValues, setInventoryInputValues] = useState<
        Record<number, string>
    >({})
    const [inventoryDisplayData, setInventoryDisplayData] = useState<
        Record<number, { lastPrice: number | null; stockQuantity: number | null }>
    >({})

    const resolver = zodResolver(
        transactionFormSchema
    ) as Resolver<TransactionFormValues>

    const form = useForm<TransactionFormValues>({
        resolver,
        defaultValues: DEFAULT_VALUES as TransactionFormValues,
    })

    const resetFormStates = () => {
        form.reset(DEFAULT_VALUES)
        setSelectedBusinessEntity(null)
        setEntitySearchQuery('')
        setInventorySearchQuery('')
        setInventoryInputValues({})
        setInventoryDisplayData({})
    }

    return {
        form,
        selectedBusinessEntity,
        setSelectedBusinessEntity,
        entitySearchQuery,
        setEntitySearchQuery,
        inventorySearchQuery,
        setInventorySearchQuery,
        inventoryInputValues,
        setInventoryInputValues,
        inventoryDisplayData,
        setInventoryDisplayData,
        resetFormStates,
    }
}