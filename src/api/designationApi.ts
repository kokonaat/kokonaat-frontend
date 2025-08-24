import { DesignationInterface } from "@/interface/designationInterface"
import { axiosInstance } from "./axios"
import { apiEndpoints } from "@/config/api"

// export const designationList = async (
//     shopId: string
// ): Promise<{ designations: DesignationInterface[] }> => {
//     const res = await axiosInstance.get(
//         `${apiEndpoints.designation.designationList}?shopId=${shopId}`
//     )
//     return res.data
// }

// export const createDesignation = async (data: { title: string; shop: string }) => {
//     const res = await axiosInstance.post(apiEndpoints.designation.createDesignation, data)
//     return res.data
// }

export const designationList = async (
    shopId: string
): Promise<{ designations: DesignationInterface[] }> => {
    if (!shopId) throw new Error("Shop ID is required");
    const res = await axiosInstance.get(
        `${apiEndpoints.designation.designationList}?shopId=${shopId}`
    );
    return res.data;
};

export const createDesignation = async (data: { title: string; shop: string }) => {
    if (!data.shop) throw new Error("Shop ID is required");
    const res = await axiosInstance.post(apiEndpoints.designation.createDesignation, data);
    return res.data;
};