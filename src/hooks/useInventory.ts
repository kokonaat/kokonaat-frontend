import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { inventoryList } from "@/api/inventoryApi"


const INVENTORY_KEYS = {
    all: ["inventory"] as const,
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
    useQuery({
        queryKey: [...INVENTORY_KEYS.all, shopId, page, limit, searchBy],
        queryFn: () => inventoryList(shopId, page, limit, searchBy),
        enabled: options?.enabled !== false && !!shopId,
        placeholderData: keepPreviousData,
    })