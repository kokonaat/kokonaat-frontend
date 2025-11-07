import { apiEndpoints } from "@/config/api"
import { axiosInstance } from "./axios"

export interface DashboardParams {
    startDate: string
    endDate?: string
    shopId?: string
}

// dashboard api
export const fetchDashboardData = async (params: DashboardParams) => {
    const res = await axiosInstance.get(apiEndpoints.dashbaord.dashboardReport, { params })
    return res.data
}