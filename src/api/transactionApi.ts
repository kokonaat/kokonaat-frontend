import { apiEndpoints } from "@/config/api"
import { axiosInstance } from "./axios"
import type { CreateTransactionDto, TransactionListResponse } from "@/interface/transactionInterface"

export interface TransactionRowInterface {
  id: string
  partnerType: "VENDOR" | "CUSTOMER"
  vendorId?: string
  customerId?: string
  transactionType: "PAYMENT" | "PURCHASE" | "COMMISSION" | "SALE"
  amount: number
  createdAt: string
}

export const getTransactions = async (shopId: string, page: number) => {
  const res = await axiosInstance.get<TransactionListResponse>(
    apiEndpoints.transactions.transactionsList,
    {
      params: { shopId, page },
    }
  )
  return res.data
}

export const createTransaction = async (data: CreateTransactionDto) => {
    if (!data.shopId) throw new Error("Shop ID is required")
    const res = await axiosInstance.post(apiEndpoints.transactions.createTransactions, data)
    return res.data
}