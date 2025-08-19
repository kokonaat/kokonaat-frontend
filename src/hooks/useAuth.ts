import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { UserSignUpInterface, UserSignInInterface } from "@/interface/userInterface"
import { signUpUser, signInUser } from "@/api/userAuthApi"
import { useAuthStore } from "@/stores/authStore"

export const useAuth = () => {
    const { setTokens } = useAuthStore()
    const navigate = useNavigate()

    // signup mutation
    const signUpMutation = useMutation({
        mutationFn: async (data: UserSignUpInterface) => {
            await signUpUser(data)
            const signInRes = await signInUser({ phone: data.phone, password: data.password })
            return signInRes
        },
        onSuccess: (data) => {
            if (data.access_token && data.refresh_token) {
                setTokens(data.access_token, data.refresh_token)
                toast.success("Account created and logged in!")
                navigate("/create-shop")
            }
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message)
        },
    })

    // signin mutation
    const signInMutation = useMutation({
        mutationFn: async (data: UserSignInInterface) => {
            const res = await signInUser(data)
            return res
        },
        onSuccess: (data) => {
            if (data.access_token && data.refresh_token) {
                setTokens(data.access_token, data.refresh_token)
                toast.success("Logged in successfully!")
            }
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message)
        },
    })

    return { signUpMutation, signInMutation }
}