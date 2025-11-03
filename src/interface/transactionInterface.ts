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

export interface TransactionDetail {
  no: string
  id: string
  transactionId: string
  inventory: {
    id: string
    name: string
  }
  quantity: number
  price: number
  total: number
  shopId: string
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  no: string
  id: string
  partnerType: "VENDOR" | "CUSTOMER"
  vendor?: {
    id: string
    name: string
  }
  customer?: {
    id: string
    name: string
  }
  vendorId?: string
  customerId?: string
  transactionType: "PAYMENT" | "PURCHASE" | "COMMISSION" | "SALE" | "SELL_OUT" | "COLLECT"
  transactionStatus: string | null
  amount: number
  pending: number
  advancePaid: number
  paid: number
  paymentType: "CASH" | "CREDIT_CARD" | "BANK_TRANSFER" | "MOBILE_PAYMENT"
  isPaid: boolean
  remarks: string | null
  payable: number
  receivable: number
  shopId: string
  createdAt: string
  updatedAt: string
  details: TransactionDetail[]
}

// update main DTO
export interface CreateTransactionDto {
  shopId: string
  partnerType: "VENDOR" | "CUSTOMER"
  vendorId?: string
  customerId?: string
  transactionType: "PAYMENT" | "PURCHASE" | "COMMISSION" | "SALE" | "SELL_OUT" | "COLLECT"
  amount?: number
  paymentType?: "CASH" | "CREDIT_CARD" | "BANK_TRANSFER" | "MOBILE_PAYMENT"
  details?: {
    inventoryId: string
    quantity: number
    price: number
    total: number
  }[]
}

export interface TransactionListResponse {
  msg: string
  statusCode: number
  data: Transaction[]
  page: number
  limit: number
  total: number
}