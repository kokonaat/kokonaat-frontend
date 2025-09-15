import { ShopStoreInterface } from '@/interface/shopInterface'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useShopStore = create<ShopStoreInterface>()(
    persist(
        (set) => ({
            currentShopId: null,
            setCurrentShopId: (id: string) => set({ currentShopId: id }),
            clearCurrentShopId: () => set({ currentShopId: null }),
        }),
        {
            name: 'shop-storage',
        }
    )
)