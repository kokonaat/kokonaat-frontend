import { createCustomer, customerList, deleteCustomer, updateCustomer } from "@/api/customerApi"
import type { CustomerFormInterface } from "@/interface/customerInterface"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

const CUSTOMER_KEYS = {
    all: ['customers'] as const,
}

// customer list
export const useCustomerList = (shopId: string, page: number, limit: number) =>
    useQuery({
        queryKey: [...CUSTOMER_KEYS.all, shopId, page, limit],
        queryFn: () => customerList(shopId, page, limit),
        enabled: !!shopId,
        keepPreviousData: true,
    })


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
