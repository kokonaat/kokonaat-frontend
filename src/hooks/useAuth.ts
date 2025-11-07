import { useMutation } from "@tanstack/react-query"
import type { UseMutationResult } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import type {
    UserSignUpInterface,
    UserSignInInterface,
    AuthResponseInterface
} from "@/interface/userInterface"
import { signUpUser, signInUser, changePassword } from "@/api/userAuthApi"
import { useAuthStore } from "@/stores/authStore"
import type { AxiosError } from "axios"
import type { ShopListInterface } from "@/interface/shopInterface"
import { shopList } from "@/api/shopApi"
import { useShopStore } from "@/stores/shopStore"

export const useAuth = () => {
    const { setTokens } = useAuthStore()
    const navigate = useNavigate()

    // sign in
    const signUpMutation: UseMutationResult<
        AuthResponseInterface,
        unknown,
        UserSignUpInterface,
        unknown
    > = useMutation({
        mutationFn: async (data: UserSignUpInterface) => {
            await signUpUser(data)
            // auto sign in
            return signInUser({ phone: data.phone, password: data.password })
        },
        onSuccess: (data) => {
            if (data.access_token && data.refresh_token) {
                setTokens(data.access_token, data.refresh_token)
                toast.success("Account created and logged in!")
                navigate("/create-shop")
            }
        },
        onError: (err: AxiosError<{ message: string }>) => {
            toast.error(err?.response?.data?.message || "Failed to sign up")
        },
    })

    // sign in
    const signInMutation: UseMutationResult<{
        authRes: AuthResponseInterface
        shopsRes: ShopListInterface[]
    }, unknown, UserSignInInterface, unknown> = useMutation({
        mutationFn: async (data: UserSignInInterface) => {
            const authRes = await signInUser(data)

            // save token in ls
            if (authRes.access_token && authRes.refresh_token) {
                setTokens(authRes.access_token, authRes.refresh_token)
            }

            // fetch shops list
            const shopsRes = await shopList()
            return { authRes, shopsRes }
        },
        onSuccess: ({ shopsRes }) => {
            toast.success("Logged in successfully!")
            // if multiple shops then redirect to shops page
            if (shopsRes.total > 1) {
                navigate("/shops")
            } else if (shopsRes.total === 1) {
                // set the single shop ID in shop store and persist in LS
                useShopStore.getState().setCurrentShopId(shopsRes.shops[0].id)
                navigate("/")
            }
        },
        onError: (err: AxiosError<{ message: string }>) => {
            toast.error(err?.response?.data?.message || "Failed to log in")
        },
    })

    return { signUpMutation, signInMutation }
}

// change password
export const useChangePassword = () => {
    return useMutation({
        mutationFn: changePassword,
    })
}