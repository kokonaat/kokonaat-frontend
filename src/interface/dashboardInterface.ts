import type { ExpenseType } from '@/constance/expenseConstance'

export interface SummaryAmounts {
  total: number
  totalPaid: number
  totalPayable: number
  totalReceivable: number
}

export interface OperatingSummary {
  totalInflow: number
  totalOutflow: number
  netPosition: number
  totalExpenses: number
}

export interface PeriodComparison {
  netPositionChange: number
  salesTotalChange: number
  expenseTotalChange: number
}

export interface ExpenseByType {
  type: ExpenseType
  total: number
  count: number
}

export interface TopProduct {
  inventoryId: string
  name: string
  unitsSold: number
  revenue: number
  transactionCount: number
}

export interface TopCustomer {
  customerId: string
  name: string
  totalSales: number
  totalPaid: number
  pending: number
}

export interface TopVendor {
  vendorId: string
  name: string
  totalPurchases: number
  totalPaid: number
  pending: number
}

export interface LowStockItem {
  id: string
  name: string
  quantity: number
  lastPrice: number
}

export interface InventoryHealth {
  skuCount: number
  totalStockUnits: number
  totalStockValue: number
  lowStockItems: LowStockItem[]
}

export interface TrendPoint {
  date: string
  total: number
  count?: number
}

export interface CashFlowPoint {
  date: string
  totalInflow: number
  totalOutflow: number
}

export interface DashboardTransaction {
  id: string
  no: string
  partnerType: 'CUSTOMER' | 'VENDOR'
  transactionType: string
  totalAmount: number
  paid: number
  pending: number
  createdAt: string
  partnerName?: string
}

export interface DashboardData {
  salesSummary: SummaryAmounts
  purchasesSummary: SummaryAmounts
  totalInventory: number
  totalCustomers: number
  totalVendors: number
  transactionsCount: number
  salesCount: number
  purchasesCount: number
  recentTransactions: DashboardTransaction[]
  last12MonthsInflowOutflow: {
    month: string
    totalInflow: number
    totalOutflow: number
  }[]
  operatingSummary: OperatingSummary
  periodComparison: PeriodComparison
  expensesByType: ExpenseByType[]
  topProducts: TopProduct[]
  topCustomers: TopCustomer[]
  topVendors: TopVendor[]
  inventoryHealth: InventoryHealth
  salesTrend: TrendPoint[]
  expenseTrend: TrendPoint[]
  periodCashFlow: CashFlowPoint[]
}

export interface DashboardParams {
  shopId: string
  startDate?: string
  endDate?: string
}
