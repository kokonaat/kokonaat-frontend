import { apiEndpoints } from "@/config/api"
import { axiosInstance } from "./axios"
import type { UserSignUpInterface, UserSignInInterface, AuthResponseInterface } from "@/interface/userInterface"

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