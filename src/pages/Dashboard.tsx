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
import DashboardSalesTrend from '@/components/dashboard/DashboardSalesTrend'
import DashboardExpenseBreakdown from '@/components/dashboard/DashboardExpenseBreakdown'
import DashboardTopProducts from '@/components/dashboard/DashboardTopProducts'
import DashboardTopPartners from '@/components/dashboard/DashboardTopPartners'
import DashboardInventoryHealth from '@/components/dashboard/DashboardInventoryHealth'
import AnalyticsKpiCard from '@/components/dashboard/AnalyticsKpiCard'
import RecenetTransactionsTable from '@/components/dashboard/RecenetTransactionsTable'
import { useShopStore } from '@/stores/shopStore'
import DateRangeSearch from '@/components/DateRangeSearch'
import { format, subDays } from 'date-fns'
import { useDashboardData } from '@/hooks/useDashboard'
import { useTranslation } from '@/hooks/useTranslation'
import type { DateRange } from 'react-day-picker'

const chartCardClass = 'min-w-0 overflow-hidden'
const chartCardContentClass = 'min-w-0 overflow-hidden p-4 pt-0 sm:p-6 sm:pt-0'

const Dashboard = () => {
  const { t } = useTranslation('dashboard')
  const shopId = useShopStore((s) => s.currentShopId)

  const defaultEndDate = useMemo(() => new Date(), [])
  const defaultStartDate = useMemo(
    () => subDays(defaultEndDate, 30),
    [defaultEndDate],
  )

  const [dateRange, setDateRange] = useState<DateRange>({
    from: defaultStartDate,
    to: defaultEndDate,
  })

  const params = useMemo(
    () => ({
      shopId: shopId || '',
      startDate: format(dateRange.from!, 'yyyy-MM-dd'),
      endDate: format(dateRange.to!, 'yyyy-MM-dd'),
    }),
    [shopId, dateRange],
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

  if (isError) return <p>{t('page.errorLoading')}</p>

  return (
    <Main className="min-w-0">
      <div className="mb-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">{t('page.title')}</h1>
          <p className="text-muted-foreground">{t('page.subtitle')}</p>
        </div>
        <div className="shrink-0">
          <DateRangeSearch value={dateRange} onDateChange={handleDateChange} />
        </div>
      </div>

      <Tabs defaultValue="overview" className="mt-6 min-w-0 space-y-6">
        <TabsContent value="overview" className="min-w-0 space-y-8">
          <section className="min-w-0">
            <h2 className="mb-4 text-lg font-semibold">{t('sections.financialPulse')}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnalyticsKpiCard
                title={t('kpi.grossSales')}
                value={data?.salesSummary?.total ?? 0}
                change={data?.periodComparison?.salesTotalChange}
                isLoading={isLoading}
              />
              <AnalyticsKpiCard
                title={t('kpi.collected')}
                value={data?.salesSummary?.totalPaid ?? 0}
                description={t('kpi.collectedDescription')}
                isLoading={isLoading}
              />
              <AnalyticsKpiCard
                title={t('kpi.receivables')}
                value={data?.salesSummary?.totalPayable ?? 0}
                description={t('kpi.receivablesDescription')}
                isLoading={isLoading}
              />
              <AnalyticsKpiCard
                title={t('kpi.purchases')}
                value={data?.purchasesSummary?.total ?? 0}
                isLoading={isLoading}
              />
              <AnalyticsKpiCard
                title={t('kpi.expenses')}
                value={data?.operatingSummary?.totalExpenses ?? 0}
                change={data?.periodComparison?.expenseTotalChange}
                isLoading={isLoading}
              />
              <AnalyticsKpiCard
                title={t('kpi.netPosition')}
                value={data?.operatingSummary?.netPosition ?? 0}
                change={data?.periodComparison?.netPositionChange}
                description={t('kpi.netPositionDescription')}
                isLoading={isLoading}
              />
            </div>
          </section>

          <section className="min-w-0">
            <h2 className="mb-4 text-lg font-semibold">{t('sections.trends')}</h2>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <Card className={chartCardClass}>
                <CardHeader>
                  <CardTitle>{t('charts.cashFlow.title')}</CardTitle>
                  <CardDescription>{t('charts.cashFlow.description')}</CardDescription>
                </CardHeader>
                <CardContent className={chartCardContentClass}>
                  <DashboardOverview data={data} isLoading={isLoading} />
                </CardContent>
              </Card>

              <Card className={chartCardClass}>
                <CardHeader>
                  <CardTitle>{t('charts.salesTrend.title')}</CardTitle>
                  <CardDescription>{t('charts.salesTrend.description')}</CardDescription>
                </CardHeader>
                <CardContent className={chartCardContentClass}>
                  <DashboardSalesTrend data={data} isLoading={isLoading} />
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="min-w-0">
            <h2 className="mb-4 text-lg font-semibold">{t('sections.insights')}</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Card className={chartCardClass}>
                <CardHeader>
                  <CardTitle>{t('charts.topProducts.title')}</CardTitle>
                  <CardDescription>{t('charts.topProducts.description')}</CardDescription>
                </CardHeader>
                <CardContent className={chartCardContentClass}>
                  <DashboardTopProducts data={data} isLoading={isLoading} />
                </CardContent>
              </Card>

              <Card className={chartCardClass}>
                <CardHeader>
                  <CardTitle>{t('charts.expenseBreakdown.title')}</CardTitle>
                  <CardDescription>{t('charts.expenseBreakdown.description')}</CardDescription>
                </CardHeader>
                <CardContent className={chartCardContentClass}>
                  <DashboardExpenseBreakdown data={data} isLoading={isLoading} />
                </CardContent>
              </Card>

              <Card className={`${chartCardClass} md:col-span-2 xl:col-span-1`}>
                <CardHeader>
                  <CardTitle>{t('charts.topPartners.title')}</CardTitle>
                  <CardDescription>{t('charts.topPartners.description')}</CardDescription>
                </CardHeader>
                <CardContent className="min-w-0 p-4 pt-0 sm:p-6 sm:pt-0">
                  <DashboardTopPartners data={data} isLoading={isLoading} />
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="min-w-0 space-y-4">
            <h2 className="text-lg font-semibold">{t('sections.inventoryAndActivity')}</h2>

            <DashboardInventoryHealth data={data} isLoading={isLoading} />

            <Card className={chartCardClass}>
              <CardHeader>
                <CardTitle>{t('recentTransactions.title')}</CardTitle>
                {data?.transactionsCount ? (
                  <CardDescription>
                    {t('recentTransactions.description', {
                      count: data.transactionsCount,
                      startDate: format(dateRange.from!, 'dd-MM-yyyy'),
                      endDate: format(dateRange.to!, 'dd-MM-yyyy'),
                    })}
                  </CardDescription>
                ) : null}
              </CardHeader>
              <CardContent className="min-w-0 overflow-x-auto">
                <RecenetTransactionsTable data={data} />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <AnalyticsKpiCard
                title={t('kpi.skusInStock')}
                value={
                  data?.inventoryHealth?.skuCount ?? data?.totalInventory ?? 0
                }
                isLoading={isLoading}
              />
              <AnalyticsKpiCard
                title={t('kpi.customersVendors')}
                value={`${data?.totalCustomers ?? 0} / ${data?.totalVendors ?? 0}`}
                isLoading={isLoading}
              />
              <AnalyticsKpiCard
                title={t('kpi.transactions')}
                value={data?.transactionsCount ?? 0}
                isLoading={isLoading}
              />
              <AnalyticsKpiCard
                title={t('kpi.salesPurchases')}
                value={`${data?.salesCount ?? 0} / ${data?.purchasesCount ?? 0}`}
                isLoading={isLoading}
              />
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </Main>
  )
}

export default Dashboard
