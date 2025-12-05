// import { BusinessEntityType } from '@/utils/enums/trasaction.enum'
// import type { Customer } from '@/interface/customerInterface'
// import type { Vendor } from '@/interface/vendorInterface'
// import type { ComboboxOptionInterface } from '@/interface/transactionInterface'

// export const createBusinessEntityOptions = (): ComboboxOptionInterface[] =>
//     Object.values(BusinessEntityType).map((entity) => ({
//         value: entity,
//         label: entity,
//     }))

// export const createEntityOptions = (
//     entities: (Vendor | Customer)[]
// ): ComboboxOptionInterface[] =>
//     entities.map((entity) => ({ value: entity.id, label: entity.name }))

// export const getEntityLabel = (entityType: BusinessEntityType | null): string => {
//     if (entityType === BusinessEntityType.VENDOR) return 'Select Vendor'
//     if (entityType === BusinessEntityType.CUSTOMER) return 'Select Customer'
//     return 'Select Entity'
// }

// export const getEntityPlaceholder = (
//     entityType: BusinessEntityType | null
// ): string => {
//     if (entityType === BusinessEntityType.VENDOR) return 'Select vendor...'
//     if (entityType === BusinessEntityType.CUSTOMER) return 'Select customer...'
//     return 'Select entity...'
// }

// export const getTransactionTypeOptions = (
//     entityType: BusinessEntityType | null,
//     VENDOR_TRANSACTION_TYPES: ComboboxOptionInterface[],
//     CUSTOMER_TRANSACTION_TYPES: ComboboxOptionInterface[]
// ): ComboboxOptionInterface[] => {
//     if (entityType === BusinessEntityType.VENDOR) return VENDOR_TRANSACTION_TYPES
//     if (entityType === BusinessEntityType.CUSTOMER)
//         return CUSTOMER_TRANSACTION_TYPES
//     return []
// }

// export const calculateTotal = (
//     inventories: Array<{ quantity: number | undefined; price: number | undefined }> | undefined
// ): number => {
//     if (!inventories) return 0
//     return inventories.reduce(
//         (acc: number, item: { quantity: number | undefined; price: number | undefined }) => {
//             const quantity = item.quantity ?? 0
//             const price = item.price ?? 0
//             return acc + quantity * price
//         },
//         0
//     )
// }

// export const calculatePending = (
//     amount: number,
//     advancePaid: number | null | undefined,
//     paid: number | null | undefined
// ): number => {
//     const advance = advancePaid ?? 0
//     const paidAmount = paid ?? 0
//     return amount - (paidAmount + advance)
// }



import type { ComboboxOptionInterface } from '@/interface/transactionInterface'
import { BusinessEntityType } from '@/utils/enums/trasaction.enum'

export const createEntityOptions = (
    entityList: Array<{ id: string; name: string }>
): ComboboxOptionInterface[] => {
    return entityList.map((entity) => ({
        value: entity.id,
        label: entity.name,
    }))
}

export const createBusinessEntityOptions = (): ComboboxOptionInterface[] => {
    return [
        { value: 'VENDOR', label: 'Vendor' },
        { value: 'CUSTOMER', label: 'Customer' },
    ]
}

export const getEntityLabel = (entityType: BusinessEntityType): string => {
    return entityType === 'VENDOR' ? 'Vendor' : 'Customer'
}

export const getEntityPlaceholder = (entityType: BusinessEntityType): string => {
    return entityType === 'VENDOR' ? 'Select vendor...' : 'Select customer...'
}

export const calculateTotal = (
    inventories: Array<{ quantity: number; price: number }> | undefined
): number => {
    if (!inventories || inventories.length === 0) return 0
    return inventories.reduce((sum, item) => {
        const quantity = Number(item.quantity) || 0
        const price = Number(item.price) || 0
        return sum + quantity * price
    }, 0)
}

export const calculatePending = (
    amount: number,
    advancePaid: number,
    paid: number
): number => {
    const totalAmount = Number(amount) || 0
    const totalAdvance = Number(advancePaid) || 0
    const totalPaid = Number(paid) || 0
    return Math.max(0, totalAmount - totalAdvance - totalPaid)
}

// Determine which entity type to show based on transaction type
export const getEntityTypeForTransaction = (transactionType: string): BusinessEntityType | null => {
    switch (transactionType) {
        case 'PURCHASE':
        case 'PAYMENT':
            return BusinessEntityType.VENDOR
        case 'SALE':
        case 'COLLECT':
            return BusinessEntityType.CUSTOMER
        case 'COMMISSION':
            return null // Will show partner type selector
        default:
            return null
    }
}

// Check if transaction type requires inventory fields
export const requiresInventoryFields = (transactionType: string): boolean => {
    return transactionType === 'PURCHASE' || transactionType === 'SALE'
}

// Check if transaction type requires amount field
export const requiresAmountField = (transactionType: string): boolean => {
    return transactionType === 'PAYMENT' || transactionType === 'COLLECT' || transactionType === 'COMMISSION'
}