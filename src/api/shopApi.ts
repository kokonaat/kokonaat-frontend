import { axiosInstance } from "./axios"
import { CreateShopInterface } from "@/interface/shopInterface"

export const createShop = async (data: CreateShopInterface) => {
    const response = await axiosInstance.post('/shop', data)
    return response.data
}