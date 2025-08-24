import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DesignationInterface } from '@/interface/designationInterface'
import { createDesignation, designationList } from '@/api/designationApi'

const DESIGNATION_KEYS = {
    all: ['designations'] as const,
}

export const useDesignationList = (shopId: string) => {
    return useQuery<{ designations: DesignationInterface[] }>({
        queryKey: [...DESIGNATION_KEYS.all, shopId],
        queryFn: () => designationList(shopId),
        enabled: !!shopId,
    })
}

export const useCreateDesignation = (shopId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createDesignation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...DESIGNATION_KEYS.all, shopId] })
        },
    })
}