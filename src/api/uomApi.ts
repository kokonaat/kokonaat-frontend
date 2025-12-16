import type { CreateUomFormInterface, UomInterface } from "@/interface/uomInterface";
import { axiosInstance } from "./axios";
import { apiEndpoints } from "@/config/api";

// list
export const uomList = async (
    shopId: string,
    page: number,
    limit: number,
    searchBy?: string,
): Promise<{ items: UomInterface[]; total: number }> => {
    const params = new URLSearchParams({
        shopId,
        page: String(page),
        limit: String(limit),
    })

    if (searchBy) params.append("searchBy", searchBy)

    const res = await axiosInstance.get(
        `${apiEndpoints.uom.uomList}?${params.toString()}`
    )

    return {
        items: res.data.data ?? [],
        total: res.data.total ?? 0,
    }
}

// create
export const createUom = async (data: CreateUomFormInterface) => {
    if (!data.shopId) throw new Error('Shop ID is required')

    const res = await axiosInstance.post<{
        data: UomInterface
    }>(
        apiEndpoints.uom.createUom,
        data
    )

    return res.data.data
}

// update
export const updateUom = async ({
    id,
    data,
    shopId,
}: {
    id: string
    data: Omit<CreateUomFormInterface, 'shopId'>
    shopId: string
}) => {
    if (!shopId) throw new Error('Shop ID is required')

    const res = await axiosInstance.put<{
        data: UomInterface
    }>(
        apiEndpoints.uom.updateUom.replace("{id}", id) + `?shopId=${shopId}`,
        data
    )
    return res.data.data
}

// del
export const deleteUom = async ({
    id,
    shopId,
}: {
    id: string
    shopId: string
}) => {
    if (!id) throw new Error('UOM ID is required')
    if (!shopId) throw new Error('Shop ID is required')

    const url = apiEndpoints.uom.deleteUom.replace("{id}", id) + `?shopId=${shopId}`

    const res = await axiosInstance.delete(url)

    return res.data
}

// get by id
export const getUomById = async (
    id: string
): Promise<UomInterface> => {
    if (!id) throw new Error('UOM ID is required')

    const res = await axiosInstance.get<UomInterface>(
        `${apiEndpoints.uom.getUomById.replace('id', id)}`
    )

    return res.data
}