import { fetchDashboardData, type DashboardParams } from "@/api/dashboardApi"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

export const useDashboardData = (params: DashboardParams) => {
    const { shopId, startDate, endDate } = params

    return useQuery({
        queryKey: ["dashboard", shopId, startDate, endDate],
        queryFn: () => fetchDashboardData({ shopId, startDate, endDate }),
        enabled: !!shopId,                 // only fetch when shopId exists
        staleTime: 0,          // prevents unnecessary refetches
        gcTime: 0,            // cache time (formerly cacheTime)
        refetchOnWindowFocus: false,       // disable auto-refetch on focus
        refetchOnMount: true,              // only refetch if data is stale
        placeholderData: keepPreviousData, // keep old data while fetching new
    })
}