// useUser.ts
import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchUser } from "@/api/userApi"
import { useUserStore } from "@/stores/userStore"
import type { UserInterface } from "@/interface/userInterface"

export const useUser = () => {
    const setUser = useUserStore((s) => s.setUser)
    const user = useUserStore((s) => s.user)

    const query = useQuery<UserInterface, Error>({
        queryKey: ["user"],
        queryFn: fetchUser,
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