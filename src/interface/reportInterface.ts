export interface TransactionReportItem {
    id: string
    no: string
    createdAt: string
    transactionType: string
    vendor?: Entity
    customer?: Entity
    details: TransactionDetailItem[]
    totalAmount: number
    paid: number
    pending: number
    paymentType: string
}

export interface ExpenseReportItem {
    id: string
    title: string
    type: string
    amount: number
    remarks: string
    createdAt: string
}

// Keep all your existing interfaces as they are
export interface TransactionLedgerResponse {
    page: number
    limit: number
    total: number
    transactions: TransactionLedgerItem[]
    totalAmount: number
    totalPaid: number
    totalPending: number
}

export interface TransactionLedgerItem {
    no: string
    id: string
    transactionType: string
    vendor?: Entity
    customer?: Entity
    vendorId?: string
    customerId?: string
    totalAmount: number
    paid: number
    pending: number
    paymentType: string
    remarks?: string | null
    shopId: string
    createdAt: string
    updatedAt: string
    details: TransactionDetailItem[]
}

export interface Entity {
    id: string
    name: string
}

export interface TransactionDetailItem {
    no: string
    id: string
    transactionId: string
    inventory: InventoryItem
    quantity: string
    price: string
    total: string
    shopId: string
    createdAt: string
    updatedAt: string
    unitOfMeasurement: UnitOfMeasurement
}

export interface InventoryItem {
    id: string
    name: string
}

export interface UnitOfMeasurement {
    id: string
    name: string
}

export interface TransactionLedgerDetailItem {
    id: string
    transactionNo: string
    createdAt: string
    transactionType: string
    entityName: string
    inventoryName: string
    quantity: string
    price: string
    total: string
    paymentType: string
    unitOfMeasurement?: { name: string }
}

export interface FlattenedTransactionDetail {
    transactionNo: string
    createdAt: string
    transactionType: string
    customerName: string
    inventoryName: string
    quantity: string
    unitOfMeasurementName: string
    price: string
    total: string
    paymentType: string
}

export interface TransactionReportParams {
    page: number
    limit: number
    shopId: string
    searchBy?: string
    startDate: string
    endDate: string
    transactionTypes: string[]
}

export interface ExpensesReportParams {
    page: number
    limit: number
    shopId: string
    searchBy?: string
    startDate: string
    endDate: string
}

export interface StocksReportParams {
    page: number
    limit: number
    shopId: string
    searchBy?: string
    startDate: string
    endDate: string
    ids: string[]
}

export interface StockReportItem {
    no: string
    id: string
    name: string
    description: string | null
    quantity: number
    lastPrice: number
    unitOfMeasurement: {
        id: string
        name: string
    }
}

export interface StockTrackReportItem {
    id: string
    no: string
    inventory: {
        id: string
        name: string
    }
    stock: number
    price: number
    customerName?: string
    createdAt: string
    isPurchased: boolean
}