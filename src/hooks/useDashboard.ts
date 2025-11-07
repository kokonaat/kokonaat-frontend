import { fetchDashboardData, type DashboardParams } from "@/api/dashboardApi"
import { useQuery } from "@tanstack/react-query"

// dashboard data
export const useDashboardData = (params: DashboardParams) => {
    const { shopId, startDate, endDate } = params

    return useQuery({
        queryKey: ["dashboard", shopId, startDate, endDate], // deconstructed values
        queryFn: () => fetchDashboardData({ shopId, startDate, endDate }),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    })
}