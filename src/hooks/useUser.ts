import { useEffect } from "react"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createUser, fetchCurrentUser, fetchUserList, fetchUserRoles } from "@/api/userApi"
import { useUserStore } from "@/stores/userStore"
import type { CreateUserRequest, CreateUserResponse, FetchUserListParams, UserInterface, UserListItem } from "@/interface/userInterface"
import { useAuthStore } from "@/stores/authStore"
import { useShopStore } from "@/stores/shopStore"

// current user info
export const useUser = () => {
    const { access_token } = useAuthStore()
    const setUser = useUserStore((s) => s.setUser)
    const user = useUserStore((s) => s.user)
    const setCurrentShop = useShopStore((s) => s.setCurrentShop)

    const query = useQuery<UserInterface, Error>({
        queryKey: ["user"],
        queryFn: fetchCurrentUser,
        staleTime: 1000 * 60 * 5,
        // existing Zustand value as initial
        initialData: user ?? undefined,
        // keeps data fresh
        refetchOnWindowFocus: false,
        // only run if access token exists
        enabled: !!access_token,
    })

    // sync query result to Zustand
    useEffect(() => {
        if (!query.data) return

        setUser(query.data)

        const currentShop = query.data.shopWiseUserRoles.find(
            (r) => r.isCurrent
        )?.shop

        if (currentShop) {
            setCurrentShop(currentShop.id, currentShop.name)
        }
    }, [query.data, setUser, setCurrentShop])

    return query
}

export const useUserList = (params: FetchUserListParams) => {
    const { shopId, page = 1, limit = 10, searchBy = '' } = params

    return useQuery<UserListItem[], Error>({
        queryKey: ['userList', shopId, page, limit, searchBy],
        queryFn: async () => {
            const data = await fetchUserList({ shopId, page, limit, searchBy })

            return data.map((u) => ({
                id: u.id,
                name: u.name,
                phone: u.phone,
                createdAt: u.createdAt,
                shopWiseUserRoles: u.shopWiseUserRoles ?? [],
            }))
        },
        enabled: !!shopId,
        placeholderData: keepPreviousData, // smooth pagination
    })
}

// get all roles
export const useUserRoles = () => {
    return useQuery({
        queryKey: ["userRoles"],
        queryFn: fetchUserRoles,
        staleTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
    })
}

// create user
export const useCreateUser = () => {
    const queryClient = useQueryClient()

    return useMutation<CreateUserResponse, Error, CreateUserRequest>({
        mutationFn: createUser,
        onSuccess: () => {
            // invalidate user list after successful creation
            queryClient.invalidateQueries({ queryKey: ["userList"] })
        },
    })
}