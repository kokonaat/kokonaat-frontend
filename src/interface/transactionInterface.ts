export interface TransactionMutateDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow?: { id: string; title: string }
    onSave?: (updatedData: { title: string }) => void
}

export interface TransactionRowInterface {
    id: string
    title: string
    transactionType?: string
    transactionPaymentStatus?: 'paid' | 'received'
}

export interface ComboboxOptionInterface {
    value: string
    label: string
}