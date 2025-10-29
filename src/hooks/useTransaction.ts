import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createTransaction, getTransactionById, getTransactions, type CreateTransactionDto } from "@/api/transactionApi"
import type { TransactionListResponse } from "@/api/transactionApi"

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
            console.error("Failed to create transaction:", error)
        },
    })
}

export const useTransactionById = (shopId: string, id: string) => {
    return useQuery({
        queryKey: ["transactions", shopId, id],
        queryFn: () => getTransactionById(shopId, id),
        enabled: !!shopId && !!id,
    })
}