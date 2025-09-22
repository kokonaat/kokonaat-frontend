import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createTransaction, getTransactions } from "@/api/transactionApi"
import type { CreateTransactionDto, TransactionListResponse } from "@/interface/transactionInterface"

const TRANSACTIONS_KEYS = {
    all: ["transactions"] as const,
}

export const useTransactionList = (shopId: string, page: number) => {
  return useQuery<TransactionListResponse>({
    queryKey: [...TRANSACTIONS_KEYS.all, shopId, page],
    queryFn: () => getTransactions(shopId, page),
    placeholderData: keepPreviousData,
  })
}

export const useCreateTransaction = (shopId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: Omit<CreateTransactionDto, "shopId">) =>
            createTransaction({ ...data, shopId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...TRANSACTIONS_KEYS.all, shopId] })
        },
        onError: (error) => {
            // eslint-disable-next-line no-console
            console.error("Failed to create transaction:", error)
        },
    })
}