import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { LoanFormInterface, LoanItemInterface, LoanSummaryInterface } from "@/interface/loanInterface"
import { createLoan, deleteLoan, getLoanById, loanList, loanSummary, payLoan, updateLoan } from "@/api/loanApi"

const LOAN_KEYS = {
    all: ["loans"] as const,
    list: (shopId: string) => [...LOAN_KEYS.all, shopId] as const,
    summary: (shopId: string) => [...LOAN_KEYS.all, shopId, "summary"] as const,
    detail: (id: string) => ["loans", id] as const,
}

export const useLoanList = (
    shopId: string,
    page: number,
    limit: number,
    searchBy?: string,
    startDate?: Date,
    endDate?: Date,
) =>
    useQuery<{ items: LoanItemInterface[]; total: number }>({
        queryKey: [...LOAN_KEYS.list(shopId), page, limit, searchBy, startDate, endDate],
        queryFn: () => loanList(shopId, page, limit, searchBy, startDate, endDate),
        enabled: !!shopId,
        placeholderData: keepPreviousData,
    })

export const useLoanSummary = (shopId: string, startDate?: Date, endDate?: Date) =>
    useQuery<LoanSummaryInterface>({
        queryKey: [...LOAN_KEYS.summary(shopId), startDate, endDate],
        queryFn: () => loanSummary(shopId, startDate, endDate),
        enabled: !!shopId,
    })

export const useCreateLoan = (shopId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: Omit<LoanFormInterface, "shopId">) => createLoan({ ...data, shopId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: LOAN_KEYS.list(shopId), exact: false })
            queryClient.invalidateQueries({ queryKey: LOAN_KEYS.summary(shopId), exact: false })
        },
    })
}

export const useUpdateLoan = (shopId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<LoanFormInterface> }) => updateLoan({ id, data }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: LOAN_KEYS.list(shopId), exact: false })
        },
    })
}

export const usePayLoan = (shopId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, amount }: { id: string; amount: number }) => payLoan({ id, amount }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: LOAN_KEYS.list(shopId), exact: false })
            queryClient.invalidateQueries({ queryKey: LOAN_KEYS.summary(shopId), exact: false })
        },
    })
}

export const useDeleteLoan = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id }: { id: string }) => deleteLoan({ id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: LOAN_KEYS.all, exact: false })
        },
    })
}

export const useLoanById = (id?: string) =>
    useQuery<LoanItemInterface>({
        queryKey: LOAN_KEYS.detail(id ?? ""),
        queryFn: () => getLoanById(id as string),
        enabled: !!id,
    })
