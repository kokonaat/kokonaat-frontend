export interface LoanItemInterface {
    id: string
    no: string
    loanFrom: string
    purpose?: string
    amount: number
    paid: number
    pending: number
    remarks?: string
    shopId: string
    createdAt: string
}

export interface LoanFormInterface {
    id?: string
    loanFrom: string
    purpose?: string
    amount: number
    remarks?: string
    shopId: string
}

export interface LoanSummaryInterface {
    totalLoan: number
    totalPaid: number
    totalPending: number
}

export interface LoanTableProps {
    data: LoanItemInterface[]
    pageIndex: number
    pageSize: number
    total: number
    onPageChange: (index: number) => void
    onSearchChange: (value: string) => void
    onDateChange?: (from?: Date, to?: Date) => void
    defaultDateRange?: { from?: Date; to?: Date }
}
