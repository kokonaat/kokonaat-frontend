import { createCustomer, customerList, deleteCustomer, updateCustomer } from "@/api/customerApi"
import { CustomerFormInterface, CustomerListInterface } from "@/interface/customerInterface"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

const CUSTOMER_KEYS = {
    all: ['customers'] as const,
}

// customer list
export const useCustomerList = (shopId: string) => {
    return useQuery<CustomerListInterface[]>({
        queryKey: [...CUSTOMER_KEYS.all, shopId],
        queryFn: () => customerList(shopId),
        enabled: !!shopId,
    })
}

// create
export const useCreateCustomer = (shopId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createCustomer,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...CUSTOMER_KEYS.all, shopId] })
        }
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
        mutationFn: deleteCustomer,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [...CUSTOMER_KEYS.all, shopId] }),
    })
}