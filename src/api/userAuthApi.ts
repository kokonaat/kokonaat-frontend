import { API } from "@/config/api"
import { axiosInstance } from "./axios"
import { UserSignUpInterface, UserSignInInterface, AuthResponseInterface } from "@/interface/userInterface"

// signup user
export const signUpUser = async (data: UserSignUpInterface) => {
    const response = await axiosInstance.post(API.AUTH.SIGNUP, data)
    return response.data
}

// signin user
export const signInUser = async (data: UserSignInInterface): Promise<AuthResponseInterface> => {
    const response = await axiosInstance.post(API.AUTH.SIGNIN, data)
    return response.data
}
