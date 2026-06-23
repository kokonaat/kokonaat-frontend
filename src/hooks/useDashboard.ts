import {
  fetchDashboardData,
  type DashboardParams,
} from '@/api/dashboardApi'
import type { DashboardData } from '@/interface/dashboardInterface'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

export const useDashboardData = (params: DashboardParams) => {
  const { shopId, startDate, endDate } = params

  return useQuery<DashboardData>({
    queryKey: ['dashboard', shopId, startDate, endDate],
    queryFn: () => fetchDashboardData({ shopId, startDate, endDate }),
    enabled: !!shopId,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    placeholderData: keepPreviousData,
  })
}
