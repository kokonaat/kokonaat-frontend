import { apiEndpoints } from "@/config/api";
import { axiosInstance } from "./axios";

export interface TransactionReportParams {
    page: number
    limit: number
    shopId: string
    searchBy?: string
    startDate: string
    endDate: string
    transactionType: "SALE" | "PURCHASE" | "PAYMENT" | "COMMISSION" | "RECEIVABLE"
}

export interface ExpensesReportParams {
    page: number
    limit: number
    shopId: string
    searchBy?: string
    startDate: string
    endDate: string
}

export const reportTransactions = async (params: TransactionReportParams) => {
    const res = await axiosInstance.get(
        apiEndpoints.reports.reportTransactions, { params }
    )
    return res.data
}

export const reportExpenses = async (params: ExpensesReportParams) => {
    const res = await axiosInstance.get(apiEndpoints.reports.reportExpenses, { params })
    return res.data.data
}