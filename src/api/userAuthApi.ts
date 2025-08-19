import { axiosInstance } from "./axios"
import { UserSignUpInterface, UserSignInInterface, AuthResponseInterface } from "@/interface/userInterface"

// signup user
export const signUpUser = async (data: UserSignUpInterface) => {
    const response = await axiosInstance.post("/auth/signup", data)
    return response.data
}

// signin user
export const signInUser = async (data: UserSignInInterface): Promise<AuthResponseInterface> => {
    const response = await axiosInstance.post("/auth/signin", data)
    return response.data
}
