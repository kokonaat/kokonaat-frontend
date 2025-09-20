import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createVendor, deleteVendor, updateVendor, vendorList } from "@/api/vendorApi"
import type { CustomerFormInterface, CustomerListInterface } from "@/interface/customerInterface"

const VENDOR_KEYS = {
    all: ['vendors'] as const,
}

// vendor list
export const useVendorList = (shopId: string) => {
    return useQuery<CustomerListInterface[]>({
        queryKey: [...VENDOR_KEYS.all, shopId],
        queryFn: () => vendorList(shopId),
        enabled: !!shopId,
    })
}

// create
export const useCreateVendor = (shopId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: Omit<CustomerFormInterface, 'shopId'>) =>
            createVendor({ ...data, shopId }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [...VENDOR_KEYS.all, shopId] }),
    })
}

// update
export const useUpdateVendor = (shopId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: CustomerFormInterface }) =>
            updateVendor({ id, data, shopId }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [...VENDOR_KEYS.all, shopId] }),
    })
}

// delete
export const useDeleteVendor = (shopId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id }: { id: string }) => deleteVendor({ id, shopId }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [...VENDOR_KEYS.all, shopId] }),
    })
}