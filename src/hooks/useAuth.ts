import { useMutation } from "@tanstack/react-query"
import type { UseMutationResult } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import type {
    UserSignUpInterface,
    UserSignInInterface,
    AuthResponseInterface,
    ForgetPasswordRequest,
    ResetPasswordRequest,
    ChangePasswordRequest,
} from "@/interface/userInterface"
import {
    signUpUser,
    signInUser,
    logoutUser,
    forgetPassword as forgetPasswordApi,
    resetPassword as resetPasswordApi,
    changePassword,
} from "@/api/userAuthApi"
import { useAuthStore } from "@/stores/authStore"
import type { AxiosError } from "axios"
import type { ShopListInterface } from "@/interface/shopInterface"
import { shopList } from "@/api/shopApi"
import { useShopStore } from "@/stores/shopStore"
import { useUser } from "./useUser"

export const useAuth = () => {
    const { setTokens, clearTokens } = useAuthStore()
    const clearCurrentShop = useShopStore((s) => s.clearCurrentShop)
    const navigate = useNavigate()
    const { refetch: refetchUser } = useUser()

    // sign up
    const signUpMutation: UseMutationResult<
        AuthResponseInterface,
        unknown,
        UserSignUpInterface,
        unknown
    > = useMutation({
        mutationFn: async (data: UserSignUpInterface) => {
            await signUpUser(data)
            // auto sign in with email + password
            return signInUser({ email: data.email, password: data.password })
        },
        onSuccess: async (data) => {
            if (data.access_token && data.refresh_token) {
                setTokens(data.access_token, data.refresh_token)
                refetchUser()
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

            // shops list
            const shopsRes = await shopList()
            return { authRes, shopsRes }
        },
        onSuccess: async ({ shopsRes }) => {
            try {
                toast.success("Logged in successfully!")
                await refetchUser()

                // validation shop res
                if (!Array.isArray(shopsRes)) {
                    toast.error("Unexpected server response.")
                    return
                }

                const shopCount = shopsRes.length

                if (shopCount === 0) return toast.info("No shops found")
                    
                // one shop
                if (shopCount === 1) {
                    const shop = shopsRes[0]

                    if (!shop?.shopId) {
                        toast.error("Invalid shop data received.")
                        navigate("/shops")
                        return
                    }

                    useShopStore.getState().setCurrentShop(shop.shopId, shop.shopName)
                    navigate("/")
                    return
                }

                // multiple shops
                navigate("/shops")

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                toast.error("Something went wrong.")
            }
        },
        onError: (err: AxiosError<{ message: string }>) => {
            toast.error(err?.response?.data?.message || "Failed to log in")
        },
    })

    const logout = async () => {
        try {
            await logoutUser()
        } finally {
            clearTokens()
            clearCurrentShop()
            navigate("/sign-in")
        }
    }

    return { signUpMutation, signInMutation, logout }
}

// change password (authenticated)
export const useChangePassword = () => {
    return useMutation({
        mutationFn: (data: ChangePasswordRequest) => changePassword(data),
    })
}

// forget password
export const useForgetPassword = () => {
    const navigate = useNavigate()
    return useMutation({
        mutationFn: (data: ForgetPasswordRequest) => forgetPasswordApi(data),
        onSuccess: () => {
            toast.success("If an account exists, you will receive an email")
            navigate("/sign-in")
        },
        onError: (err: AxiosError<{ message: string }>) => {
            toast.error(err?.response?.data?.message || "Failed to send reset email")
        },
    })
}

// reset password (from email link token)
export const useResetPassword = () => {
    const navigate = useNavigate()
    return useMutation({
        mutationFn: (data: ResetPasswordRequest) => resetPasswordApi(data),
        onSuccess: () => {
            toast.success("Password has been reset successfully")
            navigate("/sign-in")
        },
        onError: (err: AxiosError<{ message: string }>) => {
            toast.error(err?.response?.data?.message || "Failed to reset password")
        },
    })
}