import { createCustomer, customerList, deleteCustomer, getCustomerById, getCustomerTransactions, updateCustomer } from "@/api/customerApi"
import type { CustomerFormInterface } from "@/interface/customerInterface"
import type { VendorFormInterface, VendorTransactionApiResponse } from "@/interface/vendorInterface"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

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
    options?: { enabled?: boolean }
) =>
    useQuery({
        queryKey: [...CUSTOMER_KEYS.all, shopId, page, limit, searchBy],
        queryFn: () => customerList(shopId, page, limit, searchBy),
        enabled: options?.enabled !== false && !!shopId,
        placeholderData: keepPreviousData,
    })

// get customer by id
export const useCustomerById = (shopId: string, id: string) => {
    return useQuery<VendorFormInterface>({
        queryKey: ["customers", shopId, id],
        queryFn: () => getCustomerById(id, shopId),
        enabled: !!shopId && !!id,
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
export const useCustomerTransactions = (vendorId: string, pageIndex: number, pageSize: number) => {
    return useQuery<VendorTransactionApiResponse>({
        queryKey: ["vendorTransactions", vendorId, pageIndex, pageSize],
        queryFn: () => getCustomerTransactions(vendorId, pageIndex + 1, pageSize), // pageIndex +1 for 1-based API
        enabled: !!vendorId,
        placeholderData: keepPreviousData,
    })
}
