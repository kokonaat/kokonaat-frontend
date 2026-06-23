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
import { useTranslation } from "@/hooks/useTranslation"

export const useAuth = () => {
    const { setTokens, clearTokens } = useAuthStore()
    const clearCurrentShop = useShopStore((s) => s.clearCurrentShop)
    const navigate = useNavigate()
    const { refetch: refetchUser } = useUser()
    const { t } = useTranslation('toast')

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
                toast.success(t('auth.signUpSuccess'))
                navigate("/create-shop")
            }
        },
        onError: (err: AxiosError<{ message: string }>) => {
            toast.error(err?.response?.data?.message || t('auth.signUpFailed'))
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
                toast.success(t('auth.signInSuccess'))
                await refetchUser()

                // validation shop res
                if (!Array.isArray(shopsRes)) {
                    toast.error(t('auth.unexpectedResponse'))
                    return
                }

                const shopCount = shopsRes.length

                if (shopCount === 0) return toast.info(t('auth.noShopsFound'))
                    
                // one shop
                if (shopCount === 1) {
                    const shop = shopsRes[0]

                    if (!shop?.shopId) {
                        toast.error(t('auth.invalidShopData'))
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
                toast.error(t('auth.somethingWrong'))
            }
        },
        onError: (err: AxiosError<{ message: string }>) => {
            toast.error(err?.response?.data?.message || t('auth.signInFailed'))
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
    const { t } = useTranslation('toast')
    return useMutation({
        mutationFn: (data: ForgetPasswordRequest) => forgetPasswordApi(data),
        onSuccess: () => {
            toast.success(t('auth.forgetPasswordSuccess'))
            navigate("/sign-in")
        },
        onError: (err: AxiosError<{ message: string }>) => {
            toast.error(err?.response?.data?.message || t('auth.forgetPasswordFailed'))
        },
    })
}

// reset password (from email link token)
export const useResetPassword = () => {
    const navigate = useNavigate()
    const { t } = useTranslation('toast')
    return useMutation({
        mutationFn: (data: ResetPasswordRequest) => resetPasswordApi(data),
        onSuccess: () => {
            toast.success(t('auth.resetPasswordSuccess'))
            navigate("/sign-in")
        },
        onError: (err: AxiosError<{ message: string }>) => {
            toast.error(err?.response?.data?.message || t('auth.resetPasswordFailed'))
        },
    })
}
