import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createInventory,
  deleteInventory,
  getInventoryById,
  inventoryList,
  updateInventory,
} from "@/api/inventoryApi"
import type { InventoryFormInterface, InventoryItemInterface } from "@/interface/inventoryInterface"

// Query keys
const INVENTORY_KEYS = {
  all: ["inventories"] as const,
  detail: (shopId: string, id: string) => [...INVENTORY_KEYS.all, shopId, id] as const,
}

// Inventory List
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

// Get Inventory by ID
export const useInventoryById = (shopId: string, id: string) =>
  useQuery<InventoryFormInterface>({
    queryKey: INVENTORY_KEYS.detail(shopId, id),
    queryFn: () => getInventoryById(id, shopId),
    enabled: !!shopId && !!id,
  })

// Create Inventory
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

// Update Inventory
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

// Delete Inventory
export const useDeleteInventory = (shopId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteInventory({ id, shopId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['inventory', shopId],
        exact: false // invalidates all inventory queries for this shop
      })
    }
  })
}