import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createInventory,
  deleteInventory,
  getInventoryById,
  inventoryList,
  updateInventory,
} from "@/api/inventoryApi"
import type { InventoryFormInterface, InventoryItemInterface } from "@/interface/inventoryInterface"

// query keys
const INVENTORY_KEYS = {
  all: ["inventories"] as const,
  detail: (shopId: string, id: string) => [...INVENTORY_KEYS.all, shopId, id] as const,
}

// inventory list
export const useInventoryList = (
  shopId: string,
  page: number,
  limit: number,
  searchBy?: string,
  options?: { enabled?: boolean }
) =>
  useQuery<{ items: InventoryItemInterface[]; total: number }>({
    queryKey: [...INVENTORY_KEYS.all, shopId, page, limit, searchBy],
    queryFn: () => inventoryList(shopId, page, limit, searchBy),
    enabled: options?.enabled !== false && !!shopId,
    placeholderData: keepPreviousData,
  })

// get inventory by id
export const useInventoryById = (shopId: string, id: string) =>
  useQuery<InventoryFormInterface>({
    queryKey: INVENTORY_KEYS.detail(shopId, id),
    queryFn: () => getInventoryById(id, shopId),
    enabled: !!shopId && !!id,
  })

// create inventory
export const useCreateInventory = (shopId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<InventoryFormInterface, "shopId">) =>
      createInventory({ ...data, shopId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...INVENTORY_KEYS.all, shopId] })
    },
  })
}

// update inventory
export const useUpdateInventory = (shopId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: InventoryFormInterface }) =>
      updateInventory({ id, data, shopId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...INVENTORY_KEYS.all, shopId] })
    },
  })
}

// delete inventory
// ✅ Final Version
export const useDeleteInventory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteInventory({ id }),

    // 🟢 Optimistic update — remove from all paginated/filtered lists
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["inventories"] })

      // Store previous state for rollback
      const previousQueries = queryClient.getQueriesData<{ items: any[]; total: number }>({
        queryKey: ["inventories"],
      })

      // Optimistically update all cached inventory lists
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

    // 🔴 Rollback on error
    onError: (_err, _vars, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([key, data]) => {
          queryClient.setQueryData(key, data)
        })
      }
    },

    // ✅ Always sync with backend after deletion
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["inventories"],
        exact: false,
      })
    },
  })
}