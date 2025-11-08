import { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { Main } from '@/components/layout/main'
import DashboardOverview from '@/components/dashboard/DashboardOverview'
import RecenetTransactionsTable from '@/components/dashboard/RecenetTransactionsTable'
import { useShopStore } from '@/stores/shopStore'
import DateRangeSearch from '@/components/DateRangeSearch'
import { format } from 'date-fns'
import { useDashboardData } from '@/hooks/useDashboard'

const Dashboard = () => {
  const shopId = useShopStore((s) => s.currentShopId)

  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()

  // Memoize params to prevent unnecessary re-renders
  const params = useMemo(() => ({
    shopId: shopId || '',
    startDate: startDate ? format(startDate, 'yyyy-MM-dd') : '2025-01-01',
    endDate: endDate ? format(endDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
  }), [shopId, startDate, endDate])

  const { data, isLoading, isError, refetch } = useDashboardData(params)

  const handleDateChange = useCallback((from?: Date, to?: Date) => {
    setStartDate(from)
    setEndDate(to)
    refetch() // immediately fetch new data
  }, [refetch])

  if (isError) return <p>Error loading dashboard data.</p>

  return (
    <Main>
      <div className='mb-2 flex items-center justify-between space-y-2'>
        <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
        <div className='flex items-center space-x-2'>
          <Button>Download</Button>
        </div>
      </div>

      <Tabs orientation='vertical' defaultValue='overview' className='space-y-4'>
        <div className='w-full overflow-x-auto pb-2'>
          <DateRangeSearch onDateChange={handleDateChange} />
        </div>

        <TabsContent value='overview' className='space-y-4'>
          {/* Summary Cards */}
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {/* Total Inventory */}
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Total Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {isLoading ? 'Loading...' : data?.totalInventory ?? 0}
                </div>
                <p className='text-muted-foreground text-xs'>+ update info</p>
              </CardContent>
            </Card>

            {/* Customers & Vendors */}
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Customers & Vendors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {isLoading
                    ? 'Loading...'
                    : `${data?.totalCustomers ?? 0} / ${data?.totalVendors ?? 0}`}
                </div>
                <p className='text-muted-foreground text-xs'>Customers / Vendors</p>
              </CardContent>
            </Card>

            {/* Transactions */}
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {isLoading ? 'Loading...' : data?.transactionsCount ?? 0}
                </div>
                <p className='text-muted-foreground text-xs'>Total transactions</p>
              </CardContent>
            </Card>

            {/* Sales & Purchases */}
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Sales & Purchases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {isLoading
                    ? 'Loading...'
                    : `${data?.salesCount ?? 0} / ${data?.purchasesCount ?? 0}`}
                </div>
                <p className='text-muted-foreground text-xs'>Sales / Purchases</p>
              </CardContent>
            </Card>
          </div>

          {/* Overview & Recent Transactions */}
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
            <Card className='col-span-1 lg:col-span-4'>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className='ps-2'>
                <DashboardOverview />
              </CardContent>
            </Card>

            <Card className='col-span-1 lg:col-span-3'>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  You made {data?.transactionsCount ?? 0} transactions this month.
                </CardDescription>
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