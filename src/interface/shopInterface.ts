export interface CreateShopInterface {
    name: string
}

export interface Shop {
    id?: string
    name: string
    address: string
}

export interface ShopDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentShop?: Shop
}

export interface ShopProps {
    shop: Shop
    onEdit: (shop: Shop) => void
}