import type { UseFormReturn, FieldArrayWithId } from 'react-hook-form'
import type { Dispatch, SetStateAction } from 'react'
// import { useMemo } from 'react'
import {
    FormControl,
    FormItem,
    FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import type { ComboboxOptionInterface } from '@/interface/transactionInterface'
import type { TransactionFormValues } from '@/schema/transactionFormSchema'
import type { InventoryItem } from '@/interface/inventoryInterface'
import { calculateTotal } from './utils/transactionHelpers'
import { InventoryRow } from './InventoryRow'

interface InventoryFieldsProps {
    form: UseFormReturn<TransactionFormValues>
    fields: FieldArrayWithId<TransactionFormValues, 'inventories', 'id'>[]
    append: (value: any) => void
    remove: (index: number) => void
    inventoryOptions: ComboboxOptionInterface[]
    inventoryList: InventoryItem[]
    inventoryInputValues: Record<number, string>
    setInventoryInputValues: Dispatch<SetStateAction<Record<number, string>>>
    inventoryDisplayData: Record<
        number,
        { lastPrice: number | null; stockQuantity: number | null }
    >
    setInventoryDisplayData: Dispatch<
        SetStateAction<
            Record<number, { lastPrice: number | null; stockQuantity: number | null }>
        >
    >
    isInventoryLoading: boolean
    transactionType: string
}

export const InventoryFields = ({
    form,
    fields,
    append,
    remove,
    inventoryOptions,
    inventoryList,
    inventoryInputValues,
    setInventoryInputValues,
    inventoryDisplayData,
    setInventoryDisplayData,
    isInventoryLoading,
    transactionType,
}: InventoryFieldsProps) => {
    const total = calculateTotal(form.watch('inventories'))

    const handleInventorySelect = (val: string, index: number) => {
        const selectedInventory = inventoryList.find((item) => item.id === val)

        setInventoryDisplayData((prev) => ({
            ...prev,
            [index]: {
                lastPrice: selectedInventory?.lastPrice ?? null,
                stockQuantity: selectedInventory?.quantity ?? null,
            },
        }))

        form.setValue(`inventories.${index}.inventoryId`, val)
        setInventoryInputValues((prev) => ({
            ...prev,
            [index]: val,
        }))
    }

    const handleInventorySearch = (query: string, index: number) => {
        setInventoryDisplayData((prev) => ({
            ...prev,
            [index]: { lastPrice: null, stockQuantity: null },
        }))

        form.setValue(`inventories.${index}.inventoryId`, query)
        setInventoryInputValues((prev) => ({
            ...prev,
            [index]: query,
        }))
    }

    const handleAppend = () => {
        append({ inventoryId: '', quantity: 0, price: 0 })
    }

    const handleRemove = (index: number) => {
        remove(index)
        setInventoryDisplayData((prev) => {
            const newState = { ...prev }
            delete newState[index]
            return Object.keys(newState).reduce((acc, key, _i) => {
                const numKey = Number(key)
                if (numKey > index) {
                    acc[numKey - 1] = newState[numKey]
                } else {
                    acc[numKey] = newState[numKey]
                }
                return acc
            }, {} as Record<number, { lastPrice: number | null; stockQuantity: number | null }>)
        })
    }

    return (
        <>
            {fields.map((field, index) => {
                const currentInputValue = inventoryInputValues[index] ?? ''
                const itemDisplayData = inventoryDisplayData[index]

                const allOtherSelectedValues = Object.entries(inventoryInputValues)
                    .filter(([i]) => Number(i) !== index)
                    .map(([, v]) => v.toLowerCase().trim())
                    .filter((v) => v.length > 0)

                const allOtherSelectedNames = allOtherSelectedValues.map((val) => {
                    const option = inventoryOptions.find((opt) => opt.value === val)
                    return option ? option.label.toLowerCase().trim() : val
                })

                const filteredInventoryOptions = inventoryOptions.filter((opt) => {
                    const optionName = opt.label.toLowerCase().trim()
                    return !allOtherSelectedNames.includes(optionName)
                })

                const isAlreadyUsed = (value: string): boolean => {
                    const normalized = value.toLowerCase().trim()
                    if (!normalized) return false
                    return allOtherSelectedNames.includes(normalized)
                }

                return (
                    <InventoryRow
                        key={field.id}
                        form={form}
                        field={field}
                        index={index}
                        currentInputValue={currentInputValue}
                        itemDisplayData={itemDisplayData}
                        filteredInventoryOptions={filteredInventoryOptions}
                        inventoryOptions={inventoryOptions}
                        inventoryList={inventoryList}
                        isInventoryLoading={isInventoryLoading}
                        transactionType={transactionType}
                        isAlreadyUsed={isAlreadyUsed}
                        onInventorySelect={handleInventorySelect}
                        onInventorySearch={handleInventorySearch}
                        onAppend={handleAppend}
                        onRemove={handleRemove}
                        showRemoveButton={index > 0}
                    />
                )
            })}

            {fields.length > 0 && (
                <div className='flex justify-end'>
                    <div className='w-60'></div>
                    <FormItem className='max-w-52'>
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
                </div>
            )}
        </>
    )
}