import { useQuery, keepPreviousData, useQueryClient, useMutation } from '@tanstack/react-query'
import type { CreateUomFormInterface, UomInterface } from '@/interface/uomInterface'
import { createUom, deleteUom, getUomById, uomList, updateUom } from '@/api/uomApi'

// query keys
const UOM_KEYS = {
    all: ['uoms'] as const,
    list: (shopId: string) => [...UOM_KEYS.all, shopId] as const,
    detail: (id: string) => [...UOM_KEYS.all, 'detail', id] as const,
}

// list
export const useUomList = (
    shopId: string,
    page: number,
    limit: number,
    searchBy?: string,
    options?: { enabled?: boolean }
) =>
    useQuery<{
        items: UomInterface[]
        total: number
    }>({
        queryKey: [
            ...UOM_KEYS.list(shopId),
            page,
            limit,
            searchBy,
        ],
        queryFn: () =>
            uomList(shopId, page, limit, searchBy),
        enabled: options?.enabled !== false && !!shopId,
        placeholderData: keepPreviousData,
    })

// create
export const useCreateUom = (shopId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: Omit<CreateUomFormInterface, 'shopId'>) =>
            createUom({ ...data, shopId }),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: UOM_KEYS.list(shopId),
            })
        },
    })
}

// update
export const useUpdateUom = (shopId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string
            data: Omit<CreateUomFormInterface, 'shopId'>
        }) =>
            updateUom({ id, data, shopId }),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: UOM_KEYS.list(shopId),
            })
        },
    })
}

// del
export const useDeleteUom = (shopId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id }: { id: string }) =>
            deleteUom({ id, shopId }),

        // optimistic update
        onMutate: async ({ id }) => {
            await queryClient.cancelQueries({
                queryKey: UOM_KEYS.list(shopId),
            })

            const previousQueries = queryClient.getQueriesData<{
                items: UomInterface[]
                total: number
            }>({
                queryKey: UOM_KEYS.list(shopId),
            })

            previousQueries.forEach(([key, oldData]) => {
                if (!oldData) return

                queryClient.setQueryData(key, {
                    ...oldData,
                    items: oldData.items.filter((item) => item.id !== id),
                    total: oldData.total ? oldData.total - 1 : oldData.total,
                })
            })

            return { previousQueries }
        },

        // rollback on error
        onError: (_err, _vars, context) => {
            context?.previousQueries?.forEach(([key, data]) => {
                queryClient.setQueryData(key, data)
            })
        },

        // final sync
        onSettled: async () => {
            await queryClient.invalidateQueries({
                queryKey: UOM_KEYS.list(shopId),
                exact: false,
            })
        },
    })
}

// detail by id
export const useUomDetail = (uomId: string | null) => {
    return useQuery({
        queryKey: UOM_KEYS.detail(uomId || ''),
        queryFn: () => getUomById(uomId!),
        enabled: !!uomId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}