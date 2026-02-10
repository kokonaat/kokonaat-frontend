import { apiEndpoints } from "@/config/api"
import { axiosInstance } from "./axios"
import type {
    UserSignUpInterface,
    UserSignInInterface,
    AuthResponseInterface,
    ForgetPasswordRequest,
    ResetPasswordRequest,
    ChangePasswordRequest,
} from "@/interface/userInterface"

// signup user
export const signUpUser = async (data: UserSignUpInterface) => {
    const response = await axiosInstance.post(apiEndpoints.auth.signUp, data)
    return response.data
}

// signin user
export const signInUser = async (data: UserSignInInterface): Promise<AuthResponseInterface> => {
    const response = await axiosInstance.post(apiEndpoints.auth.signIn, data)
    return response.data
}

// logout (Bearer token added by axios interceptor)
export const logoutUser = async () => {
    await axiosInstance.post(apiEndpoints.auth.logout, {})
}

// forget password
export const forgetPassword = async (data: ForgetPasswordRequest) => {
    const response = await axiosInstance.post(apiEndpoints.auth.forgetPassword, data)
    return response.data
}

// reset password (token from email link)
export const resetPassword = async (data: ResetPasswordRequest) => {
    const response = await axiosInstance.post(apiEndpoints.auth.resetPassword, data)
    return response.data
}

// change password (authenticated)
export const changePassword = async (data: ChangePasswordRequest) => {
    const response = await axiosInstance.post(apiEndpoints.auth.changePassword, data)
    return response.data
}