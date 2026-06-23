import { apiEndpoints } from '@/config/api'
import { axiosInstance } from './axios'
import type { DashboardData, DashboardParams } from '@/interface/dashboardInterface'

export type { DashboardData, DashboardParams }

export const fetchDashboardData = async (
  params: DashboardParams,
): Promise<DashboardData> => {
  const res = await axiosInstance.get(apiEndpoints.dashbaord.dashboardReport, {
    params,
  })
  return res.data
}
