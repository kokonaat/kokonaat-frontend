import { apiEndpoints } from "@/config/api"
import { axiosInstance } from "./axios"
import { CustomerFormInterface, CustomerListInterface } from "@/interface/customerInterface"

// vendor list
export const vendorList = async (shopId: string): Promise<CustomerListInterface[]> => {
    if (!shopId) throw new Error("Shop ID is required")
    const res = await axiosInstance.get(
        `${apiEndpoints.vendor.vendorList}?shopId=${shopId}`
    )
    return res.data
}

// create
export const createVendor = async (data: any) => {
    if (!data.shopId) throw new Error("Shop ID is required")
    const res = await axiosInstance.post(apiEndpoints.vendor.createVendor, data)
    return res.data
}

// update
export const updateVendor = async ({
    id,
    data,
    shopId,
}: {
    id: string
    data: CustomerFormInterface
    shopId: string
}) => {
    if (!shopId) throw new Error("Shop ID is required")
    const res = await axiosInstance.put(
        `${apiEndpoints.vendor.updateVendor}/${id}?shopId=${shopId}`,
        data
    )
    return res.data
}

// delete
export const deleteVendor = async ({ id, shopId }: { id: string; shopId: string }) => {
    if (!shopId) throw new Error("Shop ID is required")
    const res = await axiosInstance.delete(
        `${apiEndpoints.vendor.deleteVendor}/${id}?shopId=${shopId}`
    )
    return res.data
}
