import { apiEndpoints } from "@/config/api"
import { axiosInstance } from "./axios"
import { CustomerFormInterface, CustomerListInterface } from "@/interface/customerInterface"

// customer list
export const customerList = async (shopId: string): Promise<CustomerListInterface[]> => {
    if (!shopId) throw new Error("Shop ID is required")
    const res = await axiosInstance.get(
        `${apiEndpoints.customer.customerList}?shopId=${shopId}`
    )
    return res.data
}

// create
export const createCustomer = async (data: CustomerFormInterface) => {
    if (!data.shop) throw new Error("Shop ID is required")
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
    const res = await axiosInstance.patch(
        `${apiEndpoints.customer.updateCustomer}/${id}?shopId=${shopId}`,
        data
    )
    return res.data
}

// delete
export const deleteCustomer = async (id: string) => {
    const res = await axiosInstance.delete(`${apiEndpoints.customer.deleteCustomer}/${id}`)
    return res.data
}