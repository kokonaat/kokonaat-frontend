import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createTransaction, getTransactionById, getTransactions, type CreateTransactionDto } from "@/api/transactionApi"
import type { TransactionListResponse } from "@/api/transactionApi"

const TRANSACTIONS_KEYS = {
    all: ["transactions"] as const,
}

// list
export const useTransactionList = (shopId: string, page: number) => {
    return useQuery<TransactionListResponse>({
        queryKey: [...TRANSACTIONS_KEYS.all, shopId, page],
        queryFn: () => getTransactions(shopId, page),
        placeholderData: keepPreviousData,
    })
}

// create
export const useCreateTransaction = (shopId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: Omit<CreateTransactionDto, "shopId">) =>
            createTransaction({ ...data, shopId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...TRANSACTIONS_KEYS.all, shopId] })
        },
    })
}

// transaction detail by id
export const useTransactionById = (shopId: string, id: string) => {
    return useQuery({
        queryKey: ["transactions", shopId, id],
        queryFn: () => getTransactionById(shopId, id),
        enabled: !!shopId && !!id,
    })
}