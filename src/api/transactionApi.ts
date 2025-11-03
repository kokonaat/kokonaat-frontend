import { apiEndpoints } from "@/config/api"
import { axiosInstance } from "./axios"
import type { CreateTransactionDto, TransactionListResponse } from "@/interface/transactionInterface"

// export interface TransactionRowInterface {
//   id: string
//   partnerType: "VENDOR" | "CUSTOMER"
//   vendorId?: string
//   customerId?: string
//   transactionType: "PAYMENT" | "PURCHASE" | "COMMISSION" | "SALE"
//   amount: number
//   createdAt: string
// }

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

export const getTransactionById = async (shopId: string, id: string) => {
  if (!shopId) throw new Error("Shop ID is required")
  if (!id) throw new Error("Transaction ID is required")

  // replace {id} in the path and also put id in the query string.
  const path = apiEndpoints.transactions.getTransactionById.replace("{id}", id)
  const res = await axiosInstance.get(`${path}?id=${id}&shopId=${shopId}`)
  return res.data
}