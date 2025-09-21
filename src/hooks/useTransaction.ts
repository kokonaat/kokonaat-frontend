import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createTransaction, type CreateTransactionDto } from "@/api/transactionApi"

const TRANSACTIONS_KEYS = {
    all: ["transactions"] as const,
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