import { apiEndpoints } from "@/config/api"
import { axiosInstance } from "./axios"
import type { CustomerFormInterface, CustomerListInterface } from "@/interface/customerInterface"
import type { VendorFormInterface, VendorTransactionApiResponse } from "@/interface/vendorInterface"

// customer list with search params
export const customerList = async (
    shopId: string,
    page: number,
    limit: number,
    searchBy?: string,
    startDate?: Date,
    endDate?: Date
): Promise<{ customers: CustomerListInterface[]; total: number }> => {
    const params = new URLSearchParams({
        shopId,
        page: String(page),
        limit: String(limit),
    })

    if (searchBy) params.append('searchBy', searchBy)
    if (startDate) params.append('startDate', startDate.toISOString())
    if (endDate) params.append('endDate', endDate.toISOString())

    const res = await axiosInstance.get(
        `${apiEndpoints.customer.customerList}?${params.toString()}`
    )

    return {
        customers: res.data.data ?? [],
        total: res.data.total ?? 0,
    }
}

// get customer by id
export const getCustomerById = async (
    id: string,
    shopId: string
): Promise<VendorFormInterface> => {
    if (!id) throw new Error("Customer ID is required")
    if (!shopId) throw new Error("Shop ID is required")

    const res = await axiosInstance.get<VendorFormInterface>(
        `${apiEndpoints.customer.getCustomerById.replace("id", id)}?shopId=${shopId}`
    )

    return res.data
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

// get Customer transactions by CustomerId
// export const getCustomerTransactions = async (
//     customerId: string,
//     page: number = 1,
//     limit: number = 10,
//     startDate?: string,
//     endDate?: string
// ): Promise<VendorTransactionApiResponse> => {
//     if (!customerId) throw new Error("Customer ID is required");

//     const res = await axiosInstance.get<VendorTransactionApiResponse>(
//         apiEndpoints.customer.customerTransactions.replace("id", customerId),
//         {
//             params: {
//                 page,
//                 limit,
//                 ...(startDate && { startDate }),
//                 ...(endDate && { endDate }),
//             },
//         }
//     );

//     return res.data;
// }

export const getCustomerTransactions = async (
    customerId: string,
    page: number = 1,
    limit: number = 10,
    startDate?: string,
    endDate?: string
): Promise<VendorTransactionApiResponse> => {
    if (!customerId) throw new Error("Customer ID is required")

    const res = await axiosInstance.get<VendorTransactionApiResponse>(
        apiEndpoints.customer.customerTransactions.replace("id", customerId),
        {
            params: { page, limit, startDate, endDate },
        }
    )

    return res.data
}