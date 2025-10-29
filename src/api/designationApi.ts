import type { DesignationInterface } from "@/interface/designationInterface"
import { axiosInstance } from "./axios"
import { apiEndpoints } from "@/config/api"

// show list
export const designationList = async (
    shopId: string
): Promise<DesignationInterface[]> => {
    if (!shopId) throw new Error("Shop ID is required")
    const res = await axiosInstance.get(
        `${apiEndpoints.designation.designationList}?shopId=${shopId}`
    )
    return res.data as DesignationInterface[]
}

// create
export const createDesignation = async (data: { title: string, shop: string }) => {
    if (!data.shop) throw new Error("Shop ID is required")
    const res = await axiosInstance.post(apiEndpoints.designation.createDesignation, data)
    return res.data
}

// update
export const updateDesignation = async ({ id, data, shopId }: { id: string, data: { title: string }, shopId: string }) => {
    if (!shopId) throw new Error("Shop ID is required")
    const res = await axiosInstance.patch(
        `${apiEndpoints.designation.updateDesignation}/${id}?shopId=${shopId}`,
        data
    )
    return res.data
}

// delete
export const deleteDesignation = async (id: string) => {
    const res = await axiosInstance.delete(
        `${apiEndpoints.designation.deleteDesignation}/${id}`
    )
    return res.data
}