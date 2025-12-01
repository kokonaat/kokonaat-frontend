import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import type { AxiosError } from "axios"
import type { CreateShopInterface, UserRoleWiseShopInterface, UpdateShopInterface } from "@/interface/shopInterface"
import { createShop, shopList, updateShop } from "@/api/shopApi"
import { useShopStore } from "@/stores/shopStore"

// query key
const SHOP_KEYS = {
    all: ["shops"] as const,
}

export const useShopList = () => {
    return useQuery<UserRoleWiseShopInterface[]>({
        queryKey: SHOP_KEYS.all,
        queryFn: shopList,
    })
}

// create shop
export const useCreateShop = () => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    // set shoopId in ls
    const setCurrentShopId = useShopStore((s) => s.setCurrentShopId)

    return useMutation({
        mutationFn: async (data: CreateShopInterface) => {
            const createShopRes = await createShop(data)
            // fetch shops list
            const shopsRes = await shopList()
            return { createShopRes, shopsRes }
        },
        onSuccess: ({ shopsRes, createShopRes }) => {
            // store the created shop ID in Zustand (and persist via localStorage if using persist)
            if (createShopRes?.id) {
                setCurrentShopId(createShopRes.id)
            }
            // if multiple shops then redirect to shops page
            if (shopsRes.total > 1) {
                navigate("/shops")
            }
            else {
                navigate("/")
            }
            toast.success("Shop created successfully")
            queryClient.invalidateQueries({ queryKey: SHOP_KEYS.all })
        },
        onError: (err: AxiosError<{ message: string }>) => {
            toast.error(err?.response?.data?.message || "Failed to create shop")
        }
    })
}

// update
export const useUpdateShop = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: UpdateShopInterface) => updateShop(data),
        onSuccess: () => {
            toast.success("Shop updated successfully!")
            queryClient.invalidateQueries({ queryKey: SHOP_KEYS.all })
        },
        onError: (err: AxiosError<{ message: string }>) => {
            toast.error(err?.response?.data?.message || "Failed to update shop")
        }
    })
}