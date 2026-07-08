import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ShopStoreInterface } from '@/interface/shopInterface'

export const useShopStore = create<ShopStoreInterface>()(
    persist(
        (set) => ({
            currentShopId: null,
            currentShopName: null,
            currentShopSlug: null,
            currentShopRoleName: null,
            setCurrentShop: (id, name, slug?, roleName?) => {
                set((state) => ({
                    currentShopId: id,
                    currentShopName: name,
                    currentShopSlug:
                        slug !== undefined ? (slug ?? null) : state.currentShopSlug,
                    currentShopRoleName:
                        roleName !== undefined
                            ? (roleName ?? null)
                            : state.currentShopRoleName,
                }))
            },
            clearCurrentShop: () =>
                set({
                    currentShopId: null,
                    currentShopName: null,
                    currentShopSlug: null,
                    currentShopRoleName: null,
                }),
        }),
        {
            name: 'shop-storage',
        }
    )
)
