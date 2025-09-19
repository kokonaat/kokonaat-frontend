import { apiEndpoints } from "@/config/api"
import { axiosInstance } from "./axios"
import type { CustomerFormInterface, CustomerListInterface } from "@/interface/customerInterface"

// customer list
export const customerList = async (
    shopId: string,
    page: number,
    limit: number
): Promise<{ customers: CustomerListInterface[]; total: number }> => {
    const res = await axiosInstance.get(
        `${apiEndpoints.customer.customerList}?shopId=${shopId}&page=${page}&limit=${limit}`
    )
    return {
        customers: res.data.data.customers,
        total: res.data.data.pagination.total,
    }
}

// create
export const createCustomer = async (data: CustomerFormInterface) => {
    if (!data.shopId) throw new Error("Shop ID is required")
    const res = await axiosInstance.post(apiEndpoints.customer.createCustomer, data)
    return res.data
}

// update
export const updateCustomer = async ({
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
        `${apiEndpoints.customer.updateCustomer}/${id}?shopId=${shopId}`,
        data
    )
    return res.data
}

// delete
export const deleteCustomer = async ({ id, shopId }: { id: string; shopId: string }) => {
    if (!shopId) throw new Error("Shop ID is required")
    const res = await axiosInstance.delete(
        `${apiEndpoints.customer.deleteCustomer}/${id}?shopId=${shopId}`
    )
    return res.data
}
