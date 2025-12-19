import { reportExpenses, reportTransactions } from "@/api/reportApi"
import type { ExpensesReportParams, TransactionReportParams } from "@/api/reportApi"
import { useQuery } from "@tanstack/react-query"

export const useTransactionReport = (
  params: Partial<TransactionReportParams>,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["transactionReport", params],
    queryFn: () => reportTransactions(params as TransactionReportParams),
    enabled: !!params.shopId && !!params.transactionType && (options?.enabled ?? true),
  })
}

export const useExpensesReport = (
  params: Partial<ExpensesReportParams>,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["expensesReport", params],
    queryFn: () => reportExpenses(params as ExpensesReportParams),
    enabled: !!params.shopId && (options?.enabled ?? true),
  })
}