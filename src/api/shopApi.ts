import { API } from "@/config/api"
import { axiosInstance } from "./axios"
import { CreateShopInterface } from "@/interface/shopInterface"

export const createShop = async (data: CreateShopInterface) => {
    const response = await axiosInstance.post(API.SHOP.CREATE_SHOP, data)
    return response.data
}