import { useEffect } from "react"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createUser, fetchCurrentUser, fetchUserList, fetchUserRoles } from "@/api/userApi"
import { useUserStore } from "@/stores/userStore"
import type { CreateUserRequest, CreateUserResponse, FetchUserListParams, UserInterface, UserListItem } from "@/interface/userInterface"

// current user info
export const useUser = () => {
    const setUser = useUserStore((s) => s.setUser)
    const user = useUserStore((s) => s.user)

    const query = useQuery<UserInterface, Error>({
        queryKey: ["user"],
        queryFn: fetchCurrentUser,
        staleTime: 1000 * 60 * 5,
        // existing Zustand value as initial
        initialData: user ?? undefined,
        // keeps data fresh
        refetchOnWindowFocus: true,
    })

    // sync query result to Zustand
    useEffect(() => {
        if (query.data && query.data !== user) {
            setUser(query.data)
        }
    }, [query.data, setUser, user])

    return query
}

// user list
// export const useUserList = (shopId: string) => {
//     return useQuery<UserListItem[], Error>({
//         queryKey: ["userList", shopId],
//         queryFn: () => fetchUserList(shopId),
//         enabled: !!shopId,
//         staleTime: 1000 * 60 * 5,
//         refetchOnWindowFocus: true,
//     })
// }

export const useUserList = (params: FetchUserListParams) => {
    const { shopId, page = 1, limit = 10, searchBy = '' } = params

    return useQuery<UserListItem[], Error>({
        queryKey: ['userList', shopId, page, limit, searchBy],
        queryFn: async () => {
            const data = await fetchUserList({ shopId, page, limit, searchBy })

            return data.map((u: any) => ({
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