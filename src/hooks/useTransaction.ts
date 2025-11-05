import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createTransaction, getTransactionById, getTransactions, transactionLedger } from "@/api/transactionApi"
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

// transaction ledger hook
export const useTransactionLedger = (
    shopId: string,
    pageSize: number,
    customerOrVendorId: string,
    limit: number = 10,
    searchBy?: string,
    startDate?: string,
    endDate?: string
) => {
    return useQuery({
        queryKey: [
            "transactionLedger",
            shopId,
            pageSize,
            customerOrVendorId,
            limit,
            searchBy,
            startDate,
            endDate,
        ],
        queryFn: () =>
            transactionLedger(shopId, pageSize, customerOrVendorId, limit, searchBy, startDate, endDate),
        // only fetch when both IDs exist
        enabled: !!shopId && !!customerOrVendorId,
        placeholderData: keepPreviousData,
    })
}