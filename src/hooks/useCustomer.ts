import { createCustomer, customerList, deleteCustomer, getCustomerById, getCustomerTransactions, updateCustomer } from "@/api/customerApi"
import type { CustomerFormInterface } from "@/interface/customerInterface"
import type { VendorFormInterface, VendorTransactionApiResponse } from "@/interface/vendorInterface"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query"

const CUSTOMER_KEYS = {
    all: ['customers'] as const,
    detail: (shopId: string, id: string) => [...CUSTOMER_KEYS.all, shopId, id] as const,
    transactions: (customerId: string, page: number, limit: number) => ["customerTransactions", customerId, page, limit] as const,
}

// customer list
export const useCustomerList = (
    shopId: string,
    page: number,
    limit: number,
    searchBy?: string,
    startDate?: Date,
    endDate?: Date,
    options?: { enabled?: boolean }
) =>
    useQuery({
        queryKey: [...CUSTOMER_KEYS.all, shopId, page, limit, searchBy, startDate, endDate],
        queryFn: () => customerList(shopId, page, limit, searchBy, startDate, endDate),
        enabled: options?.enabled !== false && !!shopId,
        placeholderData: keepPreviousData,
    })

// get customer by id
export const useCustomerById = (
    shopId: string,
    id: string,
    options?: Partial<UseQueryOptions<VendorFormInterface, Error>>
): UseQueryResult<VendorFormInterface, Error> => {
    return useQuery<VendorFormInterface>({
        queryKey: ["customers", shopId, id],
        queryFn: () => getCustomerById(id, shopId),
        enabled: !!shopId && !!id && (options?.enabled ?? true),
        ...options,
    })
}

// create
export const useCreateCustomer = (shopId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: Omit<CustomerFormInterface, 'shopId'>) =>
            createCustomer({ ...data, shopId }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [...CUSTOMER_KEYS.all, shopId] }),
    })
}

// update
export const useUpdateCustomer = (shopId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: CustomerFormInterface }) =>
            updateCustomer({ id, data, shopId }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [...CUSTOMER_KEYS.all, shopId] }),
    })
}

// delete
export const useDeleteCustomer = (shopId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id }: { id: string }) => deleteCustomer({ id, shopId }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [...CUSTOMER_KEYS.all, shopId] }),
    })
}

// get vendor transactions by customerId
export const useCustomerTransactions = (
    customerId: string,
    pageIndex: number,
    pageSize: number,
    startDate?: string,
    endDate?: string
) => {
    return useQuery<VendorTransactionApiResponse>({
        queryKey: ["vendorTransactions", customerId, pageIndex, pageSize, startDate, endDate],
        queryFn: () =>
            getCustomerTransactions(customerId, pageIndex + 1, pageSize, startDate, endDate), // pageIndex+1 for 1-based API
        enabled: !!customerId,
        placeholderData: keepPreviousData,
    })
}