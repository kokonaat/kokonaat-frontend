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
    transactionAmount?: number
}

export interface ComboboxOptionInterface {
    value: string
    label: string
}

export interface CreateTransactionDto {
  shopId: string
  partnerType: "VENDOR" | "CUSTOMER"
  transactionType: "PAYMENT" | "PURCHASE" | "COMMISSION" | "SALE"
  amount: number
  vendorId?: string
  customerId?: string
}

export interface TransactionListResponse {
  data: TransactionRowInterface[]
  total: number
}