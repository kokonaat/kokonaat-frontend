import { apiEndpoints } from "@/config/api"
import { axiosInstance } from "./axios"

export interface CreateTransactionDto {
  shopId: string
  partnerType: "VENDOR" | "CUSTOMER"
  transactionType: "PAYMENT" | "PURCHASE" | "COMMISSION" | "SALE"
  amount: number
  vendorId?: string
  customerId?: string
}

export const createTransaction = async (data: CreateTransactionDto) => {
    if (!data.shopId) throw new Error("Shop ID is required")
    const res = await axiosInstance.post(apiEndpoints.transactions.createTransactions, data)
    return res.data
}