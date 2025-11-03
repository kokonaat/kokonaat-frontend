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
  inventoryId?: string
}

export interface ComboboxOptionInterface {
  value: string
  label: string
}

// this represents one item in the details array for inventory transactions
export interface TransactionDetail {
  inventoryId: string
  quantity: number
  price: number
  total: number // Added 'total' as per swagger payload
}

// update main DTO
export interface CreateTransactionDto {
  shopId: string
  partnerType: "VENDOR" | "CUSTOMER"
  vendorId?: string
  customerId?: string
  transactionType: "PAYMENT" | "PURCHASE" | "COMMISSION" | "SALE" | "SELL_OUT"
  // for non-inventory transactions
  amount?: number
  // used for inventory transactions (PURCHASE, SELL_OUT)
  details?: TransactionDetail[]
}

export interface TransactionListResponse {
  data: TransactionRowInterface[]
  total: number
}