import { useShopList } from "@/hooks/useShop"
import { useShopStore } from "@/stores/shopStore"

export function ShopRoleBadge() {
    const currentShopId = useShopStore((s) => s.currentShopId)
    const { data: shops } = useShopList()

    if (!currentShopId || !shops) return null

    const currentShop = shops.find((s) => s.shop.id === currentShopId)
    if (!currentShop) return null

    return (
        <span className="px-2 py-1 text-xs font-medium text-white bg-blue-500 rounded-full">
            {currentShop.role?.name || 'N/A'}
        </span>
    )
}