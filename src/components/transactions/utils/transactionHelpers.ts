import { BusinessEntityType } from '@/utils/enums/trasaction.enum'
import type { Customer } from '@/interface/customerInterface'
import type { Vendor } from '@/interface/vendorInterface'
import type { ComboboxOptionInterface } from '@/interface/transactionInterface'

export const createBusinessEntityOptions = (): ComboboxOptionInterface[] =>
    Object.values(BusinessEntityType).map((entity) => ({
        value: entity,
        label: entity,
    }))

export const createEntityOptions = (
    entities: (Vendor | Customer)[]
): ComboboxOptionInterface[] =>
    entities.map((entity) => ({ value: entity.id, label: entity.name }))

export const getEntityLabel = (entityType: BusinessEntityType | null): string => {
    if (entityType === BusinessEntityType.VENDOR) return 'Select Vendor'
    if (entityType === BusinessEntityType.CUSTOMER) return 'Select Customer'
    return 'Select Entity'
}

export const getEntityPlaceholder = (
    entityType: BusinessEntityType | null
): string => {
    if (entityType === BusinessEntityType.VENDOR) return 'Select vendor...'
    if (entityType === BusinessEntityType.CUSTOMER) return 'Select customer...'
    return 'Select entity...'
}

export const getTransactionTypeOptions = (
    entityType: BusinessEntityType | null,
    VENDOR_TRANSACTION_TYPES: ComboboxOptionInterface[],
    CUSTOMER_TRANSACTION_TYPES: ComboboxOptionInterface[]
): ComboboxOptionInterface[] => {
    if (entityType === BusinessEntityType.VENDOR) return VENDOR_TRANSACTION_TYPES
    if (entityType === BusinessEntityType.CUSTOMER)
        return CUSTOMER_TRANSACTION_TYPES
    return []
}

export const calculateTotal = (
    inventories: Array<{ quantity: number | undefined; price: number | undefined }> | undefined
): number => {
    if (!inventories) return 0
    return inventories.reduce(
        (acc: number, item: { quantity: number | undefined; price: number | undefined }) => {
            const quantity = item.quantity ?? 0
            const price = item.price ?? 0
            return acc + quantity * price
        },
        0
    )
}

export const calculatePending = (
    amount: number,
    advancePaid: number | null | undefined,
    paid: number | null | undefined
): number => {
    const advance = advancePaid ?? 0
    const paidAmount = paid ?? 0
    return amount - (paidAmount + advance)
}