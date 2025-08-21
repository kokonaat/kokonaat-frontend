import { API } from "@/config/api"
import { axiosInstance } from "./axios"
import { CreateShopInterface, UpdateShopInterface } from "@/interface/shopInterface"

// create
export const createShop = async (data: CreateShopInterface) => {
    const response = await axiosInstance.post(API.SHOP.CREATE_SHOP, data)
    return response.data
}

// list
export const shopList = async () => {
    const response = await axiosInstance.get(API.SHOP.SHOP_LIST)
    return response.data
}

// update
export const updateShop = async (data: UpdateShopInterface) => {
    const response = await axiosInstance.put(`${API.SHOP.UPDATE_SHOP}${data.id}`, data)
    return response.data
}