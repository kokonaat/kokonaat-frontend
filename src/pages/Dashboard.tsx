import { useState, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { Main } from '@/components/layout/main'
import DashboardOverview from '@/components/dashboard/DashboardOverview'
import RecenetTransactionsTable from '@/components/dashboard/RecenetTransactionsTable'
import { useShopStore } from '@/stores/shopStore'
import DateRangeSearch from '@/components/DateRangeSearch'
import { format, subDays } from 'date-fns'
import { useDashboardData } from '@/hooks/useDashboard'
import type { DateRange } from 'react-day-picker'

const Dashboard = () => {
  const shopId = useShopStore((s) => s.currentShopId)

  /** default range last 30 days */
  const defaultEndDate = useMemo(() => new Date(), [])
  const defaultStartDate = useMemo(
    () => subDays(defaultEndDate, 30),
    [defaultEndDate]
  )

  /** controlled selected dates */
  const [dateRange, setDateRange] = useState<DateRange>({
    from: defaultStartDate,
    to: defaultEndDate,
  })

  /** react query params */
  const params = useMemo(
    () => ({
      shopId: shopId || '',
      startDate: format(dateRange.from!, 'yyyy-MM-dd'),
      endDate: format(dateRange.to!, 'yyyy-MM-dd'),
    }),
    [shopId, dateRange]
  )

  const { data, isLoading, isError } = useDashboardData(params)

  const handleDateChange = (from?: Date, to?: Date) => {
    if (!from || !to) {
      setDateRange({
        from: defaultStartDate,
        to: defaultEndDate,
      })
      return
    }

    setDateRange({ from, to })
  }

  if (isError) return <p>Error loading dashboard data.</p>

  return (
    <Main>
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <DateRangeSearch value={dateRange} onDateChange={handleDateChange} />

        <TabsContent value="overview" className="space-y-4">
          {/* summary cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Inventory</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                {isLoading ? 'Loading...' : data?.totalInventory ?? 0}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Customers / Vendors</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                {isLoading
                  ? 'Loading...'
                  : `${data?.totalCustomers ?? 0} / ${data?.totalVendors ?? 0
                  }`}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Transactions</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                {isLoading ? 'Loading...' : data?.transactionsCount ?? 0}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Sales / Purchases</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                {isLoading
                  ? 'Loading...'
                  : `${data?.salesCount ?? 0} / ${data?.purchasesCount ?? 0
                  }`}
              </CardContent>
            </Card>
          </div>

          {/* overview table */}
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <DashboardOverview data={data} isLoading={isLoading} />
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                {data?.transactionsCount > 0 && (
                  <CardDescription>
                    {data.transactionsCount} transactions from{' '}
                    {format(dateRange.from!, 'dd-MM-yyyy')} to{' '}
                    {format(dateRange.to!, 'dd-MM-yyyy')}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <RecenetTransactionsTable data={data} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </Main>
  )
}

export default Dashboard