import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { createVendor, deleteVendor, updateVendor, vendorList } from "@/api/vendorApi"
import type { VendorFormInterface, VendorListResponseInterface } from "@/interface/vendorInterface"

const VENDOR_KEYS = {
    all: ['vendors'] as const,
}

// vendor list
export const useVendorList = (shopId: string, page: number, limit: number) => {
    return useQuery<VendorListResponseInterface>({
        queryKey: ['vendors', shopId, page, limit],
        queryFn: () => vendorList(shopId, page, limit),
        enabled: !!shopId,
        placeholderData: keepPreviousData,
    });
}

// create
export const useCreateVendor = (shopId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: Omit<VendorFormInterface, 'shopId'>) =>
            createVendor({ ...data, shopId }),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: [...VENDOR_KEYS.all, shopId] }),
    })
}

// update
export const useUpdateVendor = (shopId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: VendorFormInterface }) =>
            updateVendor({ id, data, shopId }),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: [...VENDOR_KEYS.all, shopId] }),
    })
}

// delete
export const useDeleteVendor = (shopId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id }: { id: string }) => deleteVendor({ id, shopId }),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: [...VENDOR_KEYS.all, shopId] }),
    })
}