import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createTransaction, getTransactionById, getTransactions } from "@/api/transactionApi"
import type { CreateTransactionDto, TransactionListResponse } from "@/interface/transactionInterface"

const TRANSACTIONS_KEYS = {
    all: ["transactions"] as const,
}

// list
export const useTransactionList = (
    shopId: string,
    page: number,
    startDate?: string,
    endDate?: string
) => {
    return useQuery<TransactionListResponse>({
        queryKey: ["transactions", shopId, page, startDate, endDate],
        queryFn: () => getTransactions(shopId, page, startDate, endDate),
        placeholderData: keepPreviousData,
        enabled: !!shopId,
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