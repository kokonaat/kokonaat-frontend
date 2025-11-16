export interface CreateShopInterface {
    name: string
}

export interface ShopInterface {
    id?: string
    name: string
    address: string | null
}

export interface ShopItem {
    id: string
    isCurrent: boolean
    shop: {
        id: string
        name: string
        address: string | null
    }
    role: {
        id: string
        name: string
    }
}

export interface ShopListInterface {
    shops: ShopInterface[]
    total: number
}

export interface UpdateShopInterface {
    id: string
    name?: string
    address?: string
}

export interface ShopDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentShop?: ShopInterface
}

export interface ShopProps {
    shop: ShopInterface
    onEdit: (shop: ShopInterface) => void
}

export interface ShopStoreInterface {
    currentShopId: string | null
    setCurrentShopId: (id: string) => void
    clearCurrentShopId: () => void
}