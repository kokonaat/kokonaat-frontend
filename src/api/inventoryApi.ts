import { apiEndpoints } from "@/config/api"
import { axiosInstance } from "./axios"
import type { InventoryItemInterface } from "@/interface/inventoryInterface"

// inventory list
export const inventoryList = async (
    shopId: string,
    page: number,
    limit: number,
    searchBy?: string
): Promise<{ items: InventoryItemInterface[]; total: number }> => {
    const params = new URLSearchParams({
        shopId,
        page: String(page),
        limit: String(limit),
    })
    if (searchBy) params.append("searchBy", searchBy)

    const res = await axiosInstance.get(`${apiEndpoints.inventory.inventoryList}?${params.toString()}`)

    return {
        items: res.data.data ?? [],
        total: res.data.total ?? 0,
    }
}
