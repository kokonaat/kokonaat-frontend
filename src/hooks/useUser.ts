import { useEffect } from "react"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
    createUser,
    fetchAssignableRoles,
    fetchCurrentUser,
    fetchEmployeePermissions,
    fetchShopModulePermissions,
    fetchUserList,
    resetEmployeePassword,
    updateEmployee,
} from "@/api/userApi"
import { useUserStore } from "@/stores/userStore"
import type {
    CreateUserRequest,
    CreateUserResponse,
    FetchUserListParams,
    ResetEmployeePasswordRequest,
    UpdateEmployeeRequest,
    UserInterface,
    UserListItem,
} from "@/interface/userInterface"
import { useAuthStore } from "@/stores/authStore"
import { useShopStore } from "@/stores/shopStore"

export const useUser = () => {
    const { access_token } = useAuthStore()
    const setUser = useUserStore((s) => s.setUser)
    const user = useUserStore((s) => s.user)
    const setCurrentShop = useShopStore((s) => s.setCurrentShop)

    const query = useQuery<UserInterface, Error>({
        queryKey: ["user"],
        queryFn: fetchCurrentUser,
        staleTime: 1000 * 60 * 5,
        initialData: user ?? undefined,
        refetchOnWindowFocus: false,
        enabled: !!access_token,
    })

    useEffect(() => {
        if (!query.data) return

        setUser(query.data)

        const currentShopId = useShopStore.getState().currentShopId

        const currentMembership =
            query.data.shopWiseUserRoles.find(
                (r) => r.shop?.id === currentShopId,
            ) ??
            query.data.shopWiseUserRoles.find((r) => r.isCurrent) ??
            query.data.shopWiseUserRoles[0]

        if (currentMembership?.shop) {
            setCurrentShop(
                currentMembership.shop.id,
                currentMembership.shop.name,
                currentMembership.shop.slug ?? null,
                currentMembership.role?.name ?? null,
            )
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
                email: u.email,
                phone: u.phone,
                createdAt: u.createdAt,
                shopWiseUserRoles: u.shopWiseUserRoles ?? [],
            }))
        },
        enabled: !!shopId,
        placeholderData: keepPreviousData,
    })
}

export const useAssignableRoles = (enabled = true) => {
    return useQuery({
        queryKey: ["assignableRoles"],
        queryFn: fetchAssignableRoles,
        staleTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
        enabled,
    })
}

export const useEmployeePermissions = (userId?: string, shopId?: string) => {
    return useQuery({
        queryKey: ["employeePermissions", userId, shopId],
        queryFn: () => fetchEmployeePermissions(userId!, shopId!),
        enabled: !!userId && !!shopId,
    })
}

export const useCreateUser = () => {
    const queryClient = useQueryClient()

    return useMutation<CreateUserResponse, Error, CreateUserRequest>({
        mutationFn: createUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["userList"] })
        },
    })
}

export const useUpdateEmployee = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: UpdateEmployeeRequest) => updateEmployee(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["userList"] })
        },
    })
}

export const useResetEmployeePassword = () => {
    return useMutation({
        mutationFn: (payload: ResetEmployeePasswordRequest) =>
            resetEmployeePassword(payload),
    })
}

export const useShopPermissions = (shopId?: string | null) => {
    return useQuery({
        queryKey: ["shopModulePermissions", shopId],
        queryFn: () => fetchShopModulePermissions(shopId!),
        enabled: !!shopId,
        staleTime: 1000 * 60 * 5,
    })
}

export const useIsShopOwner = () => {
    const shopId = useShopStore((s) => s.currentShopId)
    const roleName = useShopStore((s) => s.currentShopRoleName)
    const { data: permissions } = useShopPermissions(shopId)

    return roleName === 'shop_owner' || permissions?.isOwner === true
}
