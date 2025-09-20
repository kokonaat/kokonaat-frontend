import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ShopStoreInterface } from '@/interface/shopInterface'

export const useShopStore = create<ShopStoreInterface>()(
    persist(
        (set) => ({
            currentShopId: null,
            setCurrentShopId: (id: string) => set({ currentShopId: id }),
            clearCurrentShopId: () => set({ currentShopId: null }),
        }),
        {
            // ls key name
            name: 'shop-storage',
        }
    )
)