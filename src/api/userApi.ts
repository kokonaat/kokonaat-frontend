import { axiosInstance } from "./axios"
import { apiEndpoints } from "@/config/api"
import type { UserInterface } from "@/interface/userInterface"

export const fetchUser = async (): Promise<UserInterface> => {
    const res = await axiosInstance.get<UserInterface>(apiEndpoints.user)
    return res.data
}