import { fetchDashboardData, type DashboardParams } from "@/api/dashboardApi"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

export const useDashboardData = (params: DashboardParams) => {
    const { shopId, startDate, endDate } = params

    return useQuery({
        queryKey: ["dashboard", shopId, startDate, endDate],
        queryFn: () => fetchDashboardData({ shopId, startDate, endDate }),
        enabled: !!shopId,                // only fetch when shopId exists
        staleTime: 0,                      // force refetch whenever queryKey changes
        refetchOnWindowFocus: true,        // refetch if user switches tabs
        placeholderData: keepPreviousData,           // optional: avoid stale cache
        refetchOnMount: "always",          // always refetch on component mount
    })
}