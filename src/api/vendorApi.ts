import { apiEndpoints } from "@/config/api"
import { axiosInstance } from "./axios"
import type { VendorFormInterface, VendorListApiResponseInterface, VendorListResponseInterface } from "@/interface/vendorInterface"

// vendor list
export const vendorList = async (
  shopId: string,
  page: number,
  limit: number
): Promise<VendorListResponseInterface> => {
  if (!shopId) throw new Error("Shop ID is required");
  const res = await axiosInstance.get<VendorListApiResponseInterface>(
    `${apiEndpoints.vendor.vendorList}?shopId=${shopId}&page=${page}&limit=${limit}`
  );
  return res.data;
}

// create
export const createVendor = async (data: VendorFormInterface) => {
    if (!data.shopId) throw new Error("Shop ID is required")
    const res = await axiosInstance.post<VendorListApiResponseInterface>(apiEndpoints.vendor.createVendor, data)
    return res.data.data
}

// update
export const updateVendor = async ({
    id,
    data,
    shopId,
}: {
    id: string
    data: VendorFormInterface
    shopId: string
}) => {
    if (!shopId) throw new Error("Shop ID is required")
    const res = await axiosInstance.put<VendorListApiResponseInterface>(
        `${apiEndpoints.vendor.updateVendor}/${id}?shopId=${shopId}`,
        data
    )
    return res.data.data
}

// delete
export const deleteVendor = async ({ id, shopId }: { id: string; shopId: string }) => {
    if (!shopId) throw new Error("Shop ID is required")
    const res = await axiosInstance.delete<VendorListApiResponseInterface>(
        `${apiEndpoints.vendor.deleteVendor}/${id}?shopId=${shopId}`
    )
    return res.data
}