import { apiEndpoints } from "@/config/api"
import { axiosInstance } from "./axios"
import type { CreateTransactionDto } from "@/interface/transactionInterface"

export interface TransactionRowInterface {
  id: string
  partnerType: "VENDOR" | "CUSTOMER"
  vendorId?: string
  customerId?: string
  transactionType: "PAYMENT" | "PURCHASE" | "COMMISSION" | "SALE"
  amount: number
  createdAt: string
}

export interface TransactionListResponse {
  data: TransactionRowInterface[]
  total: number
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
  // this function will receive the payload with 'details' for inventory types
  if (!data.shopId) throw new Error("Shop ID is required")
  const res = await axiosInstance.post(apiEndpoints.transactions.createTransactions, data)
  return res.data
}