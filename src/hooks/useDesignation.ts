import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { DesignationInterface } from '@/interface/designationInterface'
import { createDesignation, deleteDesignation, designationList, updateDesignation } from '@/api/designationApi'

const DESIGNATION_KEYS = {
    all: ['designations'] as const,
}

// show list
export const useDesignationList = (shopId: string) => {
    return useQuery<DesignationInterface[]>({
        queryKey: [...DESIGNATION_KEYS.all, shopId],
        queryFn: () => designationList(shopId),
        enabled: !!shopId,
    })
}

// create
export const useCreateDesignation = (shopId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createDesignation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...DESIGNATION_KEYS.all, shopId] })
        },
    })
}

// update
export const useUpdateDesignation = (shopId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: { title: string } }) =>
            updateDesignation({ id, data, shopId }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [...DESIGNATION_KEYS.all, shopId] }),
    })
}

// delete
export const useDeleteDesignation = (shopId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: deleteDesignation,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [...DESIGNATION_KEYS.all, shopId] }),
    })
}